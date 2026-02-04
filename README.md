# Artway Fine Art Services

Сайт для компании Artway Fine Art Services - перевозка и обработка предметов искусства.

## Установка и запуск

### Требования

- Node.js 18+
- npm, yarn, pnpm или bun

### Установка зависимостей

```bash
npm install
# или
yarn install
# или
pnpm install
```

### Настройка окружения

Создайте файл `.env.local` в корне проекта:

```bash
cp .env.example .env.local
```

Заполните переменные окружения:

```env
# Email настройки (для формы обратной связи)
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_app_password
MAIL_TO=your_yahoo_address@yahoo.com

# Админка
ADMIN_USERNAME=artway-admin
ADMIN_PASSWORD=your-secure-password-here
```

⚠️ **Важно:** Измените `ADMIN_PASSWORD` на надежный пароль перед деплоем!

### Запуск в режиме разработки

```bash
npm run dev
# или
yarn dev
# или
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### Сборка для продакшна

```bash
npm run build
npm start
```

## Оптимизация изображений

Проект использует оптимизированные изображения для улучшения производительности сайта. Изображения из `public/services/` и главное изображение `public/main.jpg` конвертируются в формат WebP.

### Запуск оптимизации

Для оптимизации всех изображений запустите:

```bash
npm run optimize-images
```

Скрипт автоматически:

- Конвертирует PNG изображения из `public/services/` в WebP формат (уменьшение размера на 90-93%)
- Конвертирует `public/main.jpg` в `public/main.webp` (как и изображения в services/)
- Выводит статистику по каждому обработанному файлу

### Когда запускать оптимизацию

Запускайте оптимизацию в следующих случаях:

- После добавления новых изображений в `public/services/`
- После обновления `public/main.jpg`
- Перед деплоем в продакшн

### Форматы изображений

- **Изображения services/**: Используйте формат WebP (создается автоматически при оптимизации)
- **Главное изображение**: Исходник `public/main.jpg` конвертируется в `public/main.webp` (как в services/)

### Примечание

В проекте используется статический экспорт (`output: "export"`), поэтому автоматическая оптимизация Next.js Image отключена (`images: { unoptimized: true }`). Все изображения оптимизируются вручную с помощью скрипта `optimize-images`.

## База данных

Проект использует простую файловую БД на основе JSON файла.

### Структура БД

- **Файл:** `data/schedule.json`
- **Формат:** JSON массив событий
- **Структура записи:**
  ```json
  {
    "id": "unique-id",
    "date": "Jan 9 - 13",
    "name": "Event Name",
    "location": "Event Location"
  }
  ```

### Инициализация БД

При первом запуске файл `data/schedule.json` создается автоматически с начальными данными.

Если файл отсутствует, создайте папку `data` и файл `schedule.json`:

```bash
mkdir -p data
touch data/schedule.json
echo "[]" > data/schedule.json
```

### Настройка БД на сервере

1. **Создайте папку для данных:**

   ```bash
   mkdir -p /path/to/project/data
   ```

2. **Установите права доступа:**

   ```bash
   chmod 755 /path/to/project/data
   chmod 644 /path/to/project/data/schedule.json
   ```

3. **Убедитесь, что процесс Next.js имеет права на запись:**

   - Проверьте пользователя, под которым запущен процесс
   - Убедитесь, что у пользователя есть права на запись в папку `data`

4. **Для продакшна (PM2, systemd и т.д.):**

   ```bash
   # Пример для systemd
   # Убедитесь, что User= в service файле имеет права на запись
   ```

5. **Проверка прав доступа:**

   ```bash
   # Проверить текущего пользователя
   whoami

   # Проверить права на папку
   ls -la data/

   # Если нужно изменить владельца
   sudo chown -R $USER:$USER data/
   ```

## Миграции

Поскольку используется JSON файл, миграции выполняются вручную.

### Обновление структуры данных

Если нужно изменить структуру записей в `schedule.json`:

1. **Создайте бекап:**

   ```bash
   cp data/schedule.json data/schedule.json.backup
   ```

2. **Обновите структуру:**

   - Отредактируйте `data/schedule.json` вручную
   - Или используйте скрипт миграции (см. ниже)

3. **Пример скрипта миграции:**

   ```javascript
   // scripts/migrate.js
   const fs = require("fs");
   const path = require("path");

   const scheduleFile = path.join(__dirname, "../data/schedule.json");
   const events = JSON.parse(fs.readFileSync(scheduleFile, "utf-8"));

   // Применить изменения
   const migrated = events.map((event) => ({
     ...event,
     // Добавить новое поле или изменить существующее
     newField: event.newField || "default-value",
   }));

   fs.writeFileSync(scheduleFile, JSON.stringify(migrated, null, 2));
   console.log("Migration completed");
   ```

4. **Запустите миграцию:**
   ```bash
   node scripts/migrate.js
   ```

### Добавление новых полей

Если нужно добавить новое поле ко всем записям:

```bash
# Используйте jq для массового обновления (если установлен)
jq 'map(. + {newField: ""})' data/schedule.json > data/schedule.json.tmp
mv data/schedule.json.tmp data/schedule.json
```

Или используйте Node.js скрипт:

```javascript
const fs = require("fs");
const events = JSON.parse(fs.readFileSync("data/schedule.json", "utf-8"));
const updated = events.map((e) => ({ ...e, newField: "" }));
fs.writeFileSync("data/schedule.json", JSON.stringify(updated, null, 2));
```

## Резервное копирование (Backup)

### Автоматический бекап

Создайте скрипт для автоматического бекапа:

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/schedule_$DATE.json"

mkdir -p $BACKUP_DIR
cp data/schedule.json $BACKUP_FILE

# Удалить бекапы старше 30 дней
find $BACKUP_DIR -name "schedule_*.json" -mtime +30 -delete

echo "Backup created: $BACKUP_FILE"
```

