// Buildings Grid System - Dynamisk slot-håndtering med tier-baserede grænser
console.log('Loading buildings-grid.js...');

class BuildingsGridManager {
    constructor() {
        this.baseSlotPrice = 500; // Startpris for første ekstra slot
        this.priceIncreaseRate = 0.10; // 10% stigning per slot
        this.priceModifiers = []; // Array af pris-modifiers fra events/bygninger
        
        // Tier-baserede slot-grænser
        this.tierSlotLimits = {
            0: 6,   // Tier 0: 6 slots
            1: 12,  // Tier 1: 12 slots
            2: 20,  // Tier 2: 20 slots (fremtid)
            3: 30,  // Tier 3: 30 slots (fremtid)
            4: 45,  // Tier 4: 45 slots (fremtid)
            5: 60   // Tier 5: 60 slots (fremtid)
        };
        
        // Standard antal slots ved start
        this.defaultSlots = 6;
        
        this.initializeGrid();
    }
    
    // Initialiser grid-systemet
    initializeGrid() {
        console.log('Initializing buildings grid system');
        
        // Sikr at gameState har de nødvendige properties
        if (!window.gameState.maxBuildingSlots) {
            window.gameState.maxBuildingSlots = this.defaultSlots;
        }
        
        if (!window.gameState.purchasedSlots) {
            window.gameState.purchasedSlots = 0; // Antal ekstra slots købt
        }
        
        this.updateGridDisplay();
    }
    
    // Få nuværende tier
    getCurrentTier() {
        let currentTier = 0;
        
        console.log('=== getCurrentTier DEBUG ===');
        console.log('gameState:', window.gameState);
        console.log('gameState.researchData:', window.gameState?.researchData);
        console.log('gameState.researchData.currentTier:', window.gameState?.researchData?.currentTier);
        console.log('researchSystem:', window.researchSystem);
        console.log('researchSystem.researchData:', window.researchSystem?.researchData);
        console.log('researchSystem.researchData.currentTier:', window.researchSystem?.researchData?.currentTier);
        console.log('gameState.research:', window.gameState?.research);
        console.log('gameState.research.cityExpansion:', window.gameState?.research?.cityExpansion);
        
        // Prøv først gameState
        if (window.gameState && window.gameState.researchData && window.gameState.researchData.currentTier !== undefined) {
            currentTier = window.gameState.researchData.currentTier;
            console.log('Using gameState.researchData.currentTier:', currentTier);
        } 
        // Prøv derefter researchSystem
        else if (window.researchSystem && window.researchSystem.researchData && window.researchSystem.researchData.currentTier !== undefined) {
            currentTier = window.researchSystem.researchData.currentTier;
            console.log('Using researchSystem.researchData.currentTier:', currentTier);
        }
        // Prøv localStorage direkte
        else {
            try {
                const researchData = localStorage.getItem('research-data');
                if (researchData) {
                    const parsed = JSON.parse(researchData);
                    if (parsed.currentTier !== undefined) {
                        currentTier = parsed.currentTier;
                        console.log('Using localStorage research-data.currentTier:', currentTier);
                    }
                }
            } catch (e) {
                console.log('Error reading localStorage research-data:', e);
            }
        }
        
        // Fallback til research object direkte
        if (currentTier === 0 && window.gameState && window.gameState.research && window.gameState.research.cityExpansion) {
            currentTier = 1; // Hvis gamle cityExpansion er true, så er vi i tier 1
            console.log('Using fallback gameState.research.cityExpansion, setting tier to 1');
        }
        
        console.log('Final currentTier:', currentTier);
        console.log('===========================');
        return currentTier;
    }
    
    // Få maksimum antal slots for nuværende tier
    getMaxSlotsForTier(tier = null) {
        if (tier === null) {
            tier = this.getCurrentTier();
        }
        return this.tierSlotLimits[tier] || this.tierSlotLimits[0];
    }
    
    // Beregn pris for næste slot
    calculateNextSlotPrice() {
        const purchasedSlots = window.gameState.purchasedSlots || 0;
        let price = this.baseSlotPrice;
        
        // Beregn pris baseret på antal allerede købte slots
        for (let i = 0; i < purchasedSlots; i++) {
            price *= (1 + this.priceIncreaseRate);
        }
        
        // Anvend pris-modifiers
        let totalModifier = 0;
        this.priceModifiers.forEach(modifier => {
            if (modifier.active) {
                totalModifier += modifier.percentage;
            }
        });
        
        price *= (1 + totalModifier);
        
        return Math.round(price);
    }
    
    // Beregn base pris for en specifik slot (uden modifiers)
    calculateBasePriceForSlot(slotNumber) {
        let price = this.baseSlotPrice;
        
        // Beregn pris baseret på slot nummer
        for (let i = 0; i < slotNumber; i++) {
            price *= (1 + this.priceIncreaseRate);
        }
        
        return Math.round(price);
    }
    
