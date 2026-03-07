Backend (NestJS — port 5000)
cd c:\Users\siddh\Desktop\prepapp\server
npm run start:dev

Frontend (Next.js — port 3000)
cd c:\Users\siddh\Desktop\prepapp\client
npm run dev

3. Database (Prisma — run once if schema changes)
cd c:\Users\siddh\Desktop\prepapp\server
npx prisma migrate 

.env
DATABASE_URL="postgresql://postgres:Missionpostgres@localhost:5432/prepapp"
JWT_SECRET="prepapp_jwt_secret_change_in_production"
PORT=5000