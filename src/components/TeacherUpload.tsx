import React, { useState } from 'react';
import { BookOpen, Upload, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createAssignment } from '../services/supabaseService';
import { generateQuestions } from '../services/openai';
import { extractTextFromImage } from '../services/ocr';
import type { Question } from '../types';

const subjects = [
  { id: 'math', name: 'Matematica', icon: '📐' },
  { id: 'science', name: 'Scienze', icon: '🔬' },
  { id: 'history', name: 'Storia', icon: '📚' },
  { id: 'geography', name: 'Geografia', icon: '🌍' },
  { id: 'literature', name: 'Letteratura', icon: '📖' },
];

interface TeacherUploadProps {
  userId: string;
}

export default function TeacherUpload({ userId }: TeacherUploadProps) {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setSubject('');
    setDueDate('');
    setImages([]);
    setPreviews([]);
    setError(null);
    setSuccess(false);
    setStep(1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      
      // Generate previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Extract text from images using OCR
      const texts = await Promise.all(
        images.map(image => extractTextFromImage(image))
      );

      const combinedText = texts.join('\n\n');
      
      // Generate questions using OpenAI
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: combinedText,
          subject,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore durante la generazione delle domande');
      }

      const data = await response.json();
      
      // Save assignment to Supabase
      const assignmentId = await createAssignment(
        subject,
        dueDate,
        data.questions,
        userId
      );

      if (!assignmentId) {
        throw new Error('Errore durante il salvataggio del compito');
      }

      setSuccess(true);
      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return subject !== '';
      case 2:
        return dueDate !== '';
      case 3:
        return images.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 3) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="mb-4 text-green-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-purple-900 mb-4">Compito creato con successo!</h2>
          <p className="text-gray-600 mb-8">Reindirizzamento in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-900 text-center mb-6">
          {step === 1 ? 'Carica nuovo compito' : step === 2 ? 'Seleziona scadenza' : 'Carica materiale'}
        </h1>
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`flex items-center ${
                num < step ? 'text-purple-600' : num === step ? 'text-purple-500' : 'text-gray-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  num <= step ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
              >
                {num === 1 && <BookOpen className="w-5 h-5" />}
                {num === 2 && <Calendar className="w-5 h-5" />}
                {num === 3 && <Upload className="w-5 h-5" />}
              </div>
              {num < 3 && (
                <div
                  className={`h-1 w-full mx-2 ${
                    num < step ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSubject(sub.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    subject === sub.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="text-2xl mb-2">{sub.icon}</div>
                  <div className="font-medium">{sub.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="w-full">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-4 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-12 h-12 text-purple-500" />
                <span className="text-purple-900 font-medium">
                  Clicca qui per caricare le foto
                </span>
                <span className="text-sm text-gray-500">o trascina i file qui</span>
              </label>
              {previews.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!isStepValid() || loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isStepValid() && !loading
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Elaborazione in corso...
            </span>
          ) : step === 3 ? (
            'Crea compito'
          ) : (
            'Avanti'
          )}
        </button>
      </div>
    </div>
  );
}