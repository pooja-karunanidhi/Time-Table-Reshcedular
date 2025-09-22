'use server';

/**
 * @fileOverview This file defines a Genkit flow for faculty members to suggest changes to the generated timetable using AI.
 *
 * - suggestTimetableChanges - A function that allows faculty to suggest changes to the timetable.
 * - SuggestTimetableChangesInput - The input type for the suggestTimetableChanges function.
 * - SuggestTimetableChangesOutput - The return type for the suggestTimetableChanges function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTimetableChangesInputSchema = z.object({
  timetableData: z
    .string()
    .describe(
      'The current timetable data in JSON format.'
    ),
  facultyPreferences: z.string().describe('The preferences of the faculty member.'),
  constraints: z.string().describe('Constraints to consider while suggesting changes.'),
  facultyId: z.string().describe('The ID of the faculty member making the suggestion.'),
});
export type SuggestTimetableChangesInput = z.infer<typeof SuggestTimetableChangesInputSchema>;

const SuggestTimetableChangesOutputSchema = z.object({
  suggestedChanges: z.string().describe('The AI-suggested changes to the timetable in JSON format.'),
  explanation: z.string().describe('An explanation of why the AI suggested these changes.'),
});
export type SuggestTimetableChangesOutput = z.infer<typeof SuggestTimetableChangesOutputSchema>;

export async function suggestTimetableChanges(input: SuggestTimetableChangesInput): Promise<SuggestTimetableChangesOutput> {
  return suggestTimetableChangesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTimetableChangesPrompt',
  input: {schema: SuggestTimetableChangesInputSchema},
  output: {schema: SuggestTimetableChangesOutputSchema},
  prompt: `You are an AI assistant helping faculty members suggest changes to the generated timetable.

  Consider the current timetable data, faculty preferences, and constraints to suggest the most optimal changes.

  Current Timetable Data: {{{timetableData}}}
  Faculty Preferences: {{{facultyPreferences}}}
  Constraints: {{{constraints}}}
  Faculty ID: {{{facultyId}}}

  Based on this information, suggest changes to the timetable. The suggestedChanges should be a valid JSON string representing the new timetable.
  Also, provide an explanation for each suggested change.

  Example of a valid suggestedChanges format:
  "{\\"B001\\":{\\"Monday\\":[\\"11:00-12:00 - CS102 (F002) in C001\\"],\\"Tuesday\\":[\\"09:00-10:00 - CS101 (F001) in C001\\", \\"10:00-11:00 - CS101 (F001) in C001\\"],\\"Wednesday\\":[],\\"Thursday\\":[],\\"Friday\\":[]},\\"B002\\":{\\"Monday\\":[],\\"Tuesday\\":[],\\"Wednesday\\":[\\"14:00-15:30 - AI202 (F001) in C002\\"],\\"Thursday\\":[\\"10:00-11:30 - DS301 (F002) in C002\\"],\\"Friday\\":[]}}"

  Ensure the suggested changes do not violate any constraints and align with the faculty's preferences.
  Return a JSON object with 'suggestedChanges' and 'explanation' fields.
  `,
});

const suggestTimetableChangesFlow = ai.defineFlow(
  {
    name: 'suggestTimetableChangesFlow',
    inputSchema: SuggestTimetableChangesInputSchema,
    outputSchema: SuggestTimetableChangesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
