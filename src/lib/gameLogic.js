import { 
  Crown, Hand, Shield, Skull, ShieldCheck, Wind, Coins, FlaskConical, 
  Music, Sword, Book, Hammer 
} from 'lucide-react';

export const CUSTOMER_CLASSES = [
  // --- ORIGINAL ---
  {
    id: 'noble',
    name: 'Noble',
    icon: Crown,
    goldMultiplier: 2.5, // Buffed: They should pay huge
    reputationFailMultiplier: -2,
    reputationSuccessMultiplier: 1.5,
    description: 'Wealthy and demanding'
  },
  {
    id: 'beggar',
    name: 'Beggar',
    icon: Hand,
    goldMultiplier: 0,
    reputationFailMultiplier: -0.5, // Buffed: Less penalty for failing the poor
    reputationSuccessMultiplier: 3.5, // Buffed: Huge rep boost
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
    reputationFailMultiplier: -2, // Nerfed: Failing a cultist is dangerous
    reputationSuccessMultiplier: 0.5, // Nerfed: No one likes you for helping them
    description: 'Pays in dark secrets',
    specialReward: 'Dark Secret'
  },

  // --- NEW ADDITIONS ---
  {
    id: 'merchant',
    name: 'Merchant',
    icon: Coins,
    goldMultiplier: 3.0, // The "Whale"
    reputationFailMultiplier: -0.5, // They don't care, it's just business
    reputationSuccessMultiplier: 0.5, // Transactional relationship
    description: 'Resells for profit'
  },
  {
    id: 'bard',
    name: 'Bard',
    icon: Music, // Make sure to import 'Music'
    goldMultiplier: 0.8,
    reputationFailMultiplier: -4.0, // HIGH RISK: They write a bad song about you
    reputationSuccessMultiplier: 5.0, // HIGH REWARD: They make you famous
    description: 'Influencer of the realm'
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    icon: Sword, // Make sure to import 'Sword'
    goldMultiplier: 1.4,
    reputationFailMultiplier: -1.2,
    reputationSuccessMultiplier: 1.2,
    description: 'Needs potions for the dungeon'
  },
  {
    id: 'scholar',
    name: 'Scholar',
    icon: Book, // Make sure to import 'Book'
    goldMultiplier: 1.0,
    reputationFailMultiplier: -0.2, // Low Risk: They just write a stern letter
    reputationSuccessMultiplier: 2.0, // Academic validation
    description: 'Studying alchemical theory'
  },
  {
    id: 'rival',
    name: 'Rival Alchemist',
    icon: FlaskConical,
    goldMultiplier: 1.1,
    reputationFailMultiplier: -3.0, // They will mock you relentlessly
    reputationSuccessMultiplier: 2.5, // Earn their respect
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

// --- 3. THE LOGIC MAP (Problem -> Required Tags) ---
// This ensures that no matter what text is generated, the game knows exactly what tags solve it.
const SENSATIONS_MAP = [
  // --- TIER 1: ELEMENTAL (Basic Hot/Cold/Purify) ---
  { text: 'burns with an unholy fire', tags: ['Cooling', 'Holy'] },
  { text: 'is scorching from the inside out', tags: ['Cooling', 'Calming'] },
  { text: 'feels like molten slag', tags: ['Cooling', 'Heavy'] },
  { text: 'feels like solid ice', tags: ['Hot', 'Vital'] },
  { text: 'shivers with a grave chill', tags: ['Hot', 'Holy'] },
  { text: 'has frozen stiff', tags: ['Hot', 'Calming'] },
  { text: 'oozes a foul sludge', tags: ['Purifying', 'Desiccated'] }, // Needs drying!

  // --- TIER 2: PHYSICAL (Heavy/Vital/Calming) ---
  { text: 'feels heavy as lead', tags: ['Purifying', 'Luminous'] }, // Lighten the load
  { text: 'is turning to dust', tags: ['Heavy', 'Vital'] },
  { text: 'vibrates uncontrollably', tags: ['Calming', 'Heavy'] },
  { text: 'feels thin and stretched', tags: ['Heavy', 'Vital'] },
  { text: 'is petrifying into stone', tags: ['Hot', 'Vital'] },

  // --- TIER 3: ETHEREAL (Holy/Arcane/Shadow) ---
  { text: 'is clouded by dark shadows', tags: ['Luminous', 'Holy'] }, // Needs Light
  { text: 'hears the call of the void', tags: ['Arcane', 'Calming'] }, // Needs Magic to fight Void
  { text: 'is fading from existence', tags: ['Arcane', 'Heavy'] }, // Anchor them back
  { text: 'feels disconnected from reality', tags: ['Arcane', 'Vital'] },
  { text: 'is possessed by a weak spirit', tags: ['Holy', 'Arcane'] },

  // --- TIER 4: COMPLEX (The New Stuff) ---
  { text: 'is drowning in dry air', tags: ['Vital', 'Cooling'] }, 
  { text: 'glows with a sickening light', tags: ['Shadow', 'Purifying'] }, // Needs Shadow to dim it (Future tag?)
  { text: 'has forgotten how to beat', tags: ['Vital', 'Arcane'] }, // Magical Heart restart
  { text: 'is weeping blood', tags: ['Desiccated', 'Calming'] } // Dry the tears
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
  // RISK ITEMS
  { 
    name: 'Mercury', 
    tags: ['Toxic', 'Heavy'], 
    icon: '☿',
    // Crushing Mercury creates dangerous fumes (Good for combat/high risk)
    processed: { name: 'Quicksilver Fumes', tags: ['Toxic', 'Explosive'], icon: '☁' }
  },
  { 
    name: 'Nightshade', 
    tags: ['Toxic', 'Dark'], 
    icon: '🥀',
    // Crushing extracts the sedative properties
    processed: { name: 'Nightshade Dust', tags: ['Toxic', 'Calming'], icon: '✨' }
  },

  // SAFE BASES
  { 
    name: 'Salt', 
    tags: ['Purifying', 'Crystalline'], 
    icon: '⚬',
    // Grinding salt makes it "Holy" (Classic trope)
    processed: { name: 'Fine Salt', tags: ['Purifying', 'Holy'], icon: '⚪' }
  },
  { 
    name: 'Sage', 
    tags: ['Purifying', 'Calming'], 
    icon: '🌿',
    // Crushing releases life force
    processed: { name: 'Sage Powder', tags: ['Purifying', 'Vital'], icon: '🍃' }
  },
  { 
    name: 'Moonstone', 
    tags: ['Cooling', 'Holy'], 
    icon: '☽',
    // Crushing it makes it crystalline powder
    processed: { name: 'Moon Dust', tags: ['Crystalline', 'Cooling'], icon: '❄' }
  },

  // UTILITY
  { 
    name: 'Sulfur', 
    tags: ['Hot', 'Vital'], 
    icon: '🜍',
    // Brimstone is highly explosive
    processed: { name: 'Brimstone Ash', tags: ['Hot', 'Explosive'], icon: '🌋' }
  },
  { 
    name: 'Bloodroot', 
    tags: ['Vital', 'Purifying'], 
    icon: '⚕',
    // Paste becomes toxic (The dose makes the poison)
    processed: { name: 'Red Paste', tags: ['Vital', 'Toxic'], icon: '🩸' }
  },
  { 
    name: 'Copper', 
    tags: ['Hot', 'Heavy'], 
    icon: '⚙',
    // Filings become sharp/crystalline
    processed: { name: 'Copper Filings', tags: ['Hot', 'Crystalline'], icon: '⛓' }
  }
  // Add these to your INGREDIENTS constant
{
    name: 'Ghost Pepper',
    icon: '🌶️', // Or a ghostly SVG
    tags: ['Hot', 'Arcane'], // Magical Heat
    description: 'Burns across dimensions.',
    processed: { name: 'Spirit Dust', tags: ['Arcane', 'Purifying'] } // Crushing removes heat, keeps magic
},
{
    name: 'Sun-Bleached Skull',
    icon: '💀',
    tags: ['Desiccated', 'Holy'], // Dry + Holy
    description: 'Bone that has stared into the sun too long.',
    processed: { name: 'Bone Meal', tags: ['Desiccated', 'Heavy'] } // Crushing makes it heavy powder
},
{
    name: 'Bioluminescent Moss',
    icon: '🌿',
    tags: ['Luminous', 'Vital'], // Light + Life
    description: 'Glows with a heartbeat.',
    processed: { name: 'Glowing Paste', tags: ['Luminous', 'Cooling'] }
}
];

let customerIdCounter = 0;

// --- 2. GENERATOR LOGIC ---

export const generateCustomer = () => {
  // 1. Pick Class
  const roll = Math.random();
  const customerClass = CUSTOMER_CLASSES.find(c => roll < c.prob) || CUSTOMER_CLASSES[0];

  // 2. Pick Scenario (Mechanic)
  const scenario = SENSATIONS_MAP[Math.floor(Math.random() * SENSATIONS_MAP.length)];

  // 3. Pick Body Part (Flavor) based on Category
  const validParts = LOCATIONS[scenario.category] || LOCATIONS.physical;
  const part = validParts[Math.floor(Math.random() * validParts.length)];

  return {
    id: ++customerIdCounter,
    class: customerClass,
    symptom: {
      text: `My ${part} ${scenario.text}...`,
      requiredTags: scenario.tags
    }
  };
};

// --- 3. ALCHEMY ENGINE (Tag Processing) ---

export const tagCombination = (ingredients) => {
  const allTags = [];
  
  // Flatten tags
  ingredients.forEach(ing => allTags.push(...ing.tags));

  let processedTags = [...allTags];

  // REACTION A: Thermodynamics (Hot cancels Cooling)
  const hotCount = processedTags.filter(t => t === 'Hot').length;
  const coldCount = processedTags.filter(t => t === 'Cooling').length;
  const tempCancel = Math.min(hotCount, coldCount);

  for (let i = 0; i < tempCancel; i++) {
    processedTags.splice(processedTags.indexOf('Hot'), 1);
    processedTags.splice(processedTags.indexOf('Cooling'), 1);
  }

  // REACTION B: Purification (Purifying removes Toxic)
  // *New Feature*: You can now use Toxic ingredients safely IF you add Purifying ones!
  const purifyingCount = processedTags.filter(t => t === 'Purifying').length;
  const toxicCount = processedTags.filter(t => t === 'Toxic').length;
  const poisonCancel = Math.min(purifyingCount, toxicCount);

  for (let i = 0; i < poisonCancel; i++) {
    // Note: We typically don't remove the 'Purifying' tag because it might be needed for the cure.
    // We ONLY remove the Toxic tag.
    const toxicIndex = processedTags.indexOf('Toxic');
    if (toxicIndex !== -1) processedTags.splice(toxicIndex, 1);
  }

  // CHECK STATES
  
  // 1. POISONOUS: Any remaining Toxic tags?
  const isToxic = processedTags.includes('Toxic');
  
  // 2. UNSTABLE: Too much Arcane energy? (3+ Arcane tags causes Reality Break)
  const arcaneCount = processedTags.filter(t => t === 'Arcane').length;
  const isUnstable = arcaneCount >= 3;

  return {
    tags: processedTags,
    isToxic,
    isUnstable
  };
};
export const calculateOutcome = (selectedIngredients, customer, upgrades = {}, apprentice = null) => {
  // 1. RUN THE ALCHEMY ENGINE
  // This processes the tags (cancels hot/cold, cures poison, checks void stability)
  const combination = tagCombination(selectedIngredients);
  const { tags, isToxic, isUnstable } = combination;
  
  const requiredTags = customer.symptom.requiredTags;
  const customerClass = customer.class;

  // --- FAIL STATE A: REALITY BREAK (Void/Arcane Overload) ---
  if (isUnstable) {
    let repLoss = -15;
    let narrative = `The air screams as a Void Rift tears open! It swallows the potion (and the customer's eyebrows).`;

    // Upgrade: Void Anchor (Hypothetical future upgrade) or Reinforced Cauldron
    if (upgrades.reinforced) {
      repLoss = -5;
      narrative = `A Void Rift opens! But your Reinforced Cauldron contains the anomaly before it spreads.`;
    }

    return {
      result: 'exploded', // Visual: Purple explosion
      goldReward: 0,
      reputationChange: repLoss,
      narrative
    };
  }

  // --- FAIL STATE B: TOXICITY (Poisoned) ---
  if (isToxic) {
    let repLoss = -20;
    let narrative = `The ${customerClass.name} takes one sip, turns green, and collapses. The City Watch has been notified.`;

    // Upgrade: Antidote Stash (Saves the day)
    if (upgrades.antidoteStash) {
      repLoss = -5;
      narrative = `The brew was toxic! Thankfully, you administered an emergency antidote. The ${customerClass.name} leaves angry, but alive.`;
    }
    // Apprentice: Bouncer (Reduces penalty)
    else if (apprentice && apprentice.activeAbility?.type === 'security') {
        repLoss = -10;
        narrative = `The potion was poison! Your Apprentice rushed the ${customerClass.name} to a healer, mitigating the scandal.`;
    }

    return {
      result: 'poisoned', // Visual: Green smoke
      goldReward: 0,
      reputationChange: repLoss,
      narrative
    };
  }

  // --- CHECK SUCCESS CRITERIA ---
  const hasRequirements = requiredTags.every(req => tags.includes(req));

  // --- SUCCESS STATES ---
  if (hasRequirements) {
    
    // 1. MASTERPIECE CHECK (Efficiency)
    // A Masterpiece has EXACTLY the required tags (length match), or is a complex 3-tag cure.
    const isMasterpiece = tags.length === requiredTags.length && tags.length >= 2;
    
    // 2. SIDE EFFECT CHECK (Darkness)
    // Dark ingredients work, but unsettle normal people. Cultists love them.
    const hasDarkSideEffect = tags.includes('Dark') && customerClass.id !== 'cultist';

    // Base Rewards
    let gold = customerClass.baseGold || 15;
    let rep = 5;
    let narrative = '';

    // -- SCENARIO CALCULATION --

    if (hasDarkSideEffect) {
        // Cured, but creepy
        gold = Math.floor(gold * 0.8); // They pay less
        rep = -2; // Reputation HIT even though cured
        narrative = `You cured the ailment, but the ${customerClass.name} shivers uncontrollably. "It feels... wrong."`;
    } 
    else if (isMasterpiece) {
        // Flawless Victory
        gold = Math.floor(gold * 1.5);
        rep = 15;
        
        // Custom Class Dialogue
        switch(customerClass.id) {
            case 'noble': narrative = `A Flawless Brew! The Noble tosses a heavy purse. "Finally, a competent alchemist!"`; break;
            case 'guard': narrative = `Perfect. The Guard salutes you. "This... this is better than standard issue."`; break;
            case 'cultist': narrative = `Sublime. The Cultist whispers, "The Void smiles upon your precision."`; break;
            default: narrative = `A Masterpiece! The ${customerClass.name} is awestruck by the purity of the cure.`;
        }
    } 
    else {
        // Standard Success (Sloppy but works)
        // e.g. You needed "Hot" but you gave them "Hot, Heavy, Smelly"
        rep = 5;
        narrative = `It works. The ${customerClass.name} feels better, though the taste was questionable.`;
    }

    // -- APPLY UPGRADES --
    if (upgrades.marketing) gold = Math.floor(gold * 1.25);
    if (upgrades.merchant) gold += 5;

    return {
      result: 'cured', // Visual: Gold particles
      goldReward: gold,
      reputationChange: rep,
      narrative
    };
  }

  // --- FAIL STATE C: INEFFECTIVE (Wrong Tags) ---
  return {
    result: 'failed', // Visual: Grey puff
    goldReward: 0,
    reputationChange: -2,
    narrative: `The potion does nothing. The ${customerClass.name} stares at you awkwardly. "Is this just murky water?"`
  };
};