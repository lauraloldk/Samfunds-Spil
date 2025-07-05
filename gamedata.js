// Game data - bygninger, regler, og politik
const BUILDINGS = {
    road: {
        name: 'Vej',
        icon: '🛣️',
        cost: 100,
        staminaCost: 1,
        description: 'Grundlaget for andre bygninger - ingen andre bygninger kan bygges uden veje',
        effects: {
            happiness: 5,
            maintenance: 25
        },
        requiresRoad: false
    },
    house: {
        name: 'Lille Flække',
        icon: '🏠',
        cost: 500,
        staminaCost: 2,
        description: 'Giver plads til 12 borgere',
        effects: {
            population: 12,
            happiness: 2,
            maintenance: 50
        },
        requiresRoad: true
    },
    powerplant: {
        name: 'Kraftværk',
        icon: '⚡',
        cost: 2000,
        staminaCost: 3,
        description: 'Giver strøm til byen og øger max stamina med 10',
        effects: {
            power: 100,
            happiness: -5, // Forurening
            maintenance: 200,
            maxStamina: 10 // Øger max stamina
        },
        requiresRoad: true
    },
    hospital: {
        name: 'Hospital',
        icon: '🏥',
        cost: 3000,
        staminaCost: 4,
        description: 'Forbedrer borgernes sundhed',
        effects: {
            health: 50,
            happiness: 15,
            maintenance: 300
        },
        requiresRoad: true
    },
    school: {
        name: 'Skole',
        icon: '🏫',
        cost: 1500,
        staminaCost: 3,
        description: 'Giver uddannelse til borgerne',
        effects: {
            education: 30,
            happiness: 10,
            maintenance: 150
        },
        requiresRoad: true
    },
    town: {
        name: 'Flække',
        icon: '🏘️',
        cost: 1000,
        staminaCost: 3,
        description: 'En større bebyggelse der giver plads til 17 borgere og reducerer negative events med 10%',
        effects: {
            population: 17,
            happiness: 5,
            maintenance: 75,
            eventProtection: 0.1 // 10% reduktion i negative events
        },
        requiresRoad: true,
        tier: 2 // Kræver Tier 2 forskning
    }
};

// Samfunds regler og politikker (til senere udvidelse)
const POLICIES = {
    taxation: {
        name: 'Beskatning',
        levels: {
            low: { rate: 0.1, happiness: 10, income: 0.8 },
            medium: { rate: 0.15, happiness: 0, income: 1.0 },
            high: { rate: 0.25, happiness: -15, income: 1.5 }
        }
    },
    welfare: {
        name: 'Velfærd',
        levels: {
            none: { cost: 0, happiness: -10 },
            basic: { cost: 100, happiness: 5 },
            comprehensive: { cost: 300, happiness: 20 }
        }
    },
    environment: {
        name: 'Miljøpolitik',
        levels: {
            none: { cost: 0, happiness: -5 },
            moderate: { cost: 150, happiness: 5 },
            strict: { cost: 400, happiness: 15 }
        }
    }
};

// Kriser og begivenheder (til senere udvidelse)
const EVENTS = {
    natural_disaster: {
        name: 'Naturkatastrofe',
        probability: 0.05,
        effects: {
            money: -2000,
            happiness: -20,
            buildings_destroyed: 1
        }
    },
    economic_boom: {
        name: 'Økonomisk fremgang',
        probability: 0.1,
        effects: {
            money: 1500,
            happiness: 10
        }
    },
    population_growth: {
        name: 'Befolkningstilvækst',
        probability: 0.15,
        effects: {
            population: 50,
            happiness: 5
        }
    }
};

// Basis behov som borgerne skal have opfyldt
const CITIZEN_NEEDS = {
    roads: {
        name: 'Veje',
        critical: true,
        per_capita: 0.05 // 1 vej per 20 borgere
    },
    housing: {
        name: 'Bolig',
        critical: true,
        per_capita: 0.1 // 1 hus per 10 borgere
    },
    power: {
        name: 'Strøm',
        critical: true,
        per_capita: 1 // 1 strøm per borger
    },
    health: {
        name: 'Sundhed',
        critical: false,
        per_capita: 0.02 // 1 hospital per 50 borgere
    },
    education: {
        name: 'Uddannelse',
        critical: false,
        per_capita: 0.03 // 1 skole per 33 borgere
    }
};

// Funktion til at beregne samfunds score
function calculateSocietyScore(gameState) {
    let score = 0;
    
    // Basis score baseret på befolkning
    score += gameState.population * 0.1;
    
    // Bonus for tilfredshed
    score += gameState.happiness * 0.5;
    
    // Bonus for opfyldte behov
    const buildings = Object.values(gameState.buildings);
    const roadCount = buildings.filter(b => getBuildingType(b) === 'road').length;
    const houseCount = buildings.filter(b => getBuildingType(b) === 'house').length;
    const townCount = buildings.filter(b => getBuildingType(b) === 'town').length;
    const powerplantCount = buildings.filter(b => getBuildingType(b) === 'powerplant').length;
    const hospitalCount = buildings.filter(b => getBuildingType(b) === 'hospital').length;
    const schoolCount = buildings.filter(b => getBuildingType(b) === 'school').length;
    
    // Tjek om grundlæggende behov er opfyldt
    if (roadCount >= gameState.population * CITIZEN_NEEDS.roads.per_capita) {
        score += 30;
    }
    const totalHousingCapacity = (houseCount * 12) + (townCount * 17);
    if (totalHousingCapacity >= gameState.population * CITIZEN_NEEDS.housing.per_capita) {
        score += 50;
    }
    if (powerplantCount > 0) {
        score += 30;
    }
    if (hospitalCount > 0) {
        score += 25;
    }
    if (schoolCount > 0) {
        score += 20;
    }
    
    // Bonus for avancerede bygninger
    if (townCount > 0) {
        score += townCount * 15; // 15 point per Flække
    }
    
    return Math.round(score);
}

// Eksporter til global scope
window.BUILDINGS = BUILDINGS;
window.POLICIES = POLICIES;
window.EVENTS = EVENTS;
window.CITIZEN_NEEDS = CITIZEN_NEEDS;
window.calculateSocietyScore = calculateSocietyScore;
