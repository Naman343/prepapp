/*
  Warnings:

  - A unique constraint covering the columns `[memberId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `memberId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GEN', 'EWS', 'OBC', 'SC', 'ST');

-- CreateEnum
CREATE TYPE "MemberTier" AS ENUM ('FREE', 'PRO', 'MAX');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "category" "Category",
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "memberTier" "MemberTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "pwd" BOOLEAN;

-- Backfill memberId for existing rows that have no value
UPDATE "User" SET "memberId" = substr(md5(random()::text || id), 1, 12) WHERE "memberId" IS NULL;

-- Now enforce NOT NULL and unique
ALTER TABLE "User" ALTER COLUMN "memberId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");


