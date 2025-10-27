import React from 'react';

interface StatusIndicatorProps {
  status: string;
  isRecording: boolean;
  errorMessage?: string | null;
}

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, isRecording, errorMessage }) => {
  if (status === 'error') {
    return (
      <div className="flex items-center justify-center gap-2 text-red-500 dark:text-red-400">
        <ErrorIcon />
        <span>Error: {errorMessage || 'An unknown error occurred.'}</span>
      </div>
    );
  }
    
  const statusInfo = {
    idle: { text: 'Ready to start', color: 'text-gray-500 dark:text-gray-400' },
    connecting: { text: 'Connecting...', color: 'text-gray-500 dark:text-gray-400' },
    connected: { text: 'Connected & Listening', color: 'text-green-600 dark:text-green-400' },
    closing: { text: 'Closing connection...', color: 'text-gray-500 dark:text-gray-400' },
  }[status] || { text: 'Idle', color: 'text-gray-500 dark:text-gray-400' };

  const showRecordingIndicator = isRecording && status === 'connected';

  return (
    <div className="flex items-center justify-center gap-3">
      {showRecordingIndicator && (
        <div className="flex items-center gap-2 text-red-500">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span>Recording</span>
        </div>
      )}
      {showRecordingIndicator && <span className="text-gray-300 dark:text-gray-600">|</span>}
      <span className={statusInfo.color}>Status: {statusInfo.text}</span>
    </div>
  );
};