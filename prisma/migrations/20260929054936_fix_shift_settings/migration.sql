/*
  Warnings:

  - The `endTime` column on the `Shift` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startTime` column on the `Shift` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "endTime",
ADD COLUMN     "endTime" INTEGER,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" INTEGER;
