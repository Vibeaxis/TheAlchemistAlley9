import { 
  Crown, Hand, Shield, Skull, ShieldCheck, Wind, Coins, FlaskConical, 
  Music, Sword, Book, Hammer, Anchor, Cross // <--- Added new icons
} from 'lucide-react';

// ==========================================
// 1. DATA: CUSTOMER CLASSES (Weighted)
// ==========================================
export const CUSTOMER_CLASSES = [
  // --- COMMONS (High Weight - Days 1 & 2) ---
  {
    id: 'beggar',
    name: 'Beggar',
    icon: Hand,
    weight: 50,
    minDay: 1,
    goldMultiplier: 0, 
    reputationFailMultiplier: -0.5,
    reputationSuccessMultiplier: 3.0,
    description: 'Poor but grateful'
  },
  {
    id: 'laborer', // NEW: The backbone of the city
    name: 'Laborer',
    icon: Hammer,
    weight: 45,
    minDay: 1,
    goldMultiplier: 0.8, // Pays little
    reputationFailMultiplier: -1.0,
    reputationSuccessMultiplier: 1.0, // Standard interaction
    description: 'Exhausted from the mines'
  },
  {
    id: 'sailor', // NEW: Flavor for the Docks
    name: 'Sailor',
    icon: Anchor,
    weight: 40,
    minDay: 1,
    goldMultiplier: 1.1, // Just got paid
    reputationFailMultiplier: -1.5, // Rowdy if disappointed
    reputationSuccessMultiplier: 1.0,
    description: 'Fresh from the Docks'
  },
  {
    id: 'guard',
    name: 'Guard',
    icon: Shield,
    weight: 40,
    minDay: 1,
    goldMultiplier: 1.2,
    reputationFailMultiplier: -1,
    reputationSuccessMultiplier: 1.5,
    description: 'Fair and honorable'
  },
  {
    id: 'acolyte', // NEW: Early game "Magic/Holy" intro
    name: 'Acolyte',
    icon: Cross,
    weight: 35,
    minDay: 2,
    goldMultiplier: 0.5, // Pays in donations
    reputationFailMultiplier: -1.0,
    reputationSuccessMultiplier: 2.5, // Blessings boost rep
    description: 'Seeking divine clarity'
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    icon: Sword,
    weight: 30,
    minDay: 2,
    goldMultiplier: 1.4,
    reputationFailMultiplier: -1.2,
    reputationSuccessMultiplier: 1.2,
    description: 'Needs potions for the dungeon'
  },

  // --- UNCOMMONS (Medium Weight - Day 3+) ---
  {
    id: 'scholar',
    name: 'Scholar',
    icon: Book,
    weight: 20,
    minDay: 3,
    goldMultiplier: 1.0,
    reputationFailMultiplier: -0.5,
    reputationSuccessMultiplier: 2.0,
    description: 'Studying alchemical theory'
  },
  {
    id: 'merchant',
    name: 'Merchant',
    icon: Coins,
    weight: 20,
    minDay: 3,
    goldMultiplier: 3.0,
    reputationFailMultiplier: -0.5,
    reputationSuccessMultiplier: 0.5,
    description: 'Resells for profit'
  },

  // --- RARES / EVENTS (Low Weight - Day 4+) ---
  {
    id: 'bard',
    name: 'Bard',
    icon: Music,
    weight: 10,
    minDay: 4,
    goldMultiplier: 0.8,
    reputationFailMultiplier: -5.0,
    reputationSuccessMultiplier: 5.0,
    description: 'Influencer of the realm'
  },
  {
    id: 'noble',
    name: 'Noble',
    icon: Crown,
    weight: 10,
    minDay: 5,
    goldMultiplier: 5.0, 
    reputationFailMultiplier: -3,
    reputationSuccessMultiplier: 2.0,
    description: 'Wealthy and demanding'
  },
  {
    id: 'cultist',
    name: 'Cultist',
    icon: Skull,
    weight: 5,
    minDay: 6,
    goldMultiplier: 1.5,
    reputationFailMultiplier: -2,
    reputationSuccessMultiplier: 0.5,
    description: 'Pays in dark secrets'
  },
  {
    id: 'rival',
    name: 'Rival Alchemist',
    icon: FlaskConical,
    weight: 5,
    minDay: 8,
    goldMultiplier: 1.1,
    reputationFailMultiplier: -5.0,
    reputationSuccessMultiplier: 5.0, 
    description: 'Judges your technique'
  }
];

