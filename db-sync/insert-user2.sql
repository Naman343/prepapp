INSERT INTO "User" (id, email, "passwordHash", role, name, "mobileNumber", dob, location, category, pwd, "memberTier", "memberId", "createdAt")
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'user2@prepapp.com',
  '$2b$10$j7sir8Jzk8CyAIC9U7JEburuOlxNlEh9A7nu7utk2lMviA2zSxDmK',
  'USER',
  'User Two',
  NULL, NULL, NULL, NULL, NULL,
  'FREE',
  'user2memberId',
  NOW()
) ON CONFLICT (email) DO NOTHING;

SELECT email, role FROM "User" ORDER BY "createdAt";
