import { supabase } from '../lib/supabase';
import type { Assignment, Question, Profile, TeacherAssignment, QuizScore } from '../types';
import type { Database } from '../lib/database.types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function createAssignment(
  subject: string,
  dueDate: string,
  questions: Question[],
  teacherId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('assignments')
    .insert([{
      subject,
      due_date: dueDate,
      teacher_id: teacherId,
      questions
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating assignment:', error);
    return null;
  }

  return data.id;
}

export async function getAssignments(): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }

  return data.map(assignment => ({
    id: assignment.id,
    subject: assignment.subject,
    dueDate: assignment.due_date,
    teacherId: assignment.teacher_id,
    questions: assignment.questions as Question[],
    createdAt: assignment.created_at
  }));
}

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching assignment:', error);
    return null;
  }

  return {
    id: data.id,
    subject: data.subject,
    dueDate: data.due_date,
    teacherId: data.teacher_id,
    questions: data.questions as Question[],
    createdAt: data.created_at
  };
}

export async function saveQuizScore(
  userId: string,
  assignmentId: string,
  score: number,
  correctAnswers: number,
  totalQuestions: number
): Promise<boolean> {
  const { error } = await supabase
    .from('quiz_scores')
    .upsert({
      user_id: userId,
      assignment_id: assignmentId,
      score,
      correct_answers: correctAnswers,
      total_questions: totalQuestions
    }, {
      onConflict: 'user_id,assignment_id'
    });

  if (error) {
    console.error('Error saving quiz score:', error);
    return false;
  }

  return true;
}

export async function getQuizScore(
  userId: string,
  assignmentId: string
): Promise<QuizScore | null> {
  const { data, error } = await supabase
    .from('quiz_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('assignment_id', assignmentId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching quiz score:', error);
    return null;
  }

  return data;
}