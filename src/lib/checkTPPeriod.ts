// src/scripts/checkTPPeriod.ts
import { checkTPPeriod } from "./api";

export const runTPPeriodCheck = async () => {
  try {
    const response = await checkTPPeriod();
    console.log(`Checked TP periods: ${response.pending_evaluations} pending evaluations`);
  } catch (error: any) {
    console.error("Error checking TP periods:", error.message);
  }
};