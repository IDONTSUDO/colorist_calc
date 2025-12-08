import { promises as fs } from 'fs';
import path from 'path';

interface SaveFileRequest {
  filename: string;
  content: string | Buffer;
  directory?: string;
}

export class SaveFileUseCase {
  async call(request: SaveFileRequest): Promise<string> {
    const dir = request.directory || './';
    const filePath = path.resolve(dir, request.filename);

    try {
      // Создаем директорию, если не существует
      await fs.mkdir(dir, { recursive: true });
      // Записываем файл
      await fs.writeFile(filePath, request.content);
      return filePath;
    } catch (error) {
      throw new Error(`Ошибка сохранения файла: ${error.message}`);
    }
  }
}

  