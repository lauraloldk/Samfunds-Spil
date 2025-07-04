// Samfunds Simulator - Game Logic
// Hovedlogikken for spillet med JSON autosave/load

// Initialize gameState hvis det ikke allerede eksisterer
if (!window.gameState) {
    window.gameState = {
        money: 10000,
        population: 0,
        happiness: 75,
        stamina: 10,
        year: 1930,
        buildings: {},
        maxBuildingSlots: 6,
        research: {
            cityExpansion: false
        }
    };
}

// Autosave funktionalitet
function saveGameData() {
    try {
        const gameData = JSON.stringify(window.gameState);
        localStorage.setItem('samfunds-spil-data', gameData);
        console.log('Game data saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving game data:', error);
        return false;
    }
}

function loadGameData() {
    try {
        const savedData = localStorage.getItem('samfunds-spil-data');
        if (savedData) {
            const loadedState = JSON.parse(savedData);
            
            // Sikr at alle nødvendige properties eksisterer
            window.gameState = {
                money: loadedState.money || 10000,
                population: loadedState.population || 0,
                happiness: loadedState.happiness || 75,
                stamina: loadedState.stamina || 10,
                year: loadedState.year || 1930,
                buildings: loadedState.buildings || {},
                maxBuildingSlots: loadedState.maxBuildingSlots || 6,
                research: {
                    cityExpansion: loadedState.research?.cityExpansion || false
                }
            };
            
            console.log('Game data loaded successfully');
            return true;
        }
    } catch (error) {
        console.error('Error loading game data:', error);
    }
    return false;
}

// Eksporter spildata til JSON fil
function exportGameData() {
    try {
        const gameData = JSON.stringify(window.gameState, null, 2);
        const blob = new Blob([gameData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'samfunds-spil-save.json';
        a.click();
        URL.revokeObjectURL(url);
        console.log('Game data exported successfully');
    } catch (error) {
        console.error('Error exporting game data:', error);
    }
}

// Importer spildata fra JSON fil
function importGameData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const loadedState = JSON.parse(e.target.result);
                    
                    // Sikr at alle nødvendige properties eksisterer
                    window.gameState = {
                        money: loadedState.money || 10000,
                        population: loadedState.population || 0,
                        happiness: loadedState.happiness || 75,
                        stamina: loadedState.stamina || 10,
                        year: loadedState.year || 1930,
                        buildings: loadedState.buildings || {},
                        maxBuildingSlots: loadedState.maxBuildingSlots || 6,
                        research: {
                            cityExpansion: loadedState.research?.cityExpansion || false
                        }
                    };
                    
                    saveGameData(); // Gem til localStorage
                    updateUI();
                    
                    console.log('Game data imported successfully');
                    alert('Spildata importeret!');
                } catch (error) {
                    console.error('Error importing game data:', error);
                    alert('Fejl ved import af spildata!');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Nulstil spillet
function resetGame() {
    if (confirm('Er du sikker på, at du vil nulstille spillet? Alt progress går tabt!')) {
        window.gameState = {
            money: 10000,
            population: 0,
            happiness: 75,
            stamina: 10,
            year: 1930,
            buildings: {},
            maxBuildingSlots: 6,
            research: {
                cityExpansion: false
            }
        };
        
        saveGameData();
        updateUI();
        
        console.log('Game reset successfully');
        alert('Spillet er nulstillet!');
    }
}

// Opdater UI baseret på gameState
function updateUI() {
    // Opdater ressourcer i header
    document.getElementById('money').textContent = window.gameState.money;
    document.getElementById('population').textContent = window.gameState.population;
    document.getElementById('happiness').textContent = window.gameState.happiness;
    document.getElementById('stamina').textContent = window.gameState.stamina;
    document.getElementById('year').textContent = window.gameState.year;
    
    // Opdater bygnings-grid hvis vi er på game-siden
    if (currentPage === 'game') {
        updateBuildingsGrid();
        updateEconomyDisplay();
    }
    
    // Opdater research UI hvis vi er på research-siden
    if (currentPage === 'research' && typeof updateResearchUI === 'function') {
        updateResearchUI();
    }
    
    // Opdater towns UI hvis vi er på towns-siden
    if (currentPage === 'towns' && typeof updateTownsUI === 'function') {
        updateTownsUI();
    }
}

// Opdater økonomi-display
function updateEconomyDisplay() {
    // Beregn indtægt og udgifter
    const income = window.gameState.population * 10; // 10 kr per borger
    let maintenance = 0;
    
    Object.values(window.gameState.buildings).forEach(buildingType => {
        const building = BUILDINGS[buildingType];
        if (building && building.effects && building.effects.maintenance) {
            maintenance += building.effects.maintenance;
        }
    });
    
    const netResult = income - maintenance;
    
    // Opdater UI elementer
    const annualIncome = document.getElementById('annual-income');
    const annualExpenses = document.getElementById('annual-expenses');
    const netResultElement = document.getElementById('net-result');
    
    if (annualIncome) {
        annualIncome.textContent = income + ' kr';
        annualIncome.className = income > 0 ? 'status-good' : 'status-neutral';
    }
    
    if (annualExpenses) {
        annualExpenses.textContent = maintenance + ' kr';
        annualExpenses.className = maintenance > 0 ? 'status-bad' : 'status-neutral';
    }
    
    if (netResultElement) {
        netResultElement.textContent = netResult + ' kr';
        if (netResult > 0) {
            netResultElement.className = 'status-good';
        } else if (netResult < 0) {
            netResultElement.className = 'status-bad';
        } else {
            netResultElement.className = 'status-neutral';
        }
    }
    
    // Opdater status-panelet
    updateStatusPanel();
}

// Opdater status-panel
function updateStatusPanel() {
    const buildings = Object.values(window.gameState.buildings);
    
    // Veje
    const roadCount = buildings.filter(b => b === 'road').length;
    const roadStatus = document.getElementById('road-status');
    if (roadStatus) {
        if (roadCount > 0) {
            roadStatus.textContent = `${roadCount} vej${roadCount > 1 ? 'e' : ''}`;
            roadStatus.className = 'status-good';
        } else {
            roadStatus.textContent = 'Ingen';
            roadStatus.className = 'status-bad';
        }
    }
    
    // Strøm
    const powerplantCount = buildings.filter(b => b === 'powerplant').length;
    const powerStatus = document.getElementById('power-status');
    if (powerStatus) {
        if (powerplantCount > 0) {
            powerStatus.textContent = `${powerplantCount} kraftværk${powerplantCount > 1 ? 'er' : ''}`;
            powerStatus.className = 'status-good';
        } else {
            powerStatus.textContent = 'Ingen';
            powerStatus.className = 'status-bad';
        }
    }
    
    // Sundhed
    const hospitalCount = buildings.filter(b => b === 'hospital').length;
    const healthStatus = document.getElementById('health-status');
    if (healthStatus) {
        if (hospitalCount > 0) {
            healthStatus.textContent = `${hospitalCount} hospital${hospitalCount > 1 ? 'er' : ''}`;
            healthStatus.className = 'status-good';
        } else {
            healthStatus.textContent = 'Ingen';
            healthStatus.className = 'status-bad';
        }
    }
    
    // Uddannelse
    const schoolCount = buildings.filter(b => b === 'school').length;
    const educationStatus = document.getElementById('education-status');
    if (educationStatus) {
        if (schoolCount > 0) {
            educationStatus.textContent = `${schoolCount} skole${schoolCount > 1 ? 'r' : ''}`;
            educationStatus.className = 'status-good';
        } else {
            educationStatus.textContent = 'Ingen';
            educationStatus.className = 'status-bad';
        }
    }
    
    // Boliger
    const houseCount = buildings.filter(b => b === 'house').length;
    const housingStatus = document.getElementById('housing-status');
    if (housingStatus) {
        if (houseCount > 0) {
            housingStatus.textContent = `${houseCount} hus${houseCount > 1 ? 'e' : ''}`;
            housingStatus.className = 'status-good';
        } else {
            housingStatus.textContent = 'Ingen';
            housingStatus.className = 'status-bad';
        }
    }
}

// Opdater bygnings-grid
function updateBuildingsGrid() {
    for (let i = 1; i <= 12; i++) { // Alle 12 mulige slots
        const slot = document.getElementById(`slot-${i}`);
        if (slot) {
            if (i <= window.gameState.maxBuildingSlots) {
                // Slot er tilgængelig
                slot.style.display = 'block';
                
                if (window.gameState.buildings[i]) {
                    // Slot har bygning
                    const buildingType = window.gameState.buildings[i];
                    const building = BUILDINGS[buildingType];
                    slot.innerHTML = `
                        <div class="building">
                            <div class="building-icon">${building.icon}</div>
                            <div class="building-name">${building.name}</div>
                            <button class="demolish-btn" onclick="demolishBuilding(${i})">Riv ned</button>
                        </div>
                    `;
                } else {
                    // Tom slot
                    slot.innerHTML = `
                        <div class="empty-slot" onclick="showBuildingMenu(${i})">
                            Tom grund<br>Klik for at bygge
                        </div>
                    `;
                }
            } else {
                // Slot er låst
                slot.style.display = 'none';
            }
        }
    }
}

// Vis byggemenu
function showBuildingMenu(slotId) {
    const menu = document.getElementById('building-menu');
    if (menu) {
        menu.style.display = 'block';
        menu.dataset.slotId = slotId;
        console.log('Building menu shown for slot', slotId);
    } else {
        console.error('Building menu not found in DOM');
    }
}

// Skjul byggemenu
function hideBuildingMenu() {
    const menu = document.getElementById('building-menu');
    if (menu) {
        menu.style.display = 'none';
        console.log('Building menu hidden');
    }
}

// Luk byggemenu når man klikker uden for den
function setupBuildingMenuEventListeners() {
    const menu = document.getElementById('building-menu');
    if (menu) {
        menu.addEventListener('click', function(e) {
            if (e.target === menu) {
                hideBuildingMenu();
            }
        });
    }
}

// Byg bygning
function buildBuilding(buildingType, slotId) {
    console.log('Building', buildingType, 'in slot', slotId);
    
    const building = BUILDINGS[buildingType];
    if (!building) {
        console.error('Building type not found:', buildingType);
        return;
    }
    
    // Tjek om vi har råd og stamina
    if (window.gameState.money < building.cost) {
        alert('Ikke nok penge!');
        return;
    }
    
    if (window.gameState.stamina < building.staminaCost) {
        alert('Ikke nok stamina!');
        return;
    }
    
    // Tjek om bygningen kræver vej
    if (building.requiresRoad && !hasRoadAccess()) {
        alert('Bygningen kræver en vej!');
        return;
    }
    
    // Byg bygningen
    window.gameState.money -= building.cost;
    window.gameState.stamina -= building.staminaCost;
    window.gameState.buildings[slotId] = buildingType;
    
    // Anvend bygningens effekter
    if (building.effects) {
        if (building.effects.population) {
            window.gameState.population += building.effects.population;
        }
        if (building.effects.happiness) {
            window.gameState.happiness += building.effects.happiness;
            // Begræns tilfredshed mellem 0 og 100
            window.gameState.happiness = Math.max(0, Math.min(100, window.gameState.happiness));
        }
    }
    
    hideBuildingMenu();
    updateUI();
    saveGameData();
    
    console.log('Building built successfully');
}

// Tjek om der er vejadgang
function hasRoadAccess() {
    return Object.values(window.gameState.buildings).includes('road');
}

// Riv bygning ned
function demolishBuilding(slotId) {
    if (confirm('Er du sikker på, at du vil rive bygningen ned?')) {
        const buildingType = window.gameState.buildings[slotId];
        const building = BUILDINGS[buildingType];
        
        if (building && building.effects) {
            // Fjern bygningens effekter
            if (building.effects.population) {
                window.gameState.population -= building.effects.population;
                window.gameState.population = Math.max(0, window.gameState.population);
            }
            if (building.effects.happiness) {
                window.gameState.happiness -= building.effects.happiness;
                window.gameState.happiness = Math.max(0, Math.min(100, window.gameState.happiness));
            }
        }
        
        // Fjern bygningen
        delete window.gameState.buildings[slotId];
        
        // Giv halvdelen af prisen tilbage
        window.gameState.money += Math.floor(building.cost / 2);
        
        updateUI();
        saveGameData();
    }
}

// Næste runde
function nextTurn() {
    // Øg år
    window.gameState.year++;
    
    // Regenerer stamina
    const oldStamina = window.gameState.stamina;
    window.gameState.stamina = Math.min(10, window.gameState.stamina + 3);
    
    // Beregn indkomst og udgifter
    let income = window.gameState.population * 10; // 10 kr per borger
    let maintenance = 0;
    
    Object.values(window.gameState.buildings).forEach(buildingType => {
        const building = BUILDINGS[buildingType];
        if (building && building.effects && building.effects.maintenance) {
            maintenance += building.effects.maintenance;
        }
    });
    
    const netResult = income - maintenance;
    const oldMoney = window.gameState.money;
    const oldPopulation = window.gameState.population;
    const oldHappiness = window.gameState.happiness;
    
    window.gameState.money += netResult;
    
    // Sørg for at penge ikke går under 0
    window.gameState.money = Math.max(0, window.gameState.money);
    
    // Proces befolknings-ændringer (hvis population system er tilgængeligt)
    let populationData = null;
    if (window.populationManager) {
        populationData = populationManager.processPopulationTurn();
    }
    
    // Vis feedback
    let message = `År ${window.gameState.year}\n`;
    message += `Stamina: ${oldStamina} → ${window.gameState.stamina}\n`;
    message += `Indtægt: ${income} kr\n`;
    message += `Udgifter: ${maintenance} kr\n`;
    message += `Netto: ${netResult} kr\n`;
    message += `Penge: ${oldMoney} → ${window.gameState.money} kr\n`;
    
    // Tilføj befolknings-information
    if (populationData) {
        message += `\n👥 BEFOLKNING:\n`;
        message += `Befolkning: ${oldPopulation} → ${window.gameState.population}`;
        if (populationData.populationGrowth !== 0) {
            message += ` (${populationData.populationGrowth > 0 ? '+' : ''}${populationData.populationGrowth})`;
        }
        message += `\nTilfredshed: ${oldHappiness}% → ${window.gameState.happiness}%`;
        
        if (populationData.populationGrowth > 0) {
            message += `\n✅ Din by vokser!`;
        } else if (populationData.populationGrowth < 0) {
            message += `\n⚠️ Borgere flytter væk!`;
        }
    }
    
    if (netResult < 0) {
        message += `\n💸 Du har underskud! Byg flere boliger for at øge indtægten.`;
    }
    
    updateUI();
    saveGameData();
    
    // Tjek for bankrot
    setTimeout(() => {
        checkBankruptcy();
    }, 500);
    
    console.log(message);
    alert(message);
}

// Vælg bygning (fra sidebar)
function selectBuilding(buildingType) {
    console.log('Selected building:', buildingType);
    
    // Find første ledige slot
    let emptySlot = null;
    for (let i = 1; i <= window.gameState.maxBuildingSlots; i++) {
        if (!window.gameState.buildings[i]) {
            emptySlot = i;
            break;
        }
    }
    
    if (emptySlot) {
        buildBuilding(buildingType, emptySlot);
    } else {
        alert('Ingen ledige byggepladser! Udvid din by eller riv nogle bygninger ned.');
    }
}

// Initialiser spillet
function initializeGame() {
    // Prøv at indlæse gemt data
    if (!loadGameData()) {
        // Hvis der ikke er gemt data, brug standardværdier
        console.log('No saved data found, using defaults');
    }
    
    // Sikr at alle nødvendige properties eksisterer
    if (!window.gameState.research) {
        window.gameState.research = { cityExpansion: false };
    }
    
    // Opdater UI
    updateUI();
    
    // Setup event listeners for byggemenu
    setTimeout(() => {
        setupBuildingMenuEventListeners();
    }, 100);
    
    console.log('Game initialized successfully');
}

// Udvid byen (køb næste slot)
function expandCity() {
    // Find næste tilgængelige slot
    const nextSlot = window.gameState.maxBuildingSlots + 1;
    
    if (nextSlot <= 12) {
        buyBuildingSlot(nextSlot);
    } else {
        alert('Du har allerede købt alle tilgængelige byggepladser!');
    }
}

// Køb en specifik byggeslot
function buyBuildingSlot(slotNumber) {
    // Tjek om forskning er låst op
    if (!window.gameState.research.cityExpansion) {
        alert('Du skal forst forske byudvidelse før du kan købe byggepladser!');
        return;
    }
    
    // Tjek om vi har råd
    if (window.gameState.money < 5000) {
        alert('Du har ikke nok penge! Kræver 5.000 kr.');
        return;
    }
    
    // Tjek om slot allerede er købt
    if (slotNumber <= window.gameState.maxBuildingSlots) {
        alert('Denne byggeplads er allerede købt!');
        return;
    }
    
    // Køb slot
    window.gameState.money -= 5000;
    window.gameState.maxBuildingSlots = slotNumber;
    
    // Opdater UI
    updateUI();
    saveGameData();
    
    alert(`Byggeplads ${slotNumber} købt! Du har nu ${window.gameState.maxBuildingSlots} byggepladser.`);
}

// Tjek og håndter bankrot
function checkBankruptcy() {
    if (window.gameState.money <= 0 && window.gameState.stamina <= 0) {
        const choice = confirm(
            'Du er gået bankerot! 💸\n' +
            'Penge: ' + window.gameState.money + ' kr\n' +
            'Stamina: ' + window.gameState.stamina + '\n\n' +
            'Vil du have et nødlån på 2.000 kr for at fortsætte?'
        );
        
        if (choice) {
            window.gameState.money += 2000;
            window.gameState.stamina = Math.max(1, window.gameState.stamina);
            updateUI();
            saveGameData();
            alert('Du har fået et nødlån på 2.000 kr! 🏦\nBrug dem klogt til at bygge flere boliger og skabe indtægt.');
        }
    }
}

// Autosave hver 30 sekunder
setInterval(function() {
    if (window.gameState) {
        saveGameData();
    }
}, 30000);

// Gem når vinduet lukkes
window.addEventListener('beforeunload', function() {
    if (window.gameState) {
        saveGameData();
    }
});

// Initialiser når scriptet indlæses
document.addEventListener('DOMContentLoaded', function() {
    // Vent lidt for at sikre alle scripts er indlæst
    setTimeout(function() {
        if (!window.gameState) {
            window.gameState = {
                money: 10000,
                population: 0,
                happiness: 75,
                stamina: 10,
                year: 1930,
                buildings: {},
                maxBuildingSlots: 6,
                research: {
                    cityExpansion: false
                }
            };
        }
        
        // Prøv at indlæse gemt data
        loadGameData();
        
        console.log('Game state initialized on DOM load');
    }, 100);
});

// Eksporter funktioner til global scope
window.saveGameData = saveGameData;
window.loadGameData = loadGameData;
window.exportGameData = exportGameData;
window.importGameData = importGameData;
window.resetGame = resetGame;
window.updateUI = updateUI;
window.updateBuildingsGrid = updateBuildingsGrid;
window.updateEconomyDisplay = updateEconomyDisplay;
window.updateStatusPanel = updateStatusPanel;
window.checkBankruptcy = checkBankruptcy;
window.showBuildingMenu = showBuildingMenu;
window.hideBuildingMenu = hideBuildingMenu;
window.buildBuilding = buildBuilding;
window.demolishBuilding = demolishBuilding;
window.nextTurn = nextTurn;
window.selectBuilding = selectBuilding;
window.initializeGame = initializeGame;
window.expandCity = expandCity;
window.buyBuildingSlot = buyBuildingSlot;
window.setupBuildingMenuEventListeners = setupBuildingMenuEventListeners;
