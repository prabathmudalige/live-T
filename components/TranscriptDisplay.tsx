import React, { useRef, useEffect } from 'react';
import type { Transcript } from '../types';

interface TranscriptDisplayProps {
  transcripts: Transcript[];
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ModelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A5 5 0 0014.142 11.858" />
    </svg>
);

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcripts }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcripts]);

  return (
    <div className="flex-grow p-4 md:p-6 h-96 overflow-y-auto bg-gray-100 dark:bg-gray-800/30">
        {transcripts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <p>Start the conversation to see the transcript here.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {transcripts.map((item, index) => (
                    <div key={index} className={`flex items-start gap-3 ${item.speaker === 'user' ? 'justify-end' : ''}`}>
                        {item.speaker === 'model' && <ModelIcon />}
                        <div className={`p-3 rounded-xl max-w-md ${item.speaker === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700/80 text-gray-800 dark:text-white rounded-bl-none'}`}>
                            <p>{item.text}</p>
                        </div>
                        {item.speaker === 'user' && <UserIcon />}
                    </div>
                ))}
                <div ref={endOfMessagesRef} />
            </div>
        )}
    </div>
  );
};