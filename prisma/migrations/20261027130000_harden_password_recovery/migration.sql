-- Remove the global uniqueness constraint from six-digit recovery-code hashes.
-- The same six-digit code may legitimately be issued to different users.
DROP INDEX IF EXISTS "PasswordRecoverToken_codeHash_key";

-- Invalidate existing JWTs after a password reset by versioning user sessions.
ALTER TABLE "User"
ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
