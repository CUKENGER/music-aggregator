-- AlterTable
ALTER TABLE "Album" ALTER COLUMN "deezerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Artist" ALTER COLUMN "deezerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Track" ALTER COLUMN "deezerId" DROP NOT NULL;
