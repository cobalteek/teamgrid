-- AlterTable
ALTER TABLE "ConsentRecord"
ADD COLUMN "notificationId" TEXT;

-- AlterTable
ALTER TABLE "Notification"
ADD COLUMN "consentRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "consentType" TEXT,
ADD COLUMN "consentVersion" TEXT;

-- AlterTable
ALTER TABLE "NotificationRecipient"
ADD COLUMN "acceptedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "NotificationCheckbox" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationCheckbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsentRecord_notificationId_idx" ON "ConsentRecord"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRecord_userId_consentType_version_key" ON "ConsentRecord"("userId", "consentType", "version");

-- CreateIndex
CREATE INDEX "NotificationCheckbox_notificationId_sortOrder_idx" ON "NotificationCheckbox"("notificationId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationCheckbox" ADD CONSTRAINT "NotificationCheckbox_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
