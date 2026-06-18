import { spawn } from "node:child_process";

const workspaces = ["client", "project", "server"];

for (const ws of workspaces) {
  const child = spawn("npm", ["run", "dev", "--workspace", ws], {
    stdio: "inherit",
    shell: true,
    cwd: new URL("..", import.meta.url).pathname,
  });
  child.on("error", (err) => {
    console.error(`[${ws}] error:`, err.message);
  });
  child.on("exit", (code) => {
    console.error(`[${ws}] exited with code ${code}`);
  });
}
