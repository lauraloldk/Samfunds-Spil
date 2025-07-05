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
                purchasedSlots: loadedState.purchasedSlots || 0,
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

// Beregn maksimal stamina baseret på kraftværker
function getMaxStamina() {
    const buildings = Object.values(window.gameState.buildings);
    const powerPlantCount = buildings.filter(b => getBuildingType(b) === 'powerplant').length;
    
    // Basis stamina: 10, + 10 per kraftværk
    return 10 + (powerPlantCount * 10);
}

// Opdater UI baseret på gameState
function updateUI() {
    // Opdater ressourcer i header
    document.getElementById('money').textContent = window.gameState.money;
    document.getElementById('population').textContent = window.gameState.population;
    document.getElementById('happiness').textContent = window.gameState.happiness;
    
    // Vis stamina som current/max
    const maxStamina = getMaxStamina();
    document.getElementById('stamina').textContent = `${window.gameState.stamina}/${maxStamina}`;
    
    document.getElementById('year').textContent = window.gameState.year;
    
    // Opdater bygnings-grid hvis vi er på game-siden
    if (currentPage === 'game') {
        updateBuildingsGrid();
        updateEconomyDisplay();
        updateTierUI(); // Opdater tier-baseret UI
        
        // Opdater buildings grid system
        if (window.buildingsGridManager) {
            buildingsGridManager.updateGridDisplay();
        }
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
    
    Object.values(window.gameState.buildings).forEach(buildingData => {
        const buildingType = getBuildingType(buildingData);
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
    const roadCount = buildings.filter(b => getBuildingType(b) === 'road').length;
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
    const powerplantCount = buildings.filter(b => getBuildingType(b) === 'powerplant').length;
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
    const hospitalCount = buildings.filter(b => getBuildingType(b) === 'hospital').length;
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
    const schoolCount = buildings.filter(b => getBuildingType(b) === 'school').length;
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
    const houseCount = buildings.filter(b => getBuildingType(b) === 'house').length;
    const townCount = buildings.filter(b => getBuildingType(b) === 'town').length;
    const totalHousingUnits = houseCount + townCount;
    const housingStatus = document.getElementById('housing-status');
    if (housingStatus) {
        if (totalHousingUnits > 0) {
            const housingText = [];
            if (houseCount > 0) housingText.push(`${houseCount} hus${houseCount > 1 ? 'e' : ''}`);
            if (townCount > 0) housingText.push(`${townCount} flæk${townCount > 1 ? 'ker' : 'ke'}`);
            housingStatus.textContent = housingText.join(', ');
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
                    const buildingData = window.gameState.buildings[i];
                    const buildingType = getBuildingType(buildingData);
                    const buildingName = getBuildingName(buildingData);
                    const building = BUILDINGS[buildingType];
                    
                    slot.innerHTML = `
                        <div class="building">
                            <div class="building-icon">${building.icon}</div>
                            <div class="building-name">${buildingName}</div>
                            <div class="building-actions">
                                <button class="rename-btn" onclick="renameBuilding(${i})" title="Omdøb bygning">✏️</button>
                                <button class="demolish-btn" onclick="demolishBuilding(${i})" title="Riv bygning ned">🗑️</button>
                            </div>
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
function buildBuilding(buildingType, slotId, customName = null) {
    console.log('Building', buildingType, 'in slot', slotId);
    
    const building = BUILDINGS[buildingType];
    if (!building) {
        console.error('Building type not found:', buildingType);
        return;
    }
    
    // Tjek tier-krav
    if (building.tier && !canBuildTier(building.tier)) {
        alert(`Denne bygning kræver Tier ${building.tier} forskning!`);
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
    
    // Spørg om navn hvis ikke givet
    let buildingName = customName;
    if (!buildingName) {
        buildingName = prompt(`Giv din ${building.name} et navn:`, building.name) || building.name;
    }
    
    // Byg bygningen
    window.gameState.money -= building.cost;
    window.gameState.stamina -= building.staminaCost;
    
    // Opret bygnings-objekt med navn og metadata
    window.gameState.buildings[slotId] = {
        type: buildingType,
        name: buildingName,
        builtYear: window.gameState.year,
        id: generateBuildingId()
    };
    
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
        // Hvis bygningen øger max stamina, kan vi justere nuværende stamina
        if (building.effects.maxStamina) {
            // Øg nuværende stamina med forskellen hvis spilleren har mindre end max
            const newMaxStamina = getMaxStamina();
            if (window.gameState.stamina < newMaxStamina) {
                window.gameState.stamina = Math.min(newMaxStamina, window.gameState.stamina + building.effects.maxStamina);
            }
        }
    }
    
    hideBuildingMenu();
    updateUI();
    saveGameData();
    
    console.log('Building built successfully');
}

// Tjek om der er vejadgang
function hasRoadAccess() {
    return Object.values(window.gameState.buildings).some(buildingData => {
        return getBuildingType(buildingData) === 'road';
    });
}

// Riv bygning ned
function demolishBuilding(slotId) {
    const buildingData = window.gameState.buildings[slotId];
    const buildingName = getBuildingName(buildingData);
    
    if (confirm(`Er du sikker på, at du vil rive "${buildingName}" ned?`)) {
        const buildingType = getBuildingType(buildingData);
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
            // Hvis bygningen reducerer max stamina, justér nuværende stamina
            if (building.effects.maxStamina) {
                const newMaxStamina = getMaxStamina() - building.effects.maxStamina;
                if (window.gameState.stamina > newMaxStamina) {
                    window.gameState.stamina = newMaxStamina;
                }
            }
        }
        
        // Fjern bygningen
        delete window.gameState.buildings[slotId];
        
        // Giv halvdelen af prisen tilbage
        window.gameState.money += Math.floor(building.cost / 2);
        
        updateUI();
        saveGameData();
        
        console.log(`Building "${buildingName}" demolished from slot ${slotId}`);
    }
}

// Omdøb bygning
function renameBuilding(slotId) {
    const buildingData = window.gameState.buildings[slotId];
    if (!buildingData) {
        console.error('No building found in slot', slotId);
        return;
    }
    
    const currentName = getBuildingName(buildingData);
    const newName = prompt(`Nyt navn for bygningen:`, currentName);
    
    if (newName && newName.trim()) {
        // Konverter til nyt format hvis det er gammelt format
        if (typeof buildingData === 'string') {
            window.gameState.buildings[slotId] = {
                type: buildingData,
                name: newName.trim(),
                builtYear: window.gameState.year,
                id: generateBuildingId()
            };
        } else {
            buildingData.name = newName.trim();
        }
        
        updateBuildingsGrid();
        saveGameData();
        console.log(`Building in slot ${slotId} renamed to "${newName}"`);
    }
}

// Næste runde
function nextTurn() {
    // Synkroniser research data
    syncResearchData();
    
    // Øg år
    window.gameState.year++;
    
    // Regenerer stamina
    const oldStamina = window.gameState.stamina;
    window.gameState.stamina = Math.min(getMaxStamina(), window.gameState.stamina + 3);
    
    // Beregn indtægt og udgifter
    let income = window.gameState.population * 10; // 10 kr per borger (basis)
    
    // Beregn årlig befolkningsbonus baseret på tier og skoler
    let populationBonus = 0;
    if (window.gameState.population > 0) {
        // Få nuværende tier
        let currentTier = 0;
        if (window.gameState.researchData && window.gameState.researchData.currentTier !== undefined) {
            currentTier = window.gameState.researchData.currentTier;
        } else if (window.researchSystem && window.researchSystem.researchData) {
            currentTier = window.researchSystem.researchData.currentTier;
        }
        
        // Tæl antal skoler
        let schoolCount = 0;
        Object.values(window.gameState.buildings).forEach(buildingData => {
            if (getBuildingType(buildingData) === 'school') {
                schoolCount++;
            }
        });
        
        // Beregn bonus per borger
        // Base bonus: 1 + (2 * tier)
        const baseBonus = 1 + (2 * currentTier);
        
        // Skole bonus: (antal skoler * 2 * tier) - men minimum 0
        const schoolBonus = schoolCount * 2 * Math.max(currentTier, 1);
        
        // Total bonus per borger
        const bonusPerCitizen = baseBonus + schoolBonus;
        
        // Total befolkningsbonus
        populationBonus = window.gameState.population * bonusPerCitizen;
    }
    
    // Tilføj befolkningsbonus til indkomst
    income += populationBonus;
    
    let maintenance = 0;
    
    Object.values(window.gameState.buildings).forEach(buildingData => {
        const buildingType = getBuildingType(buildingData);
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
    
    // Proces årlige events (hvis event system er tilgængeligt)
    let yearlyEvents = [];
    if (window.eventManager) {
        yearlyEvents = eventManager.processYearlyEvents();
    }
    
    // Opdater buildings grid system (hvis tilgængeligt)
    if (window.buildingsGridManager) {
        buildingsGridManager.updatePriceModifiers();
    }
    
    // Vis feedback
    let message = `År ${window.gameState.year}\n`;
    message += `Stamina: ${oldStamina} → ${window.gameState.stamina}\n`;
    message += `Basis indtægt: ${window.gameState.population * 10} kr (${window.gameState.population} borgere × 10 kr)\n`;
    
    if (populationBonus > 0) {
        // Få nuværende tier for feedback
        let currentTier = 0;
        if (window.gameState.researchData && window.gameState.researchData.currentTier !== undefined) {
            currentTier = window.gameState.researchData.currentTier;
        } else if (window.researchSystem && window.researchSystem.researchData) {
            currentTier = window.researchSystem.researchData.currentTier;
        }
        
        // Tæl antal skoler
        let schoolCount = 0;
        Object.values(window.gameState.buildings).forEach(buildingData => {
            if (getBuildingType(buildingData) === 'school') {
                schoolCount++;
            }
        });
        
        message += `💰 Befolkningsbonus: ${populationBonus} kr\n`;
        message += `   → Tier ${currentTier} base: ${1 + (2 * currentTier)} kr/borger\n`;
        if (schoolCount > 0) {
            const schoolBonus = schoolCount * 2 * Math.max(currentTier, 1);
            message += `   → Skole bonus: ${schoolBonus} kr/borger (${schoolCount} skole${schoolCount > 1 ? 'r' : ''} × ${2 * Math.max(currentTier, 1)} kr)\n`;
        }
        message += `   → Total: ${window.gameState.population} borgere × ${populationBonus / window.gameState.population} kr = ${populationBonus} kr\n`;
    } else if (window.gameState.population === 0) {
        message += `💰 Befolkningsbonus: 0 kr (ingen borgere)\n`;
    }
    
    message += `Total indtægt: ${income} kr\n`;
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
    
    // Tilføj event-information
    if (yearlyEvents.length > 0) {
        message += `\n📰 EVENTS:\n`;
        yearlyEvents.forEach(event => {
            message += `${event.name}: ${event.message}\n`;
        });
    }
    
    if (netResult < 0) {
        message += `\n💸 Du har underskud! Byg flere boliger for at øge indtægten.`;
    }
    
    updateUI();
    saveGameData();
    
    // Vis event notifikationer
    if (yearlyEvents.length > 0) {
        yearlyEvents.forEach((event, index) => {
            setTimeout(() => {
                eventManager.showEventNotification(event);
            }, index * 1000); // Vis med 1 sekunds mellemrum
        });
    }
    
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
    
    // Synkroniser research data
    syncResearchData();
    
    // Initialiser buildings grid system
    if (window.buildingsGridManager) {
        buildingsGridManager.initializeGrid();
    }
    
    // Opdater UI
    updateUI();
    
    // Setup event listeners for byggemenu
    setTimeout(() => {
        setupBuildingMenuEventListeners();
    }, 100);
    
    console.log('Game initialized successfully');
}

// Udvid byen (køb næste slot) - DEPRECATED - Nu håndteret af BuildingsGridManager
/*
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
*/

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
            alert('Du har fået et nødlån på 2.000 kr! 🏦\nBrug dem klogt til at bygge flere boliger og skabe indtægten.');
        }
    }
}

// Synkroniser research data med gameState
function syncResearchData() {
    console.log('=== syncResearchData DEBUG ===');
    console.log('researchSystem exists:', !!window.researchSystem);
    console.log('researchSystem.researchData:', window.researchSystem?.researchData);
    
    if (window.researchSystem && window.researchSystem.researchData) {
        // Gem research data i gameState for nem adgang
        if (!window.gameState.researchData) {
            window.gameState.researchData = {};
        }
        window.gameState.researchData = { ...window.researchSystem.researchData };
        console.log('Research data synchronized from researchSystem. Current tier:', window.gameState.researchData.currentTier);
    } else {
        // Prøv at hente fra localStorage hvis researchSystem ikke er tilgængeligt
        try {
            const researchData = localStorage.getItem('research-data');
            if (researchData) {
                const parsed = JSON.parse(researchData);
                if (!window.gameState.researchData) {
                    window.gameState.researchData = {};
                }
                window.gameState.researchData = { ...parsed };
                console.log('Research data synchronized from localStorage. Current tier:', window.gameState.researchData.currentTier);
            }
        } catch (e) {
            console.log('Error reading research data from localStorage:', e);
        }
    }
    
    console.log('Final gameState.researchData:', window.gameState.researchData);
    console.log('===============================');
}

// Generer unique ID for bygninger
function generateBuildingId() {
    return 'building_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Få bygningstype fra bygnings-objekt (bagudkompatibilitet)
function getBuildingType(buildingData) {
    if (typeof buildingData === 'string') {
        return buildingData; // Gamle format
    }
    return buildingData.type; // Nye format
}

// Få bygningsnavn fra bygnings-objekt
function getBuildingName(buildingData) {
    if (typeof buildingData === 'string') {
        return BUILDINGS[buildingData]?.name || buildingData; // Gamle format
    }
    return buildingData.name || BUILDINGS[buildingData.type]?.name || buildingData.type; // Nye format
}

// Tjek om spilleren kan bygge bygninger fra en bestemt tier
function canBuildTier(tier) {
    if (!window.researchSystem) return tier === 0; // Kun grundlæggende bygninger hvis research system ikke er loaded
    return window.researchSystem.isTierUnlocked(tier);
}

// Merger 3 "Lille Flække" til 1 "Flække"
function mergeBuildings() {
    const buildings = Object.entries(window.gameState.buildings);
    const houseBuildings = buildings.filter(([slotId, building]) => {
        return getBuildingType(building) === 'house';
    });
    
    if (houseBuildings.length < 3) {
        alert('Du skal have mindst 3 Lille Flække for at merge!');
        return;
    }
    
    // Tjek om Tier 2 er ulåst
    if (!canBuildTier(2)) {
        alert('Du skal have Tier 2 forskning for at merge bygninger!');
        return;
    }
    
    // Tag de første 3 huse
    const housesToMerge = houseBuildings.slice(0, 3);
    const firstSlot = housesToMerge[0][0];
    const firstName = getBuildingName(housesToMerge[0][1]);
    
    // Slet de 3 huse
    housesToMerge.forEach(([slotId, building]) => {
        delete window.gameState.buildings[slotId];
        // Træk befolkning fra
        window.gameState.population -= BUILDINGS.house.effects.population;
    });
    
    // Tilføj den nye flække i første slot
    const newName = prompt(`Giv din nye Flække et navn:`, `${firstName} Flække`) || `${firstName} Flække`;
    window.gameState.buildings[firstSlot] = {
        type: 'town',
        name: newName,
        builtYear: window.gameState.year,
        id: generateBuildingId()
    };
    
    // Tilføj befolkning fra den nye flække
    window.gameState.population += BUILDINGS.town.effects.population;
    
    // Opdater UI
    updateUI();
    alert(`🎉 Merge gennemført! ${newName} er nu bygget!`);
}

// Vis merge muligheder
function showMergeOptions() {
    const buildings = Object.entries(window.gameState.buildings);
    const houseBuildings = buildings.filter(([slotId, building]) => {
        return getBuildingType(building) === 'house';
    });
    
    if (houseBuildings.length < 3) {
        alert(`Du har ${houseBuildings.length} Lille Flække.\nDu skal have mindst 3 for at merge til 1 Flække.`);
        return;
    }
    
    const confirmMerge = confirm(`Du har ${houseBuildings.length} Lille Flække.\n\nVil du merge 3 af dem til 1 Flække?\n\n• Mister: 3 Lille Flække (36 befolkning)\n• Får: 1 Flække (17 befolkning)\n• Bonus: 10% reduktion i negative events\n\nDette er GRATIS og kan ikke fortrydes!`);
    
    if (confirmMerge) {
        mergeBuildings();
    }
}

// Opdater UI baseret på research tier
function updateTierUI() {
    // Vis/skjul Tier 2 bygninger
    const townBtn = document.getElementById('town-btn');
    const townMenuBtn = document.getElementById('town-menu-btn');
    const mergePanel = document.getElementById('merge-panel');
    
    if (canBuildTier(2)) {
        if (townBtn) townBtn.style.display = 'block';
        if (townMenuBtn) townMenuBtn.style.display = 'block';
        if (mergePanel) mergePanel.style.display = 'block';
    } else {
        if (townBtn) townBtn.style.display = 'none';
        if (townMenuBtn) townMenuBtn.style.display = 'none';
        if (mergePanel) mergePanel.style.display = 'none';
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
window.renameBuilding = renameBuilding;
window.nextTurn = nextTurn;
window.selectBuilding = selectBuilding;
window.initializeGame = initializeGame;
// window.expandCity = expandCity; // Nu håndteret af BuildingsGridManager
// window.buyBuildingSlot = buyBuildingSlot; // Nu håndteret af BuildingsGridManager
window.setupBuildingMenuEventListeners = setupBuildingMenuEventListeners;
window.syncResearchData = syncResearchData;
// Export utility functions for building data
window.getBuildingType = getBuildingType;
window.getBuildingName = getBuildingName;
window.generateBuildingId = generateBuildingId;
// Export tier and merge functions
window.canBuildTier = canBuildTier;
window.mergeBuildings = mergeBuildings;
window.showMergeOptions = showMergeOptions;
window.updateTierUI = updateTierUI;
