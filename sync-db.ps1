# ============================================================
#  PrepApp - Auto Database Sync Script
#  Pulls latest data from master (bhaiya's) server to local DB
# ============================================================

# ---------- MASTER SERVER (Bhaiya's) ----------
$MASTER_HOST     = "10.164.249.253"
$MASTER_PORT     = "5434"
$MASTER_DB       = "prepapp"
$MASTER_USER     = "postgres"
$MASTER_PASSWORD = "postgres"

# ---------- LOCAL SERVER (Your machine) ----------
$LOCAL_HOST     = "localhost"
$LOCAL_PORT     = "5432"
$LOCAL_DB       = "prepapp"
$LOCAL_USER     = "postgres"
$LOCAL_PASSWORD = "Missionpostgres"

# ---------- CONFIG ----------
$BACKUP_DIR  = "C:\Users\siddh\Desktop\prepapp\db-backups"
$LOG_FILE    = "C:\Users\siddh\Desktop\prepapp\sync-db.log"
$PG_BIN      = "C:\Program Files\PostgreSQL\17\bin"
$TIMESTAMP   = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$DUMP_FILE   = "$BACKUP_DIR\prepapp_$TIMESTAMP.dump"

# ---------- INIT ----------
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

function Log($msg) {
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Write-Host $line
    Add-Content -Path $LOG_FILE -Value $line
}

Log "=== Sync Started ==="

# ---------- STEP 1: Dump from master ----------
Log "Dumping from master ($MASTER_HOST)..."
$env:PGPASSWORD = $MASTER_PASSWORD
# Use --no-sync and plain format to avoid version mismatch issues
& "$PG_BIN\pg_dump.exe" `
    -U $MASTER_USER `
    -h $MASTER_HOST `
    -p $MASTER_PORT `
    -d $MASTER_DB `
    --no-password `
    -F p `
    -f "$DUMP_FILE.sql" 2>&1 | ForEach-Object { Log $_ }
$DUMP_FILE = "$DUMP_FILE.sql"

if (-not (Test-Path $DUMP_FILE)) {
    Log "ERROR: Dump failed - file not created. Check master server credentials/connectivity."
    exit 1
}

Log "Dump successful: $DUMP_FILE"

# ---------- STEP 2: Restore to local ----------
Log "Restoring to local database ($LOCAL_DB)..."
$env:PGPASSWORD = $LOCAL_PASSWORD
# Drop and recreate local DB for clean restore
& "$PG_BIN\psql.exe" -U $LOCAL_USER -h $LOCAL_HOST -p $LOCAL_PORT -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$LOCAL_DB';" 2>&1 | Out-Null
& "$PG_BIN\psql.exe" -U $LOCAL_USER -h $LOCAL_HOST -p $LOCAL_PORT -d postgres -c "DROP DATABASE IF EXISTS $LOCAL_DB;" 2>&1 | Out-Null
& "$PG_BIN\psql.exe" -U $LOCAL_USER -h $LOCAL_HOST -p $LOCAL_PORT -d postgres -c "CREATE DATABASE $LOCAL_DB;" 2>&1 | Out-Null
# Restore using plain SQL
& "$PG_BIN\psql.exe" `
    -U $LOCAL_USER `
    -h $LOCAL_HOST `
    -p $LOCAL_PORT `
    -d $LOCAL_DB `
    -f $DUMP_FILE 2>&1 | ForEach-Object { Log $_ }

Log "Restore complete."

# ---------- STEP 3: Cleanup old backups (keep last 5) ----------
Get-ChildItem "$BACKUP_DIR\prepapp_*.sql" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip 5 |
    ForEach-Object {
        Log "Deleting old backup: $($_.Name)"
        Remove-Item $_.FullName
    }

Log "=== Sync Finished ==="
