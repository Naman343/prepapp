-- AlterTable: Add self-relation for sub-topics on Topic
ALTER TABLE "Topic" ADD COLUMN "parentTopicId" TEXT;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
