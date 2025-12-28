
import React from 'react';
import { AppState } from '../types';
import { MODES, ACTIONS } from '../constants';
import { DownloadIcon, CopyIcon } from './Icons';

interface ReportModalProps {
  state: AppState;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ state, onClose }) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getFullReportText = () => {
    let text = `Chronos 數位觀課儀表板 - 總結報告\n`;
    text += `====================================\n`;
    text += `科目: ${state.subject}\n`;
    text += `日期: ${new Date().toLocaleDateString('zh-TW')}\n`;
    text += `產生時間: ${new Date().toLocaleTimeString('zh-TW')}\n\n`;
    
    text += `[教學模式分佈 (Total Duration)]\n`;
    MODES.forEach(m => {
      text += `- ${m.label.padEnd(10)}: ${formatTime(state.modeTimes[m.id])}\n`;
    });
    
    text += `\n[教學行為統計 (Counts & Duration)]\n`;
    ACTIONS.forEach(a => {
      text += `- ${a.label.padEnd(10)}: ${state.actionCounts[a.id].toString().padStart(2)} 次 | 累計計時: ${formatTime(state.actionTimes[a.id])}\n`;
    });
    
    text += `\n[詳細觀課歷程 (Detailed Log History)]\n`;
    text += `------------------------------------\n`;
    // Reverse logs to show chronological order for report export
    const chronologicalLogs = [...state.logs].reverse();
    chronologicalLogs.forEach(l => {
      let logLine = `[${l.timestamp}] ${l.name}`;
      if (l.value) logLine += ` | ${l.value}`;
      if (l.duration !== undefined) logLine += ` | (持續: ${formatTime(l.duration)})`;
      text += `${logLine}\n`;
    });
    
    text += `\n====================================\n`;
    text += `End of Report\n`;
    
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullReportText());
    alert('觀課紀錄已複製到剪貼簿');
  };

  const handleDownload = () => {
    const text = getFullReportText();
    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chronos_觀課紀錄_${state.subject}_${new Date().getTime()}.txt`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-amber-500/20 bg-slate-900/50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-amber-500 tracking-wider">觀課總結報告</h2>
            <p className="text-xs text-amber-500/40 uppercase tracking-widest mt-1">Detailed Observation Summary</p>
          </div>
          <button onClick={onClose} className="text-amber-500/50 hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-amber-500/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-hide bg-slate-950/20">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-amber-500/50 uppercase tracking-widest mb-3 border-b border-amber-500/10 pb-1">教學模式分佈</h3>
              <div className="space-y-2">
                {MODES.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-amber-500/5">
                    <span className="text-sm text-amber-500/80">{m.label}</span>
                    <span className="text-sm font-mono text-amber-400 font-bold">{formatTime(state.modeTimes[m.id])}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-500/50 uppercase tracking-widest mb-3 border-b border-amber-500/10 pb-1">行為計量統計</h3>
              <div className="space-y-2">
                {ACTIONS.map(a => (
                  <div key={a.id} className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-amber-500/5">
                    <span className="text-sm text-amber-500/80">{a.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-amber-400 mr-3">{state.actionCounts[a.id]}次</span>
                      <span className="text-xs font-mono text-amber-500/40">{formatTime(state.actionTimes[a.id])}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-amber-500/50 uppercase tracking-widest mb-3 border-b border-amber-500/10 pb-1">詳細觀課歷程 (Chronological Log)</h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/10 font-mono text-[11px] leading-relaxed h-64 overflow-y-auto scrollbar-hide text-amber-500/70">
              {[...state.logs].reverse().map(l => (
                <div key={l.id} className="mb-1.5 border-b border-amber-500/5 pb-1 last:border-0">
                  <span className="text-amber-500/40">[{l.timestamp}]</span> 
                  <span className={`ml-2 font-bold ${l.type.includes('start') ? 'text-amber-400' : l.type.includes('end') ? 'text-amber-600' : 'text-amber-500'}`}>
                    {l.name}
                  </span>
                  {l.value && <span className="ml-2 text-amber-500/60">({l.value})</span>}
                  {l.duration !== undefined && <span className="ml-2 text-amber-400/80 italic">- 時長: {formatTime(l.duration)}</span>}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-950/50 flex flex-wrap gap-4 border-t border-amber-500/20">
          <button 
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-500 py-3 rounded-xl border border-amber-500/30 transition-all font-medium shadow-lg"
          >
            <CopyIcon /> 複製紀錄
          </button>
          <button 
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 py-3 rounded-xl transition-all font-bold shadow-lg shadow-amber-500/30"
          >
            <DownloadIcon /> 下載 TXT
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
