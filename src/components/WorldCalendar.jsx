import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, Sun, Moon, Skull, Crown, X } from 'lucide-react';

const EVENTS = {
  3: { name: 'Market Day', desc: 'Merchant spawn rate doubled.', icon: Coins, color: 'text-amber-400' },
  5: { name: 'Royal Inspection', desc: 'Nobles begin to appear.', icon: Crown, color: 'text-purple-400' },
  7: { name: 'Blood Moon', desc: 'Cultists spawn. "Dark" ingredients grant bonus Gold.', icon: Moon, color: 'text-red-500' },
  10: { name: 'The Plague', desc: 'Vital potions required. Everyone is sick.', icon: Skull, color: 'text-green-500' }
};

const WorldCalendar = ({ isOpen, onClose, day }) => {
  if (!isOpen) return null;

  // Generate next 5 days for the forecast
  const forecast = Array.from({ length: 5 }, (_, i) => day + i);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1c1917] border border-[#44403c] w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#292524] p-6 border-b border-[#44403c] flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-900/20 rounded border border-amber-900/50">
                    <Calendar className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-amber-100 font-serif">Almanac</h2>
                    <p className="text-xs text-stone-500 uppercase tracking-widest">Current Era: Day {day}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-stone-300"><X size={24} /></button>
        </div>

        <div className="p-6">
            <div className="space-y-4">
                {forecast.map((d, i) => {
                    const event = EVENTS[d];
                    const isToday = d === day;
                    
                    return (
                        <div key={d} className={`flex items-center gap-4 p-3 rounded-lg border ${isToday ? 'bg-amber-950/20 border-amber-900/50' : 'bg-transparent border-transparent opacity-60'}`}>
                            <div className={`font-mono text-sm w-12 text-center ${isToday ? 'text-amber-400 font-bold' : 'text-stone-600'}`}>
                                Day {d}
                            </div>
                            
                            <div className="flex-1">
                                {event ? (
                                    <div>
                                        <div className={`font-bold flex items-center gap-2 ${event.color || 'text-stone-300'}`}>
                                            {event.icon && <event.icon size={14} />}
                                            {event.name}
                                        </div>
                                        <div className="text-xs text-stone-500 mt-0.5">{event.desc}</div>
                                    </div>
                                ) : (
                                    <div className="text-stone-700 text-sm italic">No significant events foreseen.</div>
                                )}
                            </div>
                            
                            {isToday && <div className="text-[10px] uppercase font-bold text-amber-500 bg-amber-900/20 px-2 py-1 rounded">Today</div>}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#44403c] text-center">
                <p className="text-xs text-stone-600 italic">"The stars guide us, but the gold feeds us."</p>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorldCalendar;