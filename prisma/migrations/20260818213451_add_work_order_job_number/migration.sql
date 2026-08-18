/*
  Warnings:

  - A unique constraint covering the columns `[jobNumber]` on the table `WorkOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "jobNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_jobNumber_key" ON "WorkOrder"("jobNumber");
