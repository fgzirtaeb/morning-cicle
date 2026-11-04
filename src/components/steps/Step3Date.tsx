import React, { useState } from 'react';
import { soundManager, speakEnglish } from '../../utils/sound.ts';
import { Volume2, Eye, EyeOff, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export const Step3Date: React.FC = () => {
  const today = new Date();

  // Day names in English
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[today.getDay()];

  // Months in English
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = months[today.getMonth()];

  const dayNumber = today.getDate();
  const year = today.getFullYear();

  // English Ordinal suffixes (1st, 2nd, 3rd, 4th, 21st, 22nd, 23rd, 31st)
  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  const ordinalString = `${dayNumber}${getOrdinalSuffix(dayNumber)}`;

  // Season in the northern hemisphere (Corullón, León)
  const getSeason = (month: number) => {
    // 0 = Jan, 1 = Feb, 2 = Mar...
    if (month >= 2 && month <= 4) return { en: 'Spring', es: 'Primavera', icon: '🌸' };
    if (month >= 5 && month <= 7) return { en: 'Summer', es: 'Verano', icon: '☀️' };
    if (month >= 8 && month <= 10) return { en: 'Autumn', es: 'Otoño', icon: '🍂' };
    return { en: 'Winter', es: 'Invierno', icon: '❄️' };
  };
  const season = getSeason(today.getMonth());

  // Mystery hide/reveal state (Hidden by default as requested in prompt)
  const [revealed, setRevealed] = useState<{
    day: boolean;
    ordinal: boolean;
    month: boolean;
    season: boolean;
    year: boolean;
  }>({
    day: false,
    ordinal: false,
    month: false,
    season: false,
    year: false,
  });

  const toggleCard = (key: keyof typeof revealed) => {
    const isNowRevealed = !revealed[key];
    setRevealed((prev) => ({ ...prev, [key]: isNowRevealed }));
    if (isNowRevealed) {
      soundManager.playCorrect();
    } else {
      soundManager.playTick();
    }
  };

  const revealAll = () => {
    soundManager.playFanfare();
    setRevealed({ day: true, ordinal: true, month: true, season: true, year: true });
  };

  const hideAll = () => {
    soundManager.playTick();
    setRevealed({ day: false, ordinal: false, month: false, season: false, year: false });
  };

  const fullDateSentence = `Today is ${dayName}, the ${ordinalString} of ${monthName}, ${year}. It is ${season.en.toLowerCase()}.`;

  return (
    <div className="space-y-6">
      {/* Top Banner with Model Sentence */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading">
                Date & Season Routine
              </h2>
              <p className="text-xs text-blue-100">
                Primero intenta decirlo en voz alta; luego toca cada tarjeta para comprobar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playTick();
                speakEnglish(fullDateSentence);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold shadow-md hover:scale-105 active:scale-95 transition-all min-h-[48px]"
              title="Escuchar frase completa de la fecha"
            >
              <Volume2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Listen Date</span>
            </button>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-6 border border-white/20">
          <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-center tracking-wide">
            "{fullDateSentence}"
          </p>
        </div>
      </div>

      {/* Cards Stage: Day, Ordinal, Month, Season, Year */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              <span>Tap to reveal / Toca para desvelar:</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pide a un/a alumno/a que salga a la pizarra a tocar y leer en voz alta.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={revealAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 min-h-[44px]"
            >
              <Eye className="w-4 h-4" />
              <span>Desvelar todo</span>
            </button>
            <button
              onClick={hideAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200 min-h-[44px]"
            >
              <EyeOff className="w-4 h-4" />
              <span>Ocultar todo</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Day of the week */}
          <button
            onClick={() => toggleCard('day')}
            className={`p-6 rounded-2xl border-2 transition-all min-h-[160px] flex flex-col justify-between items-center text-center shadow-xs active:scale-95 ${
              revealed.day
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 animate-pop-in'
                : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-400'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Day of the week
            </span>
            {revealed.day ? (
              <div className="my-2">
                <span className="text-4xl font-extrabold font-heading text-blue-600 dark:text-blue-400">
                  {dayName}
                </span>
                <span className="block text-xs text-slate-400 mt-1">Día de la semana</span>
              </div>
            ) : (
              <div className="my-2 flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-400">❓</span>
                <span className="text-xs font-bold text-slate-500 mt-1">What day is it?</span>
              </div>
            )}
            <span className="text-[11px] font-semibold text-blue-500">
              {revealed.day ? '✓ Revelado' : '👉 Toca para desvelar'}
            </span>
          </button>

          {/* Card 2: Ordinal number */}
          <button
            onClick={() => toggleCard('ordinal')}
            className={`p-6 rounded-2xl border-2 transition-all min-h-[160px] flex flex-col justify-between items-center text-center shadow-xs active:scale-95 ${
              revealed.ordinal
                ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 animate-pop-in'
                : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-amber-400'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Ordinal Day
            </span>
            {revealed.ordinal ? (
              <div className="my-2">
                <span className="text-4xl font-extrabold font-heading text-amber-600 dark:text-amber-400">
                  the {ordinalString}
                </span>
                <span className="block text-xs text-slate-400 mt-1">Número ordinal (con -th/-st)</span>
              </div>
            ) : (
              <div className="my-2 flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-400">❓</span>
                <span className="text-xs font-bold text-slate-500 mt-1">What number?</span>
              </div>
            )}
            <span className="text-[11px] font-semibold text-amber-600">
              {revealed.ordinal ? '✓ Revelado' : '👉 Toca para desvelar'}
            </span>
          </button>

          {/* Card 3: Month */}
          <button
            onClick={() => toggleCard('month')}
            className={`p-6 rounded-2xl border-2 transition-all min-h-[160px] flex flex-col justify-between items-center text-center shadow-xs active:scale-95 ${
              revealed.month
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 animate-pop-in'
                : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-400'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Month of the year
            </span>
            {revealed.month ? (
              <div className="my-2">
                <span className="text-4xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
                  {monthName}
                </span>
                <span className="block text-xs text-slate-400 mt-1">Mes del año</span>
              </div>
            ) : (
              <div className="my-2 flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-400">❓</span>
                <span className="text-xs font-bold text-slate-500 mt-1">What month?</span>
              </div>
            )}
            <span className="text-[11px] font-semibold text-emerald-600">
              {revealed.month ? '✓ Revelado' : '👉 Toca para desvelar'}
            </span>
          </button>

          {/* Card 4: Season */}
          <button
            onClick={() => toggleCard('season')}
            className={`p-6 rounded-2xl border-2 transition-all min-h-[160px] flex flex-col justify-between items-center text-center shadow-xs active:scale-95 ${
              revealed.season
                ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 animate-pop-in'
                : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-purple-400'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Season
            </span>
            {revealed.season ? (
              <div className="my-2">
                <div className="text-3xl mb-1">{season.icon}</div>
                <span className="text-3xl font-extrabold font-heading text-purple-600 dark:text-purple-400">
                  {season.en}
                </span>
                <span className="block text-xs text-slate-400 mt-1">{season.es}</span>
              </div>
            ) : (
              <div className="my-2 flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-400">❓</span>
                <span className="text-xs font-bold text-slate-500 mt-1">What season?</span>
              </div>
            )}
            <span className="text-[11px] font-semibold text-purple-600">
              {revealed.season ? '✓ Revelado' : '👉 Toca para desvelar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
