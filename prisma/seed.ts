import { PrismaClient, UserSex } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function clearDatabase() {
  await prisma.lessonPlan.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.event.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.evaluationForm.deleteMany();
  await prisma.teacherTrainee.deleteMany();
  await prisma.supervisor.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.level.deleteMany();
  await prisma.course.deleteMany();
  console.log("Cleared all existing records from the database.");
}

async function main() {
  try {
    // Clear existing records
    await clearDatabase();

    // ADMIN
    const admin1Password = await hashPassword("Secure$Admin2025!");
    const admin1 = await prisma.admin.create({
      data: {
        id: uuidv4(),
        username: "admin1",
        email: "admin1@example.com",
        passwordHash: admin1Password,
        role: "admin",
      },
    });
    console.log("Admin created: Username: admin1 / Password: Secure$Admin2025! / Email: admin1@example.com");

    const admin2Password = await hashPassword("Admin#Secure2025!");
    const admin2 = await prisma.admin.create({
      data: {
        id: uuidv4(),
        username: "admin2",
        email: "admin2@example.com",
        passwordHash: admin2Password,
        role: "admin",
      },
    });
    console.log("Admin created: Username: admin2 / Password: Admin#Secure2025! / Email: admin2@example.com");

    // LEVEL
    const levelIds: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const level = await prisma.level.upsert({
        where: { level: i },
        update: {},
        create: { level: i },
      });
      levelIds.push(level.id);
    }

    // COURSE
    const courseIds: number[] = [];
    const courses = [
      { name: "B.Ed. English" },
      { name: "B.Ed. Mathematics" },
      { name: "B.Ed. Biology" },
      { name: "B.Ed. Chemistry" },
      { name: "B.Ed. Physics" },
      { name: "B.Ed. History" },
      { name: "B.Ed. Geography" },
    ];

    for (let i = 0; i < courses.length; i++) {
      const course = await prisma.course.upsert({
        where: { name: courses[i].name },
        update: {},
        create: { name: courses[i].name },
      });
      courseIds.push(course.id);
    }

    // SUPERVISOR
    const supervisorIds: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const staffId = `STAFF${i.toString().padStart(3, "0")}`;
      const password = await hashPassword(`Super${i}$ecure2025!`);
      const supervisor = await prisma.supervisor.create({
        data: {
          id: uuidv4(), // Schema says String @id, using UUID
          staffId,
          email: `supervisor${i}@example.com`,
          passwordHash: password,
          role: "supervisor",
          name: `SName${i}`,
          surname: `SSurname${i}`,
          phone: `123-456-789${i}`,
          address: `Address${i}`,
          img: null,
          bloodType: "A+",
          sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
          createdAt: new Date(),
          birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
          placeOfSupervision: `SupervisionPlace${i}`,
        },
      });
      supervisorIds.push(supervisor.id);
      console.log(`Supervisor created: Staff ID: ${staffId} / Password: Super${i}$ecure2025! / Email: supervisor${i}@example.com`);
    }

    // TEACHER TRAINEE
    const teacherTraineeIds: string[] = [];
    for (let i = 1; i <= 40; i++) {
      const regNo = `SLU/EDU/${i.toString().padStart(3, "0")}`;
      const password = await hashPassword(`Train${i}#ecure2025!`);
      const teacherTrainee = await prisma.teacherTrainee.create({
        data: {
          id: uuidv4(), // Schema says String @id, using UUID
          regNo,
          email: `trainee${i}@example.com`,
          passwordHash: password,
          role: "teacherTrainee",
          name: `TName${i}`,
          surname: `TSurname${i}`,
          phone: `987-654-321${i}`,
          address: `Address${i}`,
          img: null,
          bloodType: "O-",
          sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
          createdAt: new Date(),
          birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 20)),
          placeOfTP: `TPPlace${i}`,
          weeksRequired: 12,
          levelId: levelIds[(i - 1) % 5], // Use stored level IDs
          courseId: courseIds[(i - 1) % 7], // Use stored course IDs
        },
      });
      teacherTraineeIds.push(teacherTrainee.id);
      console.log(`Teacher Trainee created: Reg No: ${regNo} / Password: Train${i}#ecure2025! / Email: trainee${i}@example.com`);
    }

    // ASSIGN SUPERVISORS TO TEACHER TRAINEES
    for (let i = 0; i < supervisorIds.length; i++) {
      const traineesToAssign = teacherTraineeIds.slice(i * 4, (i + 1) * 4);
      await prisma.supervisor.update({
        where: { id: supervisorIds[i] },
        data: {
          teacherTrainees: {
            connect: traineesToAssign.map((id) => ({ id })),
          },
        },
      });
    }

    // LESSON PLAN
    for (let i = 1; i <= 20; i++) {
      await prisma.lessonPlan.create({
        data: {
          title: `Lesson Plan ${i}`,
          content: `### Lesson Plan ${i}\n**Objective**: Teach core concepts\n**Duration**: 60 minutes\n1. Introduction (10 mins)\n2. Main Activity (40 mins)\n3. Conclusion (10 mins)`,
          duration: 60,
          teacherTraineeId: teacherTraineeIds[i - 1],
          courseId: courseIds[(i - 1) % 7],
          supervisorId: supervisorIds[Math.floor((i - 1) / 4)],
          feedback: i % 2 === 0 ? `Feedback for Lesson Plan ${i}: Good structure, add more examples.` : null,
        },
      });
    }

    // EVALUATION FORM
    const evaluationFormIds: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const form = await prisma.evaluationForm.create({
        data: {
          title: `Evaluation Form ${i}`,
          fileUrl: `https://example.com/evaluation-form-${i}.pdf`,
          uploadedBy: admin1.id,
        },
      });
      evaluationFormIds.push(form.id); // Capture auto-incremented IDs
      console.log(`Evaluation Form created: ID: ${form.id}, Title: ${form.title}`);
    }

    // EVALUATION
    for (let i = 1; i <= 20; i++) {
      await prisma.evaluation.create({
        data: {
          teacherTraineeId: teacherTraineeIds[i - 1],
          supervisorId: supervisorIds[Math.floor((i - 1) / 4)],
          formId: evaluationFormIds[(i - 1) % 3], // Use actual form IDs
          score: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
          feedback: `Feedback for Trainee ${i}: Good performance, needs improvement in area ${i % 3}.`,
        },
      });
    }

    // REPORT
    for (let i = 1; i <= 20; i++) {
      await prisma.report.create({
        data: {
          title: `Teaching Practice Report ${i}`,
          fileUrl: `https://example.com/report-${i}.pdf`,
          teacherTraineeId: teacherTraineeIds[i - 1],
        },
      });
    }

    // NOTIFICATION
    for (let i = 1; i <= 5; i++) {
      await prisma.notification.create({
        data: {
          title: `Notification ${i}`,
          message: `Reminder: Submit your reports by the end of week ${i}.`,
          supervisorId: supervisorIds[i - 1],
          teacherTraineeId: i % 2 === 0 ? teacherTraineeIds[i * 2] : null,
        },
      });
    }

    // EVENT
    for (let i = 1; i <= 5; i++) {
      await prisma.event.create({
        data: {
          title: `Event ${i}`,
          description: `Description for Event ${i}`,
          startTime: new Date(new Date().setHours(new Date().getHours() + i)),
          endTime: new Date(new Date().setHours(new Date().getHours() + i + 2)),
        },
      });
    }

    // ANNOUNCEMENT
    for (let i = 1; i <= 5; i++) {
      await prisma.announcement.create({
        data: {
          title: `Announcement ${i}`,
          description: `Description for Announcement ${i}`,
          date: new Date(),
        },
      });
    }

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });






