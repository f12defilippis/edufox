import React, { useState } from 'react';
import { BookOpen, Upload, User } from 'lucide-react';
import { WizardData } from '../types';

const subjects = [
  { id: 'math', name: 'Matematica', icon: '📐' },
  { id: 'science', name: 'Scienze', icon: '🔬' },
  { id: 'history', name: 'Storia', icon: '📚' },
  { id: 'geography', name: 'Geografia', icon: '🌍' },
  { id: 'literature', name: 'Letteratura', icon: '📖' },
];

interface WizardProps {
  onComplete: (data: WizardData) => void;
  username: string;
}

export default function Wizard({ onComplete, username }: WizardProps) {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      
      // Generate previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleNext = () => {
    if (step === 3) {
      onComplete({ name: username, subject, images });
    } else {
      setStep(step + 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return true; // Always valid since we're just showing a welcome message
      case 2:
        return subject !== '';
      case 3:
        return images.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="mb-8">
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
                {num === 1 && <User className="w-5 h-5" />}
                {num === 2 && <BookOpen className="w-5 h-5" />}
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

      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-900">
              Ciao {username}, vuoi iniziare una nuova avventura educativa?
            </h2>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-900">Quale materia vuoi studiare?</h2>
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

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-900">Carica le foto del libro</h2>
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
          disabled={!isStepValid()}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isStepValid()
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step === 3 ? 'Inizia il quiz' : 'Avanti'}
        </button>
      </div>
    </div>
  );
}