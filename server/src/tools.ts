// put your tools here

import { Type } from "@google/genai";
import { exec } from "child_process";
import { readFile } from "fs/promises";
import { writeFile } from "fs/promises";
import { promisify } from "util";

const asyncExec = promisify(exec);

const listProjectFilesFunction = {
  name: "listProjectFiles",
  description: `
  returns the files you can work on, you can not edit any other file than the ones listed here,
  which might change as project grows and more files are added
  returns : string[] i.e filesNames array
  `,
};

const readFileFunction = {
  name: "readFile",
  description: `
  returns {content : string, error ?: string }
  `,
  parameters: {
    type: Type.OBJECT,
    properties: {
      filePath: {
        type: Type.STRING,
        description: "filePath to read",
      },
    },
    required: ["filePath"],
  },
};

const wreitFileFunction = {
  name: "writeFile",
  description: `
    asynchronously writes data to the file, replacing the file if it already exists. data can be a string or a buffer.
    returns {error : boolean, errorMessage ?: string } 
  `,
  parameters: {
    type: Type.OBJECT,
    properties: {
      filePath: {
        type: Type.STRING,
        description: "filePath to write ",
      },
      content: {
        type: Type.STRING,
        description:
          "content to write in that file, replaces the content already there",
      },
    },
    required: ["filePath", "content"],
  },
};

const readFileTool = async (path: string) => {
  try {
    let res = await readFile(path, { encoding: "utf-8" });
    return { content: res };
  } catch (error) {
    return { content: "", error: (error as Error).message };
  }
};

const writeFileTool = async (path: string, content: string) => {
  try {
    await writeFile(path, content);
    return { error: false };
  } catch (error) {
    return { error: true, errorMessage: (error as Error).message };
  }
};

const bashFunction = {
  name: "bash",
  description: `
  GNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)
  returns  { stderr : string , stdout : string, errorInRunningCommand : boolean, error ?: string}
  `,
  parameters: {
    type: Type.OBJECT,
    properties: {
      command: {
        type: Type.STRING,
        description: "command to run on bash",
      },
    },
    required: ["command"],
  },
};

const bash = async (command: string) => {
  try {
    const { stderr, stdout } = await asyncExec(command);
    return { stdout, stderr, errorInRunningCommand: false };
  } catch (error) {
    return { errorInRunningCommand: true, error: (error as Error).message };
  }
};

export {
  bash,
  bashFunction,
  listProjectFilesFunction,
  readFileFunction,
  wreitFileFunction,
  readFileTool,
  writeFileTool,
};
