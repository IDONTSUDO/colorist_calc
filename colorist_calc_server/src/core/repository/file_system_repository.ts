import * as fs from "fs";
import { promisify } from "node:util";
import { rimraf } from "rimraf";

export class FileSystemRepository {
  public createDir = promisify(fs.mkdir);
  public lsStat = promisify(fs.lstat);
  public writeFileAsync = promisify(fs.writeFile);
  public dirIsExists = promisify(fs.exists);
  public stat = promisify(fs.stat);
  public deleteDir = promisify(fs.unlink);
  public readFileAsync = promisify(fs.readFile);
  public readdir = promisify(fs.readdir);
  public deleteDirRecursive = rimraf;
  async readFileAtBuffer(path: string): Promise<Buffer> {
    if ((await this.lsStat(path)).isDirectory()) {
      return (
        await this.readdir(path, {
          encoding: "buffer",
        })
      ).reduce((accumulator, currentValue) => Buffer.joinBuffers([accumulator, currentValue]), Buffer.from(""));
    }
    return await this.readFileAsync(path);
  }
  delete = async (path: string) => {
    return await this.deleteDir(path);
  };
  readDirRecursive(path: string, filesToDir: string[] = []): string[] {
    const files = fs.readdirSync(path);
    files.forEach((file) => {
      let filePath = "";
      if (path[path.length - 1] !== "/") {
        filePath = `${path}/${file}`;
      } else {
        filePath = `${path}${file}`;
      }

      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        this.readDirRecursive(filePath, filesToDir);
      } else {
        filesToDir.push(file);
      }
    });
    return filesToDir;
  }
}

