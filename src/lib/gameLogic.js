import { Crown, Hand, Shield, Skull, ShieldCheck, Wind, Coins, FlaskConical } from 'lucide-react';

export const CUSTOMER_CLASSES = [
  {
    id: 'noble',
    name: 'Noble',
    icon: Crown,
    goldMultiplier: 2,
    reputationFailMultiplier: -2,
    reputationSuccessMultiplier: 1.5, // Buffed
    description: 'Wealthy and demanding'
  },
  {
    id: 'beggar',
    name: 'Beggar',
    icon: Hand,
    goldMultiplier: 0,
    reputationFailMultiplier: -1,
    reputationSuccessMultiplier: 3, // Buffed: Great for farming Rep
    description: 'Poor but grateful'
  },
  {
    id: 'guard',
    name: 'Guard',
    icon: Shield,
    goldMultiplier: 1.2,
    reputationFailMultiplier: -1,
    reputationSuccessMultiplier: 1.5,
    description: 'Fair and honorable'
  },
  {
    id: 'cultist',
    name: 'Cultist',
    icon: Skull,
    goldMultiplier: 1.5,
    reputationFailMultiplier: -1,
    reputationSuccessMultiplier: 1,
    description: 'Pays in dark secrets',
    specialReward: 'Dark Secret'
  }
];

// Replaces static SYMPTOMS array
const ADJECTIVES = ['Burning', 'Freezing', 'Cursed', 'Poisonous', 'Hollow', 'Whispering', 'Heavy', 'Glowing'];
const LOCATIONS = ['skin', 'blood', 'bones', 'mind', 'dreams', 'heart', 'veins', 'flesh'];
const SENSATIONS_MAP = [
  { text: 'burns with an unholy fire', tags: ['Cooling', 'Holy'] },
  { text: 'feels like solid ice', tags: ['Hot', 'Vital'] },
  { text: 'is clouded by dark shadows', tags: ['Purifying', 'Calming'] },
  { text: 'rejects all nourishment', tags: ['Purifying', 'Vital'] },
  { text: 'turns to cold stone', tags: ['Hot', 'Vital'] },
  { text: 'hears the call of the void', tags: ['Holy', 'Calming'] },
  { text: 'feels heavy as lead', tags: ['Purifying', 'Heavy'] }, // Fixed: Changed Crystalline to Heavy to make Salt+Copper viable
  { text: 'grows strange crystals', tags: ['Purifying', 'Hot'] }
];
import { ShieldCheck, Wind, Coins, FlaskConical } from 'lucide-react';

export const UPGRADES_LIST = [
  {
    id: 'reinforced',
    name: 'Reinforced Cauldron',
    cost: 50,
    description: 'Explosions cause 0 Reputation loss instead of -10.',
    icon: ShieldCheck
  },
  {
    id: 'ventilation',
    name: 'Ventilation System',
    cost: 40,
    description: 'Accidental Poisoning causes -2 Reputation instead of -5.',
    icon: Wind
  },
  {
    id: 'merchant',
    name: "Merchant's License",
    cost: 30,
    description: 'Passive +5 Gold on every successful cure.',
    icon: Coins
  },
  {
    id: 'mercury',
    name: 'Mercury Permit',
    cost: 60,
    description: 'Using Mercury successfully grants extra +10 Gold bonus.',
    icon: FlaskConical
  }
];
export const generateSymptom = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const sensation = SENSATIONS_MAP[Math.floor(Math.random() * SENSATIONS_MAP.length)];

  return {
    id: Date.now() + Math.random(),
    text: `My ${loc} ${sensation.text}... even my ${adj} thoughts bring no comfort.`,
    requiredTags: sensation.tags
  };
};

export const INGREDIENTS = [
  // RISK ITEMS
  { name: 'Mercury', tags: ['Toxic', 'Heavy'], icon: '☿' },
  { name: 'Nightshade', tags: ['Toxic', 'Dark'], icon: '🥀' },

  // SAFE BASES
  { name: 'Salt', tags: ['Purifying', 'Crystalline'], icon: '⚬' },
  { name: 'Sage', tags: ['Purifying', 'Calming'], icon: '🌿' },
  { name: 'Moonstone', tags: ['Cooling', 'Holy'], icon: '☽' },

  // UTILITY (Fixed: Removed Toxic from these so you can actually cure people)
  { name: 'Sulfur', tags: ['Hot', 'Vital'], icon: '🜍' },
  { name: 'Bloodroot', tags: ['Vital', 'Purifying'], icon: '⚕' },
  { name: 'Copper', tags: ['Hot', 'Heavy'], icon: '⚙' } // Fixed: Changed "Conductive" to "Hot" to make it useful
];

let customerIdCounter = 0;

export const generateCustomer = () => {
  const randomClass = CUSTOMER_CLASSES[Math.floor(Math.random() * CUSTOMER_CLASSES.length)];
  const generatedSymptom = generateSymptom();

  return {
    id: ++customerIdCounter,
    class: randomClass,
    symptom: generatedSymptom
  };
};

