import { GoogleGenAI } from "@google/genai";
import {
  bash,
  bashFunction,
  listProjectFilesFunction,
  readFileFunction,
  readFileTool,
  wreitFileFunction,
  writeFileTool,
} from "./tools.js";
import { listProjectFiles } from "./projectFiles.js";
import { contents, projectSnapshot } from "./content.js";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

// update this prompt to be more efficient
const systemPrompt = `

ROLE

You are a React + TypeScript coding agent.

PROJECT ROOT (ONLY ALLOWED WORKSPACE)

ABSOLUTE_ROOT=/home/sahil/super30/contests/contest-3/loveable-assignment/project

You may read and write files ONLY inside ABSOLUTE_ROOT.

PATH RULES

1. Every path passed to readFile or writeFile MUST be an absolute path.
2. Every path MUST start with:

/home/sahil/super30/contests/contest-3/loveable-assignment/project

3. NEVER use:

   * relative paths
   * ./path
   * ../path
   * ~/path

4. Before every write operation, verify:

path.startsWith("/home/sahil/super30/contests/contest-3/loveable-assignment/project")

If false:

* STOP
* do not write
* explain why

5. If a requested file is outside the project root:

* refuse the modification
* do not attempt alternative locations

TOOLS

listProjectFiles
readFile
writeFile
bash

BASH RESTRICTIONS

bash is READ ONLY.

Allowed:

* npm run build
* npm run test
* npm run lint
* cat
* grep
* find
* ls
* pwd
* git diff
* git status

Forbidden:

* rm
* mv
* cp
* sed -i
* tee
* echo > file
* printf > file
* any command that modifies files

FILE MODIFICATION RULES

* writeFile is the ONLY tool allowed to modify files.
* Never create, modify, rename, or delete files using bash.
* Always use absolute paths for writes.
* Never infer another project root.
* Never write to the current working directory unless it is exactly ABSOLUTE_ROOT.

WORKFLOW

1. Discover project structure once.
2. Read only required files.
3. Plan.
4. Modify using writeFile with ABSOLUTE paths only.
5. Validate with read-only commands.

CRITICAL

If you are about to call:

writeFile("src/App.tsx", ...)

convert it to:

writeFile(
"/home/sahil/super30/contests/contest-3/loveable-assignment/project/src/App.tsx",
...
)

No exceptions.

 `;

const ai = new GoogleGenAI({ apiKey });

export async function generateWithGemini(prompt: string) {
  if (!apiKey) {
    return "Mock mode: GEMINI_API_KEY is not configured, so no files were changed.";
  }

  contents.push({ role: "user", parts: [{ text: prompt }] });
  projectSnapshot.messageHistory.push({
    content: prompt,
    role: "user",
    createdAt: Date.now().toString(),
  });

  while (true) {
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        tools: [
          {
            functionDeclarations: [
              listProjectFilesFunction,
              readFileFunction,
              wreitFileFunction,
              bashFunction,
            ],
          },
        ],
        systemInstruction: systemPrompt,
      },
    });

    contents.push(response.candidates![0]!.content);

    console.log(response.functionCalls);

    if (response.functionCalls && response.functionCalls.length > 0) {
      for (let fc of response.functionCalls) {
        let fcCallResponse: any;
        switch (fc.name) {
          case "bash":
            fcCallResponse = await bash(fc!.args!.command! as string);
            break;

          case "listProjectFiles":
            console.log("called tool ", "listprojectfiles");
            fcCallResponse = { files: await listProjectFiles() };

            break;
          case "readFile":
            console.log("called tool ", "readfile");
            fcCallResponse = await readFileTool(fc!.args!.filePath as string);
            break;
          case "writeFile":
            console.log("called tool ", "wreitFile");
            fcCallResponse = await writeFileTool(
              fc.args!.filePath as string,
              fc.args!.content as string,
            );
            break;

          default:
            break;
        }

        contents.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                name: fc.name,
                response: fcCallResponse,
                id: fc.id,
              },
            },
          ],
        });
      }
    } else {
      projectSnapshot.summary = response.text ?? "";
      projectSnapshot.updatedAt = Date.now().toString();
      projectSnapshot.files = await listProjectFiles();
      projectSnapshot.messageHistory.push({
        content: response.text ?? "",
        role: "assistant",
        createdAt: Date.now().toString(),
      });
      break;
    }
  }
}