    // Tjek om spilleren kan købe flere slots
    canPurchaseSlot() {
        // Synkroniser research data først
        if (typeof window.syncResearchData === 'function') {
            window.syncResearchData();
        }
        
        const currentSlots = window.gameState.maxBuildingSlots;
        const maxSlots = this.getMaxSlotsForTier();
        const currentTier = this.getCurrentTier();
        const hasSpace = currentSlots < maxSlots;
        const hasResearch = currentTier >= 1; // Kræver minimum Tier 1
        const nextSlotPrice = this.calculateNextSlotPrice();
        const hasMoney = window.gameState.money >= nextSlotPrice;
        
        console.log('=== canPurchaseSlot DEBUG ===');
        console.log('Current slots:', currentSlots);
        console.log('Max slots for tier:', maxSlots);
        console.log('Current tier:', currentTier);
        console.log('Has space:', hasSpace);
        console.log('Has research (tier >= 1):', hasResearch);
        console.log('Player money:', window.gameState.money);
        console.log('Next slot price:', nextSlotPrice);
        console.log('Has money:', hasMoney);
        console.log('gameState.researchData:', window.gameState.researchData);
        console.log('researchSystem.researchData:', window.researchSystem?.researchData);
        console.log('=============================');
        
        return {
            canPurchase: hasSpace && hasResearch && hasMoney,
            hasSpace,
            hasResearch,
            hasMoney,
            reason: !hasSpace ? 'Max slots nået for denne tier' :
                   !hasResearch ? 'Kræver Tier 1 forskning' :
                   !hasMoney ? 'Ikke nok penge' : 'OK'
        };
    }
    
    // Køb en ny slot
    purchaseSlot() {
        const purchaseCheck = this.canPurchaseSlot();
        
        if (!purchaseCheck.canPurchase) {
            alert(`Kan ikke købe slot: ${purchaseCheck.reason}`);
            return false;
        }
        
        const price = this.calculateNextSlotPrice();
        
        // Fratrække penge
        window.gameState.money -= price;
        
        // Øg antal slots
        window.gameState.maxBuildingSlots++;
        window.gameState.purchasedSlots = (window.gameState.purchasedSlots || 0) + 1;
        
        // Opdater grid
        this.updateGridDisplay();
        
        // Gem spil
        if (typeof saveGameData === 'function') {
            saveGameData();
        }
        
        console.log(`Purchased new slot for ${price} kr. Total slots: ${window.gameState.maxBuildingSlots}`);
        return true;
    }
    
    // Opdater grid-display
    updateGridDisplay() {
        const maxSlots = window.gameState.maxBuildingSlots || this.defaultSlots;
        const gridContainer = document.querySelector('.buildings-grid');
        
        if (!gridContainer) {
            console.log('Buildings grid not found, will update when available');
            return;
        }
        
        // Sikr at der er nok slots i DOM
        this.ensureSlotsExist(maxSlots);
        
        // Vis/skjul slots baseret på maxSlots
        for (let i = 1; i <= 60; i++) { // Maksimum 60 slots (tier 5)
            const slot = document.getElementById(`slot-${i}`);
            if (slot) {
                if (i <= maxSlots) {
                    slot.style.display = 'block';
                } else {
                    slot.style.display = 'none';
                }
            }
        }
        
        // Opdater expansion panel med forsinkelse for at sikre DOM er klar
        setTimeout(() => {
            this.updateExpansionPanel();
        }, 100);
    }
    
    // Sikr at der er nok slot-elementer i DOM
    ensureSlotsExist(neededSlots) {
        const gridContainer = document.querySelector('.buildings-grid');
        if (!gridContainer) return;
        
        const existingSlots = gridContainer.querySelectorAll('.building-slot').length;
        
        for (let i = existingSlots + 1; i <= neededSlots; i++) {
            const slotElement = document.createElement('div');
            slotElement.className = 'building-slot';
            slotElement.id = `slot-${i}`;
            slotElement.innerHTML = `
                <div class="empty-slot">Tom grund<br>Klik for at bygge</div>
            `;
            
            // Tilføj event listener
            slotElement.addEventListener('click', () => {
                this.handleSlotClick(i);
            });
            
            gridContainer.appendChild(slotElement);
        }
    }
    
    // Håndter slot klik
    handleSlotClick(slotId) {
        if (typeof showBuildingMenu === 'function') {
            showBuildingMenu(slotId);
        } else {
            console.log(`Clicked slot ${slotId}`);
        }
    }
    
