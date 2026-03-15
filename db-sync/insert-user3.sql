INSERT INTO "User" (id, email, "passwordHash", role, name, "memberTier", "memberId", "createdAt")
VALUES (
  'cccccccc-dddd-eeee-ffff-111111111111',
  'user3@prepapp.com',
  'hash',
  'USER',
  'User Three',
  'FREE',
  'user3member',
  NOW()
) ON CONFLICT (email) DO NOTHING;

SELECT email, role FROM "User" ORDER BY "createdAt";
