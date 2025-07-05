// Event System - Tilfældige events der sker hvert år
console.log('Loading events.js...');

class EventManager {
    constructor() {
        this.eventHistory = [];
        this.availableEvents = {};
        this.activeEvents = [];
        this.eventCooldowns = {};
        
        this.initializeEvents();
    }
    
    // Initialiser alle events
    initializeEvents() {
        // Tier 0 events - ingen events kan ske
        this.availableEvents.tier0 = [];
        
        // Tier 1 events - fødsler og dødsfald
        this.availableEvents.tier1 = [
            {
                id: 'births',
                name: 'Baby Boom 👶',
                description: 'En masse babyer er blevet født i byen!',
                type: 'positive',
                weight: 30, // Højere chance
                cooldown: 3,
                requirements: {
                    minPopulation: 20,
                    minHappiness: 50
                },
                effects: {
                    population: () => Math.floor(Math.random() * 15) + 5, // 5-20 nye borgere
                    happiness: () => Math.floor(Math.random() * 5) + 3, // 3-8 happiness
                    message: (effects) => `${effects.population} babyer er blevet født! Befolkningen er glad.`
                }
            },
            {
                id: 'deaths',
                name: 'Naturlige Dødsfald ⚰️',
                description: 'Nogle ældre borgere er gået bort på grund af alderdom.',
                type: 'negative',
                weight: 20,
                cooldown: 4,
                requirements: {
                    minPopulation: 30
                },
                effects: {
                    population: () => -(Math.floor(Math.random() * 8) + 2), // -2 til -10 borgere
                    happiness: () => -(Math.floor(Math.random() * 3) + 1), // -1 til -4 happiness
                    message: (effects) => `${Math.abs(effects.population)} borgere er gået bort af naturlige årsager. Byen sørger.`
                }
            },
            {
                id: 'epidemic',
                name: 'Mindre Epidemi 🦠',
                description: 'En mindre sygdom har ramt byen.',
                type: 'negative',
                weight: 15,
                cooldown: 8,
                requirements: {
                    minPopulation: 50,
                    maxHospitals: 1 // Kan ikke ske hvis der er mange hospitaler
                },
                effects: {
                    population: () => -(Math.floor(Math.random() * 12) + 3), // -3 til -15 borgere
                    happiness: () => -(Math.floor(Math.random() * 10) + 5), // -5 til -15 happiness
                    message: (effects) => `En epidemi har ramt byen! ${Math.abs(effects.population)} borgere er blevet syge.`
                }
            },
            {
                id: 'festival',
                name: 'Byfestival 🎉',
                description: 'En stor festival har bragt glæde til borgerne!',
                type: 'positive',
                weight: 25,
                cooldown: 5,
                requirements: {
                    minPopulation: 40,
                    minHappiness: 60
                },
                effects: {
                    happiness: () => Math.floor(Math.random() * 15) + 10, // 10-25 happiness
                    money: () => Math.floor(Math.random() * 2000) + 500, // 500-2500 kr fra turisme
                    message: (effects) => `Byfestivalen var en stor succes! Turisme indtægt: ${effects.money} kr.`
                }
            },
            {
                id: 'fire',
                name: 'Brand 🔥',
                description: 'En brand har skadet byens økonomi.',
                type: 'negative',
                weight: 10,
                cooldown: 10,
                requirements: {
                    minPopulation: 60
                },
                effects: {
                    money: () => -(Math.floor(Math.random() * 3000) + 1000), // -1000 til -4000 kr
                    happiness: () => -(Math.floor(Math.random() * 8) + 2), // -2 til -10 happiness
                    message: (effects) => `En brand har ødelagt ejendom for ${Math.abs(effects.money)} kr.`
                }
            }
        ];
        
        // Tier 2+ events kan tilføjes senere
        this.availableEvents.tier2 = [];
    }
    
