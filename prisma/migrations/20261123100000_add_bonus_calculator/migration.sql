CREATE TABLE "BonusRule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "positionId" INTEGER,
    "employeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonusRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BonusMonth" (
    "id" SERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonusMonth_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BonusMonth_ruleId_month_key" ON "BonusMonth"("ruleId", "month");
CREATE INDEX "BonusRule_organizationId_scope_idx" ON "BonusRule"("organizationId", "scope");
CREATE INDEX "BonusRule_positionId_idx" ON "BonusRule"("positionId");
CREATE INDEX "BonusRule_employeeId_idx" ON "BonusRule"("employeeId");
CREATE INDEX "BonusMonth_organizationId_month_idx" ON "BonusMonth"("organizationId", "month");

ALTER TABLE "BonusRule" ADD CONSTRAINT "BonusRule_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BonusRule" ADD CONSTRAINT "BonusRule_positionId_fkey"
  FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BonusRule" ADD CONSTRAINT "BonusRule_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BonusMonth" ADD CONSTRAINT "BonusMonth_ruleId_fkey"
  FOREIGN KEY ("ruleId") REFERENCES "BonusRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BonusMonth" ADD CONSTRAINT "BonusMonth_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
