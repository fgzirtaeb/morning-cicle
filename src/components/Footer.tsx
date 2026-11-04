import React from 'react';
import { StepNumber } from '../types.ts';
import { soundManager } from '../utils/sound.ts';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

interface FooterProps {
  activeStep: StepNumber;
  onSelectStep: (step: StepNumber) => void;
  teacherNote?: string;
}

export const Footer: React.FC<FooterProps> = ({
  activeStep,
  onSelectStep,
  teacherNote,
}) => {
  const canGoBack = activeStep > 1;
  const canGoNext = activeStep < 7;

  const handlePrev = () => {
    if (canGoBack) {
      soundManager.playTick();
      onSelectStep((activeStep - 1) as StepNumber);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      soundManager.playTick();
      onSelectStep((activeStep + 1) as StepNumber);
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 transition-colors shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Teacher instruction note (in subtle gray Spanish) */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="italic">
            <strong className="font-semibold text-slate-700 dark:text-slate-300 not-italic">
              Indicación docente:
            </strong>{' '}
            {teacherNote || 'Guía la participación oral en gran grupo; anima al alumnado a salir a tocar la pizarra.'}
          </span>
        </div>

        {/* Navigation Buttons: Back / Next with whiteboard size (min 48px) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={!canGoBack}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm min-h-[48px] min-w-[110px] justify-center transition-all border ${
              canGoBack
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 active:scale-98 shadow-xs'
                : 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
            <kbd className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-500 border border-slate-300 dark:border-slate-600">
              ←
            </kbd>
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm min-h-[48px] min-w-[120px] justify-center transition-all shadow-md ${
              canGoNext
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-98'
                : 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
            <kbd className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white border border-white/30">
              →
            </kbd>
          </button>
        </div>
      </div>
    </footer>
  );
};
