import React, { useState, useEffect } from 'react';
import { Cat, BookOpen, Brain, Award } from 'lucide-react';
import TeacherUpload from './components/TeacherUpload';
import StudentDashboard from './components/StudentDashboard';
import Login from './components/Login';
import Register from './components/Register';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'Studente' | 'Docente' | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole(session.user.user_metadata.role as 'Studente' | 'Docente');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole(session.user.user_metadata.role as 'Studente' | 'Docente');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-purple-600 text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <Register
          onLoginClick={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login
        onRegisterClick={() => setShowRegister(true)}
      />
    );
  }

  const userMetadata = user.user_metadata;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cat className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-purple-900">EduFox</h1>
          </div>
          <div className="flex items-center space-x-4">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <Brain className="w-6 h-6 text-purple-600" />
            <Award className="w-6 h-6 text-purple-600" />
            <span className="text-purple-900 font-medium">
              {userMetadata.first_name} {userMetadata.last_name}
            </span>
            <span className="text-sm text-purple-600">
              {userRole}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {userRole === 'Docente' ? (
          <TeacherUpload userId={user.id} />
        ) : (
          <StudentDashboard username={userMetadata.first_name} />
        )}
      </main>
    </div>
  );
}