import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import type { Transcript } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { ControlButton } from './components/ControlButton';
import { StatusIndicator } from './components/StatusIndicator';
import { AudioControls } from './components/AudioControls';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { EntryPage } from './components/EntryPage';
import { AudioInputSettings } from './components/AudioInputSettings';
import { VoiceSelector } from './components/VoiceSelector';

const App: React.FC = () => {
  const [isAppEntered, setIsAppEntered] = useState(false);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [theme, setTheme] = useState('dark');
  const [voice, setVoice] = useState<'female' | 'male'>('female');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [micVolume, setMicVolume] = useState(0);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const onTranscriptUpdate = useCallback((type: 'input' | 'output' | 'turnComplete', text?: string) => {
    if (type === 'input') {
      currentInputTranscriptionRef.current += text;
      setTranscripts(prev => {
        const last = prev[prev.length - 1];
        if (last?.speaker === 'user') {
          return [...prev.slice(0, -1), { speaker: 'user', text: currentInputTranscriptionRef.current }];
        }
        return [...prev, { speaker: 'user', text: currentInputTranscriptionRef.current }];
      });
    } else if (type === 'output') {
      currentOutputTranscriptionRef.current += text;
       setTranscripts(prev => {
        const last = prev[prev.length - 1];
        if (last?.speaker === 'model') {
          return [...prev.slice(0, -1), { speaker: 'model', text: currentOutputTranscriptionRef.current }];
        }
        return [...prev, { speaker: 'model', text: currentOutputTranscriptionRef.current }];
      });
    } else if (type === 'turnComplete') {
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';
    }
  }, []);

  const handleStatusChange = useCallback((newStatus: string, message?: string) => {
    setStatus(newStatus);
    if (newStatus === 'error') {
      setErrorMessage(message || 'An unexpected error occurred.');
    } else {
      setErrorMessage(null);
    }
  }, []);

  const { startSession, stopSession } = useGeminiLive({
    sourceLang,
    targetLang,
    onStatusChange: handleStatusChange,
    onTranscriptUpdate,
    isPlaying,
    volume,
    voice,
    noiseSuppression,
    echoCancellation,
    autoGainControl,
    onUserSpeakingChange: setIsUserSpeaking,
    onModelSpeakingChange: setIsModelSpeaking,
    onVolumeLevelChange: setMicVolume,
  });

  const handleToggleConversation = () => {
    if (isRecording) {
      stopSession();
      setIsRecording(false);
      setIsUserSpeaking(false);
      setIsModelSpeaking(false);
    } else {
      setTranscripts([]);
      currentInputTranscriptionRef.current = '';
      currentOutputTranscriptionRef.current = '';
      startSession();
      setIsRecording(true);
    }
  };

  const handleTogglePlayPause = () => setIsPlaying(prev => !prev);
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const handleEnterApp = () => {
    setIsAppEntered(true);
  };

  const handleLanguageSwap = () => {
    if (isRecording) return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
      <header className="w-full max-w-4xl mx-auto p-4 md:p-6 flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 dark:from-blue-400 dark:to-teal-300">
              Live Conversation Translator
            </h1>
        </div>
        <div className="flex-1 flex justify-end">
            <ThemeSwitcher theme={theme} onToggle={handleThemeToggle} />
        </div>
      </header>
      
      {isAppEntered ? (
        <>
            <main className="flex-grow flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
                <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-300">Configuration</h2>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                            <LanguageSelector
                                label="Language 1"
                                selectedLanguage={sourceLang}
                                onSelectLanguage={setSourceLang}
                                disabled={isRecording}
                            />
                            <button
                                onClick={handleLanguageSwap}
                                disabled={isRecording}
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mx-auto md:mt-5"
                                aria-label="Swap languages"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </button>
                            <LanguageSelector
                                label="Language 2"
                                selectedLanguage={targetLang}
                                onSelectLanguage={setTargetLang}
                                disabled={isRecording}
                            />
                        </div>
                        <VoiceSelector
                          selectedVoice={voice}
                          onSelectVoice={setVoice}
                          disabled={isRecording}
                        />
                        <AudioInputSettings
                            noiseSuppression={noiseSuppression}
                            echoCancellation={echoCancellation}
                            autoGainControl={autoGainControl}
                            onNoiseSuppressionChange={setNoiseSuppression}
                            onEchoCancellationChange={setEchoCancellation}
                            onAutoGainControlChange={setAutoGainControl}
                            disabled={isRecording}
                            micVolume={micVolume}
                        />
                    </div>
                    
                    <TranscriptDisplay 
                        transcripts={transcripts} 
                        isUserSpeaking={isUserSpeaking}
                        isModelSpeaking={isModelSpeaking}
                    />

                    <div className="p-4 md:p-6 mt-auto bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4">
                        <div className="w-full flex justify-between items-center">
                        <StatusIndicator status={status} isRecording={isRecording} errorMessage={errorMessage} />
                        <AudioControls 
                            isPlaying={isPlaying}
                            volume={volume}
                            onTogglePlayPause={handleTogglePlayPause}
                            onVolumeChange={handleVolumeChange}
                            disabled={!isRecording}
                        />
                        </div>
                        <ControlButton isRecording={isRecording} onClick={handleToggleConversation} />
                    </div>
                </div>
            </main>
            <footer className="w-full text-center p-4 text-gray-500 text-sm">
                <p>Made by Prabath Mudalige</p>
                <p className="mt-1">This is a tech demo. Translations may not be perfect.</p>
            </footer>
        </>
      ) : (
        <EntryPage onEnter={handleEnterApp} />
      )}

    </div>
  );
};

export default App;