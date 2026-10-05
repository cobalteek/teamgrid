/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `EmailVerificationToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codeHash]` on the table `EmailVerificationToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codeHash` to the `EmailVerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EmailVerificationToken_tokenHash_key";

-- AlterTable
ALTER TABLE "EmailVerificationToken" DROP COLUMN "tokenHash",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "codeHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_codeHash_key" ON "EmailVerificationToken"("codeHash");
