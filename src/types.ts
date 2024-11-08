export interface WizardData {
  name: string;
  subject: string;
  images: File[];
  dueDate?: string;
}

export interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Assignment {
  id: string;
  subject: string;
  dueDate: string;
  teacherId: string;
  questions: Question[];
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Profile {
  id: string;
  role: 'Studente' | 'Docente';
  first_name: string;
  last_name: string;
  user_id: string;
}

export interface TeacherAssignment {
  subject: string;
  dueDate: string;
  questions: Question[];
  teacherId: string;
}

export interface QuizScore {
  id: string;
  user_id: string;
  assignment_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  created_at: string;
  updated_at: string;
}