
import React from 'react';
import { CharacterProfile, UserProfileConfig } from '../types';
import { User, Flame, Snowflake, Skull } from 'lucide-react';

interface Props {
  currentProfile: CharacterProfile;
  onSelect: (profile: CharacterProfile) => void;
}

const PROFILES: Record<CharacterProfile, UserProfileConfig> = {
  g0d: {
    id: 'g0d',
    name: 'g0d Mode',
    description: 'Max leverage. Aggressive. All signals.',
    riskTolerance: 'AGGRESSIVE',
    leverageCap: 100,
    preferredStrategy: 'ALL',
    themeColor: 'text-purple-500'
  },
  burry: {
    id: 'burry',
    name: 'Michael B.',
    description: 'Calculated Shorts. Contrarian. Data-driven.',
    riskTolerance: 'CONTRARIAN',
    leverageCap: 50,
    preferredStrategy: 'BURRY_SHORT',
    themeColor: 'text-blue-500'
  },
  pnguin: {
    id: 'pnguin',
    name: 'Penguin',
    description: 'Divergence Hunter. High conviction longs.',
    riskTolerance: 'CALCULATED',
    leverageCap: 40,
    preferredStrategy: 'PENGUIN_LONG',
    themeColor: 'text-cyan-400'
  }
};

export const CharacterSelector: React.FC<Props> = ({ currentProfile, onSelect }) => {
  return (
    <div className="flex gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-800">
      {Object.values(PROFILES).map((profile) => {
        const isSelected = currentProfile === profile.id;
        const Icon = profile.id === 'g0d' ? Skull : profile.id === 'burry' ? User : Snowflake;
        
        return (
          <button
            key={profile.id}
            onClick={() => onSelect(profile.id)}
            className={`flex-1 flex flex-col items-center p-2 rounded transition-all ${
              isSelected 
                ? 'bg-gray-800 border border-gray-600 shadow-[0_0_10px_rgba(0,0,0,0.5)]' 
                : 'hover:bg-gray-800/50 border border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${profile.themeColor}`} />
            <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>
              {profile.name}
            </span>
            {isSelected && (
               <span className="text-[8px] text-gray-400 hidden lg:block text-center leading-tight mt-1">
                 {profile.description}
               </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
