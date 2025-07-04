// Spil logik og funktioner
let selectedBuilding = null;

// Brug den globale gameState hvis den eksisterer, ellers opret ny
if (!window.gameState) {
    window.gameState = {
        money: 10000,
        population: 0,
        happiness: 75,
        stamina: 10,
        year: 1930,
        buildings: {},
        maxBuildingSlots: 6, // Start med 6 slots, kan udvides til 12
        research: {
            cityExpansion: false
        }
    };
}

let gameState = window.gameState;
let gameStats = new GameStats();

// Byudvidelse funktioner
function expandCity()// Auto-save hver 30 sekunder
setInterval(saveGameData, 30000);

// Initialiser spillet når game-siden indlæses
function initializeGame() {
    console.log('Initializing game...');
    
    // Indlæs gemt data først
    loadGameData();
    
    // Opdater UI
    updateUI();
    updateStats();
    updateBuildButtons();
    updateExpansionPanel();
    
    // Rebuild city hvis der er bygninger
    rebuildCityView();
    
    console.log('Game initialized with state:', gameState);
}

// Initialiser andre sider
function initializeTowns() {
    // Towns side initialisering
    console.log('Towns page initialized');
}

function initializeStats() {
    // Stats side initialisering  
    updateStatsPage();
    console.log('Stats page initialized');
}

function initializeSettings() {
    // Settings side initialisering
    console.log('Settings page initialized');
}

// Opdater statistik-siden med faktiske data
function updateStatsPage() {
    // Opdater alle stat-elementer med rigtige værdier
    const statMoney = document.getElementById('stat-money');
    const statPopulation = document.getElementById('stat-population'); 
    const statHappiness = document.getElementById('stat-happiness');
    const statRoads = document.getElementById('stat-roads');
    const statPowerplants = document.getElementById('stat-powerplants');
    const statHospitals = document.getElementById('stat-hospitals');
    const statSchools = document.getElementById('stat-schools');
    const statExpansion = document.getElementById('stat-expansion');
    const statSlots = document.getElementById('stat-slots');
    
    if (statMoney) statMoney.textContent = `${gameState.money.toLocaleString()} kr`;
    if (statPopulation) statPopulation.textContent = gameState.population;
    if (statHappiness) statHappiness.textContent = `${gameState.happiness}%`;
    
    // Tæl bygninger
    const buildings = Object.values(gameState.buildings);
    if (statRoads) statRoads.textContent = buildings.filter(b => b === 'road').length;
    if (statPowerplants) statPowerplants.textContent = buildings.filter(b => b === 'powerplant').length;
    if (statHospitals) statHospitals.textContent = buildings.filter(b => b === 'hospital').length;
    if (statSchools) statSchools.textContent = buildings.filter(b => b === 'school').length;
    
    // Research status
    if (statExpansion) {
        const hasExpansion = gameState.research.cityExpansion || 
                           (window.researchSystem && researchSystem.isFeatureUnlocked('city_expansion'));
        statExpansion.textContent = hasExpansion ? '✅ Forsket' : '❌ Ikke forsket';
    }
    
    if (statSlots) statSlots.textContent = `${gameState.maxBuildingSlots}/12`;
} research tier 1 er ulåst
    if (!researchSystem.isFeatureUnlocked('city_expansion')) {
        alert('Du skal først forske Tier 1: Byudvikling for at udvide byen!');
        return;
    }
    
    // Tjek om vi kan købe flere slots
    if (gameState.maxBuildingSlots >= 12) {
        alert('Du har allerede maksimalt antal byggepladser!');
        return;
    }
    
    const expansionCost = 5000;
    if (gameState.money < expansionCost) {
        alert(`Ikke nok penge! Du har brug for ${expansionCost} kr, men har kun ${gameState.money} kr.`);
        return;
    }
    
    // Køb udvidelse
    gameState.money -= expansionCost;
    gameState.maxBuildingSlots++;
    
    // Tilføj ny slot til DOM
    addNewBuildingSlot();
    
    // Opdater UI
    updateUI();
    updateExpansionPanel();
    saveGameData();
    
    alert('By udvidet! Du har nu en ekstra byggeplads.');
}

