import React from 'react';

interface AudioInputSettingsProps {
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  onNoiseSuppressionChange: (value: boolean) => void;
  onEchoCancellationChange: (value: boolean) => void;
  onAutoGainControlChange: (value: boolean) => void;
  disabled: boolean;
  micVolume: number;
}

const Toggle: React.FC<{ label: string; enabled: boolean; onChange: (value: boolean) => void; disabled: boolean }> = 
({ label, enabled, onChange, disabled }) => {
    const toggleId = `toggle-${label.replace(/\s+/g, '-')}`;
    return (
        <div className="flex items-center justify-between">
            <label htmlFor={toggleId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <button
                id={toggleId}
                role="switch"
                aria-checked={enabled}
                onClick={() => onChange(!enabled)}
                disabled={disabled}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                    enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
        </div>
    );
};

const VolumeMeter: React.FC<{ level: number }> = ({ level }) => {
  const NUM_SEGMENTS = 20;
  // RMS is a small value (e.g., 0.01 to 0.2). Scale it to fill the segments.
  // A scaling factor of 100 means an RMS of 0.2 fills all 20 segments.
  const activeSegments = Math.min(NUM_SEGMENTS, Math.ceil(level * 100));

  return (
    <div className="mt-4">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Mic Level</label>
      <div className="flex items-center gap-1 w-full h-5 mt-1 p-0.5 rounded-md bg-gray-200 dark:bg-gray-700/50">
        {Array.from({ length: NUM_SEGMENTS }).map((_, i) => {
          const isActive = i < activeSegments;
          let color = 'bg-gray-300 dark:bg-gray-600/50';
          if (isActive) {
            if (i < NUM_SEGMENTS * 0.7) { // Green up to 70%
              color = 'bg-green-500';
            } else if (i < NUM_SEGMENTS * 0.9) { // Yellow up to 90%
              color = 'bg-yellow-500';
            } else { // Red for the rest
              color = 'bg-red-500';
            }
          }
          return <div key={i} className={`h-full flex-1 rounded-sm transition-colors duration-75 ${color}`} />;
        })}
      </div>
    </div>
  );
};


export const AudioInputSettings: React.FC<AudioInputSettingsProps> = ({
  noiseSuppression,
  echoCancellation,
  autoGainControl,
  onNoiseSuppressionChange,
  onEchoCancellationChange,
  onAutoGainControlChange,
  disabled,
  micVolume,
}) => {
  return (
    <div className="mt-4 p-4 bg-gray-100/50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-sm font-semibold mb-3 text-gray-500 dark:text-gray-400">Audio Input Settings</h3>
        <div className="space-y-3">
            <Toggle label="Noise Suppression" enabled={noiseSuppression} onChange={onNoiseSuppressionChange} disabled={disabled} />
            <Toggle label="Echo Cancellation" enabled={echoCancellation} onChange={onEchoCancellationChange} disabled={disabled} />
            <Toggle label="Auto Gain Control" enabled={autoGainControl} onChange={onAutoGainControlChange} disabled={disabled} />
        </div>
        {disabled && <VolumeMeter level={micVolume} />}
    </div>
  );
};