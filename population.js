// Population Logic - Befolknings-system med events og dynamik
console.log('Loading population.js...');

class PopulationManager {
    constructor() {
        this.populationHistory = [];
        this.activeEvents = [];
        this.eventCooldowns = {};
        this.satisfactionFactors = {
            housing: 0,
            power: 0,
            health: 0,
            education: 0,
            roads: 0
        };
    }

    // Beregn befolknings-vækst baseret på forskellige faktorer
    calculatePopulationGrowth() {
        if (!window.gameState) return 0;

        const currentPop = window.gameState.population;
        let growthRate = 0;

        // Basis vækstrate baseret på tilfredshed
        const happiness = window.gameState.happiness;
        if (happiness >= 80) {
            growthRate = 0.05; // 5% vækst
        } else if (happiness >= 60) {
            growthRate = 0.02; // 2% vækst
        } else if (happiness >= 40) {
            growthRate = 0; // Ingen vækst
        } else {
            growthRate = -0.03; // 3% fald
        }

        // Modifikationer baseret på bygninger
        const buildings = Object.values(window.gameState.buildings);
        const hospitalCount = buildings.filter(b => b === 'hospital').length;
        const schoolCount = buildings.filter(b => b === 'school').length;
        const houseCount = buildings.filter(b => b === 'house').length;

        // Hospitaler forbedrer vækst
        growthRate += hospitalCount * 0.01;

        // Skoler tiltrækker familier
        growthRate += schoolCount * 0.008;

        // Begræns vækst hvis der ikke er nok boliger
        const maxPopulation = houseCount * 12; // 12 per hus
        if (currentPop >= maxPopulation * 0.9) {
            growthRate *= 0.3; // Reduceret vækst når tæt på kapacitet
        }

        // Beregn faktisk vækst
        const growth = Math.floor(currentPop * growthRate);
        return Math.max(-Math.floor(currentPop * 0.1), growth); // Max 10% fald per år
    }

    // Opdater befolknings-tilfredshed baseret på faciliteter
    updateSatisfactionFactors() {
        if (!window.gameState) return;

        const buildings = Object.values(window.gameState.buildings);
        const population = window.gameState.population;

        // Beregn dækning for hver kategori
        const roadCount = buildings.filter(b => b === 'road').length;
        const houseCount = buildings.filter(b => b === 'house').length;
        const powerplantCount = buildings.filter(b => b === 'powerplant').length;
        const hospitalCount = buildings.filter(b => b === 'hospital').length;
        const schoolCount = buildings.filter(b => b === 'school').length;

        // Veje (1 vej per 20 borgere)
        this.satisfactionFactors.roads = Math.min(100, (roadCount * 20 / Math.max(1, population)) * 100);

        // Boliger (direkte kapacitet)
        this.satisfactionFactors.housing = Math.min(100, (houseCount * 12 / Math.max(1, population)) * 100);

        // Strøm (1 kraftværk per 100 borgere)
        this.satisfactionFactors.power = Math.min(100, (powerplantCount * 100 / Math.max(1, population)) * 100);

        // Sundhed (1 hospital per 50 borgere)
        this.satisfactionFactors.health = Math.min(100, (hospitalCount * 50 / Math.max(1, population)) * 100);

        // Uddannelse (1 skole per 30 borgere)
        this.satisfactionFactors.education = Math.min(100, (schoolCount * 30 / Math.max(1, population)) * 100);
    }

    // Beregn samlet tilfredshed baseret på faciliteter
    calculateOverallHappiness() {
        this.updateSatisfactionFactors();

        const factors = this.satisfactionFactors;
        let totalHappiness = 0;

        // Vægtede faktorer
        totalHappiness += factors.housing * 0.3; // Boliger er vigtigst
        totalHappiness += factors.roads * 0.2;   // Veje er grundlæggende
        totalHappiness += factors.power * 0.2;   // Strøm er vigtigt
        totalHappiness += factors.health * 0.15; // Sundhed
        totalHappiness += factors.education * 0.15; // Uddannelse

        // Tilføj bonus for balance (alle faktorer over 50%)
        const balanceBonus = Object.values(factors).every(f => f >= 50) ? 10 : 0;
        totalHappiness += balanceBonus;

        return Math.max(0, Math.min(100, Math.round(totalHappiness)));
    }