function addNewBuildingSlot() {
    const buildingsGrid = document.querySelector('.buildings-grid');
    if (!buildingsGrid) return;
    
    const slotId = `slot-${gameState.maxBuildingSlots}`;
    const newSlot = document.createElement('div');
    newSlot.className = 'building-slot';
    newSlot.id = slotId;
    newSlot.innerHTML = '<div class="empty-slot">Tom grund<br>Klik for at bygge</div>';
    
    // Tilføj click event
    newSlot.addEventListener('click', function() {
        if (this.querySelector('.empty-slot')) {
            buildOnSlot(this.id);
        }
    });
    
    buildingsGrid.appendChild(newSlot);
}

function updateExpansionPanel() {
    const expansionPanel = document.getElementById('expansion-panel');
    const slotsInfo = document.getElementById('slots-info');
    const expandBtn = document.getElementById('expand-btn');
    
    if (expansionPanel) {
        // Vis panel hvis research er ulåst
        if (researchSystem.isFeatureUnlocked('city_expansion')) {
            expansionPanel.style.display = 'block';
        } else {
            expansionPanel.style.display = 'none';
        }
        
        // Opdater info
        if (slotsInfo) {
            slotsInfo.textContent = `Du har ${gameState.maxBuildingSlots} af 12 mulige byggepladser`;
        }
        
        // Opdater knap
        if (expandBtn) {
            if (gameState.maxBuildingSlots >= 12) {
                expandBtn.disabled = true;
                expandBtn.textContent = '🏗️ Maksimum nået';
            } else {
                expandBtn.disabled = gameState.money < 5000;
                expandBtn.textContent = '🏗️ Køb byggeplads (5.000 kr)';
            }
        }
    }
}

