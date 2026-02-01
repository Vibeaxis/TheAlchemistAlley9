// ReputationData.js
export const REP_RANKS = [
  { level: 0, name: "Vagabond", minRep: 0, bonus: "No bonuses", color: "text-stone-500" },
  { level: 1, name: "Citizen", minRep: 50, bonus: "+5% Sale Price", color: "text-blue-400" },
  { level: 2, name: "Merchant", minRep: 150, bonus: "-10% Bribe Costs", color: "text-emerald-400" },
  { level: 3, name: "Noble", minRep: 350, bonus: "Heat decays 2x faster", color: "text-purple-400" },
  { level: 4, name: "Exalted", minRep: 700, bonus: "All favors 25% cheaper", color: "text-amber-400" },
];

export const getRank = (rep) => {
  // We use .slice().reverse() so we don't mutate the original array
  return [...REP_RANKS].reverse().find(r => rep >= r.minRep) || REP_RANKS[0];
};