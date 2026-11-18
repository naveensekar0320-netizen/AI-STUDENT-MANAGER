import React, { useState } from 'react';
import {
  Cpu,
  Pin,
  PinOff,
  Trash2,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';
import {
  UserRole,
  StudentRecord,
  DashboardMetrics,
  EssentialSpaceCapture,
  NavigationTab,
} from '../types/studentRecord';

interface EssentialKeyAgentViewProps {
  role: UserRole;
  activeStudent: StudentRecord;
  metrics: DashboardMetrics;
  activeModule: NavigationTab;
  captures: EssentialSpaceCapture[];
  initialPrompt?: string;
  isModal?: boolean;
  onCloseModal?: () => void;
  onAddCapture: (capture: EssentialSpaceCapture) => void;
  onTogglePinCapture: (id: string) => void;
  onDeleteCapture: (id: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const EssentialKeyAgentView: React.FC<EssentialKeyAgentViewProps> = ({
  role,
  activeStudent,
  metrics,
  activeModule,
  captures,
  initialPrompt = '',
  isModal = false,
  onCloseModal,
  onAddCapture,
  onTogglePinCapture,
  onDeleteCapture,
  onNavigate,
}) => {
  const [promptInput, setPromptInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialPrompt) {
      setPromptInput(initialPrompt);
    }
  }, [initialPrompt]);

  const contextSummary =
    role === 'admin'
      ? `Admin Registrar Console. Enrolled Students: ${metrics.totalStudents}, Courses: ${metrics.totalCourses}, Mean CGPA: ${metrics.averageCgpa}, Mean Attendance: ${metrics.averageAttendance}%, Attendance Warnings (<75%): ${metrics.attendanceWarningCount}, Fees Cleared: ${metrics.paidFeesCount}/${metrics.totalStudents}.`
      : `Student: ${activeStudent.fname} ${activeStudent.lname} (${activeStudent.regno}), Course: ${activeStudent.courseShort} Sem ${activeStudent.semester}, CGPA: ${activeStudent.cgpa}, Attendance: ${activeStudent.attendancePercent}%, Fee Status: ${activeStudent.feeStatus}. Subjects: ${activeStudent.subjectMarks.map((m) => `${m.subjectName} (${m.totalMarks}/100, Grade ${m.grade})`).join('; ')}.`;

  const quickPresets =
    role === 'admin'
      ? [
          'Audit students below 75% attendance and draft an intervention plan',
          'Summarize fee collection status and pending library book approvals',
          'Generate an executive briefing for Semester 3 & 5 academic performance',
        ]
      : [
          `Calculate how many classes I can miss or need to attend in Sem ${activeStudent.semester}`,
          'Create a 7-day study & homework submission plan for my current subjects',
          'Analyze my internal vs external marks to reach a 9.5+ CGPA',
        ];

  const handleTriggerEssentialCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrompt = promptInput.trim();
    if (!cleanPrompt) {
      setErrorMsg('Enter an instruction or voice/screen note for the Essential Key Agent.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/essential-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          role,
          activeModule,
          contextSummary,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Essential Key AI request failed.');
      }

      const validCategory = ['ACADEMIC', 'ATTENDANCE', 'FINANCE', 'SCHEDULE', 'SYSTEM'].includes(
        data.category
      )
        ? data.category
        : 'ACADEMIC';

      const newCapture: EssentialSpaceCapture = {
        id: `ess-${Date.now()}`,
        title: data.title || 'Essential Space Synthesis',
        summary: data.summary || 'Captured live context from studentrecorddb.',
        category: validCategory,
        metricLabel: data.metricLabel || 'LIVE METRIC',
        metricValue: data.metricValue || `${activeStudent.cgpa.toFixed(2)} CGPA`,
        actionItems: Array.isArray(data.actionItems)
          ? data.actionItems.slice(0, 4)
          : ['Review updated module state'],
        suggestedTab: (data.suggestedTab as NavigationTab) || 'dashboard',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        pinnedToDashboard: true,
        sourcePrompt: cleanPrompt,
      };

      onAddCapture(newCapture);
      setPromptInput('');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to reach server-side Gemini Essential Key endpoint.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-mono text-red-600 dark:text-red-400 font-semibold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            NOTHING OS · ESSENTIAL KEY &amp; ESSENTIAL SPACE
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Context-Aware Academic AI Agent
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Captures your active screen state (<span className="font-mono">{activeModule}</span>) and synthesizes actionable dynamic widgets via Gemini
          </p>
        </div>
        {isModal && onCloseModal && (
          <button
            type="button"
            onClick={onCloseModal}
            aria-label="Close Essential Key modal"
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Live Context Snapshot Box + Capture Input */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-6 space-y-4 nothing-dot-bg">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-300">
            SNAPSHOT CONTEXT · {role.toUpperCase()} · MODULE: {activeModule.toUpperCase()}
          </span>
          <span className="text-red-400">ESSENTIAL KEY READY</span>
        </div>

        <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 leading-relaxed">
          {contextSummary}
        </div>

        <form onSubmit={handleTriggerEssentialCapture} className="space-y-3">
          <label htmlFor="essential-key-prompt" className="block text-xs font-mono text-slate-300">
            PRESS &amp; HOLD ESSENTIAL KEY · ENTER VOICE OR TEXT CAPTURE NOTE
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="essential-key-prompt"
              type="text"
              value={promptInput}
              onChange={(e) => {
                setPromptInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Ask Essential Key to analyze attendance, plan homework, or audit fee dues..."
              className="flex-1 px-4 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SYNTHESIZING...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  CAPTURE TO ESSENTIAL SPACE
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-slate-400">Presets:</span>
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPromptInput(preset)}
              className="px-2.5 py-1 text-[11px] font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors text-left"
            >
              {preset}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 text-xs text-red-200 bg-red-950/90 border border-red-800 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Essential Space Memory Grid (Captured & Pinned Dynamic Widgets) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white">
            ESSENTIAL SPACE MEMORIES &amp; DYNAMIC WIDGET CARDS ({captures.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Pinned cards appear directly on the Overall Dashboard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {captures.map((cap) => (
            <div
              key={cap.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                    {cap.category} · {cap.createdAt}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onTogglePinCapture(cap.id)}
                      aria-label={
                        cap.pinnedToDashboard
                          ? `Unpin ${cap.title} from dashboard`
                          : `Pin ${cap.title} to dashboard`
                      }
                      className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors inline-flex items-center gap-1 ${
                        cap.pinnedToDashboard
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {cap.pinnedToDashboard ? (
                        <>
                          <Pin className="w-3 h-3" />
                          Pinned Widget
                        </>
                      ) : (
                        <>
                          <PinOff className="w-3 h-3" />
                          Pin Widget
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCapture(cap.id)}
                      aria-label={`Delete capture ${cap.title}`}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {cap.title}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="block text-[10px] font-mono text-slate-400">
                      {cap.metricLabel}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {cap.metricValue}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {cap.summary}
                </p>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                    ACTIONABLE NEXT STEPS:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {cap.actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-mono text-red-600 dark:text-red-400">0{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 truncate max-w-[220px]">
                  Note: &ldquo;{cap.sourcePrompt}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(cap.suggestedTab);
                    if (isModal && onCloseModal) onCloseModal();
                  }}
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold whitespace-nowrap"
                >
                  Open {cap.suggestedTab.replace('_', ' ')}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nothing OS Essential Key AI Agent"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