// --- 1. FLAVOR ADJECTIVES (Categorized) ---
const ADJECTIVES = {
  physical: ['Rotting', 'Petrified', 'Feverish', 'Withering', 'Numb', 'Bleeding', 'Cracked', 'Swollen'],
  ethereal: ['Cursed', 'Hollow', 'Whispering', 'Shadowy', 'Vibrating', 'Echoing', 'Fractured', 'Silent'],
  elemental: ['Burning', 'Freezing', 'Glowing', 'Electric', 'Poisonous', 'Heavy', 'Sharp']
};

// --- 2. ANATOMY / LOCATIONS (Categorized) ---
const LOCATIONS = {
  physical: ['skin', 'blood', 'bones', 'flesh', 'veins', 'stomach', 'teeth', 'eyes'],
  ethereal: ['mind', 'dreams', 'soul', 'shadow', 'thoughts', 'aura', 'memory', 'will'],
  elemental: ['breath', 'voice', 'touch', 'gaze', 'heartbeat']
};
export const SENSATIONS_MAP = [
  // --- TIER 1: BASICS (Day 1+) ---
  // Ingredients: Salt, Sage, Sulfur, Moonstone, Bloodroot, Copper
  // Available Tags: Purifying, Crystalline, Calming, Cooling, Holy, Hot, Vital, Heavy
  { category: 'elemental', text: 'burns with an unholy fire', tags: ['Cooling', 'Holy'], minDay: 1 },
  { category: 'elemental', text: 'feels like molten slag', tags: ['Cooling', 'Heavy'], minDay: 1 },
  { category: 'elemental', text: 'feels like solid ice', tags: ['Hot', 'Vital'], minDay: 1 },
  { category: 'elemental', text: 'shivers with a grave chill', tags: ['Hot', 'Holy'], minDay: 1 },
  { category: 'physical', text: 'is turning to dust', tags: ['Heavy', 'Vital'], minDay: 1 },
  { category: 'physical', text: 'vibrates uncontrollably', tags: ['Calming', 'Heavy'], minDay: 1 },
  { category: 'physical', text: 'feels heavy as lead', tags: ['Purifying', 'Vital'], minDay: 1 }, // Changed from Luminous (Tier 2) to Vital

  // --- TIER 2: ADVANCED (Day 3+) ---
  // Unlocks: Ghost Pepper, Skull, Moss
  // New Tags: Arcane, Desiccated, Luminous
  { category: 'physical', text: 'oozes a foul sludge', tags: ['Purifying', 'Desiccated'], minDay: 3 },
  { category: 'physical', text: 'feels thin and stretched', tags: ['Luminous', 'Heavy'], minDay: 3 },
  { category: 'ethereal', text: 'is clouded by dark shadows', tags: ['Luminous', 'Holy'], minDay: 3 },
  { category: 'ethereal', text: 'hears the call of the void', tags: ['Arcane', 'Calming'], minDay: 3 },
  { category: 'ethereal', text: 'is fading from existence', tags: ['Arcane', 'Heavy'], minDay: 3 },
  { category: 'ethereal', text: 'is drowning in dry air', tags: ['Vital', 'Cooling'], minDay: 3 },
  { category: 'ethereal', text: 'is weeping blood', tags: ['Desiccated', 'Calming'], minDay: 3 },

  // --- TIER 3: EXPERT (Day 6+) ---
  // Unlocks: Tentacle, Thunderstone, etc.
  // New Tags: Void, Electric, Dark
  { category: 'ethereal', text: 'is stuck in a time loop', tags: ['Arcane', 'Crystalline'], minDay: 6 },
  { category: 'physical', text: 'has stopped beating', tags: ['Electric', 'Vital'], minDay: 6 },
  { category: 'elemental', text: 'is consumed by entropy', tags: ['Void', 'Holy'], minDay: 6 },
  { category: 'ethereal', text: 'is screaming silently', tags: ['Dark', 'Calming'], minDay: 6 }
];


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
  // --- TIER 1: BASICS (Infinite Stock) ---
  { 
    name: 'Salt', 
    tags: ['Purifying', 'Crystalline'], 
    icon: '⚬',
    processed: { name: 'Fine Salt', tags: ['Purifying', 'Holy'], icon: '⚪' }
  },
  { 
    name: 'Sage', 
    tags: ['Purifying', 'Calming'], 
    icon: '🌿',
    processed: { name: 'Sage Powder', tags: ['Purifying', 'Vital'], icon: '🍃' }
  },
  { 
    name: 'Moonstone', 
    tags: ['Cooling', 'Holy'], 
    icon: '☽',
    processed: { name: 'Moon Dust', tags: ['Crystalline', 'Cooling'], icon: '❄' }
  },
  { 
    name: 'Sulfur', 
    tags: ['Hot', 'Vital'], 
    icon: '🜍',
    processed: { name: 'Brimstone Ash', tags: ['Hot', 'Explosive'], icon: '🌋' }
  },
  { 
    name: 'Bloodroot', 
    tags: ['Vital', 'Purifying'], 
    icon: '⚕',
    processed: { name: 'Red Paste', tags: ['Vital', 'Toxic'], icon: '🩸' }
  },
  { 
    name: 'Copper', 
    tags: ['Hot', 'Heavy'], 
    icon: '⚙',
    processed: { name: 'Copper Filings', tags: ['Hot', 'Crystalline'], icon: '⛓' }
  },
  { 
    name: 'Mercury', 
    tags: ['Toxic', 'Heavy'], 
    icon: '☿',
    processed: { name: 'Quicksilver Fumes', tags: ['Toxic', 'Explosive'], icon: '☁' }
  },
  { 
    name: 'Nightshade', 
    tags: ['Toxic', 'Dark'], 
    icon: '🥀',
    processed: { name: 'Nightshade Dust', tags: ['Toxic', 'Calming'], icon: '✨' }
  },
  // Adding Water as a neutral base if needed, but skipping for now to keep grid tight.

  // --- TIER 2: RARE IMPORTS (Finite - Cost Gold) ---
  {
    name: 'Ghost Pepper',
    icon: '🌶️', 
    tags: ['Hot', 'Arcane'],
    finite: true,
    cost: 40,
    description: 'Burns across dimensions. Handle with gloves.',
    processed: { name: 'Spirit Dust', tags: ['Arcane', 'Purifying'], icon: '👻' }
  },
  {
    name: 'Sun-Bleached Skull',
    icon: '💀',
    tags: ['Desiccated', 'Holy'],
    finite: true,
    cost: 50,
    description: 'Bone that has stared into the sun for a century.',
    processed: { name: 'Bone Meal', tags: ['Desiccated', 'Heavy'], icon: '🦴' }
  },
  {
    name: 'Bioluminescent Moss',
    icon: '🍄',
    tags: ['Luminous', 'Vital'],
    finite: true,
    cost: 60,
    description: 'Found deep in the caves of the Underdark.',
    processed: { name: 'Glowing Paste', tags: ['Luminous', 'Cooling'], icon: '🧪' }
  },

  // --- TIER 3: EXOTIC REAGENTS (Finite - High Cost) ---
  {
    name: 'Abyssal Tentacle',
    icon: '🐙',
    tags: ['Void', 'Toxic'],
    finite: true,
    cost: 100,
    description: 'It still twitches when you look away.',
    processed: { name: 'Void Ink', tags: ['Void', 'Dark'], icon: '⚫' }
  },
  {
    name: 'Thunderstone',
    icon: '⚡',
    tags: ['Electric', 'Crystalline'],
    finite: true,
    cost: 120,
    description: 'A crystallized lightning strike.',
    processed: { name: 'Spark Powder', tags: ['Electric', 'Hot'], icon: '✨' }
  },
  {
    name: 'Mandrake Root',
    icon: '🥔',
    tags: ['Vital', 'Toxic'], // Scream makes it dangerous
    finite: true,
    cost: 80,
    description: 'Wear earplugs before chopping.',
    processed: { name: 'Silence Extract', tags: ['Vital', 'Calming'], icon: '🤫' }
  },

  // --- TIER 4: LEGENDARY (Finite - Very High Cost) ---
  {
    name: 'Phoenix Feather',
    icon: '🪶',
    tags: ['Vital', 'Holy'],
    finite: true,
    cost: 200,
    description: 'Warm to the touch. It smells like hope.',
    processed: { name: 'Ash of Rebirth', tags: ['Holy', 'Arcane'], icon: '🔥' }
  },
  {
    name: 'Grave Dust',
    icon: '⚰️',
    tags: ['Dark', 'Cooling'],
    finite: true,
    cost: 90,
    description: 'Soil from the grave of a traitor.',
    processed: { name: 'Shadow Essence', tags: ['Dark', 'Arcane'], icon: '👻' }
  },
  {
    name: 'Time-Lost Sand',
    icon: '⏳',
    tags: ['Arcane', 'Crystalline'],
    finite: true,
    cost: 250,
    description: 'Sand that flows upwards.',
    processed: { name: 'Stasis Powder', tags: ['Arcane', 'Calming'], icon: '⏸️' }
  }
];

