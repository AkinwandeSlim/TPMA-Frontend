import moment from "moment";
import clsx from "clsx";
import { parseISO, format } from "date-fns";
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return clsx(classes);
}
// Get the Monday of the current or next work week
const getReferenceMonday = (): Date => {
  const today = new Date("2025-04-06"); // Hardcoded for consistency with the current date
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let daysToMonday;

  if (dayOfWeek === 0) {
    // Sunday: Next Monday is tomorrow
    daysToMonday = 1;
  } else if (dayOfWeek === 1) {
    // Monday: Use today
    daysToMonday = 0;
  } else {
    // Tuesday to Saturday: Go to next Monday
    daysToMonday = 8 - dayOfWeek;
  }

  const referenceMonday = new Date(today);
  referenceMonday.setDate(today.getDate() + daysToMonday);
  return referenceMonday;
};

export const adjustScheduleToCurrentWeek = (
  lessons: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
  const referenceMonday = getReferenceMonday(); // April 7, 2025
  const referenceFriday = new Date(referenceMonday);
  referenceFriday.setDate(referenceMonday.getDate() + 4); // April 11, 2025

  return lessons.map((lesson) => {
    const lessonStart = moment.utc(lesson.start);
    const referenceMondayMoment = moment.utc(referenceMonday);
    const referenceFridayMoment = moment.utc(referenceFriday);

    // Check if the lesson is already in the desired week (Monday to Friday)
    if (
      lessonStart.isBetween(
        referenceMondayMoment,
        referenceFridayMoment,
        undefined,
        "[]"
      )
    ) {
      return lesson; // No adjustment needed
    }

    // Adjust the lesson to the reference week
    const lessonDayOfWeek = lesson.start.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

    const adjustedStartDate = new Date(referenceMonday);
    adjustedStartDate.setDate(referenceMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      lesson.start.getHours(),
      lesson.start.getMinutes(),
      lesson.start.getSeconds()
    );

    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds()
    );

    return {
      title: lesson.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};




export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy, HH:mm");
  } catch (error) {
    console.warn(`Date format error ${dateString}:`, error);
    return "N/A";
  }
};





// export function classNames(...classes: (string | undefined | null | false)[]): string {
//   return classes.filter(Boolean).join(" ");
// }










































// // IT APPEARS THAT BIG CALENDAR SHOWS THE LAST WEEK WHEN THE CURRENT DAY IS A WEEKEND.
// // FOR THIS REASON WE'LL GET THE LAST WEEK AS THE REFERENCE WEEK.
// // IN THE TUTORIAL WE'RE TAKING THE NEXT WEEK AS THE REFERENCE WEEK.

// const getLatestMonday = (): Date => {
//   const today = new Date();
//   const dayOfWeek = today.getDay();
//   const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
//   const latestMonday = today;
//   latestMonday.setDate(today.getDate() - daysSinceMonday);
//   return latestMonday;
// };

// export const adjustScheduleToCurrentWeek = (
//   lessons: { title: string; start: Date; end: Date }[]
// ): { title: string; start: Date; end: Date }[] => {
//   const latestMonday = getLatestMonday();

//   return lessons.map((lesson) => {
//     const lessonDayOfWeek = lesson.start.getDay();

//     const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

//     const adjustedStartDate = new Date(latestMonday);

//     adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
//     adjustedStartDate.setHours(
//       lesson.start.getHours(),
//       lesson.start.getMinutes(),
//       lesson.start.getSeconds()
//     );
//     const adjustedEndDate = new Date(adjustedStartDate);
//     adjustedEndDate.setHours(
//       lesson.end.getHours(),
//       lesson.end.getMinutes(),
//       lesson.end.getSeconds()
//     );

//     return {
//       title: lesson.title,
//       start: adjustedStartDate,
//       end: adjustedEndDate,
//     };
//   });
// };
