import React, { useState, useEffect } from 'react';
import { DesdobleId, GradeId } from '../../types.ts';
import { UNIT_2_DATA } from '../../data/unit2Data.ts';
import { speakEnglish, soundManager } from '../../utils/sound.ts';
import { Volume2, Play, Pause, RefreshCw, Sparkles } from 'lucide-react';

interface Step1HelloProps {
  activeDesdoble: DesdobleId;
}

export const Step1Hello: React.FC<Step1HelloProps> = ({ activeDesdoble }) => {
  const gradesInDesdoble: GradeId[] =
    activeDesdoble === 'desdoble1' ? ['grade2', 'grade3', 'grade4'] : ['grade5', 'grade6'];

  const [selectedGrade, setSelectedGrade] = useState<GradeId>(gradesInDesdoble[0]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1 = normal (3s), 0.7 = slow (4.5s), 1.5 = fast (2s)
  const [rolesSwapped, setRolesSwapped] = useState<boolean>(false);

  // Sync selectedGrade when desdoble changes
  useEffect(() => {
    if (!gradesInDesdoble.includes(selectedGrade)) {
      setSelectedGrade(gradesInDesdoble[0]);
      setCurrentLineIndex(0);
    }
  }, [activeDesdoble]);

  const gradeData = UNIT_2_DATA[selectedGrade];
  const dialogueLines = gradeData.dialogueLines;

  // Spacebar toggle auto play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
        soundManager.playTick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto advance bubbles
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAutoPlaying) {
      const delay = Math.round(3000 / speedMultiplier);
      timer = setTimeout(() => {
        setCurrentLineIndex((prev) => (prev + 1) % dialogueLines.length);
      }, delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAutoPlaying, currentLineIndex, speedMultiplier, dialogueLines.length]);

  const activeLine = dialogueLines[currentLineIndex];

  // When roles are swapped: teacher becomes students, students becomes teacher
  const effectiveSpeaker = rolesSwapped
    ? activeLine.speaker === 'teacher'
      ? 'students'
      : 'teacher'
    : activeLine.speaker;

  const handleSpeak = (text: string) => {
    soundManager.playTick();
    speakEnglish(text);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Grade selection tab, Speed slider, Switch roles, Play/Pause */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        {/* Grade tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Curso:
          </span>
          {gradesInDesdoble.map((gid) => {
            const data = UNIT_2_DATA[gid];
            const isSelected = selectedGrade === gid;
            return (
              <button
                key={gid}
                onClick={() => {
                  setSelectedGrade(gid);
                  setCurrentLineIndex(0);
                  soundManager.playTick();
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all min-h-[44px] flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{data.gradeLabel}</span>
                <span className="text-xs opacity-80 hidden md:inline">({data.unitTitle})</span>
              </button>
            );
          })}
        </div>

        {/* Controls: Speed, Switch Roles, Pause/Play */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Switch Roles Button */}
          <button
            onClick={() => {
              setRolesSwapped(!rolesSwapped);
              soundManager.playTick();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] flex items-center gap-1.5 border ${
              rolesSwapped
                ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-purple-50'
            }`}
            title="Cambiar papeles: los alumnos hacen de profe y la profe de alumnos"
          >
            <RefreshCw className={`w-4 h-4 ${rolesSwapped ? 'animate-spin' : ''}`} />
            <span>{rolesSwapped ? 'Roles invertidos!' : 'Cambiar papeles'}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 mr-1.5 hidden sm:inline">Velocidad:</span>
            {[
              { label: '0.8x', val: 0.75 },
              { label: '1x', val: 1 },
              { label: '1.5x', val: 1.5 },
            ].map((spd) => (
              <button
                key={spd.label}
                onClick={() => setSpeedMultiplier(spd.val)}
                className={`px-2 py-1 rounded-md font-bold transition-colors ${
                  speedMultiplier === spd.val
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          {/* Play/Pause Auto Advance */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 min-h-[44px] flex items-center gap-1.5 text-xs font-bold"
            title="Pausar o reanudar avance automático (Barra espaciadora)"
          >
            {isAutoPlaying ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
            <span className="hidden sm:inline">{isAutoPlaying ? 'Pausar' : 'Reanudar'}</span>
            <kbd className="hidden lg:inline text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">
              Espacio
            </kbd>
          </button>
        </div>
      </div>

      {/* Main Dialogue Stage for Digital Whiteboard */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-slate-800/40 rounded-3xl p-6 sm:p-10 shadow-md border border-amber-100 dark:border-slate-700 relative overflow-hidden min-h-[380px] flex flex-col justify-between">
        {/* Banner with grade theme */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Morning Greeting Dialogue · {gradeData.gradeLabel}
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
            Unit 2: {gradeData.unitTitle}
          </span>
        </div>

        {/* Central Speech Bubble Card */}
        <div className="my-auto py-4">
          <div
            key={currentLineIndex}
            className={`animate-pop-in p-6 sm:p-8 rounded-3xl shadow-lg border-2 max-w-3xl mx-auto transition-all ${
              effectiveSpeaker === 'teacher'
                ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/80 text-blue-950 dark:text-blue-100'
                : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 text-emerald-950 dark:text-emerald-100'
            }`}
          >
            {/* Speaker Header with role icon */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">
                  {effectiveSpeaker === 'teacher' ? '👩‍🏫' : '👧🧒'}
                </span>
                <div>
                  <div className="text-base sm:text-lg font-bold font-heading tracking-wide flex items-center gap-2">
                    {effectiveSpeaker === 'teacher' ? 'Teacher' : 'Students / Class'}
                    {rolesSwapped && (
                      <span className="text-xs bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded font-normal">
                        (Papel cambiado!)
                      </span>
                    )}
                  </div>
                  <span className="text-xs opacity-75">
                    {effectiveSpeaker === 'teacher' ? 'La maestra o alumno voluntario' : 'Toda la clase en coro'}
                  </span>
                </div>
              </div>

              {/* Pronounce Button */}
              <button
                onClick={() => handleSpeak(activeLine.textEn)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all text-amber-600 dark:text-amber-400 flex items-center gap-1.5 min-h-[48px] min-w-[48px] justify-center"
                title="Escuchar pronunciación (en-GB)"
                aria-label="Listen with British pronunciation"
              >
                <Volume2 className="w-6 h-6" />
                <span className="text-xs font-bold hidden sm:inline">Listen</span>
              </button>
            </div>

            {/* Target English Sentence (High contrast, Large font for whiteboard) */}
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading tracking-wide leading-relaxed text-slate-900 dark:text-white mb-3">
              "{activeLine.textEn}"
            </p>

            {/* Subtle Spanish translation for scaffolding / CRA pupils */}
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 italic">
              {activeLine.textEs}
            </p>
          </div>
        </div>

        {/* Bubble Step Selector / Indicators */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Progreso del diálogo:</span>
          <div className="flex items-center gap-2">
            {dialogueLines.map((line, idx) => (
              <button
                key={line.id}
                onClick={() => {
                  setCurrentLineIndex(idx);
                  soundManager.playTick();
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all min-h-[36px] ${
                  currentLineIndex === idx
                    ? 'bg-amber-500 text-white shadow-md scale-110 ring-2 ring-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
