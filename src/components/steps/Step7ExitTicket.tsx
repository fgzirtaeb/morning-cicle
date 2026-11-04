import React, { useState } from 'react';
import { DesdobleId, GradeId, DesdobleState } from '../../types.ts';
import { UNIT_2_DATA, BADGES_CONFIG } from '../../data/unit2Data.ts';
import { soundManager, speakEnglish } from '../../utils/sound.ts';
import {
  Volume2,
  Ticket,
  Trophy,
  Award,
  Flame,
  Sparkles,
  CheckCircle2,
  Gift,
} from 'lucide-react';

interface Step7ExitTicketProps {
  activeDesdoble: DesdobleId;
  desdobleState: DesdobleState;
  onUpdateState: (newState: DesdobleState) => void;
}

export const Step7ExitTicket: React.FC<Step7ExitTicketProps> = ({
  activeDesdoble,
  desdobleState,
  onUpdateState,
}) => {
  const gradesInDesdoble: GradeId[] =
    activeDesdoble === 'desdoble1' ? ['grade2', 'grade3', 'grade4'] : ['grade5', 'grade6'];

  const [selectedGrade, setSelectedGrade] = useState<GradeId>(gradesInDesdoble[0]);
  const [punchedCount, setPunchedCount] = useState<number>(0);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [sessionClosed, setSessionClosed] = useState<boolean>(false);

  const gradeData = UNIT_2_DATA[selectedGrade];
  const exitPrompts = gradeData.exitTicketPrompts;

  const handlePunchTicket = (promptText: string) => {
    setSelectedPrompt(promptText);
    setPunchedCount((prev) => prev + 1);
    soundManager.playCorrect();
    speakEnglish(promptText);
  };

  const handleCloseSession = () => {
    soundManager.playFanfare();
    setSessionClosed(true);

    // Increment streak
    const nextStreak = desdobleState.streak + 1;
    const bonusUnlocked = nextStreak >= 3;

    // Grant badges: unlock super-speaker, team-player, grammar-detective
    const updatedBadges = {
      ...desdobleState.badges,
      'super-speaker': true,
      'team-player': true,
      'grammar-detective': true,
      ...(desdobleState.starJar >= 10 ? { 'star-champion': true } : {}),
    };

    onUpdateState({
      ...desdobleState,
      streak: nextStreak,
      bonusGameUnlocked: bonusUnlocked,
      badges: updatedBadges,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Exit Ticket Checkout */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎟️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading">
                Exit Ticket & Daily Reward · Final Checkout
              </h2>
              <p className="text-xs text-purple-100">
                Cada alumno/a dice una frase en inglés de la Unidad 2 para validar su billete de salida.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-amber-300" />
              <span>{punchedCount} Billetes validados</span>
            </div>
          </div>
        </div>

        {selectedPrompt && (
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-white/20 animate-pop-in">
            <p className="text-xl sm:text-2xl font-extrabold font-heading text-center text-amber-200">
              "{selectedPrompt}"
            </p>
          </div>
        )}
      </div>

      {/* Main Exit Ticket Stage */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>Choose your Exit Phrase / Elige tu frase para salir:</span>
            </h3>
            <p className="text-xs text-slate-400">
              Toca una tarjeta, repítela en voz alta ante la clase y valida tu pase.
            </p>
          </div>

          {/* Grade selection tabs */}
          <div className="flex items-center gap-2">
            {gradesInDesdoble.map((gid) => {
              const gInfo = UNIT_2_DATA[gid];
              const isSelected = selectedGrade === gid;
              return (
                <button
                  key={gid}
                  onClick={() => {
                    setSelectedGrade(gid);
                    soundManager.playTick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors min-h-[40px] ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {gInfo.gradeLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exit Phrase Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {exitPrompts.map((prompt, idx) => {
            const isChosen = selectedPrompt === prompt;
            return (
              <button
                key={idx}
                onClick={() => handlePunchTicket(prompt)}
                className={`p-5 rounded-2xl border-2 text-left transition-all min-h-[72px] flex items-center justify-between shadow-xs active:scale-98 ${
                  isChosen
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 scale-102 ring-2 ring-purple-300'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 hover:border-purple-300 text-slate-800 dark:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎫</span>
                  <span className="text-base font-bold font-heading">{prompt}</span>
                </div>
                <Volume2 className="w-5 h-5 text-purple-500 shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Session Closure & Classroom Daily Reward */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-850 dark:to-slate-800 p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-900/60 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-xl font-bold font-heading text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Gift className="w-6 h-6 text-amber-600" />
                <span>Classroom Daily Reward & Streak</span>
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Puntos acumulados hoy en el tarro: {desdobleState.starJar} ⭐ · Racha activa: {desdobleState.streak} sesiones
              </p>
            </div>

            {!sessionClosed ? (
              <button
                onClick={handleCloseSession}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base shadow-lg active:scale-95 transition-all min-h-[50px] flex items-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                <span>Cerrar sesión y dar recompensa</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-300 dark:border-emerald-700 animate-pop-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>¡Sesión cerrada con éxito! Racha: {desdobleState.streak}d 🔥</span>
              </div>
            )}
          </div>

          {sessionClosed && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/80 my-2 animate-pop-in text-center">
              <span className="text-3xl block mb-1">🎉 🎶 🌟</span>
              <p className="text-base sm:text-lg font-extrabold font-heading text-slate-900 dark:text-white">
                "Well done, explorers! Recompensa del día pactada con la maestra concedida."
              </p>
              <p className="text-xs text-slate-500 mt-1">
                La clase puede cantar la canción de la unidad, ver el sticker digital o realizar un juego corto en grupo.
              </p>
            </div>
          )}

          {/* Badges Earned Section */}
          <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Insignias de la Asamblea (C.R.A. Jimena Muñiz):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {BADGES_CONFIG.map((b) => {
                const isUnlocked = desdobleState.badges[b.id];
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isUnlocked
                        ? 'border-amber-400 bg-white dark:bg-slate-900 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 opacity-40 bg-slate-100 dark:bg-slate-850'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{b.icon}</span>
                    <span className="text-xs font-bold font-heading block text-slate-900 dark:text-white">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {b.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