let customerIdCounter = 0;
// --- 2. GENERATOR LOGIC ---

// Helper to fix "My bones is" -> "My bones are"
const fixGrammar = (part, text) => {
    const isPlural = ['eyes', 'bones', 'veins', 'dreams', 'thoughts', 'lungs', 'teeth'].includes(part);
    
    // Simple replacement rules
    if (isPlural) {
        if (text.startsWith('is ')) return text.replace('is ', 'are ');
        if (text.startsWith('has ')) return text.replace('has ', 'have ');
        if (text.startsWith('feels ')) return text.replace('feels ', 'feel ');
        if (text.startsWith('burns ')) return text.replace('burns ', 'burn ');
        if (text.startsWith('shivers ')) return text.replace('shivers ', 'shiver ');
        if (text.startsWith('oozes ')) return text.replace('oozes ', 'ooze ');
        if (text.startsWith('vibrates ')) return text.replace('vibrates ', 'vibrate ');
        if (text.startsWith('glows ')) return text.replace('glows ', 'glow ');
        if (text.startsWith('hears ')) return text.replace('hears ', 'hear ');
    }
    return text;
};
// ** UPDATED GENERATOR **
export const generateCustomer = (day = 1) => {
  // 1. Filter Classes based on Day
  const availableClasses = CUSTOMER_CLASSES.filter(c => day >= (c.minDay || 1));

  // Weighted Random Class
  const totalWeight = availableClasses.reduce((sum, c) => sum + (c.weight || 10), 0);
  let random = Math.random() * totalWeight;
  let customerClass = availableClasses[0]; 

  for (const c of availableClasses) {
      const weight = c.weight || 10;
      if (random < weight) {
          customerClass = c;
          break;
      }
      random -= weight;
  }

  // 2. Filter Scenarios based on Day (THE FIX)
  const availableScenarios = SENSATIONS_MAP.filter(s => day >= (s.minDay || 1));
  
  // Fallback: If day 1 has no scenarios (shouldn't happen), take the first one
  const scenario = availableScenarios.length > 0 
    ? availableScenarios[Math.floor(Math.random() * availableScenarios.length)]
    : SENSATIONS_MAP[0];

  // 3. Pick Body Part
  const validParts = LOCATIONS[scenario.category] || LOCATIONS.physical;
  const part = validParts[Math.floor(Math.random() * validParts.length)];
  
  const text = fixGrammar(part, scenario.text);

  return {
    id: ++customerIdCounter,
    class: customerClass,
    symptom: {
      text: `My ${part} ${text}...`,
      requiredTags: scenario.tags
    }
  };
};

