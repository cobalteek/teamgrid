CREATE TABLE "Vacation" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "employeeId" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Vacation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Vacation_organizationId_startDate_endDate_idx" ON "Vacation"("organizationId", "startDate", "endDate");
CREATE INDEX "Vacation_employeeId_startDate_endDate_idx" ON "Vacation"("employeeId", "startDate", "endDate");

ALTER TABLE "Vacation" ADD CONSTRAINT "Vacation_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Vacation" ADD CONSTRAINT "Vacation_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
