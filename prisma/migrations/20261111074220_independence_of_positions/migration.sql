-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_positionId_fkey";

-- DropForeignKey
ALTER TABLE "Shift" DROP CONSTRAINT "Shift_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Shift" DROP CONSTRAINT "Shift_positionId_fkey";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "positionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Shift" ALTER COLUMN "employeeId" DROP NOT NULL,
ALTER COLUMN "positionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