// Gem data til JSON-filer
function saveGameData() {
    const gameData = {
        gameState: gameState,
        timestamp: new Date().toISOString(),
        version: "1.0"
    };
    
    // Gem til localStorage (simulerer JSON-fil)
    localStorage.setItem('samfunds-spil-data', JSON.stringify(gameData));
    
    // Gem stats til localStorage
    const statsData = {
        stats: gameStats.exportStats(),
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('samfunds-spil-stats', JSON.stringify(statsData));
    
    // Debug: Vis når data gemmes
    console.log('Game data saved:', {
        money: gameState.money,
        stamina: gameState.stamina,
        year: gameState.year
    });
}

// Indlæs data fra JSON-filer
function loadGameData() {
    const saved = localStorage.getItem('samfunds-spil-data');
    if (saved) {
        const data = JSON.parse(saved);
        gameState = data.gameState;
        // Sikr at nye felter eksisterer
        if (typeof gameState.stamina === 'undefined') gameState.stamina = 10;
        if (!gameState.year) gameState.year = 1930;
        if (!gameState.maxBuildingSlots) gameState.maxBuildingSlots = 6;
        if (gameState.population === undefined) gameState.population = 0;
        updateUI();
        rebuildCityView();
        updateBuildButtons();
        updateExpansionPanel();
    }
    
    // Indlæs stats
    const savedStats = localStorage.getItem('samfunds-spil-stats');
    if (savedStats) {
        const statsData = JSON.parse(savedStats);
        // Gendan stats hvis muligt
        if (statsData.stats && statsData.stats.history) {
            gameStats.history = statsData.stats.history;
            gameStats.achievements = statsData.stats.achievements || [];
        }
    }
}

// Opdater UI
function updateUI() {
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('population').textContent = gameState.population;
    document.getElementById('happiness').textContent = gameState.happiness;
    document.getElementById('stamina').textContent = gameState.stamina;
    document.getElementById('year').textContent = gameState.year;
    
    // Beregn og vis årlig økonomi
    const economy = calculateAnnualEconomy();
    const annualIncomeElement = document.getElementById('annual-income');
    const annualExpensesElement = document.getElementById('annual-expenses');
    const netResultElement = document.getElementById('net-result');
    
    if (annualIncomeElement) {
        annualIncomeElement.textContent = `${economy.income} kr`;
    }
    if (annualExpensesElement) {
        annualExpensesElement.textContent = `${economy.expenses} kr`;
    }
    if (netResultElement) {
        netResultElement.textContent = `${economy.net} kr`;
        netResultElement.className = economy.net >= 0 ? 'status-good' : 'status-bad';
    }
    
    updateBuildButtons();
    updateExpansionPanel();
}

function updateBuildButtons() {
    document.querySelectorAll('.build-btn').forEach(btn => {
        const onClick = btn.getAttribute('onclick');
        if (onClick && onClick.includes('selectBuilding')) {
            const match = onClick.match(/selectBuilding\('(\w+)'\)/);
            if (!match) return;
            
            const buildingType = match[1];
            
            // Brug data fra BUILDINGS objektet
            const buildingData = BUILDINGS[buildingType];
            if (!buildingData) return;
            
            const canAfford = gameState.money >= buildingData.cost;
            const hasStamina = gameState.stamina >= buildingData.staminaCost;
            const hasRoadForBuilding = !buildingData.requiresRoad || hasRoadAccess();
            
            const canBuild = canAfford && hasStamina && hasRoadForBuilding;
            
            btn.disabled = !canBuild;
            
            if (!canAfford) {
                btn.style.opacity = '0.5';
                btn.title = `Ikke nok penge (kræver ${buildingData.cost} kr, har ${gameState.money} kr)`;
            } else if (!hasStamina) {
                btn.style.opacity = '0.5';
                btn.title = `Ikke nok stamina (kræver ${buildingData.staminaCost} stamina, har ${gameState.stamina} stamina)`;
            } else if (!hasRoadForBuilding) {
                btn.style.opacity = '0.5';
                btn.title = 'Kræver vej først';
            } else {
                btn.style.opacity = '1';
                btn.title = `Koster ${buildingData.cost} kr og ${buildingData.staminaCost} stamina`;
            }
        }
    });
}

// Tjek om der er vej tilgængelig for andre bygninger
function hasRoadAccess() {
    const buildings = Object.values(gameState.buildings);
    return buildings.includes('road');
}

// Vælg bygning type
function selectBuilding(type) {
    selectedBuilding = type;
    document.querySelectorAll('.build-btn').forEach(btn => {
        btn.style.background = '#3498db';
    });
    event.target.style.background = '#27ae60';
}

// Byg bygning på slot
function buildOnSlot(slotId) {
    if (!selectedBuilding) {
        alert('Vælg først en bygning type!');
        return;
    }

    // Brug data fra BUILDINGS objektet
    const buildingData = BUILDINGS[selectedBuilding];
    if (!buildingData) {
        alert('Ugyldig bygning type!');
        return;
    }

    // Tjek stamina
    if (gameState.stamina < buildingData.staminaCost) {
        alert(`Ikke nok stamina! Du har brug for ${buildingData.staminaCost} stamina, men har kun ${gameState.stamina}.`);
        return;
    }

    // Tjek om bygning kræver vej
    if (buildingData.requiresRoad && !hasRoadAccess()) {
        alert('Du skal bygge en vej først!');
        return;
    }

    // Tjek penge
    if (gameState.money < buildingData.cost) {
        alert(`Ikke nok penge! Du har brug for ${buildingData.cost} kr, men har kun ${gameState.money} kr.`);
        return;
    }

    // Byg bygningen
    gameState.money -= buildingData.cost;
    gameState.stamina -= buildingData.staminaCost;
    gameState.buildings[slotId] = selectedBuilding;

    // Opdater UI
    const slot = document.getElementById(slotId);
    slot.innerHTML = `<div class="building ${selectedBuilding}">${buildingData.icon} ${buildingData.name}</div>`;
    
    // Opdater stats
    updateStats();
    selectedBuilding = null;
    
    // Reset knapper
    document.querySelectorAll('.build-btn').forEach(btn => {
        btn.style.background = '#3498db';
    });
    
    // Opdater byggeknapper
    updateBuildButtons();
    
    // Gem data
    saveGameData();
}

// Opdater statistikker
function updateStats() {
    // Tæl bygninger
    const buildings = Object.values(gameState.buildings);
    const roadCount = buildings.filter(b => b === 'road').length;
    const houseCount = buildings.filter(b => b === 'house').length;
    const powerplantCount = buildings.filter(b => b === 'powerplant').length;
    const hospitalCount = buildings.filter(b => b === 'hospital').length;
    const schoolCount = buildings.filter(b => b === 'school').length;

    // Opdater befolkning baseret på huse
    gameState.population = houseCount * 12; // 12 per hus (Lille Flække)

    // Opdater status
    const roadStatus = document.getElementById('road-status');
    const powerStatus = document.getElementById('power-status');
    const healthStatus = document.getElementById('health-status');
    const educationStatus = document.getElementById('education-status');
    const housingStatus = document.getElementById('housing-status');

    if (roadStatus) {
        roadStatus.textContent = roadCount > 0 ? 'Tilgængelig' : 'Ingen';
        roadStatus.className = roadCount > 0 ? 'status-good' : 'status-bad';
    }

    if (powerStatus) {
        powerStatus.textContent = powerplantCount > 0 ? 'God' : 'Ingen';
        powerStatus.className = powerplantCount > 0 ? 'status-good' : 'status-bad';
    }

    if (healthStatus) {
        healthStatus.textContent = hospitalCount > 0 ? 'God' : 'Dårlig';
        healthStatus.className = hospitalCount > 0 ? 'status-good' : 'status-bad';
    }

    if (educationStatus) {
        educationStatus.textContent = schoolCount > 0 ? 'God' : 'Ingen';
        educationStatus.className = schoolCount > 0 ? 'status-good' : 'status-bad';
    }

    if (housingStatus) {
        housingStatus.textContent = houseCount > 0 ? 'God' : 'Ingen';
        housingStatus.className = houseCount > 0 ? 'status-good' : 'status-bad';
    }

    // Beregn tilfredshed
    let happiness = 50; // Base
    if (powerplantCount > 0) happiness += 10;
    if (hospitalCount > 0) happiness += 15;
    if (schoolCount > 0) happiness += 10;
    if (houseCount > 0) happiness += 15;
    if (roadCount > 0) happiness += 5; // Veje øger tilfredshed

    gameState.happiness = Math.min(100, Math.max(0, happiness));

    // Opdater UI
    updateUI();
    
    // Gem stats
    gameStats.recordStats(gameState);
}

// Beregn årlig økonomi
function calculateAnnualEconomy() {
    const buildings = Object.values(gameState.buildings);
    const houseCount = buildings.filter(b => b === 'house').length;
    const powerplantCount = buildings.filter(b => b === 'powerplant').length;
    const hospitalCount = buildings.filter(b => b === 'hospital').length;
    const schoolCount = buildings.filter(b => b === 'school').length;
    const roadCount = buildings.filter(b => b === 'road').length;

    // Indtægter
    let income = 0;
    income += gameState.population * 50; // Skat per borger
    income += houseCount * 200; // Ejendomsskat
    income += powerplantCount * 300; // Energisalg
    
    // Udgifter
    let expenses = 0;
    expenses += houseCount * 50; // Hus vedligeholdelse
    expenses += powerplantCount * 200; // Kraftværk drift
    expenses += hospitalCount * 300; // Hospital drift
    expenses += schoolCount * 150; // Skole drift
    expenses += roadCount * 25; // Vej vedligeholdelse
    
    return {
        income: income,
        expenses: expenses,
        net: income - expenses
    };
}

// Næste år funktion
function nextYear() {
    const economy = calculateAnnualEconomy();
    
    // Opdater penge
    gameState.money += economy.net;
    
    // Beregn stamina bonus baseret på performance
    let staminaGain = 1; // Base stamina
    if (economy.net > 1000) staminaGain += 2; // Bonus for god økonomi
    else if (economy.net > 0) staminaGain += 1; // Lille bonus for positiv økonomi
    
    if (gameState.happiness > 80) staminaGain += 1; // Bonus for høj tilfredshed
    else if (gameState.happiness > 60) staminaGain += 0.5;
    
    gameState.stamina += Math.floor(staminaGain);
    gameState.year += 1;
    
    // Vis årsoversigt
    showYearSummary(economy, staminaGain);
    
    // Opdater UI
    updateUI();
    updateStats();
    updateBuildButtons();
    updateExpansionPanel();
    saveGameData();
}

// Vis årsoversigt
function showYearSummary(economy, staminaGain) {
    const summaryText = `
        År ${gameState.year - 1} Oversigt:
        
        💰 Årlig indtægt: ${economy.income} kr
        💸 Årlige udgifter: ${economy.expenses} kr
        📊 Netto resultat: ${economy.net} kr
        
        😊 Tilfredshed: ${gameState.happiness}%
        💪 Stamina optjent: +${Math.floor(staminaGain)}
        
        📅 Velkommen til år ${gameState.year}!
    `;
    
    alert(summaryText);
}

// Genbyg by visning
function rebuildCityView() {
    Object.keys(gameState.buildings).forEach(slotId => {
        const buildingType = gameState.buildings[slotId];
        const buildingData = BUILDINGS[buildingType];
        const slot = document.getElementById(slotId);
        
        if (slot && buildingData) {
            slot.innerHTML = `<div class="building ${buildingType}">${buildingData.icon} ${buildingData.name}</div>`;
        }
    });
    
    // Tilføj manglende slots hvis der er flere end 6
    const buildingsGrid = document.querySelector('.buildings-grid');
    if (buildingsGrid && gameState.maxBuildingSlots > 6) {
        for (let i = 7; i <= gameState.maxBuildingSlots; i++) {
            const slotId = `slot-${i}`;
            if (!document.getElementById(slotId)) {
                const newSlot = document.createElement('div');
                newSlot.className = 'building-slot';
                newSlot.id = slotId;
                newSlot.innerHTML = '<div class="empty-slot">Tom grund<br>Klik for at bygge</div>';
                buildingsGrid.appendChild(newSlot);
            }
        }
    }
    
    // Sæt click event listeners på slots
    document.querySelectorAll('.building-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.querySelector('.empty-slot')) {
                buildOnSlot(this.id);
            }
        });
    });
}

