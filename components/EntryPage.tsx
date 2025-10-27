import React from 'react';

interface EntryPageProps {
  onEnter: () => void;
}

const EnterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
);


export const EntryPage: React.FC<EntryPageProps> = ({ onEnter }) => {
  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
      <div className="mb-8">
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-xl md:text-2xl mb-4">
          Real-time, two-way voice translation powered by Gemini.
        </p>
         <p className="text-gray-400 dark:text-gray-500 text-lg">
          Made by Prabath Mudalige
        </p>
      </div>
     
      <button
        onClick={onEnter}
        className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50 transform hover:scale-105"
      >
        <EnterIcon />
        Start Translating
      </button>
    </main>
  );
};
