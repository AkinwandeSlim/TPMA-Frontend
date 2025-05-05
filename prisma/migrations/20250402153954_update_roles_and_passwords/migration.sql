/*
  Warnings:

  - You are about to drop the column `username` on the `Supervisor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Supervisor_username_key";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE "Supervisor" DROP COLUMN "username",
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'supervisor';

-- AlterTable
ALTER TABLE "TeacherTrainee" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'teacherTrainee';
