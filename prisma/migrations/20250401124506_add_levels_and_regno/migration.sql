/*
  Warnings:

  - You are about to drop the column `username` on the `TeacherTrainee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[staffId]` on the table `Supervisor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[regNo]` on the table `TeacherTrainee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffId` to the `Supervisor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `TeacherTrainee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradeId` to the `TeacherTrainee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regNo` to the `TeacherTrainee` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TeacherTrainee_username_key";

-- AlterTable
ALTER TABLE "Supervisor" ADD COLUMN     "staffId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeacherTrainee" DROP COLUMN "username",
ADD COLUMN     "classId" INTEGER NOT NULL,
ADD COLUMN     "gradeId" INTEGER NOT NULL,
ADD COLUMN     "regNo" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Grade" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grade_level_key" ON "Grade"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supervisor_staffId_key" ON "Supervisor"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherTrainee_regNo_key" ON "TeacherTrainee"("regNo");

-- AddForeignKey
ALTER TABLE "TeacherTrainee" ADD CONSTRAINT "TeacherTrainee_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTrainee" ADD CONSTRAINT "TeacherTrainee_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
