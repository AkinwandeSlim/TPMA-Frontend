/*
  Warnings:

  - You are about to drop the column `classId` on the `TeacherTrainee` table. All the data in the column will be lost.
  - You are about to drop the column `gradeId` on the `TeacherTrainee` table. All the data in the column will be lost.
  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `courseId` to the `TeacherTrainee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `levelId` to the `TeacherTrainee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherTrainee" DROP CONSTRAINT "TeacherTrainee_classId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherTrainee" DROP CONSTRAINT "TeacherTrainee_gradeId_fkey";

-- AlterTable
ALTER TABLE "TeacherTrainee" DROP COLUMN "classId",
DROP COLUMN "gradeId",
ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD COLUMN     "levelId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "_SupervisorTeacherTrainee" ADD CONSTRAINT "_SupervisorTeacherTrainee_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SupervisorTeacherTrainee_AB_unique";

-- DropTable
DROP TABLE "Class";

-- DropTable
DROP TABLE "Grade";

-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherTraineeId" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "supervisorId" TEXT,
    "feedback" TEXT,

    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Level_level_key" ON "Level"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");

-- AddForeignKey
ALTER TABLE "TeacherTrainee" ADD CONSTRAINT "TeacherTrainee_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTrainee" ADD CONSTRAINT "TeacherTrainee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_teacherTraineeId_fkey" FOREIGN KEY ("teacherTraineeId") REFERENCES "TeacherTrainee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