    // Opdater udvidelsespanel
    updateExpansionPanel() {
        const expansionPanel = document.getElementById('expansion-panel');
        const expandBtn = document.getElementById('expand-btn');
        const slotsInfo = document.getElementById('slots-info');
        
        if (!expansionPanel) return;
        
        // Synkroniser research data
        if (typeof window.syncResearchData === 'function') {
            window.syncResearchData();
        }
        
        const currentTier = this.getCurrentTier();
        const maxSlots = this.getMaxSlotsForTier();
        const currentSlots = window.gameState.maxBuildingSlots;
        const purchaseCheck = this.canPurchaseSlot();
        const nextPrice = this.calculateNextSlotPrice();
        const basePriceForNext = this.calculateBasePriceForSlot(window.gameState.purchasedSlots || 0);
        const activeModifiers = this.getActivePriceModifiers();
        
        // Vis panel hvis Tier 1+ eller hvis der allerede er ekstra slots
        if (currentTier >= 1 || currentSlots > this.defaultSlots) {
            expansionPanel.style.display = 'block';
            
            // Opdater info tekst
            if (slotsInfo) {
                let infoText = `Du har ${currentSlots} af ${maxSlots} mulige byggepladser (Tier ${currentTier})`;
                
                // Tilføj information om aktive modifiers
                if (activeModifiers.length > 0) {
                    infoText += `\n\nAktive modifiers:`;
                    activeModifiers.forEach(modifier => {
                        const sign = modifier.percentage > 0 ? '+' : '';
                        infoText += `\n• ${modifier.description}`;
                    });
                }
                
                slotsInfo.textContent = infoText;
                slotsInfo.style.whiteSpace = 'pre-line'; // Tillad linjeskift
            }
            
            // Opdater knap
            if (expandBtn) {
                let buttonText = `🏗️ Køb byggeplads (${nextPrice.toLocaleString()} kr)`;
                
                // Vis base pris og modifier hvis der er forskel
                if (nextPrice !== basePriceForNext) {
                    buttonText += `\n(Base: ${basePriceForNext.toLocaleString()} kr)`;
                }
                
                expandBtn.textContent = buttonText;
                expandBtn.disabled = !purchaseCheck.canPurchase;
                expandBtn.title = purchaseCheck.reason;
                
                if (!purchaseCheck.canPurchase) {
                    expandBtn.classList.add('disabled');
                } else {
                    expandBtn.classList.remove('disabled');
                }
            }
        } else {
            expansionPanel.style.display = 'none';
        }
    }
    
    // Tilføj pris-modifier (fra events eller bygninger)
    addPriceModifier(id, percentage, duration = null, description = '') {
        const modifier = {
            id: id,
            percentage: percentage, // -0.1 for 10% rabat, +0.2 for 20% tillæg
            duration: duration, // null for permanent, antal år for midlertidig
            description: description,
            active: true,
            startYear: window.gameState.year
        };
        
        // Fjern eksisterende modifier med samme ID
        this.priceModifiers = this.priceModifiers.filter(m => m.id !== id);
        
        // Tilføj ny modifier
        this.priceModifiers.push(modifier);
        
        console.log(`Added price modifier: ${description} (${percentage > 0 ? '+' : ''}${Math.round(percentage * 100)}%)`);
        this.updateExpansionPanel();
    }
    
    // Fjern pris-modifier
    removePriceModifier(id) {
        this.priceModifiers = this.priceModifiers.filter(m => m.id !== id);
        this.updateExpansionPanel();
    }
    
    // Opdater pris-modifiers (kaldes hvert år)
    updatePriceModifiers() {
        const currentYear = window.gameState.year;
        
        this.priceModifiers.forEach(modifier => {
            if (modifier.duration !== null) {
                const yearsPassed = currentYear - modifier.startYear;
                if (yearsPassed >= modifier.duration) {
                    modifier.active = false;
                }
            }
        });
        
        // Fjern inaktive modifiers
        this.priceModifiers = this.priceModifiers.filter(m => m.active);
    }
    
    // Få aktive pris-modifiers (til visning)
    getActivePriceModifiers() {
        return this.priceModifiers.filter(m => m.active);
    }
    
    // Tier-opgradering (kaldes når tier ændres)
    onTierUpgrade(newTier) {
        const oldMaxSlots = this.getMaxSlotsForTier(newTier - 1);
        const newMaxSlots = this.getMaxSlotsForTier(newTier);
        
        if (newMaxSlots > oldMaxSlots) {
            console.log(`Tier upgrade! Max slots increased from ${oldMaxSlots} to ${newMaxSlots}`);
            
            // Opdater display
            this.updateGridDisplay();
            
            // Vis besked til spilleren
            if (typeof alert === 'function') {
                setTimeout(() => {
                    alert(`🎉 Tier ${newTier} opnået!\n\nDu kan nu bygge op til ${newMaxSlots} bygninger (tidligere ${oldMaxSlots}).`);
                }, 1000);
            }
        }
    }
    
