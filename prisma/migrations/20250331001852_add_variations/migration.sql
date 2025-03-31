-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "variations" TEXT[] DEFAULT ARRAY[]::TEXT[];
