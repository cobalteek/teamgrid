-- DropIndex
DROP INDEX "OrganizationMember_organizationId_idx";

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_roleId_idx" ON "OrganizationMember"("organizationId", "roleId");
