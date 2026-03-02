/*
  Warnings:

  - A unique constraint covering the columns `[soundcloudId]` on the table `Album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[soundcloudId]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[soundcloudId]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "soundcloudId" TEXT;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "followers" INTEGER,
ADD COLUMN     "soundcloudId" TEXT,
ADD COLUMN     "verified" BOOLEAN;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "comments" INTEGER,
ADD COLUMN     "likes" INTEGER,
ADD COLUMN     "playbackCount" INTEGER,
ADD COLUMN     "releaseDate" TIMESTAMP(3),
ADD COLUMN     "reposts" INTEGER,
ADD COLUMN     "soundcloudId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Album_soundcloudId_key" ON "Album"("soundcloudId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_soundcloudId_key" ON "Artist"("soundcloudId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_soundcloudId_key" ON "Track"("soundcloudId");
