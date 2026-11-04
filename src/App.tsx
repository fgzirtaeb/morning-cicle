/**
 * Morning Circle · Unit 2
 * C.R.A. Jimena Muñiz - Corullón (León)
 * Primary English (LOMLOE, Decreto 38/2022 de Castilla y León)
 */

import React, { useState, useEffect } from 'react';
import {
  DesdobleId,
  StepNumber,
  DesdobleState,
  WeatherDataDocument,
} from './types.ts';
import {
  loadPreferences,
  savePreferences,
  loadDesdobleState,
  saveDesdobleState,
  resetDesdobleState,
  loadWeatherDocument,
  saveWeatherDocument,
} from './utils/storage.ts';
import { soundManager } from './utils/sound.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { Step1Hello } from './components/steps/Step1Hello.tsx';
import { Step2HowAreYou } from './components/steps/Step2HowAreYou.tsx';
import { Step3Date } from './components/steps/Step3Date.tsx';
import { Step4Weather } from './components/steps/Step4Weather.tsx';
import { Step5Time } from './components/steps/Step5Time.tsx';
import { Step6Challenge } from './components/steps/Step6Challenge.tsx';
import { Step7ExitTicket } from './components/steps/Step7ExitTicket.tsx';

const TEACHER_NOTES: Record<StepNumber, string> = {
  1: "Guía el diálogo en coro o por turnos. Pulsa 'Cambiar papeles' para que los alumnos adopten el rol de la maestra.",
  2: "Cada alumno/a se acerca a la pizarra digital, toca su emoción para sumar al contador y pronuncia el modelo afirmativo + negativo.",
  3: "Pregunta a la asamblea 'What day is it today?' antes de destapar las tarjetas misteriosas; luego compruébalo pulsando en ellas.",
  4: "Revisa la temperatura de Corullón registrada por AEMET y ajustadla con −/+ si la temperatura del aula o patio difiere.",
  5: "Repasad la hora en palabras (o'clock, half past, quarter past/to). Utilizad los botones ±5m para retar a la clase con nuevas horas.",
  6: "Núcleo gamificado: el alumnado suma estrellas al tarro común eligiendo su nivel DUA de andamiaje.",
  7: "Pase de salida: cada alumno dice una frase antes de finalizar. Cerrad la sesión para registrar la racha y dar la recompensa.",
};

export default function App() {
  const [preferences, setPreferences] = useState(() => loadPreferences());
  const [activeDesdoble, setActiveDesdoble] = useState<DesdobleId>(preferences.lastDesdoble);
  const [activeStep, setActiveStep] = useState<StepNumber>(1);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(preferences.isDarkMode);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(preferences.soundEnabled);

  // Desdoble state & weather document
  const [desdobleState, setDesdobleState] = useState<DesdobleState>(() =>
    loadDesdobleState(preferences.lastDesdoble)
  );
  const [weatherDoc, setWeatherDoc] = useState<WeatherDataDocument>(() => loadWeatherDocument());

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync sound manager enabled state
  useEffect(() => {
    soundManager.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Save preferences when they change
  useEffect(() => {
    savePreferences({
      lastDesdoble: activeDesdoble,
      speechRate: 0.9,
      soundEnabled,
      isDarkMode,
    });
  }, [activeDesdoble, soundEnabled, isDarkMode]);

  // Handle desdoble switch
  const handleSelectDesdoble = (newDesdoble: DesdobleId) => {
    if (newDesdoble === activeDesdoble) return;
    saveDesdobleState(activeDesdoble, desdobleState);
    const loaded = loadDesdobleState(newDesdoble);
    setActiveDesdoble(newDesdoble);
    setDesdobleState(loaded);
  };

  // State update handler
  const handleUpdateDesdobleState = (newState: DesdobleState) => {
    setDesdobleState(newState);
    saveDesdobleState(activeDesdoble, newState);
  };

  // Weather update handler
  const handleUpdateWeatherDoc = (newDoc: WeatherDataDocument) => {
    setWeatherDoc(newDoc);
    saveWeatherDocument(newDoc);
  };

  // Reset unit handler
  const handleResetUnit = () => {
    const fresh = resetDesdobleState(activeDesdoble);
    setDesdobleState(fresh);
    soundManager.playCorrect();
  };

  // Keyboard navigation: Left/Right arrows for steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' && activeStep < 7) {
        e.preventDefault();
        soundManager.playTick();
        setActiveStep((prev) => (prev + 1) as StepNumber);
      } else if (e.key === 'ArrowLeft' && activeStep > 1) {
        e.preventDefault();
        soundManager.playTick();
        setActiveStep((prev) => (prev - 1) as StepNumber);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-300 selection:text-slate-900 transition-colors">
      {/* Header with Title, Desdoble Switcher, Timer, and Step Bar */}
      <Header
        activeDesdoble={activeDesdoble}
        onSelectDesdoble={handleSelectDesdoble}
        activeStep={activeStep}
        onSelectStep={setActiveStep}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onResetUnit={handleResetUnit}
        starCount={desdobleState.starJar}
        maxStars={desdobleState.maxStars}
        streak={desdobleState.streak}
      />

      {/* Main Interactive Assembly Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeStep === 1 && (
          <Step1Hello activeDesdoble={activeDesdoble} />
        )}

        {activeStep === 2 && (
          <Step2HowAreYou
            emotionTally={desdobleState.emotionTally}
            onUpdateTally={(newTally) =>
              handleUpdateDesdobleState({
                ...desdobleState,
                emotionTally: newTally,
              })
            }
          />
        )}

        {activeStep === 3 && <Step3Date />}

        {activeStep === 4 && (
          <Step4Weather
            activeDesdoble={activeDesdoble}
            weatherDoc={weatherDoc}
            onUpdateWeatherDoc={handleUpdateWeatherDoc}
          />
        )}

        {activeStep === 5 && <Step5Time />}

        {activeStep === 6 && (
          <Step6Challenge
            activeDesdoble={activeDesdoble}
            desdobleState={desdobleState}
            onUpdateState={handleUpdateDesdobleState}
          />
        )}

        {activeStep === 7 && (
          <Step7ExitTicket
            activeDesdoble={activeDesdoble}
            desdobleState={desdobleState}
            onUpdateState={handleUpdateDesdobleState}
          />
        )}
      </main>

      {/* Footer with Previous/Next controls, shortcuts, and Teacher instructions */}
      <Footer
        activeStep={activeStep}
        onSelectStep={setActiveStep}
        teacherNote={TEACHER_NOTES[activeStep]}
      />
    </div>
  );
}
