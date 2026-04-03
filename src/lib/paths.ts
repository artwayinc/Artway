// Утилита для работы с путями с учетом basePath
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function getImagePath(path: string): string {
  // Если путь уже начинается с basePath, возвращаем как есть
  if (path.startsWith(basePath)) {
    return path;
  }
  // Добавляем basePath к пути
  return `${basePath}${path}`;
}
