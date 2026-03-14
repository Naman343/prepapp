-- Run this on NODE A (connected to prepapp database)
-- Replace placeholders before execution:
--   <NODE_B_HOST>, <NODE_B_PORT>, <DB_NAME>, <REPL_USER>, <REPL_PASSWORD>

-- Create publication for all current tables
DROP PUBLICATION IF EXISTS pub_a;
CREATE PUBLICATION pub_a FOR ALL TABLES;

-- Subscribe NODE A to NODE B publication
DROP SUBSCRIPTION IF EXISTS sub_from_b;
CREATE SUBSCRIPTION sub_from_b
CONNECTION 'host=<NODE_B_HOST> port=<NODE_B_PORT> dbname=<DB_NAME> user=<REPL_USER> password=<REPL_PASSWORD>'
PUBLICATION pub_b
WITH (
  copy_data = false,
  create_slot = true,
  enabled = true
);

-- Verify
SELECT subname, status, received_lsn, latest_end_lsn, latest_end_time
FROM pg_stat_subscription;
