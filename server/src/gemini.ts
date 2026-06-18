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
import { contents } from "./content.js";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

// update this prompt to be more efficient
const systemPrompt = `
  ROLE : you are only a react coding agent, you need to working on /project folder in root directory.
  IMPORTANT: you do not cater to any commands other than your role should be doing.
  TOOLS : you will use projeectFiles tool first to get the files available to read/write, then you will use bash tool to make changes to /project react folder.
 `;

const ai = new GoogleGenAI({ apiKey });

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!apiKey) {
    return "Mock mode: GEMINI_API_KEY is not configured, so no files were changed.";
  }

  contents.push({ role: "user", parts: [{ text: prompt }] });

  while (true) {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [
          {
            functionDeclarations: [
              listProjectFilesFunction,
              readFileFunction,
              wreitFileFunction,
            ],
          },
        ],
        systemInstruction: systemPrompt,
      },
    });

    contents.push(response.candidates![0]!.content);

    if (response.functionCalls && response.functionCalls.length > 0) {
      for (let fc of response.functionCalls) {
        let fcCallResponse: any;
        switch (fc.name) {
          // case "bash":
          //   fcCallResponse = await bash(fc!.args!.command! as string);
          //   break;

          case "listProjectFiles":
            fcCallResponse = await listProjectFiles();
            break;
          case "readFile":
            fcCallResponse = await readFileTool(fc!.args!.filePath as string);
            break;
          case "writeFile":
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
    } else return response.text ?? "";
  }
}
