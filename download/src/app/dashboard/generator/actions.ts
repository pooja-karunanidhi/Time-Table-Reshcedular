"use server";

import { generateTimetableOptions, type GenerateTimetableOptionsInput } from "@/ai/flows/generate-timetable-options";

export async function generate(input: GenerateTimetableOptionsInput) {
  try {
    const result = await generateTimetableOptions(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
