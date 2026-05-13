-- Add MVP photoUrl to coaches (fallback while MediaCenter is not yet wired).
ALTER TABLE "coaches" ADD COLUMN "photoUrl" TEXT;
