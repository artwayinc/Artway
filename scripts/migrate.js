#!/usr/bin/env node
/**
 * Пример скрипта миграции для schedule.json
 * 
 * Использование:
 *   node scripts/migrate.js
 * 
 * Перед запуском создайте бекап:
 *   cp data/schedule.json data/schedule.json.backup
 */

const fs = require('fs');
const path = require('path');

const scheduleFile = path.join(__dirname, '../data/schedule.json');

if (!fs.existsSync(scheduleFile)) {
  console.error('Error: data/schedule.json not found');
  process.exit(1);
}

try {
  // Читаем текущие данные
  const events = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
  console.log(`Found ${events.length} events`);

  // Применить миграции
  const migrated = events.map(event => {
    // Пример: добавить новое поле если его нет
    // return {
    //   ...event,
    //   newField: event.newField || 'default-value'
    // };

    // Пример: переименовать поле
    // const { oldField, ...rest } = event;
    // return {
    //   ...rest,
    //   newField: oldField || ''
    // };

    // По умолчанию возвращаем без изменений
    return event;
  });

  // Сохраняем мигрированные данные
  fs.writeFileSync(scheduleFile, JSON.stringify(migrated, null, 2), 'utf-8');
  console.log('Migration completed successfully');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