// import { Day, PrismaClient, UserSex } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   // ADMIN
//   await prisma.admin.upsert({
//     where: { id: "admin1" },
//     update: {},
//     create: {
//       id: "admin1",
//       username: "admin1",

//     },
//   });
//   await prisma.admin.upsert({
//     where: { id: "admin2" },
//     update: {},
//     create: {
//       id: "admin2",
//       username: "admin2",

//     },
//   });

//   // GRADE
//   for (let i = 1; i <= 6; i++) {
//     await prisma.grade.create({
//       data: {
//         level: i,
//       },
//     });
//   }

//   // CLASS
//   for (let i = 1; i <= 6; i++) {
//     await prisma.class.create({
//       data: {
//         name: `${i}A`, 
//         gradeId: i, 
//         capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
//       },
//     });
//   }

//   // SUBJECT
//   const subjectData = [
//     { name: "Mathematics" },
//     { name: "Science" },
//     { name: "English" },
//     { name: "History" },
//     { name: "Geography" },
//     { name: "Physics" },
//     { name: "Chemistry" },
//     { name: "Biology" },
//     { name: "Computer Science" },
//     { name: "Art" },
//   ];

//   for (const subject of subjectData) {
//     await prisma.subject.create({ data: subject });
//   }

//   // TEACHER
//   for (let i = 1; i <= 15; i++) {
//     await prisma.teacher.create({
//       data: {
//         id: `teacher${i}`, // Unique ID for the teacher
//         username: `teacher${i}`,
//         name: `TName${i}`,
//         surname: `TSurname${i}`,
//         email: `teacher${i}@example.com`,
//         phone: `123-456-789${i}`,
//         address: `Address${i}`,
//         bloodType: "A+",
//         sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
//         subjects: { connect: [{ id: (i % 10) + 1 }] }, 
//         classes: { connect: [{ id: (i % 6) + 1 }] }, 
//         birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
//       },
//     });
//   }

