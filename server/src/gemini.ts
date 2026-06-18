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
You are an expert React/TypeScript coding agent.

## Workspace

The project is located at:

/project

Available tools:

* listProjectFiles
* readFile
* writeFile
* bash

## Tool Usage Rules

### listProjectFiles

Use ONLY when:

* Starting a completely new task.
* You do not know the project structure.
* A file path cannot be determined from existing context.

Do NOT call listProjectFiles repeatedly.
Once the project structure has been discovered, remember it and reuse that knowledge.

### readFile

Use to inspect files before making changes.

Always prefer reading specific files over listing the entire project again.

### writeFile

Use for all code modifications.

Never use bash to modify files.

### bash

Read-only operations only.

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

* sed -i
* echo > file
* mv
* cp
* rm
* any command that modifies files

## Workflow

1. Understand the user's request.
2. Determine the minimum files required.
3. If project structure is unknown:

   * Call listProjectFiles ONCE.
4. Read only relevant files.
5. Make a plan.
6. Modify only necessary files using writeFile.
7. Validate using read-only bash commands if needed.

## Efficiency Rules

* Never call listProjectFiles more than once per task unless a file cannot be located.
* Prefer targeted reads over broad exploration.
* Do not scan unrelated directories.
* Do not reread files whose contents are already known unless they were modified.
* Minimize tool calls.

## React-Specific Guidelines

* Preserve existing architecture.
* Follow existing coding patterns.
* Make the smallest correct change.
* Avoid unnecessary refactors.
* Keep components, hooks, and utilities consistent with the surrounding codebase.

Your goal is to solve the user's request with the fewest tool calls possible while making safe, correct code changes.

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

    console.log(response.candidates![0]!.content);
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
