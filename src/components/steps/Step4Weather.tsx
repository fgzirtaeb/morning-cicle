import React, { useState, useEffect } from 'react';
import { DesdobleId, WeatherDataDocument } from '../../types.ts';
import { soundManager, speakEnglish } from '../../utils/sound.ts';
import { Volume2, ExternalLink, Plus, Minus, CloudSun } from 'lucide-react';

interface Step4WeatherProps {
  activeDesdoble: DesdobleId;
  weatherDoc: WeatherDataDocument;
  onUpdateWeatherDoc: (doc: WeatherDataDocument) => void;
}

const WEATHER_ITEMS = [
  { id: 'sunny', label: 'Sunny', emoji: '☀️', spanish: 'Soleado' },
  { id: 'cloudy', label: 'Cloudy', emoji: '☁️', spanish: 'Nublado' },
  { id: 'raining', label: 'Raining', emoji: '🌧️', spanish: 'Lloviendo' },
  { id: 'snowing', label: 'Snowing', emoji: '🌨️', spanish: 'Nevando' },
  { id: 'windy', label: 'Windy', emoji: '💨', spanish: 'Ventoso' },
  { id: 'cold', label: 'Cold', emoji: '❄️', spanish: 'Frío' },
  { id: 'hot', label: 'Hot', emoji: '🔥', spanish: 'Caluroso' },
];

const NUMBER_WORDS: Record<number, string> = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
  16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
  21: 'twenty-one', 22: 'twenty-two', 23: 'twenty-three', 24: 'twenty-four', 25: 'twenty-five',
};

function numberToWords(num: number): string {
  if (num < 0) return `minus ${NUMBER_WORDS[-num] || Math.abs(num)}`;
  return NUMBER_WORDS[num] || `${num}`;
}

export const Step4Weather: React.FC<Step4WeatherProps> = ({
  activeDesdoble,
  weatherDoc,
  onUpdateWeatherDoc,
}) => {
  // Determine temperature for the latest passed hour
  const currentHour = new Date().getHours();
  const availableHours = Object.keys(weatherDoc.hours)
    .map(Number)
    .sort((a, b) => a - b);

  // Find last passed hour <= currentHour
  let targetHour = availableHours.filter((h) => h <= currentHour).pop();
  if (targetHour === undefined) {
    // If before morning or fallback, use first available or default 9
    targetHour = availableHours[0] ?? 9;
  }

  const currentHourKey = String(targetHour);
  const currentTemp = weatherDoc.hours[currentHourKey] ?? 10;

  // Selected weather condition tags (can select multiple as requested)
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['cold', 'sunny']);

  const toggleCondition = (id: string) => {
    soundManager.playTick();
    if (selectedConditions.includes(id)) {
      if (selectedConditions.length > 1) {
        setSelectedConditions(selectedConditions.filter((c) => c !== id));
      }
    } else {
      setSelectedConditions([...selectedConditions, id]);
    }
  };

  const handleAdjustTemp = (delta: number) => {
    soundManager.playTick();
    const newTemp = currentTemp + delta;
    const updatedHours = {
      ...weatherDoc.hours,
      [currentHourKey]: newTemp,
    };
    onUpdateWeatherDoc({
      ...weatherDoc,
      hours: updatedHours,
      fetched: new Date().toISOString(),
    });
  };

  // Temperature sensation qualitative descriptor
  const getTempDescriptor = (temp: number) => {
    if (temp <= 4) return 'very cold';
    if (temp <= 11) return 'cold';
    if (temp <= 17) return 'cool';
    if (temp <= 24) return 'warm';
    return 'hot';
  };

  const tempDesc = getTempDescriptor(currentTemp);

  // Model sentence tailored by Desdoble as required in prompt:
  // Desdoble 1: "It's cold." (or "It's sunny and cold.")
  // Desdoble 2: "It's twelve degrees. It's cool."
  const conditionWords = selectedConditions.join(' and ');
  const tempWord = numberToWords(currentTemp);

  const modelSentence =
    activeDesdoble === 'desdoble1'
      ? `It's ${selectedConditions.includes('cold') ? 'cold' : conditionWords}.`
      : `It's ${tempWord} degrees. It's ${tempDesc}.`;

  return (
    <div className="space-y-6">
      {/* Top Banner with Model Sentence by Desdoble */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⛅</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading">
                Weather in Corullón · {activeDesdoble === 'desdoble1' ? 'Desdoble 1 (2º-3º-4º)' : 'Desdoble 2 (5º-6º)'}
              </h2>
              <p className="text-xs text-sky-100">
                {activeDesdoble === 'desdoble1'
                  ? 'Modelo simplificado con adjetivos: "It\'s cold. It isn\'t sunny."'
                  : 'Modelo avanzado con grados: "It\'s twelve degrees. It\'s cool."'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playTick();
              speakEnglish(modelSentence);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-sky-900 font-bold shadow-md hover:scale-105 active:scale-95 transition-all min-h-[48px]"
            title="Escuchar modelo de tiempo atmosférico"
          >
            <Volume2 className="w-5 h-5 text-sky-600" />
            <span className="text-sm">Listen Weather</span>
          </button>
        </div>

        <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-6 border border-white/20">
          <p className="text-2xl sm:text-4xl font-extrabold font-heading text-center tracking-wide">
            "{modelSentence}"
          </p>
        </div>
      </div>

      {/* Corullón Live Temperature Banner & AEMET Link */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/70 flex items-center justify-center text-sky-600 dark:text-sky-300">
              <CloudSun className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Corullón, El Bierzo (León)
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                  Hora {targetHour}:00h
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Documento compartido: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">weather/corullon</code> ({weatherDoc.source})
              </p>
            </div>
          </div>

          {/* Interactive Temperature Control (- / + buttons) */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleAdjustTemp(-1)}
              className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-lg flex items-center justify-center shadow-xs hover:bg-slate-100 active:scale-95 border border-slate-200 dark:border-slate-600"
              title="Bajar 1°C"
              aria-label="Decrease temperature"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="px-3 text-center">
              <span className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                {currentTemp}°C
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                {tempWord} degrees
              </span>
            </div>

            <button
              onClick={() => handleAdjustTemp(1)}
              className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-lg flex items-center justify-center shadow-xs hover:bg-slate-100 active:scale-95 border border-slate-200 dark:border-slate-600"
              title="Subir 1°C"
              aria-label="Increase temperature"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* AEMET external link */}
            <a
              href="https://www.aemet.es/es/eltiempo/prediccion/municipios/corullon-id24059"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline px-2 py-1 font-semibold"
              title="Ver predicción oficial de AEMET para Corullón"
            >
              <span>AEMET</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Weather Conditions Grid (Multiple selection allowed) */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Weather Conditions / Condiciones del tiempo (marca varias):
            </h4>
            <span className="text-xs text-slate-400">
              {selectedConditions.length} seleccionada(s)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {WEATHER_ITEMS.map((item) => {
              const isSelected = selectedConditions.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleCondition(item.id)}
                  className={`p-3 sm:p-4 rounded-2xl border-2 transition-all min-h-[90px] flex flex-col items-center justify-center text-center shadow-xs active:scale-95 ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 shadow-sm scale-102 ring-2 ring-sky-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-slate-300'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl mb-1">{item.emoji}</span>
                  <span className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.spanish}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
