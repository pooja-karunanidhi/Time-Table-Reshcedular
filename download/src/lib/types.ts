export interface Faculty {
  id: string;
  name: string;
  subjects: string[];
  availability: string;
  workload: number;
  department: string;
}

export interface StudentBatch {
  id: string;
  name: string;
  type: 'UG' | 'PG';
  semester: number;
  department: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  hoursPerWeek: number;
  type: 'Core' | 'Elective';
}

export interface Classroom {
  id:string;
  name: string;
  capacity: number;
  type: 'Lecture Hall' | 'Lab' | 'Classroom';
  isAvailable: boolean;
}

export interface Constraint {
  id: string;
  description: string;
  value: string | number;
}
