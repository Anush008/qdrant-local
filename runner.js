import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

// ESM doesn't support __dirname and __filename by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const { qdrantBinary } = packageJson;
const { name, directory } = qdrantBinary;
const exeName = ["win32", "cygwin"].includes(process.platform)
  ? `${name}.exe`
  : name;
const cwd = path.join(__dirname, directory);
const binPath = path.join(cwd, exeName);

export function runQdrant() {
  const restPort = getRandomFreePort();
  const child = spawn(binPath, [], {
    stdio: "ignore",
    cwd,
    env: {
      "QDRANT__SERVICE__HTTP_PORT": restPort,
      "QDRANT__SERVICE__ENABLE_STATIC_CONTENT": 0,
    }
  });

  process.on('exit', (e) => {
    child.kill();
  });

  child.unref();

  // TODO: Use a better wait strategy with /readyz
  sleepSync(1500);
  return restPort;
}

function getRandomFreePort() {
  // 0 means random free port assigned by the OS
  const server = http.createServer().listen(0);
  const port = server.address().port;
  server.close();
  return port;
}

function sleepSync(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) { }
}