// Towns/City expansion functions
console.log('Loading towns.js...');

function buyBuildingSlot(slotNumber) {
    // Sikre at gameState eksisterer
    if (!window.gameState) {
        alert('Spillet er ikke fuldt indlæst endnu. Prøv igen om lidt.');
        return;
    }
    
    // Sikre at research objektet eksisterer
    if (!gameState.research) {
        gameState.research = { cityExpansion: false };
    }
    
    // Tjek om byudvidelse er forsket
    const hasResearch = gameState.research.cityExpansion || 
                       (window.researchSystem && researchSystem.isFeatureUnlocked('city_expansion'));
    
    if (!hasResearch) {
        alert('Du skal først forske Tier 1: Byudvidelse for at købe ekstra byggepladser!');
        return;
    }
    
    // Tjek om vi har nok penge
    if (gameState.money < 5000) {
        alert('Du har ikke nok penge! Kræver 5.000 kr.');
        return;
    }
    
    // Tjek om slot allerede er købt
    if (gameState.maxBuildingSlots >= slotNumber) {
        alert('Denne byggeplads er allerede købt!');
        return;
    }
    
    // Køb byggeplasen
    gameState.money -= 5000;
    gameState.maxBuildingSlots = slotNumber;
    
    // Opdater UI
    if (typeof updateUI === 'function') {
        updateUI();
    }
    updateTownsUI();
    
    // Gem spil
    if (typeof saveGame === 'function') {
        saveGame();
    }
    
    alert(`Byggeplads ${slotNumber} købt! Du kan nu bygge på denne plads.`);
}

function initializeTowns() {
    // Opdater towns UI når siden indlæses
    setTimeout(() => {
        updateTownsUI();
    }, 100); // Kort delay for at sikre gameState er indlæst
}

function updateTownsUI() {
    // Sikre at gameState eksisterer
    if (!window.gameState) {
        console.log('gameState not ready yet');
        return;
    }
    
    // Sikre at research objektet eksisterer
    if (!gameState.research) {
        gameState.research = { cityExpansion: false };
    }
    
    // Opdater byoversigt
    const currentSlots = document.getElementById('current-slots');
    const maxSlots = document.getElementById('max-slots');
    const availableSlots = document.getElementById('available-slots');
    
    if (currentSlots) {
        currentSlots.textContent = gameState.maxBuildingSlots;
    }
    
    if (maxSlots) {
        maxSlots.textContent = '12';
    }
    
    if (availableSlots) {
        availableSlots.textContent = 12 - gameState.maxBuildingSlots;
    }
    
    // Opdater køb-knapper for slot 7-12
    for (let i = 7; i <= 12; i++) {
        const slotStatus = document.getElementById(`status-${i}`);
        const buyBtn = document.getElementById(`buy-${i}`);
        
        if (gameState.maxBuildingSlots >= i) {
            // Slot er købt
            if (slotStatus) {
                slotStatus.textContent = '✅ Købt';
                slotStatus.className = 'slot-status owned';
            }
            
            if (buyBtn) {
                buyBtn.disabled = true;
                buyBtn.textContent = '✅ Købt';
            }
        } else {
            // Slot er ikke købt
            if (slotStatus) {
                slotStatus.textContent = '🔒 Låst';
                slotStatus.className = 'slot-status locked';
            }
            
            if (buyBtn) {
                const hasResearch = gameState.research.cityExpansion || 
                                   (window.researchSystem && researchSystem.isFeatureUnlocked('city_expansion'));
                const canBuy = hasResearch && gameState.money >= 5000;
                
                buyBtn.disabled = !canBuy;
                
                if (!hasResearch) {
                    buyBtn.textContent = '🔬 Kræver forskning';
                } else if (gameState.money < 5000) {
                    buyBtn.textContent = '💰 Ikke råd';
                } else {
                    buyBtn.textContent = '💰 Køb (5.000 kr)';
                }
            }
        }
    }
}

console.log('Towns functions loaded');