    // Beregn hvor mange events der skal ske baseret på tier og byens størrelse
    calculateEventCount(tier, population) {
        if (tier === 0) {
            return 0; // Ingen events i tier 0
        }
        
        if (tier === 1) {
            // 0-5 events per år baseret på befolkning
            let baseChance = Math.min(population / 20, 5); // Max 5 events
            return Math.floor(Math.random() * (baseChance + 1));
        }
        
        // Fremtidige tiers kan have flere events
        return Math.floor(Math.random() * (tier * 2)) + 1;
    }
    
    // Tjek om et event kan ske
    canEventOccur(event) {
        const gameState = window.gameState;
        
        // Tjek cooldown
        if (this.eventCooldowns[event.id] && this.eventCooldowns[event.id] > 0) {
            return false;
        }
        
        // Tjek krav
        if (event.requirements) {
            if (event.requirements.minPopulation && gameState.population < event.requirements.minPopulation) {
                return false;
            }
            
            if (event.requirements.maxPopulation && gameState.population > event.requirements.maxPopulation) {
                return false;
            }
            
            if (event.requirements.minHappiness && gameState.happiness < event.requirements.minHappiness) {
                return false;
            }
            
            if (event.requirements.maxHappiness && gameState.happiness > event.requirements.maxHappiness) {
                return false;
            }
            
            if (event.requirements.maxHospitals) {
                const hospitalCount = Object.values(gameState.buildings).filter(b => b === 'hospital').length;
                if (hospitalCount > event.requirements.maxHospitals) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Vælg tilfældige events til at udføre
    selectRandomEvents(tier, eventCount) {
        const availableEvents = this.availableEvents[`tier${tier}`] || [];
        const validEvents = availableEvents.filter(event => this.canEventOccur(event));
        
        if (validEvents.length === 0) {
            return [];
        }
        
        const selectedEvents = [];
        const eventPool = [...validEvents];
        
        for (let i = 0; i < eventCount && eventPool.length > 0; i++) {
            // Vægt-baseret selektion
            const totalWeight = eventPool.reduce((sum, event) => sum + event.weight, 0);
            let random = Math.random() * totalWeight;
            
            let selectedEvent = null;
            for (const event of eventPool) {
                random -= event.weight;
                if (random <= 0) {
                    selectedEvent = event;
                    break;
                }
            }
            
            if (selectedEvent) {
                selectedEvents.push(selectedEvent);
                // Fjern event fra pool så det ikke kan vælges igen samme år
                const index = eventPool.indexOf(selectedEvent);
                eventPool.splice(index, 1);
            }
        }
        
        return selectedEvents;
    }
    
    // Udført et event
    executeEvent(event) {
        const gameState = window.gameState;
        const effects = {};
        
        // Beregn effekter
        if (event.effects.population) {
            effects.population = event.effects.population();
            gameState.population = Math.max(0, gameState.population + effects.population);
        }
        
        if (event.effects.happiness) {
            effects.happiness = event.effects.happiness();
            gameState.happiness = Math.max(0, Math.min(100, gameState.happiness + effects.happiness));
        }
        
        if (event.effects.money) {
            effects.money = event.effects.money();
            gameState.money = Math.max(0, gameState.money + effects.money);
        }
        
        // Gem i historik
        const eventRecord = {
            year: gameState.year,
            id: event.id,
            name: event.name,
            description: event.description,
            type: event.type,
            effects: effects,
            message: event.effects.message(effects)
        };
        
        this.eventHistory.push(eventRecord);
        
        // Sæt cooldown
        if (event.cooldown) {
            this.eventCooldowns[event.id] = event.cooldown;
        }
        
        return eventRecord;
    }
    
    // Proces events for et år
    processYearlyEvents() {
        const gameState = window.gameState;
        
        // Få tier fra research system
        let currentTier = 0;
        if (gameState.researchData && gameState.researchData.currentTier !== undefined) {
            currentTier = gameState.researchData.currentTier;
        } else if (window.researchSystem && window.researchSystem.researchData) {
            currentTier = window.researchSystem.researchData.currentTier;
        }
        
        // Reducer cooldowns
        Object.keys(this.eventCooldowns).forEach(eventId => {
            if (this.eventCooldowns[eventId] > 0) {
                this.eventCooldowns[eventId]--;
            } else {
                delete this.eventCooldowns[eventId];
            }
        });
        
        // Beregn antal events
        const eventCount = this.calculateEventCount(currentTier, gameState.population);
        
        if (eventCount === 0) {
            return [];
        }
        
        // Vælg og udfør events
        const selectedEvents = this.selectRandomEvents(currentTier, eventCount);
        const executedEvents = [];
        
        selectedEvents.forEach(event => {
            const eventRecord = this.executeEvent(event);
            executedEvents.push(eventRecord);
        });
        
        // Begræns historik til de sidste 100 events
        if (this.eventHistory.length > 100) {
            this.eventHistory = this.eventHistory.slice(-100);
        }
        
        return executedEvents;
    }
    
    // Vis event notification
    showEventNotification(eventRecord) {
        const notification = document.createElement('div');
        notification.className = `event-notification ${eventRecord.type}`;
        notification.innerHTML = `
            <div class="event-content">
                <h4>${eventRecord.name}</h4>
                <p>${eventRecord.message}</p>
                <div class="event-effects">
                    ${eventRecord.effects.population ? `👥 Befolkning: ${eventRecord.effects.population > 0 ? '+' : ''}${eventRecord.effects.population}` : ''}
                    ${eventRecord.effects.happiness ? `😊 Tilfredshed: ${eventRecord.effects.happiness > 0 ? '+' : ''}${eventRecord.effects.happiness}%` : ''}
                    ${eventRecord.effects.money ? `💰 Penge: ${eventRecord.effects.money > 0 ? '+' : ''}${eventRecord.effects.money.toLocaleString()} kr` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Fjern efter 6 sekunder
        setTimeout(() => {
            notification.remove();
        }, 6000);
    }
    
    // Få event historik
    getEventHistory(lastYears = 10) {
        return this.eventHistory.slice(-lastYears);
    }
    
    // Få events for et specifikt år
    getEventsForYear(year) {
        return this.eventHistory.filter(event => event.year === year);
    }
    
    // Statistikker
    getEventStatistics() {
        const stats = {
            totalEvents: this.eventHistory.length,
            positiveEvents: this.eventHistory.filter(e => e.type === 'positive').length,
            negativeEvents: this.eventHistory.filter(e => e.type === 'negative').length,
            mostCommonEvent: null,
            recentEvents: this.eventHistory.slice(-5)
        };
        
        // Find mest almindelige event
        const eventCounts = {};
        this.eventHistory.forEach(event => {
            eventCounts[event.id] = (eventCounts[event.id] || 0) + 1;
        });
        
        let maxCount = 0;
        Object.keys(eventCounts).forEach(eventId => {
            if (eventCounts[eventId] > maxCount) {
                maxCount = eventCounts[eventId];
                stats.mostCommonEvent = eventId;
            }
        });
        
        return stats;
    }
    
    // Reset system
    reset() {
        this.eventHistory = [];
        this.activeEvents = [];
        this.eventCooldowns = {};
    }
}

// CSS til event notifications
const eventCSS = `
    .event-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideInEvent 0.5s ease-out;
        max-width: 320px;
        border-left: 4px solid #fff;
        margin-bottom: 10px;
    }
    
    .event-notification.positive {
        background: linear-gradient(135deg, #27ae60, #229954);
    }
    
    .event-notification.negative {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
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
        padding: 8px;
        border-radius: 5px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .event-effects > span {
        background: rgba(255,255,255,0.1);
        padding: 2px 6px;
        border-radius: 3px;
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
`;

// Tilføj CSS til head
const eventStyleSheet = document.createElement('style');
eventStyleSheet.textContent = eventCSS;
document.head.appendChild(eventStyleSheet);

// Initialiser event manager
const eventManager = new EventManager();

// Eksporter til global scope
window.eventManager = eventManager;
window.EventManager = EventManager;

console.log('Event system loaded successfully');
