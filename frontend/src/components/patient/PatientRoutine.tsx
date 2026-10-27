import React, { useEffect, useState } from 'react';
import { RoutineTask } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, Check, Clock, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

interface PatientRoutineProps {
  onBack: () => void;
}

export const PatientRoutine: React.FC<PatientRoutineProps> = ({ onBack }) => {
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const data = await api.getRoutine();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (taskId: number) => {
    try {
      await api.toggleRoutineTask(taskId);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, is_completed: !t.is_completed } : t))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const speakTask = (task: RoutineTask) => {
    if ('speechSynthesis' in window) {
      const statusText = task.is_completed ? 'This is completed.' : 'This is coming up.';
      const msg = `${task.time_of_day}. ${task.title}. ${task.description || ''}. ${statusText}`;
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const completedCount = tasks.filter(t => t.is_completed).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header with Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-stone-300 text-stone-800 font-bold hover:bg-stone-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
          🗓️ My Day Rhythm
        </h1>
      </div>

      {/* Progress reassurance */}
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
            Today's Progress
          </span>
          <p className="text-lg font-bold text-emerald-950">
            {completedCount} of {tasks.length} activities completed
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-200 text-emerald-900 font-black text-lg flex items-center justify-center">
          {Math.round((completedCount / (tasks.length || 1)) * 100)}%
        </div>
      </div>

      {/* Routine Task Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 font-bold text-stone-500">Loading your day...</div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`patient-card-touch p-4 sm:p-5 rounded-2xl border-2 transition flex items-center justify-between gap-4 ${
                task.is_completed
                  ? 'bg-stone-50/70 border-stone-200 opacity-80'
                  : 'bg-white border-stone-300 shadow-xs hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1">
                {/* Large check button */}
                <button
                  onClick={() => handleToggle(task.id)}
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition cursor-pointer shrink-0 ${
                    task.is_completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-stone-400 hover:border-emerald-500 bg-white'
                  }`}
                  title="Mark as done"
                >
                  {task.is_completed && <Check className="w-7 h-7 stroke-[3]" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
                      {task.time_of_day}
                    </span>
                    {task.is_completed && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                  </div>
                  <h3 className={`text-lg font-extrabold text-stone-900 mt-1 ${task.is_completed ? 'line-through text-stone-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-stone-600 font-medium">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Read aloud button */}
              <button
                onClick={() => speakTask(task)}
                className="p-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl cursor-pointer"
                title="Speak this activity"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
