import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Question } from '../services/openai';

interface QuizQuestionProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (index: number) => void;
}

export function QuizQuestion({ question, selectedAnswer, onAnswerSelect }: QuizQuestionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-900">{question.text}</h3>
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedAnswer === null
                ? 'border-purple-200 hover:border-purple-400'
                : selectedAnswer === index
                ? index === question.correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : index === question.correctAnswer
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {selectedAnswer !== null && index === question.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {selectedAnswer === index && index !== question.correctAnswer && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}