// --- 3. ALCHEMY ENGINE ---
export const tagCombination = (ingredients) => {
  const allTags = [];
  ingredients.forEach(ing => allTags.push(...ing.tags));
  let processedTags = [...allTags];

  // A. Thermodynamics (Hot <-> Cold)
  // They neutralize each other completely
  const hotCount = processedTags.filter(t => t === 'Hot').length;
  const coldCount = processedTags.filter(t => t === 'Cooling').length;
  const tempCancel = Math.min(hotCount, coldCount);
  
  for (let i = 0; i < tempCancel; i++) {
    const hotIdx = processedTags.indexOf('Hot');
    if (hotIdx > -1) processedTags.splice(hotIdx, 1);
    
    const coldIdx = processedTags.indexOf('Cooling');
    if (coldIdx > -1) processedTags.splice(coldIdx, 1);
  }

  // B. Purification (Purifying -> Toxic)
  // Purifying acts as a cleansing agent. It removes Toxic tags.
  // CRITICAL: We do NOT remove the 'Purifying' tag. It survives the reaction.
  const purifyingCount = processedTags.filter(t => t === 'Purifying').length;
  const toxicCount = processedTags.filter(t => t === 'Toxic').length;
  const poisonCancel = Math.min(purifyingCount, toxicCount);
  
  for (let i = 0; i < poisonCancel; i++) {
    const toxicIndex = processedTags.indexOf('Toxic');
    if (toxicIndex !== -1) processedTags.splice(toxicIndex, 1);
  }

  // C. State Checks
  const isToxic = processedTags.includes('Toxic');
  const arcaneCount = processedTags.filter(t => t === 'Arcane').length;
  const isUnstable = arcaneCount >= 3;

  return { tags: processedTags, isToxic, isUnstable };
};

