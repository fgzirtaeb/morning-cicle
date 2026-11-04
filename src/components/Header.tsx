import React, { useState, useEffect } from 'react';
import {
  DesdobleId,
  StepNumber,
} from '../types.ts';
import { STEPS_CONFIG } from '../data/unit2Data.ts';
import { soundManager } from '../utils/sound.ts';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  AlertTriangle,
  Flame,
  Award,
} from 'lucide-react';

interface HeaderProps {
  activeDesdoble: DesdobleId;
  onSelectDesdoble: (d: DesdobleId) => void;
  activeStep: StepNumber;
  onSelectStep: (step: StepNumber) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetUnit: () => void;
  starCount: number;
  maxStars: number;
  streak: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeDesdoble,
  onSelectDesdoble,
  activeStep,
  onSelectStep,
  soundEnabled,
  onToggleSound,
  isDarkMode,
  onToggleDarkMode,
  onResetUnit,
  starCount,
  maxStars,
  streak,
}) => {
  // Whiteboard session countdown timer (default 5:00 = 300s, configurable)
  const [timerSeconds, setTimerSeconds] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            soundManager.playCorrect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    soundManager.playTick();
  };

  const resetTimer = (seconds: number = 300) => {
    setIsTimerRunning(false);
    setTimerSeconds(seconds);
    soundManager.playTick();
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-3 py-2 sm:px-6 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Top row: Brand, Desdoble selector, Timer, Settings */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Logo & School context */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white text-xl sm:text-2xl shadow-md font-bold">
              MC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                  Morning Circle · Unit 2
                </h1>
                <span className="hidden md:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                  LOMLOE · DUA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                C.R.A. Jimena Muñiz · Corullón (León)
              </p>
            </div>
          </div>

          {/* Desdoble Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                onSelectDesdoble('desdoble1');
                soundManager.playTick();
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[44px] flex items-center gap-1.5 ${
                activeDesdoble === 'desdoble1'
                  ? 'bg-amber-500 text-white shadow-md scale-102'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🌱 Desdoble 1</span>
              <span className="text-[11px] opacity-90 hidden sm:inline">(2º-3º-4º)</span>
            </button>
            <button
              onClick={() => {
                onSelectDesdoble('desdoble2');
                soundManager.playTick();
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[44px] flex items-center gap-1.5 ${
                activeDesdoble === 'desdoble2'
                  ? 'bg-teal-600 text-white shadow-md scale-102'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🚀 Desdoble 2</span>
              <span className="text-[11px] opacity-90 hidden sm:inline">(5º-6º)</span>
            </button>
          </div>

          {/* Whiteboard Countdown Timer & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak & Star Jar quick badge */}
            <div className="hidden lg:flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-lg">
              <span className="text-amber-500 text-sm">⭐</span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {starCount}/{maxStars}
              </span>
              {streak > 0 && (
                <div className="flex items-center gap-0.5 text-xs text-orange-600 dark:text-orange-400 font-bold ml-1 pl-1.5 border-l border-amber-200 dark:border-amber-800">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{streak}d</span>
                </div>
              )}
            </div>

            {/* Timer for digital whiteboard */}
            <div className="flex items-center bg-slate-900 dark:bg-black text-amber-400 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl border border-slate-700 shadow-sm font-mono font-bold text-base sm:text-lg min-h-[44px]">
              <span className={timerSeconds < 60 && timerSeconds > 0 ? 'text-red-400 animate-pulse' : ''}>
                {formatTime(timerSeconds)}
              </span>
              <div className="flex items-center gap-1 ml-2 text-white">
                <button
                  onClick={toggleTimer}
                  title={isTimerRunning ? 'Pausar temporizador' : 'Iniciar temporizador'}
                  className="p-1 hover:bg-slate-800 rounded active:scale-95 transition-transform"
                  aria-label="Play or pause timer"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={() => resetTimer(300)}
                  title="Reiniciar a 5 minutos"
                  className="p-1 hover:bg-slate-800 rounded active:scale-95 transition-transform"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle sound effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Reset Unit Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              title="Reiniciar unidad (borra puntos y progreso con confirmación)"
              className="p-2 sm:p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Reset unit progress"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Navigation Bar: Steps 1 to 7 */}
        <nav aria-label="Morning Circle Steps" className="mt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {STEPS_CONFIG.map((step) => {
              const isActive = activeStep === step.number;
              const isPast = activeStep > step.number;
              return (
                <button
                  key={step.number}
                  onClick={() => {
                    onSelectStep(step.number);
                    soundManager.playTick();
                  }}
                  className={`flex-1 min-w-[100px] sm:min-w-[120px] px-2 py-2 rounded-xl text-left border transition-all flex flex-col justify-center min-h-[48px] ${
                    isActive
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md font-bold scale-102 ring-2 ring-amber-300 dark:ring-amber-500'
                      : isPast
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span>{step.icon}</span>
                      <span>{step.number}. {step.title}</span>
                    </span>
                    {isPast && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓</span>}
                  </div>
                  <span className={`text-[10px] truncate ${isActive ? 'text-amber-100' : 'text-slate-400'}`}>
                    {step.subtitleEs}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold font-heading">¿Reiniciar progreso de la Unidad?</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Esta acción pondrá a cero las estrellas del tarro cooperativo, las casillas exploradas en el mapa y los puntos de los equipos de este desdoble. Se guardará para la siguiente sesión.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onResetUnit();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md min-h-[44px]"
              >
                Sí, reiniciar unidad
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
