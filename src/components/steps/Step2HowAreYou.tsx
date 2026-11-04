import React, { useState } from 'react';
import { EmotionItem } from '../../types.ts';
import { EMOTIONS_LIST } from '../../data/unit2Data.ts';
import { soundManager, speakEnglish } from '../../utils/sound.ts';
import { Volume2, RotateCcw, Plus, Sparkles } from 'lucide-react';

interface Step2HowAreYouProps {
  emotionTally: Record<string, number>;
  onUpdateTally: (tally: Record<string, number>) => void;
}

export const Step2HowAreYou: React.FC<Step2HowAreYouProps> = ({
  emotionTally,
  onUpdateTally,
}) => {
  const [selectedAffirmative, setSelectedAffirmative] = useState<string>('happy');
  const [selectedNegative, setSelectedNegative] = useState<string>('tired');
  const [lastTappedEmotion, setLastTappedEmotion] = useState<string | null>(null);

  const handleTapEmotion = (emotion: EmotionItem) => {
    soundManager.playCorrect();
    setLastTappedEmotion(emotion.id);

    // Update tally
    const current = emotionTally[emotion.id] || 0;
    const next = { ...emotionTally, [emotion.id]: current + 1 };
    onUpdateTally(next);

    // Update affirmative model to what was tapped
    setSelectedAffirmative(emotion.id);

    // If negative is the same, pick an opposite
    if (selectedNegative === emotion.id) {
      const other = emotion.id === 'tired' ? 'sad' : 'tired';
      setSelectedNegative(other);
    }
  };

  const handleResetTally = () => {
    soundManager.playTick();
    onUpdateTally({});
  };

  const affEmotion = EMOTIONS_LIST.find((e) => e.id === selectedAffirmative) || EMOTIONS_LIST[0];
  const negEmotion = EMOTIONS_LIST.find((e) => e.id === selectedNegative) || EMOTIONS_LIST[3];

  const fullModelSentence = `I'm ${affEmotion.label.toLowerCase()}. I'm not ${negEmotion.label.toLowerCase()}.`;

  const totalResponses = Object.values(emotionTally).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Dynamic Model Sentence (Affirmative + Negative) */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🗣️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading">
                Language Model: Affirmative & Negative
              </h2>
              <p className="text-xs text-amber-100">
                Modelo oral obligatorio para salir a la asamblea: "I'm... I'm not..."
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playTick();
              speakEnglish(fullModelSentence);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold shadow-md hover:scale-105 active:scale-95 transition-all min-h-[48px]"
            title="Escuchar modelo oral con pronunciación británica"
          >
            <Volume2 className="w-5 h-5 text-amber-600" />
            <span className="text-sm">Listen Model</span>
          </button>
        </div>

        {/* Big high-contrast sentence display */}
        <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-6 border border-white/20">
          <p className="text-2xl sm:text-4xl font-extrabold font-heading tracking-wide text-center">
            "{fullModelSentence}"
          </p>
          <div className="flex justify-center gap-4 mt-3 text-xs sm:text-sm font-semibold text-amber-100">
            <span>✅ Estoy {affEmotion.spanish.toLowerCase()}</span>
            <span>·</span>
            <span>❌ No estoy {negEmotion.spanish.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Grid of 8 Emotions for Whiteboard Tapping */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <span>🌈</span>
              <span>Tap your emotion / Toca tu emoción:</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total votos hoy: <strong className="text-amber-600 font-bold">{totalResponses} alumnos</strong> (C.R.A. Jimena Muñiz)
            </p>
          </div>

          <button
            onClick={handleResetTally}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors border border-transparent hover:border-red-200"
            title="Poner a cero el recuento de hoy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar recuento</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {EMOTIONS_LIST.map((emo) => {
            const count = emotionTally[emo.id] || 0;
            const isAff = selectedAffirmative === emo.id;
            const isNeg = selectedNegative === emo.id;
            const isJustTapped = lastTappedEmotion === emo.id;

            return (
              <button
                key={emo.id}
                onClick={() => handleTapEmotion(emo)}
                className={`group relative p-4 sm:p-6 rounded-2xl border-2 text-center transition-all min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-between shadow-xs hover:shadow-md active:scale-95 ${
                  isJustTapped ? 'animate-bounce-short ring-4 ring-amber-400' : ''
                } ${
                  isAff
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-amber-300'
                }`}
              >
                {/* Live tally badge */}
                <span className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-sm">
                  {count}
                </span>

                {/* Big Whiteboard Emoji */}
                <span className="text-4xl sm:text-5xl my-1 group-hover:scale-110 transition-transform">
                  {emo.emoji}
                </span>

                <div>
                  <div className="text-base sm:text-lg font-extrabold font-heading text-slate-900 dark:text-white">
                    {emo.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {emo.spanish}
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  +1 vote & speak!
                </div>
              </button>
            );
          })}
        </div>

        {/* Customize the Negative Tag */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Cambiar la parte negativa ("I'm not..."):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {EMOTIONS_LIST.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  setSelectedNegative(e.id);
                  soundManager.playTick();
                }}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                  selectedNegative === e.id
                    ? 'bg-red-500 text-white border-red-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                not {e.label.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
