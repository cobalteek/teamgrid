-- CreateTable
CREATE TABLE "PasswordRecoverToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordRecoverToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordRecoverToken_codeHash_key" ON "PasswordRecoverToken"("codeHash");

-- CreateIndex
CREATE INDEX "PasswordRecoverToken_userId_expiresAt_idx" ON "PasswordRecoverToken"("userId", "expiresAt");

-- AddForeignKey
ALTER TABLE "PasswordRecoverToken" ADD CONSTRAINT "PasswordRecoverToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