    // Få statistikker om grid-systemet
    getGridStatistics() {
        const currentTier = this.getCurrentTier();
        return {
            currentSlots: window.gameState.maxBuildingSlots,
            maxSlotsForTier: this.getMaxSlotsForTier(),
            purchasedSlots: window.gameState.purchasedSlots || 0,
            nextSlotPrice: this.calculateNextSlotPrice(),
            currentTier: currentTier,
            activePriceModifiers: this.getActivePriceModifiers(),
            canPurchaseSlot: this.canPurchaseSlot()
        };
    }
    
    // Reset system (til nye spil)
    reset() {
        window.gameState.maxBuildingSlots = this.defaultSlots;
        window.gameState.purchasedSlots = 0;
        this.priceModifiers = [];
        this.updateGridDisplay();
    }
    
    // Debug information
    debugInfo() {
        const stats = this.getGridStatistics();
        const tierInfo = {
            gameStateResearch: window.gameState?.researchData?.currentTier,
            researchSystemTier: window.researchSystem?.researchData?.currentTier,
            oldResearchSystem: window.gameState?.research?.cityExpansion,
            calculatedTier: this.getCurrentTier()
        };
        
        console.log('Buildings Grid Debug Info:', {
            ...stats,
            tierInfo
        });
        
        return { ...stats, tierInfo };
    }
}

// CSS til disabled knapper
const gridCSS = `
    .build-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #ccc !important;
    }
    
    .build-btn.disabled:hover {
        background: #ccc !important;
        transform: none !important;
    }
    
    .buildings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
        max-height: 400px;
        overflow-y: auto;
        padding: 10px;
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
    }
    
    .building-slot {
        aspect-ratio: 1;
        border: 2px dashed #ddd;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        background: rgba(255,255,255,0.8);
    }
    
    .building-slot:hover {
        border-color: #3498db;
        background: rgba(255,255,255,0.95);
        transform: translateY(-2px);
    }
    
    .empty-slot {
        text-align: center;
        color: #666;
        font-size: 0.9em;
        padding: 10px;
    }
    
    .building-slot.occupied {
        border: 2px solid #27ae60;
        background: rgba(39, 174, 96, 0.1);
    }
    
    .building-content {
        text-align: center;
        padding: 10px;
    }
    
    .building-icon {
        font-size: 2em;
        margin-bottom: 5px;
    }
    
    .building-name {
        font-size: 0.8em;
        font-weight: bold;
        color: #2c3e50;
    }
`;

// Tilføj CSS til head
const gridStyleSheet = document.createElement('style');
gridStyleSheet.textContent = gridCSS;
document.head.appendChild(gridStyleSheet);

// Initialiser buildings grid manager
const buildingsGridManager = new BuildingsGridManager();

// Eksporter til global scope
window.buildingsGridManager = buildingsGridManager;
window.BuildingsGridManager = BuildingsGridManager;

// Global funktioner til kompatibilitet
window.expandCity = function() {
    return buildingsGridManager.purchaseSlot();
};

window.updateBuildingsGrid = function() {
    // First handle slot visibility and expansion (from buildings-grid.js)
    buildingsGridManager.updateGridDisplay();
    
    // Then handle building content display (from game-logic.js)
    // This is the original updateBuildingsGrid logic with building names
    for (let i = 1; i <= 60; i++) { // Support up to 60 slots
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
};

// Debug funktioner
window.debugBuildingsGrid = function() {
    return buildingsGridManager.debugInfo();
};

window.forceTierSync = function() {
    if (typeof window.syncResearchData === 'function') {
        window.syncResearchData();
    }
    buildingsGridManager.updateGridDisplay();
    console.log('Tier sync forced. Current tier:', buildingsGridManager.getCurrentTier());
};

window.forceExpansionUpdate = function() {
    buildingsGridManager.updateExpansionPanel();
    console.log('Expansion panel force updated');
};

window.testPurchaseSlot = function() {
    const result = buildingsGridManager.canPurchaseSlot();
    console.log('Purchase slot test result:', result);
    return result;
};

window.quickFixTier = function() {
    // Quick fix for tier issues
    if (!window.gameState.researchData) {
        window.gameState.researchData = {};
    }
    window.gameState.researchData.currentTier = 1;
    
    if (window.researchSystem && window.researchSystem.researchData) {
        window.researchSystem.researchData.currentTier = 1;
    }
    
    // Update localStorage
    try {
        const researchData = {
            currentTier: 1,
            unlockedFeatures: ['basic_buildings', 'city_expansion'],
            researchHistory: []
        };
        localStorage.setItem('research-data', JSON.stringify(researchData));
    } catch (e) {
        console.log('Error updating localStorage:', e);
    }
    
    // Force update
    buildingsGridManager.updateGridDisplay();
    console.log('Quick fix applied - Tier set to 1');
};

console.log('Buildings grid system loaded successfully');
