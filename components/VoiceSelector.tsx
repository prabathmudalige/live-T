import React from 'react';

interface VoiceSelectorProps {
  selectedVoice: 'female' | 'male';
  onSelectVoice: (voice: 'female' | 'male') => void;
  disabled: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelectVoice, disabled }) => {
  return (
    <div className="mt-4">
      <fieldset>
        <legend className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          AI Voice
        </legend>
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              id="voice-female"
              type="radio"
              name="voice-selector"
              value="female"
              checked={selectedVoice === 'female'}
              onChange={() => onSelectVoice('female')}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:ring-2 bg-gray-100 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="voice-female" className={`ml-2 block text-sm ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
              Female
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="voice-male"
              type="radio"
              name="voice-selector"
              value="male"
              checked={selectedVoice === 'male'}
              onChange={() => onSelectVoice('male')}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:ring-2 bg-gray-100 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="voice-male" className={`ml-2 block text-sm ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
              Male
            </label>
          </div>
        </div>
      </fieldset>
    </div>
  );
};
