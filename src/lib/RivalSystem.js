// src/lib/RivalSystem.js

const NAMES = ['Vex', 'Gorlag', 'Silas', 'Mina', 'Zephyr', 'Kael', 'Oren', 'Nyx'];
const TITLES = ['the Pious', 'the Butcher', 'the Pure', 'the Snake', 'of the Void', 'Gold-Tooth'];

const CLASSES = [
    { id: 'purist', name: 'Purist', focus: 'Holy', weakness: 'Dark' },
    { id: 'toxin_master', name: 'Toxin Master', focus: 'Toxic', weakness: 'Purifying' },
    { id: 'pyro', name: 'Pyromancer', focus: 'Hot', weakness: 'Cooling' }
];

const QUIRKS = [
    { id: 'paranoic', name: 'Paranoid', desc: 'Harder to spy on (+20% Mission Risk).', effect: (stats) => ({ ...stats, defense: stats.defense + 0.2 }) },
    { id: 'connected', name: 'Connected', desc: 'Raises your Heat twice as fast.', effect: (stats) => ({ ...stats, aggression: stats.aggression * 1.5 }) },
    { id: 'rich', name: 'Old Money', desc: 'Steals 20% more customers.', effect: (stats) => ({ ...stats, greed: stats.greed + 20 }) }
];

export const generateRival = (dayDifficulty) => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const title = TITLES[Math.floor(Math.random() * TITLES.length)];
    const archetype = CLASSES[Math.floor(Math.random() * CLASSES.length)];
    const quirk = QUIRKS[Math.floor(Math.random() * QUIRKS.length)];

    return {
        id: `rival_${Date.now()}`,
        name: `${name} ${title}`,
        archetype: archetype,
        quirk: quirk,
        level: 1,
        // Stats (0.0 to 1.0)
        marketShare: 0.1, // They currently own 10% of the city's business
        defense: 0.2 + (dayDifficulty * 0.05), // Resistance to your Spy
        aggression: 0.3, // Chance to attack you at night
        status: 'active', // active, injured, defeated
        avatarSeed: name + title // For DiceBear
    };
};

export const resolveRivalAction = (rival, playerStats) => {
    if (rival.status !== 'active') return null;

    const roll = Math.random();
    let action = null;

    // 1. Market Pressure (Always happens)
    const goldStolen = Math.floor(playerStats.gold * (rival.marketShare * 0.5)); // They skim off the top

    // 2. Aggressive Action (Chance based on aggression)
    if (roll < rival.aggression) {
        const attackType = Math.random();
        if (attackType > 0.5) {
            action = { type: 'slander', desc: 'Spread rumors about your hygiene.', effect: { heat: 15, rep: -5 } };
        } else {
            action = { type: 'buyout', desc: 'Bought out the local Sage supply.', effect: { ingredient: 'Sage', qty: -2 } };
        }
    }

    return {
        goldLoss: goldStolen,
        specialAction: action
    };
};

export const RIVAL_ENCOUNTERS = [
  {
    id: 'shakedown',
    title: 'The Shakedown',
    text: (rival) => `${rival.name} corners you in the alley. "This is my turf, alchemist. Pay the tax or bleed."`,
    options: [
      { 
        label: 'Pay Gold', 
        cost: '50g', 
        type: 'safe', 
        result: { text: 'You pay up. They laugh and walk away.', effect: { gold: -50 } } 
      },
      { 
        label: 'Intimidate', 
        req: 'Rep > 30', 
        type: 'risky', 
        risk: 0.4, 
        success: { text: 'You remind them who you are. They back off.', effect: { rep: 5 } },
        fail: { text: 'They aren\'t impressed and break your nose.', effect: { gold: -20, days: -1 } } // days -1 = injured
      },
      { 
        label: 'Throw Poison', 
        cost: '1x Toxic', 
        type: 'aggressive',
        result: { text: 'You blind them with a toxic cloud! They scream.', effect: { rivalHealth: -1, heat: 10 } } 
      }
    ]
  },
  {
    id: 'debate',
    title: 'Public Accusation',
    text: (rival) => `${rival.name} is shouting in the town square. "This fraud sells snake oil! Their potions are poison!"`,
    options: [
      { 
        label: 'Ignore', 
        cost: '-10 Rep', 
        type: 'safe', 
        result: { text: 'You walk away, but the crowd believes them.', effect: { rep: -10 } } 
      },
      { 
        label: 'Debate', 
        req: 'Int > Avg', 
        type: 'risky', 
        risk: 0.5, 
        success: { text: 'You scientifically dismantle their argument. The crowd cheers!', effect: { rep: 20 } },
        fail: { text: 'You stutter. The crowd boos.', effect: { rep: -20 } }
      },
      { 
        label: 'Bribe Crowd', 
        cost: '30g', 
        type: 'safe',
        result: { text: 'A few coins makes the crowd love you again.', effect: { gold: -30, rep: 5 } } 
      }
    ]
  }
];

