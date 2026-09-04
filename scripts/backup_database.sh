#!/bin/bash

# Database Backup Script for Referio Migration
# This script creates a full backup of the current database before migration

# Configuration
DB_NAME="referio"
BACKUP_DIR="./database/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/referio_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting database backup..."
echo "📁 Backup directory: $BACKUP_DIR"
echo "📄 Backup file: $BACKUP_FILE"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "❌ Error: pg_dump command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Create the backup
echo "⏳ Creating backup..."
pg_dump \
    --host=localhost \
    --port=5432 \
    --username=postgres \
    --dbname="$DB_NAME" \
    --verbose \
    --clean \
    --create \
    --if-exists \
    --format=plain \
    --file="$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "📄 Backup file: $BACKUP_FILE"
    
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "📊 Backup size: $FILE_SIZE"
    
    # Verify backup file exists and is not empty
    if [ -s "$BACKUP_FILE" ]; then
        echo "✅ Backup file verification passed"
        echo "🔒 Backup is ready for migration"
    else
        echo "❌ Error: Backup file is empty or doesn't exist"
        exit 1
    fi
else
    echo "❌ Error: Backup failed"
    exit 1
fi

echo ""
echo "📋 Next steps:"
echo "1. Verify the backup file exists: $BACKUP_FILE"
echo "2. Test restore (optional): psql -f $BACKUP_FILE"
echo "3. Proceed with migration when ready"
echo ""
echo "🛡️  Your data is now safely backed up!"
