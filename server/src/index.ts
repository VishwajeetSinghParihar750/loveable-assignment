import "dotenv/config";
import cors from "cors";
import express from "express";
import type { Message, ProjectSnapshot } from "./types.js";
import { contents, projectSnapshot } from "./content.js";
import { generateWithGemini } from "./gemini.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/project", async (_request, response) => {
  // you'll use this endpoint to show preview of your running react project , messages  , files , only one project for now is supported.
  // make sure the above state is synced with fe, even some changes are applied
  // return ProjectSnapshot type here
  response.json(projectSnapshot);
});

app.post("/api/messages", async (request, response) => {
  // read user message here and make changes to files present in projects folder in root dir
  // writeProjectFile(path, content). After writes, return a fresh project snapshot.

  const { message } = request.body;
  await generateWithGemini(message);
  response.json(projectSnapshot);
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
