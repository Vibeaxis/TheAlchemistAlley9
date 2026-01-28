
import { Search, Book, ShieldAlert } from 'lucide-react';

export const HIREABLE_NPCS = [
  // Scroungers
  {
    id: 'marta',
    name: 'Marta the Scrounger',
    class: 'Scrounger',
    icon: Search,
    color: 'text-green-400',
    description: 'Finds things others miss in the dark alleys.',
    passiveAbility: { type: 'scavenge', description: 'Finds 1 random ingredient every night' },
    activeAbility: { type: 'none', description: 'No active ability' }
  },
  {
    id: 'rat_boy',
    name: 'Rat Boy',
    class: 'Scrounger',
    icon: Search,
    color: 'text-green-400',
    description: 'Small, quick, and smells terrible. Very effective.',
    passiveAbility: { type: 'scavenge', description: 'Finds 1 random ingredient every night' },
    activeAbility: { type: 'none', description: 'No active ability' }
  },
  {
    id: 'old_tibs',
    name: 'Old Tibs',
    class: 'Scrounger',
    icon: Search,
    color: 'text-green-400',
    description: 'Knows every trash heap in the city.',
    passiveAbility: { type: 'scavenge', description: 'Finds 1 random ingredient every night' },
    activeAbility: { type: 'none', description: 'No active ability' }
  },
  // Scholars
  {
    id: 'elias',
    name: 'Elias the Scribe',
    class: 'Scholar',
    icon: Book,
    color: 'text-blue-400',
    description: 'A failed wizard with a sharp eye for details.',
    passiveAbility: { type: 'research', description: 'Reveals 1 unknown ingredient property per night' },
    activeAbility: { type: 'consult', description: 'Can identify 1 hidden symptom requirement per customer' }
  },
  {
    id: 'sister_agnes',
    name: 'Sister Agnes',
    class: 'Scholar',
    icon: Book,
    color: 'text-blue-400',
    description: 'Exiled from the convent for forbidden reading.',
    passiveAbility: { type: 'research', description: 'Reveals 1 unknown ingredient property per night' },
    activeAbility: { type: 'consult', description: 'Can identify 1 hidden symptom requirement per customer' }
  },
  {
    id: 'professor_crow',
    name: 'Professor Crow',
    class: 'Scholar',
    icon: Book,
    color: 'text-blue-400',
    description: 'Teaches at the university, moonlights for you.',
    passiveAbility: { type: 'research', description: 'Reveals 1 unknown ingredient property per night' },
    activeAbility: { type: 'consult', description: 'Can identify 1 hidden symptom requirement per customer' }
  },
  // Bouncers
  {
    id: 'grog',
    name: 'Grog',
    class: 'Bouncer',
    icon: ShieldAlert,
    color: 'text-red-400',
    description: 'Big. Strong. Not very talkative.',
    passiveAbility: { type: 'guard', description: 'Reduces reputation loss from failures by 50%' },
    activeAbility: { type: 'none', description: 'No active ability' }
  },
  {
    id: 'iron_mary',
    name: 'Iron Mary',
    class: 'Bouncer',
    icon: ShieldAlert,
    color: 'text-red-400',
    description: 'Former city guard captain. Takes no nonsense.',
    passiveAbility: { type: 'guard', description: 'Reduces reputation loss from failures by 50%' },
    activeAbility: { type: 'none', description: 'No active ability' }
  }
];
