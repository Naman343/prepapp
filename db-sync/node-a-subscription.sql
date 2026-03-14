-- Run on NODE A after pub_b exists on NODE B
-- Replace placeholders:
-- <NODE_B_HOST> <NODE_B_PORT> <DB_NAME> <REPL_USER> <REPL_PASSWORD>

DROP SUBSCRIPTION IF EXISTS sub_from_b;
CREATE SUBSCRIPTION sub_from_b
CONNECTION 'host=<NODE_B_HOST> port=<NODE_B_PORT> dbname=<DB_NAME> user=<REPL_USER> password=<REPL_PASSWORD>'
PUBLICATION pub_b
WITH (
  copy_data = false,
  create_slot = true,
  enabled = true
);

SELECT subname, status, received_lsn, latest_end_lsn, latest_end_time
FROM pg_stat_subscription;
