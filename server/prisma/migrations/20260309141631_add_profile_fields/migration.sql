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
ADD COLUMN     "memberId" TEXT NOT NULL,
ADD COLUMN     "memberTier" "MemberTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "pwd" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");