export const tagCombination = (ingredients) => {
  const allTags = [];
  let isFatal = false;

  // Collect all tags
  ingredients.forEach(ingredient => {
    allTags.push(...ingredient.tags);
  });

  // Process tag rules
  const processedTags = [...allTags];

  // Rule 1: Hot + Cold cancel out
  const hotCount = processedTags.filter(t => t === 'Hot').length;
  const coldCount = processedTags.filter(t => t === 'Cooling').length;
  const cancelCount = Math.min(hotCount, coldCount);

  for (let i = 0; i < cancelCount; i++) {
    const hotIndex = processedTags.indexOf('Hot');
    const coldIndex = processedTags.indexOf('Cooling');
    if (hotIndex !== -1) processedTags.splice(hotIndex, 1);
    if (coldIndex !== -1) processedTags.splice(coldIndex, 1);
  }

  // Rule 2: 2x Toxic = Fatal
  const toxicCount = processedTags.filter(t => t === 'Toxic').length;
  if (toxicCount >= 2) {
    isFatal = true;
  }

  return {
    tags: processedTags,
    isFatal
  };
};

export const calculateOutcome = (selectedIngredients, customer, upgrades = {}, apprentice = null) => {
  const combination = tagCombination(selectedIngredients);
  const { tags, isFatal } = combination;
  const requiredTags = customer.symptom.requiredTags;
  const customerClass = customer.class;

  // 1. EXPLOSION
  if (isFatal) {
    let reputationChange = -10;
    let narrative = `The cauldron EXPLODES in a shower of toxic fumes! The ${customerClass.name} flees.`;

    // Upgrade: Reinforced Cauldron
    if (upgrades.reinforced) {
      reputationChange = 0;
      narrative = `The cauldron EXPLODES! But your reinforced plating contains the blast. (Reputation Saved)`;
    }
    // Apprentice: Bouncer
    else if (apprentice && apprentice.npcClass === 'Bouncer') {
      reputationChange = -5; // Halved
      narrative += ` (Your Bouncer ${apprentice.npcName} cleared the room, reducing the panic.)`;
    }

    return {
      result: 'exploded',
      goldReward: 0,
      reputationChange,
      narrative
    };
  }

  // Check success criteria
  const hasAllRequired = requiredTags.every(reqTag => tags.includes(reqTag));
  const hasToxic = tags.includes('Toxic');
  // Cultists don't mind Dark ingredients, everyone else does
  const hasDark = tags.includes('Dark') && customerClass.id !== 'cultist';

  // 2. CURED
  if (hasAllRequired && !hasToxic && !hasDark) {
    let goldReward = customerClass.goldMultiplier === 0 ? 0 : 15 * customerClass.goldMultiplier; // Buffed Gold

    // Buffed Base Reputation: Wins should feel good
    const reputationChange = 5 * customerClass.reputationSuccessMultiplier;

    // Upgrade: Merchant's License
    if (upgrades.merchant) {
      goldReward += 5;
    }

    // Upgrade: Mercury Permit
    const usedMercury = selectedIngredients.some(i => i.name === 'Mercury');
    if (upgrades.mercury && usedMercury) {
      goldReward += 10;
    }

    // Narrative generation
    let narrative = '';
    if (customerClass.id === 'noble') {
      narrative = `The Noble is cured! "Excellent work!" They pay you ${goldReward} gold.`;
    } else if (customerClass.id === 'beggar') {
      narrative = `The Beggar weeps with joy. "Bless you! Word of your kindness will spread!" (+${reputationChange} Reputation)`;
    } else if (customerClass.id === 'guard') {
      narrative = `The Guard nods. "You have my thanks." They pay you ${goldReward} gold.`;
    } else if (customerClass.id === 'cultist') {
      narrative = `The Cultist's eyes gleam. "You understand the shadows..." (+${reputationChange} Rep)`;
    } else {
      narrative = `The customer is cured! You earn ${goldReward} gold.`;
    }

    return {
      result: 'cured',
      goldReward,
      reputationChange,
      narrative
    };
  }

  // 3. POISONED / FAILED
  let narrative = '';
  let reputationChange = 0;

  if (hasToxic) {
    reputationChange = -5; // Reduced from -20 to -5

    // Upgrade: Ventilation System
    if (upgrades.ventilation) {
      reputationChange = -2;
    }

    narrative = `The ${customerClass.name} clutches their stomach. "You've POISONED me!"`;
    return {
      result: 'poisoned',
      goldReward: 0,
      reputationChange,
      narrative
    };
  }

  // Ineffective (Failed)
  reputationChange = -2; // Reduced penalty
  narrative = `The potion does nothing. The ${customerClass.name} leaves disappointed.`;

  return {
    result: 'poisoned', // Using poisoned style for failure to show red flash
    goldReward: 0,
    reputationChange,
    narrative
  };
};