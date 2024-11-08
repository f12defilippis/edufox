import React from 'react';
import { Brain } from 'lucide-react';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
}

export function QuizProgress({ currentQuestion, totalQuestions, score }: QuizProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          Domanda {currentQuestion + 1} di {totalQuestions}
        </span>
        <span className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-900">{score} Purificoin</span>
        </span>
      </div>
      <div className="h-2 bg-purple-100 rounded-full">
        <div
          className="h-2 bg-purple-600 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        />
      </div>
    </div>
  );
}