// Eksporter data til rigtig JSON-fil
function exportDataToFile() {
    const data = {
        gameState: gameState,
        stats: gameStats.exportStats(),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samfunds-spil-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Eksporter data
function exportData() {
    exportDataToFile();
}

// Importer data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    gameState = data.gameState;
                    // Sikr at stamina og årstal eksisterer
                    if (typeof gameState.stamina === 'undefined') gameState.stamina = 10;
                    if (!gameState.year) gameState.year = 1930;
                    if (!gameState.maxBuildingSlots) gameState.maxBuildingSlots = 6;
                    if (gameState.population === undefined) gameState.population = 0;
                    updateUI();
                    rebuildCityView();
                    updateStats();
                    updateExpansionPanel();
                    saveGameData(); // Gem opdateret data
                    alert('Data importeret succesfuldt!');
                } catch (error) {
                    alert('Fejl ved indlæsning af data: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Nulstil alt data
function resetData() {
    if (confirm('Er du sikker på, at du vil nulstille alle data?')) {
        gameState = {
            money: 10000,
            population: 0,
            happiness: 75,
            stamina: 10,
            year: 1930,
            buildings: {},
            maxBuildingSlots: 6
        };
        gameStats = new GameStats();
        localStorage.removeItem('samfunds-spil-data');
        researchSystem.reset();
        updateUI();
        rebuildCityView();
        updateStats();
        updateExpansionPanel();
        alert('Data nulstillet!');
    }
}

// Initialiser spil når siden loader
function initializeGame() {
    try {
        loadGameData();
        updateUI();
        rebuildCityView();
        updateStats();
        updateExpansionPanel();
        
        // Sæt click event listeners på building slots
        setTimeout(() => {
            document.querySelectorAll('.building-slot').forEach(slot => {
                slot.addEventListener('click', function() {
                    if (this.querySelector('.empty-slot')) {
                        buildOnSlot(this.id);
                    }
                });
            });
        }, 100); // Small delay to ensure DOM is ready
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Automatisk gem data når siden lukkes
window.addEventListener('beforeunload', function() {
    saveGameData();
});

// Gem også data periodisk (hvert 30. sekund)
setInterval(saveGameData, 30000);

// Initialiser andre sider
function initializeTowns() {
    // Towns side initialisering
    console.log('Towns page initialized');
}

function initializeStats() {
    // Stats side initialisering
    console.log('Stats page initialized');
}

function initializeSettings() {
    // Settings side initialisering
    console.log('Settings page initialized');
}
