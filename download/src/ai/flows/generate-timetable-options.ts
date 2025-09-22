'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating multiple timetable options using AI.
 *
 * The flow takes into account faculty details, student batches, subjects, classrooms, and constraints
 * to produce optimized timetable options. It exports the `generateTimetableOptions` function,
 * the `GenerateTimetableOptionsInput` type, and the `GenerateTimetableOptionsOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const GenerateTimetableOptionsInputSchema = z.object({
  facultyDetails: z.string().describe('Details of the faculty, including subjects, availability, and workload.'),
  studentBatches: z.string().describe('Information about student batches, including UG/PG, semester, and department.'),
  subjects: z.string().describe('Subject details, including credits, hours per week, and elective/core status.'),
  classrooms: z.string().describe('Classroom details, including capacity, type, and availability.'),
  constraints: z.string().describe('Constraints for timetable generation, such as max classes/day, fixed slots, and elective overlaps.'),
  numOptions: z.number().default(3).describe('The number of timetable options to generate.'),
});
export type GenerateTimetableOptionsInput = z.infer<typeof GenerateTimetableOptionsInputSchema>;

// Define the output schema for the flow
const GenerateTimetableOptionsOutputSchema = z.object({
  timetableOptions: z.array(z.string()).describe('An array of generated timetable options.'),
});
export type GenerateTimetableOptionsOutput = z.infer<typeof GenerateTimetableOptionsOutputSchema>;

// Define the tool to generate a timetable option
const generateTimetableOptionTool = ai.defineTool({
  name: 'generateTimetableOption',
  description: 'Generates a single timetable option based on the provided constraints and data.',
  inputSchema: z.object({
    facultyDetails: z.string().describe('Details of the faculty, including subjects, availability, and workload.'),
    studentBatches: z.string().describe('Information about student batches, including UG/PG, semester,, and department.'),
    subjects: z.string().describe('Subject details, including credits, hours per week, and elective/core status.'),
    classrooms: z.string().describe('Classroom details, including capacity, type, and availability.'),
    constraints: z.string().describe('Constraints for timetable generation, such as max classes/day, fixed slots, and elective overlaps.'),
  }),
  outputSchema: z.string().describe('A single generated timetable option as a JSON string. The JSON should be a dictionary where keys are batch IDs. The value for each batch ID is another dictionary where keys are days of the week (Monday-Friday) and values are arrays of strings representing time slots (e.g., "09:00-10:00 - CS101 (F001) in C001").'),
}, async (input) => {
  const generationPromptText = `Generate a timetable in JSON format based on the following data.
    The output should be a JSON object where keys are batch IDs. The value for each batch ID is another dictionary where keys are days of the week (Monday-Friday) and values are arrays of strings representing time slots (e.g., "09:00-10:00 - CS101 (F001) in C001").

    Faculty: ${input.facultyDetails}
    Student Batches: ${input.studentBatches}
    Subjects: ${input.subjects}
    Classrooms: ${input.classrooms}
    Constraints: ${input.constraints}
    `;

  const { output } = await ai.generate({ prompt: generationPromptText });
  return JSON.stringify(output || {});
});


// Define the prompt for generating timetable options
const generateTimetableOptionsPrompt = ai.definePrompt({
  name: 'generateTimetableOptionsPrompt',
  tools: [generateTimetableOptionTool],
  input: {schema: GenerateTimetableOptionsInputSchema},
  output: {schema: GenerateTimetableOptionsOutputSchema},
  prompt: `You are a timetable generator assistant. You generate multiple timetable options based on the provided data and constraints, using the generateTimetableOption tool.

  The user will provide you with faculty details, student batches, subject information, classroom information, and constraints.  You should generate {{numOptions}} timetable options.

  Constraints: {{{constraints}}}
  Faculty Details: {{{facultyDetails}}}
  Student Batches: {{{studentBatches}}}
  Subjects: {{{subjects}}}
  Classrooms: {{{classrooms}}}

  Return each generated timetable option in the timetableOptions array.`, // Use Handlebars templating here
});

// Define the Genkit flow
const generateTimetableOptionsFlow = ai.defineFlow({
    name: 'generateTimetableOptionsFlow',
    inputSchema: GenerateTimetableOptionsInputSchema,
    outputSchema: GenerateTimetableOptionsOutputSchema,
  },
  async input => {
    const {output} = await generateTimetableOptionsPrompt(input);
    return output!;
  }
);

/**
 * Generates multiple timetable options using AI.
 * @param input - The input data for timetable generation.
 * @returns A promise that resolves to the generated timetable options.
 */
export async function generateTimetableOptions(input: GenerateTimetableOptionsInput): Promise<GenerateTimetableOptionsOutput> {
  return generateTimetableOptionsFlow(input);
}
