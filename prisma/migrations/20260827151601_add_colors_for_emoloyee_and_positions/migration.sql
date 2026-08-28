/*
  Warnings:

  - Added the required column `color` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "color" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "color" TEXT NOT NULL;