    // Tjek for befolknings-events
    checkForEvents() {
        if (!window.gameState) return;

        const year = window.gameState.year;
        const population = window.gameState.population;
        const happiness = window.gameState.happiness;

        // Event: Baby Boom (høj tilfredshed)
        if (happiness >= 85 && population >= 50 && !this.eventCooldowns.babyBoom) {
            this.triggerEvent('babyBoom');
        }

        // Event: Migration (middel tilfredshed, gode faciliteter)
        if (happiness >= 70 && this.satisfactionFactors.education >= 60 && !this.eventCooldowns.migration) {
            this.triggerEvent('migration');
        }

        // Event: Economic Boom (mange borgere, gode faciliteter)
        if (population >= 100 && happiness >= 75 && !this.eventCooldowns.economicBoom) {
            this.triggerEvent('economicBoom');
        }

        // Event: Population Crisis (lav tilfredshed)
        if (happiness <= 30 && population >= 20 && !this.eventCooldowns.populationCrisis) {
            this.triggerEvent('populationCrisis');
        }

        // Event: Infrastructure Strain (for mange borgere, for få faciliteter)
        if (population >= 60 && this.satisfactionFactors.roads < 30 && !this.eventCooldowns.infrastructureStrain) {
            this.triggerEvent('infrastructureStrain');
        }
    }

    // Udløs et specifikt event
    triggerEvent(eventType) {
        const events = {
            babyBoom: {
                name: 'Baby Boom! 👶',
                description: 'Høj tilfredshed har ført til en baby boom!',
                effects: {
                    population: Math.floor(window.gameState.population * 0.15),
                    happiness: 5
                },
                duration: 1,
                cooldown: 10
            },
            migration: {
                name: 'Indvandring 🏃‍♂️',
                description: 'Gode uddannelsesfaciliteter tiltrækker nye borgere!',
                effects: {
                    population: Math.floor(10 + Math.random() * 15),
                    money: 500
                },
                duration: 1,
                cooldown: 8
            },
            economicBoom: {
                name: 'Økonomisk Boom 💰',
                description: 'En blomstrende by tiltrækker investeringer!',
                effects: {
                    money: Math.floor(window.gameState.population * 25),
                    happiness: 10
                },
                duration: 2,
                cooldown: 15
            },
            populationCrisis: {
                name: 'Befolkningskrise 📉',
                description: 'Lav tilfredshed får borgere til at flytte væk!',
                effects: {
                    population: -Math.floor(window.gameState.population * 0.2),
                    happiness: -5
                },
                duration: 1,
                cooldown: 12
            },
            infrastructureStrain: {
                name: 'Infrastruktur Overbelastning 🚧',
                description: 'For mange borgere, for få veje skaber problemer!',
                effects: {
                    happiness: -15,
                    money: -Math.floor(window.gameState.population * 5)
                },
                duration: 2,
                cooldown: 8
            }
        };

        const event = events[eventType];
        if (!event) return;

        // Anvend event-effekter
        if (event.effects.population) {
            window.gameState.population += event.effects.population;
            window.gameState.population = Math.max(0, window.gameState.population);
        }

        if (event.effects.money) {
            window.gameState.money += event.effects.money;
            window.gameState.money = Math.max(0, window.gameState.money);
        }

        if (event.effects.happiness) {
            window.gameState.happiness += event.effects.happiness;
            window.gameState.happiness = Math.max(0, Math.min(100, window.gameState.happiness));
        }

        // Tilføj til aktive events
        this.activeEvents.push({
            type: eventType,
            name: event.name,
            description: event.description,
            remainingDuration: event.duration
        });

        // Sæt cooldown
        this.eventCooldowns[eventType] = event.cooldown;

        // Vis besked til spilleren
        this.showEventNotification(event);
    }

