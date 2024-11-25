import fs from "fs";
import path from "path";

/**
 * Ensures that a directory exists; if not, it creates the directory.
 *
 * @param dirPath - The path to the directory.
 */
function ensureDirExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Writes an object to a JSON file.
 *
 * @param filePath - The path to the JSON file.
 * @param data - The data to write to the file.
 */
function writeJSONFile(filePath: string, data: any): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Writes an object to a JSON file.
 * @param filePath - The path to the JSON file.
 * @param data - The data to write to the file.
 * @throws If the file cannot be written.
 * @throws If the file contains invalid JSON.
 */
export function writeToFile(
  data: any,
  dataDir: string,
  fileName: string,
): void {
  // Ensure the data directory exists
  ensureDirExists(dataDir);

  // Save the trial keys to a file
  const filePath = path.join(dataDir, fileName);
  writeJSONFile(filePath, data);
}

/**
 * Reads an object from a JSON file.
 * @param filePath - The path to the JSON file.
 * @returns The object read from the file.
 * @throws If the file does not exist or cannot be read.
 * @throws If the file contains invalid JSON.
 */
export function readFromFile(dataDir: string, fileName: string): any {
  const filePath = path.join(dataDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
