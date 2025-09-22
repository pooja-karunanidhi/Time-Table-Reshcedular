import type { Faculty, StudentBatch, Subject, Classroom, Constraint } from './types';

export const mockFaculty: Faculty[] = [
  { id: 'F001', name: 'Dr. Alan Turing', subjects: ['CS101', 'AI202'], availability: 'Mon-Fri 9am-5pm', workload: 12, department: 'Computer Science' },
  { id: 'F002', name: 'Dr. Ada Lovelace', subjects: ['CS102', 'DS301'], availability: 'Mon, Wed, Fri 10am-4pm', workload: 10, department: 'Data Science' },
];

export const mockStudentBatches: StudentBatch[] = [
  { id: 'B001', name: 'UG CS Sem 4', type: 'UG', semester: 4, department: 'Computer Science' },
  { id: 'B002', name: 'PG AI Sem 2', type: 'PG', semester: 2, department: 'Artificial Intelligence' },
];

export const mockSubjects: Subject[] = [
  { id: 'S001', name: 'Introduction to CS', code: 'CS101', credits: 4, hoursPerWeek: 4, type: 'Core' },
  { id: 'S002', name: 'Advanced AI', code: 'AI202', credits: 3, hoursPerWeek: 3, type: 'Elective' },
  { id: 'S003', name: 'Data Structures', code: 'CS102', credits: 4, hoursPerWeek: 4, type: 'Core' },
  { id: 'S004', name: 'Machine Learning', code: 'DS301', credits: 3, hoursPerWeek: 3, type: 'Core' },
];

export const mockClassrooms: Classroom[] = [
  { id: 'C001', name: 'Room 101', capacity: 60, type: 'Classroom', isAvailable: true },
  { id: 'C002', name: 'AI Lab', capacity: 40, type: 'Lab', isAvailable: true },
];

export const mockConstraints: Constraint[] = [
  { id: 'CN001', description: 'Max classes per day per faculty', value: 4 },
  { id: 'CN002', description: 'No classes on Friday afternoon', value: 'Fri > 1pm' },
  { id: 'CN003', description: 'Lunch break', value: '12pm-1pm daily' },
  { id: 'CN004', description: 'Average leave per month per faculty', value: 3 },
];
