// Research system - Tier 0 og 1
console.log('Loading research.js...');

class ResearchSystem {
    constructor() {
        this.researchData = {
            currentTier: 0,
            unlockedFeatures: [],
            researchHistory: []
        };
        
        // Definition af research tiers
        this.tiers = {
            0: {
                name: "Grundlæggende Samfund",
                description: "Start dit samfund med de mest basale bygninger",
                cost: 0,
                costType: 'free', // Gratis
                requirements: [],
                unlocks: ['basic_buildings'],
                researchPoints: 0
            },
            1: {
                name: "Byudvikling",
                description: "Lær at udvide din by med flere byggepladser",
                cost: 5000, // 5000 kr
                costType: 'money', // Koster penge
                requirements: ['basic_buildings'],
                unlocks: ['city_expansion'],
                researchPoints: 0
            },
            2: {
                name: "Bysammenslutning",
                description: "Lær at bygge større bebyggelser og merge eksisterende bygninger",
                cost: 12, // 100 forskningspoint
                costType: 'research', // Koster forskningspoint
                requirements: ['city_expansion'],
                unlocks: ['town_buildings', 'merge_buildings'],
                researchPoints: 100
            },
            3: {
                name: "Avanceret Byplanlægning",
                description: "Unlåser avancerede bygninger og funktioner",
                cost: 200, // 200 forskningspoint
                costType: 'research', // Koster forskningspoint
                requirements: ['town_buildings', 'merge_buildings'],
                unlocks: ['advanced_buildings'],
                researchPoints: 200
            },
            4: {
                name: "Moderne Samfund",
                description: "Det mest avancerede samfund med alle funktioner",
                cost: 300, // 300 forskningspoint
                costType: 'research', // Koster forskningspoint
                requirements: ['advanced_buildings'],
                unlocks: ['modern_buildings'],
                researchPoints: 300
            }
        };
        
        // Start med Tier 0 ulåst
        this.unlockTier(0);
    }
    
    // Tjek om en tier er ulåst
    isTierUnlocked(tier) {
        return this.researchData.currentTier >= tier;
    }
    
    // Tjek om en feature er ulåst
    isFeatureUnlocked(feature) {
        return this.researchData.unlockedFeatures.includes(feature);
    }
    
    // Få forskningspoint baseret på befolkning og bygninger
    getResearchPoints() {
        let points = 0;
        
        // 1 point per 10 indbyggere
        points += Math.floor(gameState.population / 10);
        
        // Bonus point for skoler
        const buildings = Object.values(gameState.buildings);
        const schoolCount = buildings.filter(b => getBuildingType(b) === 'school').length;
        points += schoolCount * 5;
        
        return points;
    }
    
    // Tjek om vi kan forske næste tier
    canResearchTier(tier) {
        if (tier <= this.researchData.currentTier) return false;
        if (!this.tiers[tier]) return false;
        
        const tierData = this.tiers[tier];
        
        // Tjek kost baseret på type
        if (tierData.costType === 'money') {
            // Tjek om vi har nok penge
            if (window.gameState.money < tierData.cost) return false;
        } else if (tierData.costType === 'research') {
            // Tjek om vi har nok forskningspoint
            const availablePoints = this.getResearchPoints();
            if (availablePoints < tierData.cost) return false;
        }
        
        // Tjek om alle requirements er opfyldt
        return tierData.requirements.every(req => this.isFeatureUnlocked(req));
    }
    
    // Forsk en tier
    researchTier(tier) {
        if (!this.canResearchTier(tier)) {
            return false;
        }
        
        const tierData = this.tiers[tier];
        
        // Træk kost fra baseret på type
        if (tierData.costType === 'money') {
            window.gameState.money -= tierData.cost;
            // Opdater money display
            if (typeof updateDisplay === 'function') {
                updateDisplay();
            }
        } else if (tierData.costType === 'research') {
            // Forskningspoint bruges ikke direkte, men vi noterer det
            console.log(`Forskning af Tier ${tier} brugte ${tierData.cost} forskningspoint`);
        }
        
        // Lås tier op
        this.unlockTier(tier);
        
        // Tilføj til historie
        this.researchData.researchHistory.push({
            tier: tier,
            name: tierData.name,
            timestamp: new Date().toISOString(),
            cost: tierData.cost,
            costType: tierData.costType
        });
        
        // Gem data
        this.saveData();
        
        return true;
    }
    
    // Lås en tier op (intern funktion)
    unlockTier(tier) {
        const oldTier = this.researchData.currentTier;
        this.researchData.currentTier = Math.max(this.researchData.currentTier, tier);
        
        // Tilføj alle unlocks fra denne tier
        if (this.tiers[tier]) {
            this.tiers[tier].unlocks.forEach(feature => {
                if (!this.researchData.unlockedFeatures.includes(feature)) {
                    this.researchData.unlockedFeatures.push(feature);
                }
            });
        }
        
        // Notify buildings grid system om tier upgrade
        if (window.buildingsGridManager && tier > oldTier) {
            setTimeout(() => {
                buildingsGridManager.onTierUpgrade(tier);
            }, 100);
        }
    }
    
