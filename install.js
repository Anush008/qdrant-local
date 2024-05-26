import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

// ESM doesn't support __dirname and __filename by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
// The version number is expected to be in parity with the qdrant release version
const { qdrantBinary } = packageJson;
const { name, repository, directory, version } = qdrantBinary;

// All the binary files will be stored in the /bin directory
const binDir = path.join(__dirname, directory);

try {
  void install();
} catch (error) {
  console.error("Installation failed:", error.message);
}

async function install() {
  if (fs.existsSync(binDir)) {
    console.info("Binary directory already exists. Skipping download.");
    console.info(`If you want to re-download the binary, please remove the ${binDir} directory.`);
    return;
  }
  fs.mkdirSync(binDir, {
    mode: 0o777,
  });
  await getBinary();
}

async function getBinary() {
  const downloadURL = getBinaryDownloadURL();
  // console.log(`Downloading ${name} from ${downloadURL}`);
  const pkgName = ["win32", "cygwin"].includes(process.platform)
    ? `package.zip`
    : `package.tar.gz`;
  const packagePath = path.join(binDir, pkgName);

  await downloadPackage(downloadURL, packagePath);
  await extractPackage(packagePath, binDir);

  fs.rmSync(packagePath);
}

function getBinaryDownloadURL() {
  let os, arch;

  switch (process.platform) {
    case "win32":
    case "cygwin":
      os = "pc-windows-msvc";
      break;
    case "darwin":
      os = "apple-darwin";
      break;
    case "linux":
      os = "unknown-linux-gnu";
      break;
    default:
      throw new Error(`Unsupported OS: ${process.platform}`);
  }

  switch (process.arch) {
    case "x64":
      arch = "x86_64";
      break;
    case "arm64":
      // Qdrant release workflow cuts arm64 binaries only for darwin and linux
      if (!os in ["apple-darwin", "unknown-linux-gnu"]) {
        throw new Error(
          `Qdrant local is not supported in ${process.platform}-arm64`
        );
      }
      arch = "aarch64";
      break;
    default:
      throw new Error(`Unsupported architecture: ${process.arch}`);
  }

  const extension = os === "pc-windows-msvc" ? "zip" : "tar.gz";

  return `${repository}/releases/download/v${version}/${name}-${arch}-${os}.${extension}`;
}

function downloadPackage(url, outputPath) {
  // We use https.get instead of fetch to get a readable stream from the response without additional dependencies
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        // If the response is a redirect, we download the package from the new location
        if (response.statusCode === 302) {
          resolve(downloadPackage(response.headers.location, outputPath));
        } else if (response.statusCode === 200) {
          const file = fs.createWriteStream(outputPath);
          response.pipe(file);
          file.on("finish", () => {
            file.close(resolve);
          });
        } else {
          reject(
            new Error(
              `Failed to download ${name}. Status code: ${response.statusCode}`
            )
          );
        }
      })
      .on("error", reject);
  });
}

async function extractPackage(inputPath, outputPath) {
  if (path.extname(inputPath) === ".gz") {
    const tar = await import("tar");
    await tar.x({
      file: inputPath,
      cwd: outputPath,
    });
  } else if (path.extname(inputPath) === ".zip") {
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(inputPath);
    zip.extractAllTo(outputPath, true, true);
  }
}