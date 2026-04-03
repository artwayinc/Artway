#!/bin/bash
# Скрипт для автоматического бекапа schedule.json

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/schedule_$DATE.json"

# Создать папку для бекапов если её нет
mkdir -p $BACKUP_DIR

# Создать бекап
if [ -f "data/schedule.json" ]; then
  cp data/schedule.json $BACKUP_FILE
  echo "Backup created: $BACKUP_FILE"
  
  # Удалить бекапы старше 30 дней
  find $BACKUP_DIR -name "schedule_*.json" -mtime +30 -delete
  echo "Old backups cleaned (older than 30 days)"
else
  echo "Error: data/schedule.json not found"
  exit 1
fi
