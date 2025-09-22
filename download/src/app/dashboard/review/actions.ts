"use server";

import { suggestTimetableChanges, type SuggestTimetableChangesInput } from "@/ai/flows/suggest-timetable-changes";

export async function suggest(input: SuggestTimetableChangesInput) {
  try {
    const result = await suggestTimetableChanges(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
