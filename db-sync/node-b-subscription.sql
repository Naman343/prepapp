-- Run on NODE B after pub_a exists on NODE A
-- Replace placeholders:
-- <NODE_A_HOST> <NODE_A_PORT> <DB_NAME> <REPL_USER> <REPL_PASSWORD>

DROP SUBSCRIPTION IF EXISTS sub_from_a;
CREATE SUBSCRIPTION sub_from_a
CONNECTION 'host=<NODE_A_HOST> port=<NODE_A_PORT> dbname=<DB_NAME> user=<REPL_USER> password=<REPL_PASSWORD>'
PUBLICATION pub_a
WITH (
  copy_data = false,
  create_slot = true,
  enabled = true
);

SELECT subname, status, received_lsn, latest_end_lsn, latest_end_time
FROM pg_stat_subscription;