//   // LESSON
//   for (let i = 1; i <= 30; i++) {
//     await prisma.lesson.create({
//       data: {
//         name: `Lesson${i}`, 
//         day: Day[
//           Object.keys(Day)[
//             Math.floor(Math.random() * Object.keys(Day).length)
//           ] as keyof typeof Day
//         ], 
//         startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
//         endTime: new Date(new Date().setHours(new Date().getHours() + 3)), 
//         subjectId: (i % 10) + 1, 
//         classId: (i % 6) + 1, 
//         teacherId: `teacher${(i % 15) + 1}`, 
//       },
//     });
//   }

//   // PARENT
//   for (let i = 1; i <= 25; i++) {
//     await prisma.parent.create({
//       data: {
//         id: `parentId${i}`,
//         username: `parentId${i}`,
//         name: `PName ${i}`,
//         surname: `PSurname ${i}`,
//         email: `parent${i}@example.com`,
//         phone: `123-456-789${i}`,
//         address: `Address${i}`,
//       },
//     });
//   }

//   // STUDENT
//   for (let i = 1; i <= 50; i++) {
//     await prisma.student.create({
//       data: {
//         id: `student${i}`, 
//         username: `student${i}`, 
//         name: `SName${i}`,
//         surname: `SSurname ${i}`,
//         email: `student${i}@example.com`,
//         phone: `987-654-321${i}`,
//         address: `Address${i}`,
//         bloodType: "O-",
//         sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
//         parentId: `parentId${Math.ceil(i / 2) % 25 || 25}`, 
//         gradeId: (i % 6) + 1, 
//         classId: (i % 6) + 1, 
//         birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
//       },
//     });
//   }

//   // EXAM
//   for (let i = 1; i <= 10; i++) {
//     await prisma.exam.create({
//       data: {
//         title: `Exam ${i}`, 
//         startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
//         endTime: new Date(new Date().setHours(new Date().getHours() + 2)), 
//         lessonId: (i % 30) + 1, 
//       },
//     });
//   }

//   // ASSIGNMENT
//   for (let i = 1; i <= 10; i++) {
//     await prisma.assignment.create({
//       data: {
//         title: `Assignment ${i}`, 
//         startDate: new Date(new Date().setHours(new Date().getHours() + 1)), 
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), 
//         lessonId: (i % 30) + 1, 
//       },
//     });
//   }

//   // RESULT
//   for (let i = 1; i <= 10; i++) {
//     await prisma.result.create({
//       data: {
//         score: 90, 
//         studentId: `student${i}`, 
//         ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }), 
//       },
//     });
//   }

//   // ATTENDANCE
//   for (let i = 1; i <= 10; i++) {
//     await prisma.attendance.create({
//       data: {
//         date: new Date(), 
//         present: true, 
//         studentId: `student${i}`, 
//         lessonId: (i % 30) + 1, 
//       },
//     });
//   }

//   // EVENT
//   for (let i = 1; i <= 5; i++) {
//     await prisma.event.create({
//       data: {
//         title: `Event ${i}`, 
//         description: `Description for Event ${i}`, 
//         startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
//         endTime: new Date(new Date().setHours(new Date().getHours() + 2)), 
//         classId: (i % 5) + 1, 
//       },
//     });
//   }

//   // ANNOUNCEMENT
//   for (let i = 1; i <= 5; i++) {
//     await prisma.announcement.create({
//       data: {
//         title: `Announcement ${i}`, 
//         description: `Description for Announcement ${i}`, 
//         date: new Date(), 
//         classId: (i % 5) + 1, 
//       },
//     });
//   }

//   console.log("Seeding completed successfully.");
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
