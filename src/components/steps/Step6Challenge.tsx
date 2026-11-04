import React, { useState, useEffect } from 'react';
import {
  DesdobleId,
  GradeId,
  DesdobleState,
  DUALevel,
  FlashCardItem,
  WhereIsItItem,
  RiddleItem,
  FamousPersonItem,
  QuickCheckItem,
} from '../../types.ts';
import { UNIT_2_DATA } from '../../data/unit2Data.ts';
import { soundManager, speakEnglish } from '../../utils/sound.ts';
import {
  Volume2,
  Sparkles,
  Trophy,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  HelpCircle,
  Dices,
  Eye,
  Timer,
  Compass,
  Flame,
  Award,
  Undo2,
} from 'lucide-react';

interface Step6ChallengeProps {
  activeDesdoble: DesdobleId;
  desdobleState: DesdobleState;
  onUpdateState: (newState: DesdobleState) => void;
}

type MinigameMode =
  | 'flash-and-say'
  | 'memory-flash'
  | 'where-is-it'
  | 'weather-forecaster'
  | 'riddle-box'
  | 'who-am-i'
  | 'quick-check'
  | 'mystery-wheel'
  | 'bonus-game';

export const Step6Challenge: React.FC<Step6ChallengeProps> = ({
  activeDesdoble,
  desdobleState,
  onUpdateState,
}) => {
  const gradesInDesdoble: GradeId[] =
    activeDesdoble === 'desdoble1' ? ['grade2', 'grade3', 'grade4'] : ['grade5', 'grade6'];

  const [selectedGrade, setSelectedGrade] = useState<GradeId>(gradesInDesdoble[0]);
  const [activeMinigame, setActiveMinigame] = useState<MinigameMode>('flash-and-say');
  const [selectedDUALevel, setSelectedDUALevel] = useState<DUALevel>(2);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'try-again'>('idle');

  // Flash & Say state
  const [flashIndex, setFlashIndex] = useState<number>(0);
  const [flashRevealed, setFlashRevealed] = useState<boolean>(false);

  // Memory Flash state
  const [memoryCountdown, setMemoryCountdown] = useState<number | null>(null);
  const [hiddenMemoryIndex, setHiddenMemoryIndex] = useState<number | null>(null);
  const [memoryRevealed, setMemoryRevealed] = useState<boolean>(false);

  // Where is it state
  const [whereIndex, setWhereIndex] = useState<number>(0);
  const [selectedWhereOption, setSelectedWhereOption] = useState<string | null>(null);

  // Weather Forecaster state
  const [forecasterStamp, setForecasterStamp] = useState<{ sky: string; temp: string; city: string }>({
    sky: 'raining and windy',
    temp: '9°C (cold)',
    city: 'Corullón',
  });

  // Riddle Box state
  const [riddleIndex, setRiddleIndex] = useState<number>(0);
  const [revealedCluesCount, setRevealedCluesCount] = useState<number>(1);
  const [riddleSolved, setRiddleSolved] = useState<boolean>(false);

  // Who Am I state
  const [famousIndex, setFamousIndex] = useState<number>(0);
  const [selectedPronunciation, setSelectedPronunciation] = useState<string | null>(null);
  const [famousSolved, setFamousSolved] = useState<boolean>(false);

  // Quick Check state
  const [quickIndex, setQuickIndex] = useState<number>(0);
  const [selectedQuickAnswer, setSelectedQuickAnswer] = useState<string | null>(null);

  // Mystery Wheel state
  const [isSpinningWheel, setIsSpinningWheel] = useState<boolean>(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  // Sync selectedGrade when desdoble changes
  useEffect(() => {
    if (!gradesInDesdoble.includes(selectedGrade)) {
      setSelectedGrade(gradesInDesdoble[0]);
    }
  }, [activeDesdoble]);

  const gradeData = UNIT_2_DATA[selectedGrade];
  const vocabList = gradeData.vocabulary;

  // Cooperative Star Jar handler
  const addStars = (count: number) => {
    soundManager.playStarSparkle();
    const newCount = Math.min(desdobleState.maxStars, desdobleState.starJar + count);
    const rewards = newCount >= desdobleState.maxStars ? desdobleState.rewardsUnlocked + 1 : desdobleState.rewardsUnlocked;
    
    // Unlock map tile for current grade if possible
    const currentTiles = [...(desdobleState.territories[selectedGrade] || [false, false, false, false, false, false])];
    const firstIncompleteIdx = currentTiles.findIndex((t) => !t);
    if (firstIncompleteIdx !== -1) {
      currentTiles[firstIncompleteIdx] = true;
    }

    onUpdateState({
      ...desdobleState,
      starJar: newCount >= desdobleState.maxStars ? 0 : newCount, // Resets or fills
      rewardsUnlocked: rewards,
      territories: {
        ...desdobleState.territories,
        [selectedGrade]: currentTiles,
      },
    });

    if (newCount >= desdobleState.maxStars) {
      soundManager.playFanfare();
    }
  };

  // Team score handlers with undo history
  const handleScoreChange = (teamId: string, delta: number) => {
    soundManager.playTick();
    const updatedTeams = desdobleState.teams.map((t) => {
      if (t.id === teamId) {
        return { ...t, points: Math.max(0, t.points + delta) };
      }
      return t;
    });

    const newHistory = [
      { teamId, delta, timestamp: Date.now() },
      ...desdobleState.scoreHistory.slice(0, 9),
    ];

    onUpdateState({
      ...desdobleState,
      teams: updatedTeams,
      scoreHistory: newHistory,
    });
  };

  const handleUndoScore = () => {
    if (desdobleState.scoreHistory.length === 0) return;
    soundManager.playTick();
    const lastAction = desdobleState.scoreHistory[0];
    const updatedTeams = desdobleState.teams.map((t) => {
      if (t.id === lastAction.teamId) {
        return { ...t, points: Math.max(0, t.points - lastAction.delta) };
      }
      return t;
    });

    onUpdateState({
      ...desdobleState,
      teams: updatedTeams,
      scoreHistory: desdobleState.scoreHistory.slice(1),
    });
  };

  // Trigger feedback
  const triggerSuccess = (starsReward: number = 1) => {
    soundManager.playCorrect();
    setFeedbackStatus('success');
    addStars(starsReward);
    setTimeout(() => setFeedbackStatus('idle'), 1500);
  };

  const triggerTryAgain = () => {
    soundManager.playTryAgain();
    setFeedbackStatus('try-again');
    setTimeout(() => setFeedbackStatus('idle'), 1200);
  };

  // Memory Flash 5s countdown
  const startMemoryFlash = () => {
    soundManager.playTick();
    setMemoryRevealed(false);
    setHiddenMemoryIndex(null);
    setMemoryCountdown(5);

    const interval = setInterval(() => {
      setMemoryCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Pick random item to hide
          const randomIdx = Math.floor(Math.random() * Math.min(6, vocabList.length));
          setHiddenMemoryIndex(randomIdx);
          soundManager.playTick();
          return null;
        }
        soundManager.playTick();
        return prev - 1;
      });
    }, 1000);
  };

  // Spin Mystery Wheel
  const spinMysteryWheel = () => {
    if (isSpinningWheel) return;
    setIsSpinningWheel(true);
    setWheelResult(null);

    const options = [
      '🌟 Star Booster: +2 Stars to Star Jar!',
      '🤝 Partner Assist: Call a classmate to help!',
      '⏭️ Pass Turn: Safe escape with applause!',
      '🎲 Mystery Minigame: Weather Forecaster challenge!',
      '🎙️ Super Pronunciation: Double points on next word!',
      '✨ Wildcard: All teams get +1 point!',
    ];

    let ticks = 0;
    const interval = setInterval(() => {
      soundManager.playTick();
      ticks++;
      if (ticks > 12) {
        clearInterval(interval);
        const picked = options[Math.floor(Math.random() * options.length)];
        setWheelResult(picked);
        setIsSpinningWheel(false);
        soundManager.playCorrect();
      }
    }, 120);
  };

  // Scaffolding stars calculator
  const currentDUAStars = selectedDUALevel === 1 ? 1 : selectedDUALevel === 2 ? 2 : 3;

  return (
    <div className="space-y-6">
      {/* Cooperative Star Jar Banner & Rotating Teams Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cooperative Star Jar */}
        <div className="lg:col-span-1 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍯</span>
              <div>
                <h3 className="text-lg font-bold font-heading">Cooperative Star Jar</h3>
                <p className="text-[11px] text-amber-100">Meta común: ¡Sin ranking individual!</p>
              </div>
            </div>
            <button
              onClick={() => addStars(1)}
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
              title="Añadir estrella manualmente"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1 Star</span>
            </button>
          </div>

          {/* Star visual meter */}
          <div className="my-2 bg-black/20 p-3 rounded-2xl border border-white/20">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span>Classroom Jar Progress</span>
              <span className="text-amber-200 text-sm">
                {desdobleState.starJar} / {desdobleState.maxStars} ⭐
              </span>
            </div>
            <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-amber-200 rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${Math.min(100, (desdobleState.starJar / desdobleState.maxStars) * 100)}%`,
                }}
              />
            </div>
            {desdobleState.rewardsUnlocked > 0 && (
              <div className="mt-2 text-[11px] font-semibold text-yellow-100 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                <span>¡{desdobleState.rewardsUnlocked} Recompensa(s) ganadas para la clase!</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-amber-100/90 italic">
            Al llenarse, la maestra otorga una recompensa pactada (canción, juego o sticker).
          </p>
        </div>

        {/* Rotating Teams Scoreboard */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-md border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Rotating Teams Scoreboard / Marcador de Equipos
                </h3>
                <p className="text-[11px] text-slate-400">Puntajes rotatorios para el juego en el aula</p>
              </div>
            </div>

            {desdobleState.scoreHistory.length > 0 && (
              <button
                onClick={handleUndoScore}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 min-h-[36px]"
                title="Deshacer último cambio de puntos"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Deshacer</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {desdobleState.teams.map((team) => (
              <div
                key={team.id}
                className="p-3 rounded-2xl border-2 bg-slate-50 dark:bg-slate-850 flex flex-col justify-between"
                style={{ borderColor: team.color }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-extrabold truncate font-heading" style={{ color: team.color }}>
                    {team.name}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {team.points}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    onClick={() => handleScoreChange(team.id, -1)}
                    className="flex-1 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-100 active:scale-95 min-h-[36px] flex items-center justify-center"
                    title="-1 punto"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleScoreChange(team.id, 1)}
                    className="flex-1 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs active:scale-95 min-h-[36px] flex items-center justify-center"
                    style={{ backgroundColor: team.color }}
                    title="+1 punto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade Selector & Territory Progress Map (Explorers' Club) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Explorers' Club · {gradeData.themeTerritory}
              </h3>
              <p className="text-xs text-slate-400">
                Curso: {gradeData.gradeLabel} · Desbloquea las 6 casillas del territorio
              </p>
            </div>
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
                    setFlashIndex(0);
                    setFlashRevealed(false);
                    soundManager.playTick();
                  }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all min-h-[44px] ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {gInfo.gradeLabel} ({gInfo.themeTerritory})
                </button>
              );
            })}
          </div>
        </div>

        {/* 6-Tile Progress Map */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[1, 2, 3, 4, 5, 6].map((tileNum, idx) => {
            const isUnlocked = desdobleState.territories[selectedGrade]?.[idx] || false;
            return (
              <div
                key={tileNum}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  isUnlocked
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850/50 text-slate-400'
                }`}
              >
                <div className="text-xl mb-1">
                  {isUnlocked ? '🚩' : '🔒'}
                </div>
                <div className="text-xs font-bold font-heading">
                  Tile {tileNum}
                </div>
                <div className="text-[10px] opacity-80 truncate">
                  {isUnlocked ? 'Explorado' : 'Bloqueado'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DUA 3-Level Scaffolding Selector & Minigames Selector */}
      <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 border border-slate-200 dark:border-slate-700">
        {/* DUA Scaffolding Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            Andamiaje DUA:
          </span>
          {[
            { level: 1 as DUALevel, label: 'Nivel 1: Apoyo visual (+1 ⭐)', icon: '👁️' },
            { level: 2 as DUALevel, label: 'Nivel 2: Huecos / Modelo (+2 ⭐)', icon: '✏️' },
            { level: 3 as DUALevel, label: 'Nivel 3: Producción libre (+3 ⭐)', icon: '🗣️' },
          ].map((dua) => (
            <button
              key={dua.level}
              onClick={() => {
                setSelectedDUALevel(dua.level);
                soundManager.playTick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all min-h-[40px] flex items-center gap-1.5 ${
                selectedDUALevel === dua.level
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-102'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{dua.icon}</span>
              <span>{dua.label}</span>
            </button>
          ))}
        </div>

        {/* Minigames Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'flash-and-say' as MinigameMode, label: 'Flash & Say', icon: '⚡' },
            { id: 'memory-flash' as MinigameMode, label: 'Memory Flash', icon: '🧠' },
            ...(selectedGrade === 'grade2' || selectedGrade === 'grade3'
              ? [{ id: 'where-is-it' as MinigameMode, label: 'Where is it?', icon: '📍' }]
              : []),
            ...(selectedGrade === 'grade4'
              ? [{ id: 'weather-forecaster' as MinigameMode, label: 'Forecaster TV', icon: '📺' }]
              : []),
            ...(selectedGrade === 'grade5'
              ? [{ id: 'riddle-box' as MinigameMode, label: 'Riddle Box', icon: '📦' }]
              : []),
            ...(selectedGrade === 'grade6'
              ? [{ id: 'who-am-i' as MinigameMode, label: 'Who Am I?', icon: '🏛️' }]
              : []),
            { id: 'quick-check' as MinigameMode, label: 'True/False', icon: '❓' },
            { id: 'mystery-wheel' as MinigameMode, label: 'Ruleta / Mystery', icon: '🎡' },
          ].map((game) => (
            <button
              key={game.id}
              onClick={() => {
                setActiveMinigame(game.id);
                soundManager.playTick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors min-h-[40px] flex items-center gap-1 ${
                activeMinigame === game.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-black dark:border-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{game.icon}</span>
              <span>{game.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Minigame Interactive Stage */}
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-lg border-2 min-h-[380px] flex flex-col justify-between transition-all ${
          feedbackStatus === 'success'
            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 animate-bounce-short'
            : feedbackStatus === 'try-again'
            ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 animate-shake-gentle'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* ========================================================= */}
        {/* MINIGAME 1: FLASH & SAY */}
        {/* ========================================================= */}
        {activeMinigame === 'flash-and-say' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Flash & Say · {gradeData.gradeLabel} ({vocabList[flashIndex]?.category})
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Card {flashIndex + 1} of {vocabList.length}
              </span>
            </div>

            {/* Flash Card Stage */}
            <div className="max-w-xl mx-auto text-center py-4">
              <div className="text-6xl sm:text-8xl mb-4 animate-pop-in select-none">
                {vocabList[flashIndex]?.emoji}
              </div>

              {/* DUA Scaffold Hint based on selected level */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 rounded-2xl mb-4 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                <strong className="block font-bold mb-1">
                  Pista de apoyo (DUA Nivel {selectedDUALevel}):
                </strong>
                {selectedDUALevel === 1 && vocabList[flashIndex]?.scaffoldLevel1}
                {selectedDUALevel === 2 && (
                  <span className="font-mono text-base tracking-wider font-bold">
                    {vocabList[flashIndex]?.scaffoldLevel2}
                  </span>
                )}
                {selectedDUALevel === 3 && vocabList[flashIndex]?.scaffoldLevel3}
              </div>

              {/* Revealed Answer or Mystery Box */}
              {flashRevealed ? (
                <div className="animate-pop-in space-y-2">
                  <div className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
                    {vocabList[flashIndex]?.term}
                  </div>
                  <div className="text-base sm:text-lg text-slate-600 dark:text-slate-300 italic font-heading">
                    "{vocabList[flashIndex]?.sentence}"
                  </div>
                  <button
                    onClick={() => {
                      speakEnglish(vocabList[flashIndex]?.sentence);
                      soundManager.playTick();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-xs mt-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen English</span>
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <button
                    onClick={() => {
                      setFlashRevealed(true);
                      soundManager.playTick();
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base shadow-md active:scale-95 transition-all min-h-[48px]"
                  >
                    👀 Reveal Answer / Comprobar
                  </button>
                </div>
              )}
            </div>

            {/* Teacher action feedback buttons & next card */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerSuccess(currentDUAStars)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct! (+{currentDUAStars} ⭐)</span>
                </button>
                <button
                  onClick={triggerTryAgain}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 active:scale-95 min-h-[44px]"
                >
                  Try Again
                </button>
              </div>

              <button
                onClick={() => {
                  setFlashIndex((prev) => (prev + 1) % vocabList.length);
                  setFlashRevealed(false);
                  soundManager.playTick();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs sm:text-sm active:scale-95 min-h-[44px]"
              >
                Next Word ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MINIGAME 2: MEMORY FLASH (What's Missing?) */}
        {/* ========================================================= */}
        {activeMinigame === 'memory-flash' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <div>
                  <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    Memory Flash: What's Missing?
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mira todos los elementos durante 5 segundos. ¡Uno desaparecerá!
                  </p>
                </div>
              </div>

              <button
                onClick={startMemoryFlash}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 min-h-[44px]"
              >
                <Timer className="w-4 h-4" />
                <span>Start 5s Countdown</span>
              </button>
            </div>

            {memoryCountdown !== null ? (
              <div className="py-12 text-center animate-pop-in">
                <span className="text-7xl sm:text-9xl font-black font-heading text-amber-500">
                  {memoryCountdown}
                </span>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-3">
                  Memorise all the cards!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 my-4">
                {vocabList.slice(0, 6).map((item, idx) => {
                  const isHidden = hiddenMemoryIndex === idx && !memoryRevealed;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border-2 text-center min-h-[140px] flex flex-col items-center justify-center transition-all ${
                        isHidden
                          ? 'border-dashed border-amber-400 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850'
                      }`}
                    >
                      {isHidden ? (
                        <div className="animate-pop-in">
                          <span className="text-5xl">❓</span>
                          <span className="block text-xs font-black font-heading text-amber-600 mt-1">
                            What's missing?
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl sm:text-5xl mb-2 block">{item.emoji}</span>
                          <span className="text-xs sm:text-sm font-bold font-heading text-slate-800 dark:text-white">
                            {item.term}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {hiddenMemoryIndex !== null && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 flex-wrap gap-2">
                <button
                  onClick={() => {
                    setMemoryRevealed(true);
                    soundManager.playCorrect();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs sm:text-sm min-h-[44px]"
                >
                  👀 Reveal Missing Item ({vocabList[hiddenMemoryIndex]?.term})
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerSuccess(currentDUAStars)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm min-h-[44px]"
                  >
                    Correct! (+{currentDUAStars} ⭐)
                  </button>
                  <button
                    onClick={startMemoryFlash}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs min-h-[44px]"
                  >
                    Play Again ↻
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MINIGAME 3: WHERE IS IT? (2º & 3º Prepositions) */}
        {/* ========================================================= */}
        {activeMinigame === 'where-is-it' && gradeData.whereIsItItems && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Where is it? · Prepositions (on, under, in, behind)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Item {whereIndex + 1} of {gradeData.whereIsItItems.length}
              </span>
            </div>

            {(() => {
              const item = gradeData.whereIsItItems[whereIndex];
              return (
                <div className="space-y-4">
                  {/* Visual Scene Card */}
                  <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 text-center max-w-lg mx-auto">
                    <div className="flex justify-center items-center gap-4 text-5xl sm:text-6xl my-2">
                      <span>{item.subjectEmoji}</span>
                      <span className="text-2xl text-slate-400 font-heading">
                        [ {item.preposition} ]
                      </span>
                      <span>{item.locationEmoji}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Preposition target: <strong>{item.preposition.toUpperCase()}</strong>
                    </p>
                  </div>

                  {/* 4 Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {item.options.map((opt) => {
                      const isSelected = selectedWhereOption === opt;
                      const isCorrect = opt === item.correctSentence;

                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setSelectedWhereOption(opt);
                            if (isCorrect) {
                              triggerSuccess(currentDUAStars);
                            } else {
                              triggerTryAgain();
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 text-left font-bold text-sm sm:text-base transition-all min-h-[56px] ${
                            isSelected
                              ? isCorrect
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 scale-102 ring-2 ring-emerald-300'
                                : 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-900'
                              : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 bg-white dark:bg-slate-800 text-slate-800 dark:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => {
                        setWhereIndex((prev) => (prev + 1) % gradeData.whereIsItItems!.length);
                        setSelectedWhereOption(null);
                        soundManager.playTick();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs sm:text-sm min-h-[44px]"
                    >
                      Next Scene ➔
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================= */}
        {/* MINIGAME 4: WEATHER FORECASTER (4º) */}
        {/* ========================================================= */}
        {activeMinigame === 'weather-forecaster' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📺</span>
                <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Weather Forecaster TV Studio (4º)
                </h4>
              </div>
              <button
                onClick={() => {
                  const skies = ['sunny and hot', 'cold and cloudy', 'raining and windy', 'snowing and cold'];
                  const temps = ['18°C (warm)', '7°C (cold)', '1°C (very cold)', '24°C (hot)'];
                  const cities = ['Corullón', 'Ponferrada', 'León', 'Villafranca del Bierzo'];
                  setForecasterStamp({
                    sky: skies[Math.floor(Math.random() * skies.length)],
                    temp: temps[Math.floor(Math.random() * temps.length)],
                    city: cities[Math.floor(Math.random() * cities.length)],
                  });
                  soundManager.playTick();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs min-h-[40px] flex items-center gap-1"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Randomize Forecast</span>
              </button>
            </div>

            {/* TV Screen Mockup */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border-4 border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-sky-400 font-mono mb-4 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span>LIVE ON AIR · TV CORULLÓN WEATHER</span>
                </span>
                <span>LOCATION: {forecasterStamp.city.toUpperCase()}</span>
              </div>

              {/* Forecaster Teleprompter Script */}
              <div className="text-center py-4 space-y-4">
                <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">
                  Teleprompter for the pupil forecaster:
                </p>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-amber-300 leading-snug">
                  "Good morning! In {forecasterStamp.city} today, it is {forecasterStamp.sky}. The temperature is {forecasterStamp.temp}!"
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() =>
                    speakEnglish(
                      `Good morning! In ${forecasterStamp.city} today, it is ${forecasterStamp.sky}. The temperature is ${forecasterStamp.temp}!`
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <span>Listen Teleprompter Audio</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                onClick={() => triggerSuccess(currentDUAStars)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm min-h-[44px]"
              >
                Award Forecaster (+{currentDUAStars} ⭐)
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MINIGAME 5: RIDDLE BOX (5º Animals everywhere) */}
        {/* ========================================================= */}
        {activeMinigame === 'riddle-box' && gradeData.riddles && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <div>
                  <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    Riddle Box: Progressive Clues (5º)
                  </h4>
                  <p className="text-xs text-slate-400">
                    1 pista = 3 estrellas ⭐⭐⭐ · 2 pistas = 2 estrellas ⭐⭐ · 3 pistas = 1 estrella ⭐
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Riddle {riddleIndex + 1} of {gradeData.riddles.length}
              </span>
            </div>

            {(() => {
              const item = gradeData.riddles[riddleIndex];
              const starsForRiddle = revealedCluesCount === 1 ? 3 : revealedCluesCount === 2 ? 2 : 1;

              return (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="space-y-3">
                    {item.clues.slice(0, revealedCluesCount).map((clue, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-amber-100 text-base font-bold animate-pop-in"
                      >
                        {clue}
                      </div>
                    ))}
                  </div>

                  {revealedCluesCount < 3 && !riddleSolved && (
                    <button
                      onClick={() => {
                        setRevealedCluesCount((prev) => prev + 1);
                        soundManager.playTick();
                      }}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-50 min-h-[44px]"
                    >
                      + Reveal Next Clue (Baja a {revealedCluesCount === 1 ? '2' : '1'} ⭐)
                    </button>
                  )}

                  {/* Solved reveal */}
                  {riddleSolved ? (
                    <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-center animate-pop-in">
                      <span className="text-6xl block mb-2">{item.targetEmoji}</span>
                      <h5 className="text-3xl font-black font-heading text-emerald-800 dark:text-emerald-200">
                        It's a {item.target}!
                      </h5>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                        Grammar rule: "{item.grammarPattern}"
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => {
                          setRiddleSolved(true);
                          soundManager.playCorrect();
                        }}
                        className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm min-h-[48px]"
                      >
                        👀 Reveal Animal Answer
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button
                      onClick={() => triggerSuccess(starsForRiddle)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm min-h-[44px]"
                    >
                      Class Solved It! (+{starsForRiddle} ⭐)
                    </button>
                    <button
                      onClick={() => {
                        setRiddleIndex((prev) => (prev + 1) % gradeData.riddles!.length);
                        setRevealedCluesCount(1);
                        setRiddleSolved(false);
                        soundManager.playTick();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs sm:text-sm min-h-[44px]"
                    >
                      Next Riddle ➔
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================= */}
        {/* MINIGAME 6: WHO AM I? (6º Famous People & -ed Pronunciation) */}
        {/* ========================================================= */}
        {activeMinigame === 'who-am-i' && gradeData.famousPeople && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <div>
                  <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    Who Am I? & Regular Past -ed Pronunciation (6º)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Adivina el personaje histórico y clasifica la pronunciación de -ed (/t/, /d/, o /ɪd/)
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Person {famousIndex + 1} of {gradeData.famousPeople.length}
              </span>
            </div>

            {(() => {
              const person = gradeData.famousPeople[famousIndex];

              return (
                <div className="space-y-4 max-w-2xl mx-auto">
                  {/* Clues Card */}
                  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-5 rounded-3xl">
                    <div className="text-4xl text-center mb-2">{person.roleEmoji}</div>
                    <ul className="space-y-1.5 text-sm sm:text-base font-bold text-slate-800 dark:text-rose-100 list-disc list-inside">
                      {person.clues.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Target verb and Pronunciation Sorting (/t/, /d/, /ɪd/) */}
                  <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Target Regular Verb in -ed:
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold font-heading text-rose-600 dark:text-rose-400">
                      "{person.regularVerb}" (base: {person.verbBase})
                    </span>

                    <p className="text-xs font-semibold text-slate-500 mt-2 mb-3">
                      ¿Cómo suena el sufijo -ed al pronunciarlo?
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      {(['/t/', '/d/', '/ɪd/'] as const).map((soundBucket) => {
                        const isChosen = selectedPronunciation === soundBucket;
                        const isCorrect = soundBucket === person.edPronunciation;

                        return (
                          <button
                            key={soundBucket}
                            onClick={() => {
                              setSelectedPronunciation(soundBucket);
                              if (isCorrect) {
                                triggerSuccess(currentDUAStars);
                              } else {
                                triggerTryAgain();
                              }
                            }}
                            className={`p-3 rounded-xl border-2 font-black text-lg transition-all min-h-[50px] ${
                              isChosen
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                                  : 'border-red-400 bg-red-50 text-red-800'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-300'
                            }`}
                          >
                            {soundBucket}
                          </button>
                        );
                      })}
                    </div>

                    {selectedPronunciation === person.edPronunciation && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 animate-pop-in">
                        ✓ {person.pronunciationExplanation}
                      </p>
                    )}
                  </div>

                  {/* Full Identity reveal */}
                  {famousSolved ? (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 text-center animate-pop-in">
                      <span className="text-xl sm:text-2xl font-black font-heading text-amber-900 dark:text-amber-200">
                        {person.name} ({person.role})
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setFamousSolved(true);
                          soundManager.playCorrect();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm min-h-[44px]"
                      >
                        👀 Reveal Name of Person
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setFamousIndex((prev) => (prev + 1) % gradeData.famousPeople!.length);
                        setSelectedPronunciation(null);
                        setFamousSolved(false);
                        soundManager.playTick();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs sm:text-sm min-h-[44px]"
                    >
                      Next Person ➔
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================= */}
        {/* MINIGAME 7: QUICK CHECK (True/False / Odd one out / Fix) */}
        {/* ========================================================= */}
        {activeMinigame === 'quick-check' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">❓</span>
                <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Quick Check · True/False & Odd One Out ({gradeData.gradeLabel})
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Question {quickIndex + 1} of {gradeData.quickChecks.length}
              </span>
            </div>

            {(() => {
              const qc = gradeData.quickChecks[quickIndex];
              return (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">
                      {qc.type.toUpperCase().replace('-', ' ')}
                    </span>
                    <h5 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                      "{qc.question}"
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {qc.options?.map((opt) => {
                      const isSelected = selectedQuickAnswer === opt;
                      const isCorrect = opt === qc.correctAnswer;

                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setSelectedQuickAnswer(opt);
                            if (isCorrect) {
                              triggerSuccess(currentDUAStars);
                            } else {
                              triggerTryAgain();
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all min-h-[50px] ${
                            isSelected
                              ? isCorrect
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-300'
                                : 'border-red-400 bg-red-50 text-red-900'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300 text-slate-800 dark:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {selectedQuickAnswer === qc.correctAnswer && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-xs font-bold text-emerald-800 dark:text-emerald-200 text-center animate-pop-in">
                      ✓ {qc.explanation}
                    </div>
                  )}

                  <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setQuickIndex((prev) => (prev + 1) % gradeData.quickChecks.length);
                        setSelectedQuickAnswer(null);
                        soundManager.playTick();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs sm:text-sm min-h-[44px]"
                    >
                      Next Question ➔
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================= */}
        {/* MINIGAME 8: MYSTERY WHEEL / RULETA */}
        {/* ========================================================= */}
        {activeMinigame === 'mystery-wheel' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎡</span>
                <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Mystery Wheel · Ruleta de Comodines & Participación
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                Gira para elegir comodín o alumno al azar
              </span>
            </div>

            <div className="text-center py-6 max-w-lg mx-auto">
              <div
                className={`w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-full border-8 border-amber-500 bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-2xl flex items-center justify-center transition-transform ${
                  isSpinningWheel ? 'animate-spin' : ''
                }`}
              >
                <span className="text-6xl sm:text-7xl select-none">🎁</span>
              </div>

              <div className="mt-6">
                <button
                  onClick={spinMysteryWheel}
                  disabled={isSpinningWheel}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-base sm:text-lg shadow-lg hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all min-h-[52px]"
                >
                  {isSpinningWheel ? '¡Girando ruleta...!' : '🎯 Spin Wheel / Girar Ruleta'}
                </button>
              </div>

              {wheelResult && (
                <div className="mt-6 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 text-center animate-pop-in">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-1">
                    ¡Resultado de la Ruleta!
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white">
                    {wheelResult}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
