import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Assignment, Question } from '../types';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResult } from './QuizResult';
import { saveQuizScore } from '../services/supabaseService';
import { supabase } from '../lib/supabase';

interface QuizProps {
  username: string;
  assignment: Assignment;
  onBack: () => void;
}

const QUESTIONS_PER_QUIZ = 10;
const PURIFICOIN_CORRECT = 10;
const PURIFICOIN_INCORRECT = 3;

function Quiz({ username, assignment, onBack }: QuizProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
    prepareQuestions();
  }, [assignment]);

  const prepareQuestions = () => {
    try {
      setLoading(true);
      // Randomly select questions from the assignment
      const allQuestions = [...assignment.questions];
      const selectedQuestions: Question[] = [];
      
      for (let i = 0; i < QUESTIONS_PER_QUIZ && allQuestions.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        selectedQuestions.push(allQuestions[randomIndex]);
        allQuestions.splice(randomIndex, 1);
      }

      setQuestions(selectedQuestions);
    } catch (err) {
      setError('Errore nella preparazione delle domande');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    setScore(score + (isCorrect ? PURIFICOIN_CORRECT : PURIFICOIN_INCORRECT));
    setShowExplanation(true);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      if (userId) {
        await saveQuizScore(
          userId,
          assignment.id,
          score,
          correctAnswers,
          questions.length
        );
      }
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="text-lg text-purple-900">Preparazione del quiz in corso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ops! Qualcosa è andato storto</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Torna alla selezione
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <QuizResult 
          name={username}
          score={score}
          correctAnswers={correctAnswers}
          totalQuestions={questions.length}
          onRestart={onBack}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <button
        onClick={onBack}
        className="flex items-center text-purple-600 hover:text-purple-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Torna alla selezione
      </button>

      <QuizProgress
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        score={score}
      />

      <QuizQuestion
        question={questions[currentQuestion]}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswer}
      />

      {showExplanation && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-900">{questions[currentQuestion].explanation}</p>
        </div>
      )}

      {selectedAnswer !== null && (
        <button
          onClick={handleNext}
          className="w-full mt-6 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          {currentQuestion === questions.length - 1 ? 'Vedi risultato' : 'Prossima domanda'}
        </button>
      )}
    </div>
  );
}

export default Quiz;