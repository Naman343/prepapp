INSERT INTO "User" (id, email, "passwordHash", role, name, "mobileNumber", dob, location, category, pwd, "memberTier", "memberId", "createdAt")
VALUES (
  'c61b676b-173f-489f-9b63-b05e1bbfcd28',
  'admin@prepapp.com',
  '$2b$10$j7sir8Jzk8CyAIC9U7JEburuOlxNlEh9A7nu7utk2lMviA2zSxDmK',
  'ADMIN',
  'Admin',
  NULL, NULL, NULL, NULL, NULL,
  'FREE',
  '394f93234c12',
  '2026-03-14 16:30:13.932'
) ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  role = EXCLUDED.role;

SELECT email, role FROM "User";
