
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AppState, 
  TeachingModeId, 
  ActionId, 
  EngagementLevel, 
  LogEntry 
} from './types';
import { 
  SUBJECTS, 
  MODES, 
  ACTIONS, 
  ENGAGEMENT_REMINDER_INTERVAL 
} from './constants';
import { StartIcon, StopIcon, CheckIcon } from './components/Icons';
import ReportModal from './components/ReportModal';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isSessionActive: false,
    activeMode: null,
    modeTimes: { lecture: 0, discussion: 0, practice: 0, digital: 0 },
    actionCounts: { praise: 0, correction: 0, open_q: 0, closed_q: 0, walking: 0 },
    actionTimes: { praise: 0, correction: 0, open_q: 0, closed_q: 0, walking: 0 },
    activeActions: [],
    logs: [],
    engagement: 'med',
    subject: SUBJECTS[0],
    lastInteraction: Date.now()
  });

  const [sysTime, setSysTime] = useState(new Date().toLocaleTimeString('zh-TW', { hour12: false }));
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [isReminderFlashing, setIsReminderFlashing] = useState(false);

  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Format seconds to MM:SS
  const formatSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addLog = useCallback((type: LogEntry['type'], name: string, value?: string, duration?: number) => {
    const timeStr = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: timeStr,
      type,
      name,
      value,
      duration
    };
    setState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 100), // Increased log limit for more detail
      lastInteraction: Date.now()
    }));
  }, []);

  // System clock and Engagement reminder
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setSysTime(new Date().toLocaleTimeString('zh-TW', { hour12: false }));
      if (state.isSessionActive) {
        const idleTime = Date.now() - state.lastInteraction;
        if (idleTime > ENGAGEMENT_REMINDER_INTERVAL) {
          setIsReminderFlashing(true);
        } else {
          setIsReminderFlashing(false);
        }
      }
    }, 1000);
    return () => clearInterval(clockInterval);
  }, [state.isSessionActive, state.lastInteraction]);

  // Session Ticker
  useEffect(() => {
    if (state.isSessionActive) {
      tickerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
        
        setState(prev => {
          const newModeTimes = { ...prev.modeTimes };
          const newActionTimes = { ...prev.actionTimes };
          
          if (prev.activeMode) {
            newModeTimes[prev.activeMode] += 1;
          }
          
          prev.activeActions.forEach(actionId => {
            newActionTimes[actionId] += 1;
          });

          return {
            ...prev,
            modeTimes: newModeTimes,
            actionTimes: newActionTimes
          };
        });
      }, 1000);
    } else {
      if (tickerRef.current) clearInterval(tickerRef.current);
    }
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [state.isSessionActive]);

  const toggleSession = () => {
    if (!state.isSessionActive) {
      setState(prev => ({ 
        ...prev, 
        isSessionActive: true, 
        lastInteraction: Date.now(),
        modeTimes: { lecture: 0, discussion: 0, practice: 0, digital: 0 },
        actionCounts: { praise: 0, correction: 0, open_q: 0, closed_q: 0, walking: 0 },
        actionTimes: { praise: 0, correction: 0, open_q: 0, closed_q: 0, walking: 0 },
        activeActions: [],
        logs: []
      }));
      setSessionDuration(0);
      addLog('mode_change', '開始觀課');
    } else {
      // End all active timers before stopping
      const currentActiveActions = [...state.activeActions];
      currentActiveActions.forEach(id => {
        const action = ACTIONS.find(a => a.id === id);
        addLog('action_timed_end', `${action?.label} (強制結束)`, `時長: ${formatSeconds(state.actionTimes[id])}`);
      });

      setState(prev => ({ ...prev, isSessionActive: false, activeMode: null, activeActions: [] }));
      addLog('mode_change', '結束觀課');
      setShowReport(true);
    }
  };

  const handleModeClick = (modeId: TeachingModeId) => {
    if (!state.isSessionActive) return;
    const mode = MODES.find(m => m.id === modeId);
    
    if (state.activeMode === modeId) {
      addLog('mode_change', `${mode?.label} 暫停`, `時長: ${formatSeconds(state.modeTimes[modeId])}`);
      setState(prev => ({ ...prev, activeMode: null, lastInteraction: Date.now() }));
    } else {
      if (state.activeMode) {
        const prevMode = MODES.find(m => m.id === state.activeMode);
        addLog('mode_change', `${prevMode?.label} 切換暫停`, `時長: ${formatSeconds(state.modeTimes[state.activeMode!])}`);
      }
      addLog('mode_change', `${mode?.label} 開始`);
      setState(prev => ({ ...prev, activeMode: modeId, lastInteraction: Date.now() }));
    }
  };

  const handleActionDiscrete = (actionId: ActionId) => {
    if (!state.isSessionActive) return;
    const action = ACTIONS.find(a => a.id === actionId);
    setState(prev => ({
      ...prev,
      actionCounts: { ...prev.actionCounts, [actionId]: prev.actionCounts[actionId] + 1 },
      lastInteraction: Date.now()
    }));
    addLog('action', `${action?.label} (計次)`);
  };

  const toggleActionTiming = (actionId: ActionId) => {
    if (!state.isSessionActive) return;
    const action = ACTIONS.find(a => a.id === actionId);
    const isTiming = state.activeActions.includes(actionId);

    if (isTiming) {
      addLog('action_timed_end', `${action?.label} 計時結束`, `區段結束`);
      setState(prev => ({
        ...prev,
        activeActions: prev.activeActions.filter(id => id !== actionId),
        lastInteraction: Date.now()
      }));
    } else {
      addLog('action_timed_start', `${action?.label} 計時開始`);
      setState(prev => ({
        ...prev,
        activeActions: [...prev.activeActions, actionId],
        lastInteraction: Date.now()
      }));
    }
  };

  // Long press handler
  const handleActionInteraction = (actionId: ActionId, type: 'start' | 'end') => {
    if (!state.isSessionActive) return;

    if (type === 'start') {
      longPressTimerRef.current[actionId] = setTimeout(() => {
        toggleActionTiming(actionId);
        longPressTimerRef.current[actionId] = null as any;
      }, 600);
    } else {
      if (longPressTimerRef.current[actionId]) {
        clearTimeout(longPressTimerRef.current[actionId]);
        handleActionDiscrete(actionId);
        longPressTimerRef.current[actionId] = null as any;
      }
    }
  };

  const handleEngagementChange = (level: EngagementLevel) => {
    if (!state.isSessionActive) return;
    const label = level === 'high' ? '高' : level === 'med' ? '中' : '低';
    setState(prev => ({ ...prev, engagement: level, lastInteraction: Date.now() }));
    addLog('engagement', '變更學生專注度', label);
    setIsReminderFlashing(false);
  };

  const handleSendNote = () => {
    if (!noteInput.trim() || !state.isSessionActive) return;
    addLog('note', '質性紀錄', noteInput);
    setNoteInput('');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 klimt-pattern pointer-events-none" />

      {/* Header */}
      <header className="glass sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-amber-500 tracking-tighter">CHRONOS</h1>
            <p className="text-[10px] uppercase opacity-50 tracking-widest -mt-1">Digital Dashboard</p>
          </div>
          <select 
            value={state.subject}
            onChange={(e) => setState(prev => ({ ...prev, subject: e.target.value }))}
            className="bg-slate-900/80 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-medium transition-all"
            disabled={state.isSessionActive}
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          <div className="text-center">
            <div className="text-2xl font-mono font-light text-amber-400">{sysTime}</div>
            {state.isSessionActive && (
              <div className="text-xs text-amber-500/60 font-medium">觀課時長: {formatSeconds(sessionDuration)}</div>
            )}
          </div>
          
          <button 
            onClick={toggleSession}
            className={`transition-all duration-300 transform active:scale-95 ${state.isSessionActive ? 'text-red-500' : 'text-amber-500'}`}
          >
            {state.isSessionActive ? <StopIcon /> : <StartIcon />}
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
        {/* Left - Teaching Modes */}
        <section className="lg:col-span-3 space-y-4">
          <h2 className="text-xs font-bold text-amber-500/50 uppercase tracking-[0.2em] mb-2 px-1">教學模式 (States)</h2>
          <div className="grid grid-cols-1 gap-4">
            {MODES.map(mode => {
              const isActive = state.activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeClick(mode.id)}
                  disabled={!state.isSessionActive}
                  className={`
                    relative overflow-hidden group p-5 rounded-2xl border transition-all duration-300 text-left
                    ${isActive 
                      ? 'bg-amber-500/10 border-amber-500 active-pulse' 
                      : 'bg-slate-900/40 border-amber-500/10 hover:border-amber-500/30'
                    }
                    ${!state.isSessionActive ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-lg font-bold tracking-tight ${isActive ? 'text-amber-400' : 'text-amber-500/80'}`}>
                      {mode.label}
                    </span>
                    {isActive && <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
                  </div>
                  <div className="text-2xl font-mono font-light text-amber-500/40 group-hover:text-amber-500/80 transition-colors">
                    {formatSeconds(state.modeTimes[mode.id])}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Center - Teaching Actions */}
        <section className="lg:col-span-6 space-y-4">
          <h2 className="text-xs font-bold text-amber-500/50 uppercase tracking-[0.2em] mb-2 px-1">教學行為 (Actions - 長按計時)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ACTIONS.map(action => {
              const isDiscipline = action.id === 'correction';
              const isTiming = state.activeActions.includes(action.id);
              return (
                <button
                  key={action.id}
                  onMouseDown={() => handleActionInteraction(action.id, 'start')}
                  onMouseUp={() => handleActionInteraction(action.id, 'end')}
                  onMouseLeave={() => { if(longPressTimerRef.current[action.id]) clearTimeout(longPressTimerRef.current[action.id]) }}
                  onTouchStart={() => handleActionInteraction(action.id, 'start')}
                  onTouchEnd={() => handleActionInteraction(action.id, 'end')}
                  disabled={!state.isSessionActive}
                  className={`
                    relative flex flex-col items-center justify-center gap-2 p-6 rounded-3xl border transition-all duration-300 transform active:scale-95 aspect-square overflow-hidden
                    ${isTiming 
                      ? 'bg-amber-500/20 border-amber-400 active-pulse' 
                      : isDiscipline 
                        ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40' 
                        : 'bg-slate-900/40 border-amber-500/10 hover:bg-amber-500/5 hover:border-amber-500/40'
                    }
                    ${!state.isSessionActive ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                >
                  <div className={`text-3xl font-bold ${isTiming ? 'text-amber-300' : isDiscipline ? 'text-red-400' : 'text-amber-500'}`}>
                    {state.actionCounts[action.id]}
                  </div>
                  <span className={`text-sm font-medium tracking-wide text-center leading-tight ${isTiming ? 'text-amber-300' : isDiscipline ? 'text-red-500/80' : 'text-amber-400/80'}`}>
                    {action.label}
                  </span>
                  
                  {state.actionTimes[action.id] > 0 && (
                    <div className="text-[10px] font-mono mt-1 opacity-60">
                      ⏱ {formatSeconds(state.actionTimes[action.id])}
                    </div>
                  )}

                  {isTiming && (
                    <div className="absolute inset-0 border-2 border-amber-500/30 rounded-3xl animate-pulse pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Right - Log Stream */}
        <section className="lg:col-span-3 space-y-4">
          <h2 className="text-xs font-bold text-amber-500/50 uppercase tracking-[0.2em] mb-2 px-1">即時紀錄 (Detailed Logs)</h2>
          <div className="bg-slate-900/40 rounded-2xl border border-amber-500/10 h-[500px] overflow-hidden flex flex-col shadow-inner">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {state.logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-amber-500/20 text-sm italic">
                  尚未有紀錄資料
                </div>
              ) : (
                state.logs.map((log) => (
                  <div key={log.id} className="animate-in slide-in-from-top-4 duration-500 border-l-2 border-amber-500/30 pl-3 py-1">
                    <div className="text-[10px] font-mono text-amber-500/40 flex justify-between items-center">
                      <span>{log.timestamp}</span>
                      {log.duration !== undefined && <span>{formatSeconds(log.duration)}</span>}
                    </div>
                    <div className={`text-sm font-medium ${log.type.includes('start') ? 'text-amber-400' : log.type.includes('end') ? 'text-amber-600' : 'text-amber-400/90'}`}>
                      {log.name}
                    </div>
                    {log.value && <div className="text-xs text-amber-500/60 mt-0.5 italic">{log.value}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Controls */}
      <footer className={`
        glass fixed bottom-0 left-0 right-0 z-40 p-4 transition-all duration-500
        ${isReminderFlashing ? 'bg-amber-500/20 ring-4 ring-amber-500/50 ring-inset' : ''}
      `}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-amber-500/80 shrink-0">專注度:</span>
            <div className="flex-1 grid grid-cols-3 gap-2 h-10">
              {(['high', 'med', 'low'] as EngagementLevel[]).map(level => {
                const isActive = state.engagement === level;
                const colors = {
                  high: isActive ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
                  med: isActive ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                  low: isActive ? 'bg-red-500 text-slate-950' : 'bg-red-500/10 text-red-500 border-red-500/30'
                };
                return (
                  <button
                    key={level}
                    onClick={() => handleEngagementChange(level)}
                    disabled={!state.isSessionActive}
                    className={`rounded-lg text-xs font-bold border transition-all ${colors[level]} ${!state.isSessionActive ? 'opacity-30' : ''}`}
                  >
                    {level === 'high' ? '高' : level === 'med' ? '中' : '低'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="質性紀錄輸入..."
              className="flex-1 bg-slate-950/80 border border-amber-500/20 rounded-xl px-4 py-2 text-amber-100 placeholder:text-amber-500/30 focus:outline-none focus:border-amber-500/60"
              onKeyDown={(e) => e.key === 'Enter' && handleSendNote()}
              disabled={!state.isSessionActive}
            />
            <button 
              onClick={handleSendNote}
              disabled={!state.isSessionActive || !noteInput.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 p-2.5 rounded-xl transition-all shadow-lg"
            >
              <CheckIcon />
            </button>
          </div>
        </div>
      </footer>

      {showReport && (
        <ReportModal 
          state={state} 
          onClose={() => setShowReport(false)} 
        />
      )}
    </div>
  );
};

export default App;
