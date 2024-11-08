import React from 'react';

interface QuizResultProps {
  name: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  onRestart: () => void;
}

export function QuizResult({ name, score, correctAnswers, totalQuestions, onRestart }: QuizResultProps) {
  const getLevelInfo = (score: number) => {
    if (score <= 25) return { name: 'Drago Cucciolo', message: 'Devi migliorare, continua a studiare!' };
    if (score <= 50) return { name: 'Lupo Giovane', message: 'Buon inizio, puoi fare di meglio!' };
    if (score <= 75) return { name: 'Leone Coraggioso', message: 'Molto bene, continua così!' };
    return { name: 'Fenice Leggendaria', message: 'Eccellente, sei un vero campione!' };
  };

  const level = getLevelInfo(score);

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-purple-900 mb-4">
        Complimenti {name}!
      </h2>
      <div className="mb-6">
        <p className="text-xl font-semibold text-purple-700">
          Hai risposto correttamente a {correctAnswers} domande su {totalQuestions}
        </p>
        <p className="text-xl font-semibold text-purple-700 mt-2">
          Hai guadagnato {score} Purificoin
        </p>
        <p className="text-lg text-purple-600 mt-2">Livello: {level.name}</p>
        <p className="text-gray-600 mt-2">{level.message}</p>
      </div>
      <button
        onClick={onRestart}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
      >
        Ricomincia
      </button>
    </div>
  );
}