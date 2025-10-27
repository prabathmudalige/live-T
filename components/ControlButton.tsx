
import React from 'react';

interface ControlButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
    </svg>
);


export const ControlButton: React.FC<ControlButtonProps> = ({ isRecording, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${
        isRecording 
          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/50' 
          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50'
      }`}
    >
      {isRecording ? <StopIcon /> : <MicrophoneIcon />}
      {isRecording ? 'Stop Conversation' : 'Start Conversation'}
    </button>
  );
};
