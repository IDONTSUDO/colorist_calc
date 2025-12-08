import { Result } from "../helpers/result";
import { FileSystemRepository } from "../repository/file_system_repository";

export class ReadFileUseCase {
  fileSystemRepository: FileSystemRepository = new FileSystemRepository();

  async call<T>(path: string): Promise<Result<string, T>> {
    try {
      if (RegExp(path).test("^(.+)/([^/]+)$")) {
        return Result.error(`ReadFileUseCase got the bad way: ${path}`);
      }
      const file = await this.fileSystemRepository.readFileAsync(path);
      return Result.ok(file.toString() as T);
    } catch (error) {
      return Result.error(`ReadFileUseCase error:${error}`);
    }
  }
}
