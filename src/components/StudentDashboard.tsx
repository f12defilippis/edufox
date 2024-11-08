import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ChevronDown, ChevronUp, Trophy, Brain, CheckCircle2 } from 'lucide-react';
import { getAssignments, getQuizScore } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import type { Assignment, QuizScore } from '../types';
import Quiz from './Quiz';

interface StudentDashboardProps {
  username: string;
}

interface AssignmentWithScore extends Assignment {
  score?: QuizScore;
  isExpanded?: boolean;
}

export default function StudentDashboard({ username }: StudentDashboardProps) {
  const [assignments, setAssignments] = useState<AssignmentWithScore[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadAssignments(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const loadAssignments = async (currentUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignments();
      
      // Fetch scores for each assignment
      const assignmentsWithScores = await Promise.all(
        data.map(async (assignment) => {
          const score = await getQuizScore(currentUserId, assignment.id);
          return {
            ...assignment,
            score,
            isExpanded: false
          };
        })
      );
      
      setAssignments(assignmentsWithScores);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Errore nel caricamento dei compiti. Per favore riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (assignmentId: string) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, isExpanded: !assignment.isExpanded }
        : assignment
    ));
  };

  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, string> = {
      math: '📐',
      science: '🔬',
      history: '📚',
      geography: '🌍',
      literature: '📖',
    };
    return icons[subject] || '📚';
  };

  const getSubjectName = (subject: string) => {
    const names: Record<string, string> = {
      math: 'Matematica',
      science: 'Scienze',
      history: 'Storia',
      geography: 'Geografia',
      literature: 'Letteratura',
    };
    return names[subject] || subject;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (selectedAssignment) {
    return (
      <Quiz
        username={username}
        assignment={selectedAssignment}
        onBack={() => {
          setSelectedAssignment(null);
          if (userId) loadAssignments(userId);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-purple-600">Caricamento compiti...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => userId && loadAssignments(userId)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  const groupedAssignments = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.subject]) {
      acc[assignment.subject] = [];
    }
    acc[assignment.subject].push(assignment);
    return acc;
  }, {} as Record<string, AssignmentWithScore[]>);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-purple-900 text-center mb-8">
        Seleziona un compito
      </h1>

      {Object.entries(groupedAssignments).length === 0 ? (
        <div className="text-center text-gray-600 p-8">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-purple-300" />
          <p className="text-lg">Non ci sono compiti disponibili al momento.</p>
          <p className="text-sm text-gray-500 mt-2">Torna più tardi per nuovi compiti.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAssignments).map(([subject, subjectAssignments]) => (
            <div key={subject} className="border-2 border-purple-100 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">{getSubjectIcon(subject)}</span>
                <h2 className="text-xl font-semibold text-purple-900">
                  {getSubjectName(subject)}
                </h2>
              </div>
              <div className="space-y-3">
                {subjectAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`rounded-lg border-2 transition-colors ${
                      assignment.score 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-purple-200'
                    }`}
                  >
                    {assignment.score ? (
                      // Completed assignment with accordion
                      <>
                        <button
                          onClick={() => toggleExpand(assignment.id)}
                          className="w-full flex items-center justify-between p-4"
                        >
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                            <span>Scadenza: {formatDate(assignment.dueDate)}</span>
                            <div className="ml-3 flex items-center text-green-600">
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              <span className="text-sm">Completato</span>
                            </div>
                          </div>
                          {assignment.isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-purple-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-purple-600" />
                          )}
                        </button>
                        
                        {assignment.isExpanded && (
                          <div className="px-4 pb-4 border-t border-purple-100">
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-purple-600">
                                  <Trophy className="w-4 h-4 mr-1" />
                                  <span>Punteggio:</span>
                                </div>
                                <span className="font-medium">{assignment.score.score} Purificoin</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-purple-600">
                                  <Brain className="w-4 h-4 mr-1" />
                                  <span>Risposte corrette:</span>
                                </div>
                                <span className="font-medium">
                                  {assignment.score.correct_answers} su {assignment.score.total_questions}
                                </span>
                              </div>
                              <button
                                onClick={() => setSelectedAssignment(assignment)}
                                className="w-full mt-2 py-2 px-4 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                              >
                                Rifai il quiz
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // Uncompleted assignment without accordion
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="w-full flex items-center justify-between p-4"
                      >
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                          <span>Scadenza: {formatDate(assignment.dueDate)}</span>
                        </div>
                        <span className="text-purple-600">Inizia →</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}