export const calculateOutcome = (selectedIngredients, customer, upgrades = {}, apprentice = null) => {
  const combination = tagCombination(selectedIngredients);
  const { tags, isToxic, isUnstable } = combination;
  const requiredTags = customer.symptom.requiredTags;
  const customerClass = customer.class;

  // 1. FAILURE: VOID EXPLOSION
  if (isUnstable) {
    let repLoss = -5;
    let narrative = `The air screams as a Void Rift tears open! It swallows the potion (and the customer's eyebrows).`;
    if (upgrades.reinforced) {
      repLoss = -2;
      narrative = `A Void Rift opens! But your Reinforced Cauldron contains the anomaly.`;
    }
    return { result: 'exploded', goldReward: 0, reputationChange: repLoss, narrative };
  }

  // 2. FAILURE: TOXICITY
  if (isToxic) {
    let repLoss = -10;
    let narrative = `The ${customerClass.name} takes one sip, turns green, and collapses. The City Watch has been notified.`;
    
    if (upgrades.antidoteStash) {
      repLoss = -2;
      narrative = `The brew was toxic! Thankfully, you administered an emergency antidote. They leave angry, but alive.`;
    } 
    else if (apprentice && apprentice.activeAbility?.type === 'security') {
      repLoss = -5;
      narrative = `The potion was poison! Your Bouncer rushed them to a healer, mitigating the scandal.`;
    }

    return { result: 'poisoned', goldReward: 0, reputationChange: repLoss, narrative };
  }

  // 3. SUCCESS CHECK
  const hasRequirements = requiredTags.every(req => tags.includes(req));

  if (hasRequirements) {
    // Masterpiece: Exact match, no junk, complex (2+ tags)
    const isMasterpiece = tags.length === requiredTags.length && tags.length >= 2;
    // Dark Side Effect: Using 'Dark' ingredients on non-cultists
    const hasDarkSideEffect = tags.includes('Dark') && customerClass.id !== 'cultist';

    let gold = customerClass.goldMultiplier ? Math.floor(15 * customerClass.goldMultiplier) : 15;
    let rep = 5;
    let narrative = `It works. The ${customerClass.name} feels better.`;

    if (hasDarkSideEffect) {
        gold = Math.floor(gold * 0.8);
        rep = -2;
        narrative = `You cured the ailment, but the ${customerClass.name} shivers uncontrollably. "It feels... wrong."`;
    } 
    else if (isMasterpiece) {
        gold = Math.floor(gold * 1.5);
        rep = 15;
        narrative = `A Masterpiece! The ${customerClass.name} is awestruck by the purity of the cure.`;
    }

    if (upgrades.marketing) gold = Math.floor(gold * 1.25);
    if (upgrades.merchant) gold += 5;

    return { result: 'cured', goldReward: gold, reputationChange: rep, narrative };
  }

  // 4. FAILURE: INEFFECTIVE
  return { 
    result: 'failed', 
    goldReward: 0, 
    reputationChange: -2, 
    narrative: `The potion does nothing. The ${customerClass.name} tastes it, frowns, and leaves.` 
  };
};