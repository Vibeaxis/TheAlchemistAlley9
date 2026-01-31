import React from 'react';
import { motion } from 'framer-motion';
import { Skull, ShieldAlert, CheckCircle, Clock, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APPRENTICE_MISSIONS } from '@/lib/gameLogic';

const ApprenticeMissions = ({ apprentice, onAssignMission, gold }) => {
  // If injured, show recovery screen
  if (apprentice.status === 'injured') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center border border-red-900/50 mb-4">
            <Skull className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-red-400">Apprentice Injured</h3>
        <p className="text-stone-500 mt-2 max-w-sm">
            {apprentice.npcName} was hurt during the last mission. They need to rest for {apprentice.daysRemaining || 1} more day(s).
        </p>
      </div>
    );
  }

  // If already on a mission
  if (apprentice.status === 'on_mission') {
    const mission = APPRENTICE_MISSIONS.find(m => m.id === apprentice.currentMissionId);
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-indigo-900/20 rounded-full flex items-center justify-center border border-indigo-500/50 mb-4 animate-pulse">
            <Clock className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-indigo-300">Mission in Progress</h3>
        <p className="text-stone-400 mt-2">
            {apprentice.npcName} is currently executing: <br/>
            <span className="text-amber-500 font-bold">{mission?.name}</span>
        </p>
        <p className="text-xs text-stone-600 mt-4 uppercase tracking-widest">Report expected tomorrow morning</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-xl font-bold text-amber-100 font-serif mb-6 flex items-center gap-2">
        Covert Operations
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        {APPRENTICE_MISSIONS.map((mission) => {
            const canAfford = gold >= mission.cost;
            const riskColor = mission.risk > 0.5 ? 'text-red-400' : mission.risk > 0.2 ? 'text-orange-400' : 'text-emerald-400';
            
            return (
                <div key={mission.id} className="bg-[#1c1917] border border-[#292524] p-4 rounded-xl flex flex-col gap-3 hover:border-amber-900/50 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-black/40 rounded border border-white/5 text-stone-400">
                                <mission.icon size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-100">{mission.name}</h4>
                                <div className={`text-[10px] uppercase tracking-widest font-bold ${riskColor}`}>
                                    Risk: {(mission.risk * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            {mission.cost > 0 && (
                                <div className="text-xs text-amber-500 font-mono mb-1">Cost: {mission.cost}g</div>
                            )}
                        </div>
                    </div>
                    
                    <p className="text-xs text-stone-500 italic">"{mission.description}"</p>
                    
                    <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="text-xs text-stone-400">
                            Reward: <span className="text-emerald-400">{mission.rewards.ingredients > 0 ? `${mission.rewards.ingredients} Reagents` : `${mission.rewards.minGold}-${mission.rewards.maxGold} Gold`}</span>
                        </div>
                        <Button 
                            size="sm" 
                            disabled={!canAfford}
                            onClick={() => onAssignMission(mission)}
                            className={`h-7 text-xs ${canAfford ? 'bg-amber-900 hover:bg-amber-800' : 'bg-stone-800 opacity-50'}`}
                        >
                            Deploy
                        </Button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default ApprenticeMissions;