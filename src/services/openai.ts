import { Question } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function generateQuestions(text: string, subject: string): Promise<Question[]> {
  console.log('API URL:', API_URL);
  console.log('Generating questions for subject:', subject);
  console.log('Text length:', text.length);

  try {
    const response = await fetch(`${API_URL}/api/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, subject }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server response:', errorData);
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Errore durante la generazione delle domande');
  }
}