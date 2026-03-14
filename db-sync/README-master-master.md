# PostgreSQL master-master (bidirectional logical replication)

This setup converts two PostgreSQL servers into write-capable peers using built-in logical replication.

Important limits:
- DDL is not replicated (run Prisma migrations on both nodes).
- Conflict handling is not automatic for same-row writes on both nodes.
- Use clear write ownership (for example, user data on node A, analytics on node B) or implement app-level conflict policy.

## 0) Prerequisites on both nodes

In postgresql.conf (both nodes):
- wal_level = logical
- max_replication_slots = 10
- max_wal_senders = 10
- max_worker_processes = 10

In pg_hba.conf (both nodes):
Allow replication user from opposite node IP.

Then restart PostgreSQL.

## 1) Promote old replica if still in recovery

Run on old replica:

```sql
SELECT pg_is_in_recovery();
SELECT pg_promote(wait => true);
SELECT pg_is_in_recovery();
```

## 2) Create replication role on both nodes

```sql
CREATE ROLE repl_user WITH LOGIN REPLICATION PASSWORD 'REPLACE_STRONG_PASSWORD';
```

## 3) Run scripts in this exact order

1. Run db-sync/node-a-publication.sql on node A.
2. Run db-sync/node-b-publication.sql on node B.
3. Run db-sync/node-a-subscription.sql on node A (after replacing placeholders).
4. Run db-sync/node-b-subscription.sql on node B (after replacing placeholders).

This split avoids circular dependency errors while creating subscriptions.

## 4) Verify

On both nodes:

```sql
SELECT subname, status, received_lsn, latest_end_lsn, latest_end_time
FROM pg_stat_subscription;

SELECT slot_name, active, restart_lsn
FROM pg_replication_slots;
```

## 5) Optional initial consistency check

Before enabling app writes on both sides, compare row counts for key tables:

```sql
SELECT 'User' AS table_name, COUNT(*) FROM "User"
UNION ALL SELECT 'Test', COUNT(*) FROM "Test"
UNION ALL SELECT 'Question', COUNT(*) FROM "Question"
UNION ALL SELECT 'TestAttempt', COUNT(*) FROM "TestAttempt"
UNION ALL SELECT 'Response', COUNT(*) FROM "Response";
```

## 6) Rollback (disable replication quickly)

On both nodes:

```sql
ALTER SUBSCRIPTION sub_from_a DISABLE;
ALTER SUBSCRIPTION sub_from_b DISABLE;
```

Drop later if needed:

```sql
DROP SUBSCRIPTION sub_from_a;
DROP SUBSCRIPTION sub_from_b;
DROP PUBLICATION pub_a;
DROP PUBLICATION pub_b;
```
