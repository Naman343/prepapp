-- AlterTable: Add year and date fields to Test for PYQ metadata
ALTER TABLE "Test" ADD COLUMN     "year" INTEGER,
ADD COLUMN     "date" TIMESTAMP(3);
