import { Message, ProjectSnapshot } from "./types.js";

const previewUrl = process.env.PROJECT_PREVIEW_URL ?? "http://localhost:5174";

const contents: any[] = [];
const messageHistory: Message[] = [];
const projectSnapshot: ProjectSnapshot = {
  files: [],
  messageHistory,
  previewUrl,
  summary: "",
  updatedAt: Date.now().toString(),
};

export { contents, messageHistory, projectSnapshot };