Сделайте скрипт исполняемым:

```bash
chmod +x scripts/backup.sh
```

### Настройка cron для автоматических бекапов

Добавьте в crontab (бекап каждый день в 2:00):

```bash
crontab -e
```

Добавьте строку:

```
0 2 * * * cd /path/to/project && ./scripts/backup.sh >> /path/to/project/backups/backup.log 2>&1
```

### Ручной бекап

```bash
# Создать бекап с датой
cp data/schedule.json data/schedule_$(date +%Y%m%d_%H%M%S).json

# Или в отдельную папку
mkdir -p backups
cp data/schedule.json backups/schedule_$(date +%Y%m%d_%H%M%S).json
```

### Восстановление из бекапа

```bash
# Найти нужный бекап
ls -la backups/

# Восстановить
cp backups/schedule_20250125_020000.json data/schedule.json
```

### Рекомендации по бекапам

1. **Частота:** Минимум раз в день, лучше после каждого изменения
2. **Хранение:** Храните бекапы в отдельной папке или на внешнем хранилище
3. **Ротация:** Удаляйте старые бекапы (старше 30-90 дней)
4. **Проверка:** Периодически проверяйте, что бекапы создаются корректно
5. **Оффлайн копии:** Делайте копии на внешние носители или облачное хранилище

### Бекап на удаленный сервер

Для дополнительной безопасности можно настроить автоматическую отправку бекапов на удаленный сервер:

```bash
#!/bin/bash
# scripts/backup-remote.sh

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/schedule_$DATE.json"

mkdir -p $BACKUP_DIR
cp data/schedule.json $BACKUP_FILE

# Отправить на удаленный сервер через SCP
scp $BACKUP_FILE user@remote-server:/path/to/backups/

# Или использовать rsync
rsync -avz $BACKUP_FILE user@remote-server:/path/to/backups/
```

## Админка

### Доступ к админке

- **URL:** `/admin`
- **Логин:** Значение из `ADMIN_USERNAME` в `.env.local`
- **Пароль:** Значение из `ADMIN_PASSWORD` в `.env.local`

### Управление расписанием

После входа в админку доступна страница `/admin/schedule` для:

- Просмотра всех событий
- Добавления новых событий
- Редактирования существующих событий
- Удаления событий

### Безопасность

⚠️ **Важно для продакшна:**

- Используйте сложный пароль (минимум 16 символов)
- Регулярно меняйте пароль
- Не коммитьте `.env.local` в git
- Используйте HTTPS в продакшне
- Рассмотрите добавление rate limiting

Подробнее о безопасности см. [ADMIN_SECURITY.md](./ADMIN_SECURITY.md)

## SEO: Семантическое ядро

Базовые ключевые группы для сайта по перевозке предметов искусства:

- fine art shipping
- fine art logistics
- fine art transportation
- fine art handling
- fine art storage
- art packing
- art crating
- white glove delivery
- art installation
- museum art transport
- gallery art transport
- art courier service
- international art shipping
- local art shipping
- art moving services
- art transportation New York
- fine art shipping New York
- art logistics NYC

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