    // Vis event-notification
    showEventNotification(event) {
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `
            <div class="event-content">
                <h4>${event.name}</h4>
                <p>${event.description}</p>
                <div class="event-effects">
                    ${event.effects.population ? `👥 Befolkning: ${event.effects.population > 0 ? '+' : ''}${event.effects.population}` : ''}
                    ${event.effects.money ? `💰 Penge: ${event.effects.money > 0 ? '+' : ''}${event.effects.money} kr` : ''}
                    ${event.effects.happiness ? `😊 Tilfredshed: ${event.effects.happiness > 0 ? '+' : ''}${event.effects.happiness}%` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Fjern efter 5 sekunder
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Opdater events (kaldes hvert år)
    updateEvents() {
        // Reducer cooldowns
        Object.keys(this.eventCooldowns).forEach(eventType => {
            if (this.eventCooldowns[eventType] > 0) {
                this.eventCooldowns[eventType]--;
            } else {
                delete this.eventCooldowns[eventType];
            }
        });

        // Opdater aktive events
        this.activeEvents = this.activeEvents.filter(event => {
            event.remainingDuration--;
            return event.remainingDuration > 0;
        });

        // Tjek for nye events
        this.checkForEvents();
    }

    // Proces befolknings-ændringer (kaldes hvert år)
    processPopulationTurn() {
        // Gem nuværende stats
        this.populationHistory.push({
            year: window.gameState.year,
            population: window.gameState.population,
            happiness: window.gameState.happiness,
            satisfactionFactors: { ...this.satisfactionFactors }
        });

        // Behold kun de sidste 20 år
        if (this.populationHistory.length > 20) {
            this.populationHistory.shift();
        }

        // Beregn og anvend befolkningsvækst
        const growth = this.calculatePopulationGrowth();
        if (growth !== 0) {
            window.gameState.population += growth;
            window.gameState.population = Math.max(0, window.gameState.population);
        }

        // Opdater tilfredshed baseret på faciliteter
        const newHappiness = this.calculateOverallHappiness();
        window.gameState.happiness = newHappiness;

        // Opdater events
        this.updateEvents();

        return {
            populationGrowth: growth,
            newHappiness: newHappiness,
            satisfactionFactors: this.satisfactionFactors
        };
    }

    // Få population statistikker
    getPopulationStats() {
        return {
            currentPopulation: window.gameState.population,
            happiness: window.gameState.happiness,
            satisfactionFactors: this.satisfactionFactors,
            activeEvents: this.activeEvents,
            history: this.populationHistory.slice(-10) // Sidste 10 år
        };
    }

    // Reset population system
    reset() {
        this.populationHistory = [];
        this.activeEvents = [];
        this.eventCooldowns = {};
        this.satisfactionFactors = {
            housing: 0,
            power: 0,
            health: 0,
            education: 0,
            roads: 0
        };
    }
}

// CSS til event notifications
const populationCSS = `
    .event-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideInEvent 0.5s ease-out;
        max-width: 300px;
        border-left: 4px solid #fff;
    }

    .event-notification h4 {
        margin: 0 0 8px 0;
        font-size: 1.1em;
    }

    .event-notification p {
        margin: 0 0 10px 0;
        font-size: 0.9em;
        line-height: 1.3;
    }

    .event-effects {
        font-size: 0.8em;
        background: rgba(255,255,255,0.2);
        padding: 5px 8px;
        border-radius: 5px;
    }

    @keyframes slideInEvent {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .population-details {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
        border-left: 4px solid #3498db;
    }

    .satisfaction-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
        margin-top: 10px;
    }

    .satisfaction-item {
        text-align: center;
        padding: 10px;
        background: white;
        border-radius: 5px;
        border: 1px solid #e9ecef;
    }

    .satisfaction-value {
        font-size: 1.2em;
        font-weight: bold;
        margin-top: 5px;
    }

    .satisfaction-good { color: #27ae60; }
    .satisfaction-medium { color: #f39c12; }
    .satisfaction-bad { color: #e74c3c; }
`;

// Tilføj CSS til head
const populationStyleSheet = document.createElement('style');
populationStyleSheet.textContent = populationCSS;
document.head.appendChild(populationStyleSheet);

// Initialiser population manager
const populationManager = new PopulationManager();

// Eksporter til global scope
window.populationManager = populationManager;
window.PopulationManager = PopulationManager;

console.log('Population system loaded successfully');
