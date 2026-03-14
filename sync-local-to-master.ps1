# ============================================================
#  PrepApp - One-time reverse sync (LOCAL -> MASTER)
#  Use when master is behind and local is source of truth
# ============================================================

param(
    [switch]$Force
)

# ---------- LOCAL SERVER (SOURCE) ----------
$LOCAL_HOST     = "localhost"
$LOCAL_PORT     = "5432"
$LOCAL_DB       = "prepapp"
$LOCAL_USER     = "postgres"
$LOCAL_PASSWORD = "Missionpostgres"

# ---------- MASTER SERVER (TARGET) ----------
$MASTER_HOST     = "LAPTOP-I6GVMCAT"
$MASTER_PORT     = "5434"
$MASTER_DB       = "prepapp"
$MASTER_USER     = "postgres"
$MASTER_PASSWORD = "postgres"

# ---------- CONFIG ----------
$BACKUP_DIR  = "C:\Users\siddh\Desktop\prepapp\db-backups"
$LOG_FILE    = "C:\Users\siddh\Desktop\prepapp\sync-local-to-master.log"
$PG_BIN      = "C:\Program Files\PostgreSQL\17\bin"
$TIMESTAMP   = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$DUMP_FILE   = "$BACKUP_DIR\prepapp_local_to_master_$TIMESTAMP.sql"
$MASTER_BK   = "$BACKUP_DIR\prepapp_master_backup_$TIMESTAMP.sql"

if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

function Log($msg) {
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Write-Host $line
    Add-Content -Path $LOG_FILE -Value $line
}

if (-not $Force) {
    Write-Host "This will OVERWRITE master database with local data."
    Write-Host "Re-run with -Force to continue."
    exit 1
}

Log "=== Reverse Sync Started (LOCAL -> MASTER) ==="

# ---------- STEP 0: Backup master before overwrite ----------
Log "Taking safety backup from master ($MASTER_HOST)..."
$env:PGPASSWORD = $MASTER_PASSWORD
& "$PG_BIN\pg_dump.exe" `
    -U $MASTER_USER `
    -h $MASTER_HOST `
    -p $MASTER_PORT `
    -d $MASTER_DB `
    --no-password `
    -F p `
    -f "$MASTER_BK" 2>&1 | ForEach-Object { Log $_ }

if (-not (Test-Path $MASTER_BK)) {
    Log "ERROR: Could not create master safety backup. Aborting."
    exit 1
}

Log "Master safety backup created: $MASTER_BK"

# ---------- STEP 1: Dump local ----------
Log "Dumping local source database ($LOCAL_HOST)..."
$env:PGPASSWORD = $LOCAL_PASSWORD
& "$PG_BIN\pg_dump.exe" `
    -U $LOCAL_USER `
    -h $LOCAL_HOST `
    -p $LOCAL_PORT `
    -d $LOCAL_DB `
    --no-password `
    -F p `
    -f "$DUMP_FILE" 2>&1 | ForEach-Object { Log $_ }

if (-not (Test-Path $DUMP_FILE)) {
    Log "ERROR: Local dump failed - file not created."
    exit 1
}

Log "Local dump successful: $DUMP_FILE"

# ---------- STEP 2: Restore local dump to master ----------
Log "Restoring local dump to master ($MASTER_DB)..."
$env:PGPASSWORD = $MASTER_PASSWORD
& "$PG_BIN\psql.exe" -U $MASTER_USER -h $MASTER_HOST -p $MASTER_PORT -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$MASTER_DB';" 2>&1 | Out-Null
& "$PG_BIN\psql.exe" -U $MASTER_USER -h $MASTER_HOST -p $MASTER_PORT -d postgres -c "DROP DATABASE IF EXISTS $MASTER_DB;" 2>&1 | Out-Null
& "$PG_BIN\psql.exe" -U $MASTER_USER -h $MASTER_HOST -p $MASTER_PORT -d postgres -c "CREATE DATABASE $MASTER_DB;" 2>&1 | Out-Null

& "$PG_BIN\psql.exe" `
    -U $MASTER_USER `
    -h $MASTER_HOST `
    -p $MASTER_PORT `
    -d $MASTER_DB `
    -f "$DUMP_FILE" 2>&1 | ForEach-Object { Log $_ }

Log "Restore to master complete."
Log "=== Reverse Sync Finished ==="
