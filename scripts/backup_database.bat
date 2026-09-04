@echo off
REM Database Backup Script for Referio Migration (Windows)
REM This script creates a full backup of the current database before migration

REM Configuration
set DB_NAME=referio
set BACKUP_DIR=.\database\backups
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set TIMESTAMP=%YYYY%%MM%%DD%_%HH%%Min%%Sec%
set BACKUP_FILE=%BACKUP_DIR%\referio_backup_%TIMESTAMP%.sql

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo 🔄 Starting database backup...
echo 📁 Backup directory: %BACKUP_DIR%
echo 📄 Backup file: %BACKUP_FILE%

REM Check if pg_dump is available
where pg_dump >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: pg_dump command not found. Please install PostgreSQL client tools.
    pause
    exit /b 1
)

REM Create the backup
echo ⏳ Creating backup...
pg_dump ^
    --host=localhost ^
    --port=5432 ^
    --username=postgres ^
    --dbname=%DB_NAME% ^
    --verbose ^
    --clean ^
    --create ^
    --if-exists ^
    --format=plain ^
    --file="%BACKUP_FILE%"

REM Check if backup was successful
if %ERRORLEVEL% equ 0 (
    echo ✅ Backup completed successfully!
    echo 📄 Backup file: %BACKUP_FILE%
    
    REM Get file size
    for %%A in ("%BACKUP_FILE%") do set FILE_SIZE=%%~zA
    echo 📊 Backup size: %FILE_SIZE% bytes
    
    REM Verify backup file exists and is not empty
    if exist "%BACKUP_FILE%" (
        echo ✅ Backup file verification passed
        echo 🔒 Backup is ready for migration
    ) else (
        echo ❌ Error: Backup file doesn't exist
        pause
        exit /b 1
    )
) else (
    echo ❌ Error: Backup failed
    pause
    exit /b 1
)

echo.
echo 📋 Next steps:
echo 1. Verify the backup file exists: %BACKUP_FILE%
echo 2. Test restore (optional): psql -f "%BACKUP_FILE%"
echo 3. Proceed with migration when ready
echo.
echo 🛡️  Your data is now safely backed up!
pause
