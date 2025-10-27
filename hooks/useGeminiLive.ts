import { useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveSession } from '@google/genai';
import type { Blob } from '@google/genai';

interface UseGeminiLiveProps {
  sourceLang: string;
  targetLang: string;
  onStatusChange: (status: string, message?: string) => void;
  onTranscriptUpdate: (type: 'input' | 'output' | 'turnComplete', text?: string) => void;
  isPlaying: boolean;
  volume: number;
}

// Audio utility functions
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


export const useGeminiLive = ({
  sourceLang,
  targetLang,
  onStatusChange,
  onTranscriptUpdate,
  isPlaying,
  volume,
}: UseGeminiLiveProps) => {
  const sessionRef = useRef<LiveSession | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (outputGainNodeRef.current && outputAudioContextRef.current) {
      const targetVolume = isPlaying ? volume : 0;
      outputGainNodeRef.current.gain.setTargetAtTime(targetVolume, outputAudioContextRef.current.currentTime, 0.05);
    }
  }, [isPlaying, volume]);


  const stopSession = useCallback(() => {
    onStatusChange('closing');
    
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (outputGainNodeRef.current) {
        outputGainNodeRef.current.disconnect();
        outputGainNodeRef.current = null;
    }
    
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    
    onStatusChange('idle');
  }, [onStatusChange]);

  const startSession = useCallback(async () => {
    onStatusChange('connecting');
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputGainNodeRef.current = outputAudioContextRef.current.createGain();
      outputGainNodeRef.current.connect(outputAudioContextRef.current.destination);
      outputGainNodeRef.current.gain.value = isPlaying ? volume : 0;
      nextStartTimeRef.current = 0;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are a live translator. The user is speaking ${sourceLang}. Listen to what they say, translate it to ${targetLang}, and respond naturally in ${targetLang}. Keep your responses concise.`,
        },
        callbacks: {
          onopen: async () => {
            onStatusChange('connected');
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.inputTranscription) {
              onTranscriptUpdate('input', message.serverContent.inputTranscription.text);
            }
            if (message.serverContent?.outputTranscription) {
              onTranscriptUpdate('output', message.serverContent.outputTranscription.text);
            }
            if(message.serverContent?.turnComplete) {
                onTranscriptUpdate('turnComplete');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current && outputGainNodeRef.current) {
                const outputCtx = outputAudioContextRef.current;
                const gainNode = outputGainNodeRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);

                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(gainNode);
                
                source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }
          },
          onerror: (e) => {
            console.error('Session error:', e);
            onStatusChange('error', 'Connection failed. Please check your network and API key.');
            stopSession();
          },
          onclose: () => {
             console.log('Session closed');
          },
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error('Failed to start session:', error);
      onStatusChange('error', 'Failed to initialize session. Please check your API key.');
      stopSession();
    }
  }, [sourceLang, targetLang, onStatusChange, onTranscriptUpdate, stopSession, isPlaying, volume]);

  return { startSession, stopSession };
};