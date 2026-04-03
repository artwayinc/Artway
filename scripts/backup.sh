#!/bin/bash
# D1 backup script: exports remote DB to SQL file and removes old backups.

set -euo pipefail

BACKUP_DIR="./backups/d1"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-artway-db}"
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_$DATE.sql"

mkdir -p "$BACKUP_DIR"

echo "Exporting D1 database '$DB_NAME' to $BACKUP_FILE"
npx wrangler d1 export "$DB_NAME" --remote --output "$BACKUP_FILE"

find "$BACKUP_DIR" -name "${DB_NAME}_*.sql" -mtime +30 -delete
echo "Backup created: $BACKUP_FILE"
echo "Old backups cleaned (older than 30 days)"
