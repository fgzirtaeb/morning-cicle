import React, { useState, useEffect } from 'react';
import { soundManager, speakEnglish } from '../../utils/sound.ts';
import { Volume2, Clock, Plus, Minus, RotateCcw } from 'lucide-react';

const HOUR_WORDS = [
  'twelve', 'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'
];

/**
 * British English time phrases in 5-minute steps
 */
export function getTimeInWords(hours: number, minutes: number): string {
  // Round to nearest 5 minutes
  const roundedMin = Math.round(minutes / 5) * 5;
  let effectiveMin = roundedMin;
  let effectiveHour = hours % 12;

  if (effectiveMin === 60) {
    effectiveMin = 0;
    effectiveHour = (effectiveHour + 1) % 12;
  }

  const curHourWord = HOUR_WORDS[effectiveHour === 0 ? 12 : effectiveHour];
  const nextHourNum = (effectiveHour + 1) % 12;
  const nextHourWord = HOUR_WORDS[nextHourNum === 0 ? 12 : nextHourNum];

  switch (effectiveMin) {
    case 0:
      return `It's ${curHourWord} o'clock.`;
    case 5:
      return `It's five past ${curHourWord}.`;
    case 10:
      return `It's ten past ${curHourWord}.`;
    case 15:
      return `It's quarter past ${curHourWord}.`;
    case 20:
      return `It's twenty past ${curHourWord}.`;
    case 25:
      return `It's twenty-five past ${curHourWord}.`;
    case 30:
      return `It's half past ${curHourWord}.`;
    case 35:
      return `It's twenty-five to ${nextHourWord}.`;
    case 40:
      return `It's twenty to ${nextHourWord}.`;
    case 45:
      return `It's quarter to ${nextHourWord}.`;
    case 50:
      return `It's ten to ${nextHourWord}.`;
    case 55:
      return `It's five to ${nextHourWord}.`;
    default:
      return `It's ${curHourWord} o'clock.`;
  }
}

export const Step5Time: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState<boolean>(true);
  const [customHours, setCustomHours] = useState<number>(new Date().getHours());
  const [customMinutes, setCustomMinutes] = useState<number>(new Date().getMinutes());

  // Keep live time updated every 15s if live mode
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const current = new Date();
      setNow(current);
      setCustomHours(current.getHours());
      setCustomMinutes(current.getMinutes());
    }, 15000);
    return () => clearInterval(interval);
  }, [isLive]);

  const displayHours = isLive ? now.getHours() : customHours;
  const displayMinutes = isLive ? now.getMinutes() : customMinutes;

  const timePhrase = getTimeInWords(displayHours, displayMinutes);

  const formattedDigital = `${displayHours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}`;

  const adjustMinutes = (delta: number) => {
    setIsLive(false);
    soundManager.playTick();
    let totalMins = customHours * 60 + customMinutes + delta;
    if (totalMins < 0) totalMins += 24 * 60;
    totalMins = totalMins % (24 * 60);

    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    setCustomHours(h);
    setCustomMinutes(m);
  };

  const resetToNow = () => {
    const current = new Date();
    setNow(current);
    setCustomHours(current.getHours());
    setCustomMinutes(current.getMinutes());
    setIsLive(true);
    soundManager.playCorrect();
  };

  // Analog Clock angles
  const minuteAngle = (displayMinutes / 60) * 360;
  const hourAngle = ((displayHours % 12) / 12) * 360 + (displayMinutes / 60) * 30;

  return (
    <div className="space-y-6">
      {/* Top Banner with Model Sentence */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⏰</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading">
                What time is it? · Telling the Time
              </h2>
              <p className="text-xs text-emerald-100">
                La hora en palabras (o'clock, half past, quarter past, quarter to...).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playTick();
              speakEnglish(timePhrase);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 font-bold shadow-md hover:scale-105 active:scale-95 transition-all min-h-[48px]"
            title="Escuchar la hora en palabras"
          >
            <Volume2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm">Listen Time</span>
          </button>
        </div>

        <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-6 border border-white/20">
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-center tracking-wide">
            "{timePhrase}"
          </p>
          <div className="flex justify-center items-center gap-2 mt-2 text-emerald-100 font-mono text-sm">
            <span>Digital:</span>
            <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-white">{formattedDigital}</span>
            {isLive ? (
              <span className="text-[11px] bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100 font-sans">
                ● En directo
              </span>
            ) : (
              <span className="text-[11px] bg-amber-500/80 px-2 py-0.5 rounded text-white font-sans">
                Modo práctica
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clock Visualization & Practice Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span>Interactive Whiteboard Clock:</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Usa los botones ±5m o ±15m para practicar diferentes horas con la asamblea.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => adjustMinutes(-15)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 border border-slate-200 dark:border-slate-700 min-h-[44px]"
            >
              -15m
            </button>
            <button
              onClick={() => adjustMinutes(-5)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 border border-slate-200 dark:border-slate-700 min-h-[44px]"
            >
              -5m
            </button>
            <button
              onClick={() => adjustMinutes(5)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 border border-slate-200 dark:border-slate-700 min-h-[44px]"
            >
              +5m
            </button>
            <button
              onClick={() => adjustMinutes(15)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 border border-slate-200 dark:border-slate-700 min-h-[44px]"
            >
              +15m
            </button>
            {!isLive && (
              <button
                onClick={resetToNow}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 border border-emerald-200 min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Volver a hora real</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Clock Visual & Common Intervals Helper */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-6">
          {/* SVG Analog Clock */}
          <div className="flex justify-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-8 border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-xl flex items-center justify-center">
              {/* Hour markers */}
              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const r = 90; // distance from center
                const x = 112 + r * Math.sin(angle);
                const y = 112 - r * Math.cos(angle);
                return (
                  <span
                    key={h}
                    className="absolute font-bold text-sm sm:text-base text-slate-700 dark:text-slate-300 select-none font-heading"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {h}
                  </span>
                );
              })}

              {/* Hour hand */}
              <div
                className="absolute w-2 bg-slate-900 dark:bg-white rounded-full origin-bottom shadow-sm transition-transform duration-300"
                style={{
                  height: '52px',
                  bottom: '50%',
                  transform: `rotate(${hourAngle}deg)`,
                }}
              />

              {/* Minute hand */}
              <div
                className="absolute w-1.5 bg-emerald-500 rounded-full origin-bottom shadow-sm transition-transform duration-300"
                style={{
                  height: '75px',
                  bottom: '50%',
                  transform: `rotate(${minuteAngle}deg)`,
                }}
              />

              {/* Center pin */}
              <div className="absolute w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-md z-10" />
            </div>
          </div>

          {/* Quick 5-min intervals cheat-sheet / practice buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-heading text-slate-700 dark:text-slate-300">
              Frases clave de la hora en inglés (toca para probar):
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "o'clock (en punto)", min: 0 },
                { label: 'quarter past (y cuarto)', min: 15 },
                { label: 'half past (y media)', min: 30 },
                { label: 'quarter to (menos cuarto)', min: 45 },
                { label: 'five past (y cinco)', min: 5 },
                { label: 'twenty-five to (menos 25)', min: 35 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    setIsLive(false);
                    setCustomMinutes(btn.min);
                    soundManager.playTick();
                  }}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-colors ${
                    Math.round(displayMinutes / 5) * 5 % 60 === btn.min
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">{btn.label}</span>
                  <span className="text-[10px] opacity-80">:{btn.min.toString().padStart(2, '0')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
