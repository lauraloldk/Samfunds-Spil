// Settings funktioner
console.log('Loading settings.js...');

function initializeSettings() {
    // Indstillinger-siden er klar
    console.log('Settings initialized');
}

// Gem spil (wrapper til saveGameData)
function saveGame() {
    if (typeof saveGameData === 'function') {
        const success = saveGameData();
        if (success) {
            alert('Spillet er gemt!');
        } else {
            alert('Fejl ved gemning af spillet!');
        }
    }
}

// Indlæs spil (wrapper til loadGameData)
function loadGame() {
    if (typeof loadGameData === 'function') {
        const success = loadGameData();
        if (success) {
            if (typeof updateUI === 'function') {
                updateUI();
            }
            alert('Spillet er indlæst!');
        } else {
            alert('Ingen gemt data fundet!');
        }
    }
}

// Ryd cache
function clearCache() {
    if (confirm('Er du sikker på, at du vil rydde cache? Dette kan hjælpe med at løse problemer, men din progression bliver ikke påvirket.')) {
        // Ryd localStorage undtagen spildata
        const gameData = localStorage.getItem('samfunds-spil-data');
        localStorage.clear();
        if (gameData) {
            localStorage.setItem('samfunds-spil-data', gameData);
        }
        
        // Genindlæs siden
        location.reload();
    }
}

// Vis debug information
function showDebugInfo() {
    if (window.gameState) {
        const debugInfo = {
            gameState: window.gameState,
            localStorage: {
                gameData: localStorage.getItem('samfunds-spil-data'),
                researchData: localStorage.getItem('research-data')
            },
            currentPage: window.currentPage || 'unknown',
            scriptsLoaded: {
                gameLogic: typeof window.saveGameData === 'function',
                research: typeof window.researchSystem !== 'undefined',
                towns: typeof window.buyBuildingSlot === 'function',
                stats: typeof window.GameStats !== 'undefined'
            }
        };
        
        console.log('Debug Info:', debugInfo);
        alert('Debug information logged to console. Press F12 to view.');
    } else {
        alert('gameState not found!');
    }
}

// Eksporter funktioner
window.initializeSettings = initializeSettings;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.clearCache = clearCache;
window.showDebugInfo = showDebugInfo;

console.log('Settings functions loaded');