    // Gem research data
    saveData() {
        localStorage.setItem('research-data', JSON.stringify(this.researchData));
    }
    
    // Indlæs research data
    loadData() {
        const saved = localStorage.getItem('research-data');
        if (saved) {
            try {
                this.researchData = JSON.parse(saved);
            } catch (error) {
                console.error('Fejl ved indlæsning af research data:', error);
                this.reset();
            }
        }
    }
    
    // Nulstil research system
    reset() {
        this.researchData = {
            currentTier: 0,
            unlockedFeatures: [],
            researchHistory: []
        };
        this.unlockTier(0);
        this.saveData();
    }
    
    // Eksporter data (til gem/hent funktioner)
    exportData() {
        return { ...this.researchData };
    }
    
    // Importer data (fra gem/hent funktioner)
    importData(data) {
        this.researchData = { ...data };
        this.saveData();
    }
}

// Initialiser research system
const researchSystem = new ResearchSystem();

// Indlæs gemt data
researchSystem.loadData();

// Eksporter til global scope
window.researchSystem = researchSystem;

console.log('Research system loaded. Current tier:', researchSystem.researchData.currentTier);

// Global functions for research UI
function doResearch(researchId) {
    if (researchId === 'city-expansion') {
        // Sikre at gameState eksisterer
        if (!window.gameState) {
            alert('Spillet er ikke fuldt indlæst endnu. Prøv igen om lidt.');
            return;
        }
        
        // Sikre at research objektet eksisterer
        if (!gameState.research) {
            gameState.research = { cityExpansion: false };
        }
        
        // Tjek om vi har nok penge (2000 kr)
        if (gameState.money < 2000) {
            alert('Du har ikke nok penge til at forske! Kræver 2.000 kr.');
            return;
        }
        
        // Træk penge fra og lås byudvidelse op
        gameState.money -= 2000;
        gameState.research.cityExpansion = true;
        
        // Opdater researchSystem også
        if (window.researchSystem) {
            researchSystem.unlockTier(1);
        }
        
        // Opdater UI
        if (typeof updateUI === 'function') {
            updateUI();
        }
        
        // Opdater research status
        const expansionStatus = document.getElementById('expansion-status');
        const expansionBtn = document.getElementById('expansion-btn');
        
        if (expansionStatus) {
            expansionStatus.textContent = '✅ Færdig';
            expansionStatus.className = 'research-status completed';
        }
        
        if (expansionBtn) {
            expansionBtn.disabled = true;
            expansionBtn.textContent = '✅ Færdig';
        }
        
        // Vis byudvidelse panel på game-siden
        const expansionPanel = document.getElementById('expansion-panel');
        if (expansionPanel) {
            expansionPanel.style.display = 'block';
        }
        
        // Gem spil
        if (typeof saveGame === 'function') {
            saveGame();
        }
        
        alert('Forskning færdig! Du kan nu købe ekstra byggepladser.');
    }
}

function initializeResearch() {
    // Opdater research UI baseret på nuværende status
    setTimeout(() => {
        updateResearchUI();
    }, 100); // Kort delay for at sikre gameState er indlæst
}

function updateResearchUI() {
    // Sikre at gameState eksisterer
    if (!window.gameState) {
        console.log('gameState not ready yet');
        return;
    }
    
    // Sikre at research objektet eksisterer
    if (!gameState.research) {
        gameState.research = { cityExpansion: false };
    }
    
    // Opdater byudvidelse research status
    const expansionStatus = document.getElementById('expansion-status');
    const expansionBtn = document.getElementById('expansion-btn');
    
    const isResearched = gameState.research.cityExpansion || 
                        (window.researchSystem && researchSystem.isFeatureUnlocked('city_expansion'));
    
    if (isResearched) {
        if (expansionStatus) {
            expansionStatus.textContent = '✅ Færdig';
            expansionStatus.className = 'research-status completed';
        }
        
        if (expansionBtn) {
            expansionBtn.disabled = true;
            expansionBtn.textContent = '✅ Færdig';
        }
    } else {
        if (expansionStatus) {
            expansionStatus.textContent = '❌ Ikke forsket';
            expansionStatus.className = 'research-status';
        }
        
        if (expansionBtn) {
            expansionBtn.disabled = gameState.money < 2000;
            expansionBtn.textContent = gameState.money < 2000 ? '💰 Ikke råd' : '🔬 Forsk';
        }
    }
}
