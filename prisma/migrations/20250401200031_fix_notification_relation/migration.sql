-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_teacherTraineeId_fkey" FOREIGN KEY ("teacherTraineeId") REFERENCES "TeacherTrainee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
