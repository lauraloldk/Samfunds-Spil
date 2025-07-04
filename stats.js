// Statistik system til at tracke samfundets udvikling
class GameStats {
    constructor() {
        this.history = [];
        this.startTime = Date.now();
        this.achievements = [];
    }

    // Gem nuværende stats
    recordStats(gameState) {
        const timestamp = Date.now();
        const stats = {
            timestamp: timestamp,
            money: gameState.money,
            population: gameState.population,
            happiness: gameState.happiness,
            buildings: { ...gameState.buildings },
            societyScore: calculateSocietyScore(gameState)
        };
        
        this.history.push(stats);
        this.checkAchievements(stats);
        
        // Behold kun de sidste 100 records for at spare hukommelse
        if (this.history.length > 100) {
            this.history.shift();
        }
    }

    // Tjek for achievements
    checkAchievements(stats) {
        const achievements = [
            {
                id: 'first_building',
                name: 'Første bygning',
                description: 'Byg din første bygning',
                condition: () => Object.keys(stats.buildings).length >= 1
            },
            {
                id: 'growing_city',
                name: 'Voksende by',
                description: 'Nå 200 borgere',
                condition: () => stats.population >= 200
            },
            {
                id: 'happy_citizens',
                name: 'Glade borgere',
                description: 'Nå 90% tilfredshed',
                condition: () => stats.happiness >= 90
            },
            {
                id: 'wealthy_city',
                name: 'Rig by',
                description: 'Spar 50.000 kr',
                condition: () => stats.money >= 50000
            },
            {
                id: 'full_coverage',
                name: 'Fuld dækning',
                description: 'Byg alle typer bygninger',
                condition: () => {
                    const buildingTypes = Object.values(stats.buildings);
                    return ['house', 'powerplant', 'hospital', 'school'].every(type => 
                        buildingTypes.includes(type)
                    );
                }
            }
        ];

        achievements.forEach(achievement => {
            if (!this.achievements.includes(achievement.id) && achievement.condition()) {
                this.achievements.push(achievement.id);
                this.showAchievement(achievement);
            }
        });
    }

    // Vis achievement notification
    showAchievement(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <h4>🏆 Achievement Unlocked!</h4>
                <p><strong>${achievement.name}</strong></p>
                <p>${achievement.description}</p>
            </div>
        `;
        
        // Tilføj til DOM
        document.body.appendChild(notification);
        
        // Fjern efter 3 sekunder
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Få seneste stats
    getLatestStats() {
        return this.history[this.history.length - 1] || null;
    }

    // Få stats udvikling
    getStatsHistory(limit = 10) {
        return this.history.slice(-limit);
    }

    // Beregn gennemsnitlig vækst
    getGrowthRate(metric) {
        if (this.history.length < 2) return 0;
        
        const recent = this.history.slice(-5);
        const first = recent[0];
        const last = recent[recent.length - 1];
        
        if (!first || !last || first[metric] === 0) return 0;
        
        return ((last[metric] - first[metric]) / first[metric]) * 100;
    }

    // Eksporter stats til JSON
    exportStats() {
        return {
            history: this.history,
            achievements: this.achievements,
            gameTime: Date.now() - this.startTime
        };
    }
}

// Funktion til at vise detaljerede statistikker
function showStatsModal(gameStats) {
    const modal = document.createElement('div');
    modal.className = 'stats-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📊 Detaljerede Statistikker</h2>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>💰 Økonomi</h3>
                        <p>Nuværende: ${gameStats.getLatestStats()?.money || 0} kr</p>
                        <p>Vækst: ${gameStats.getGrowthRate('money').toFixed(1)}%</p>
                    </div>
                    <div class="stat-card">
                        <h3>👥 Befolkning</h3>
                        <p>Nuværende: ${gameStats.getLatestStats()?.population || 0}</p>
                        <p>Vækst: ${gameStats.getGrowthRate('population').toFixed(1)}%</p>
                    </div>
                    <div class="stat-card">
                        <h3>😊 Tilfredshed</h3>
                        <p>Nuværende: ${gameStats.getLatestStats()?.happiness || 0}%</p>
                        <p>Ændring: ${gameStats.getGrowthRate('happiness').toFixed(1)}%</p>
                    </div>
                    <div class="stat-card">
                        <h3>🏆 Achievements</h3>
                        <p>Opnået: ${gameStats.achievements.length}</p>
                    </div>
                </div>
                <div class="achievements-list">
                    <h3>🏆 Opnåede Achievements</h3>
                    ${gameStats.achievements.map(id => `<p>✅ ${id}</p>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// CSS til achievements og stats modal
const statsCSS = `
    .achievement-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f39c12, #e67e22);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .stats-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 0;
        border-radius: 15px;
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
    }

    .modal-body {
        padding: 20px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }

    .stat-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 10px;
        border-left: 4px solid #3498db;
    }

    .achievements-list {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }
`;

// Tilføj CSS til head
const styleSheet = document.createElement('style');
styleSheet.textContent = statsCSS;
document.head.appendChild(styleSheet);

// Eksporter til global scope
window.GameStats = GameStats;
window.showStatsModal = showStatsModal;

// Initialiser statistik-siden
function initializeStats() {
    setTimeout(() => {
        updateStatsPage();
    }, 100); // Kort delay for at sikre gameState er indlæst
}

// Opdater statistik-siden
function updateStatsPage() {
    // Sikre at gameState eksisterer
    if (!window.gameState) {
        console.log('gameState not ready yet');
        return;
    }
    
    // Opdater økonomi stats
    const statMoney = document.getElementById('stat-money');
    const statIncome = document.getElementById('stat-income');
    const statExpenses = document.getElementById('stat-expenses');
    
    if (statMoney) {
        statMoney.textContent = gameState.money.toLocaleString() + ' kr';
    }
    
    // Beregn indtægt og udgifter
    const income = gameState.population * 10;
    let expenses = 0;
    
    Object.values(gameState.buildings).forEach(buildingType => {
        const building = BUILDINGS[buildingType];
        if (building && building.effects && building.effects.maintenance) {
            expenses += building.effects.maintenance;
        }
    });
    
    if (statIncome) {
        statIncome.textContent = income.toLocaleString() + ' kr';
    }
    
    if (statExpenses) {
        statExpenses.textContent = expenses.toLocaleString() + ' kr';
    }
    
    // Opdater befolkning stats
    const statPopulation = document.getElementById('stat-population');
    const statHappiness = document.getElementById('stat-happiness');
    const statHouses = document.getElementById('stat-houses');
    
    if (statPopulation) {
        statPopulation.textContent = gameState.population.toLocaleString();
    }
    
    if (statHappiness) {
        statHappiness.textContent = gameState.happiness + '%';
    }
    
    // Tæl bygninger
    const buildings = Object.values(gameState.buildings);
    const buildingCounts = {
        road: buildings.filter(b => b === 'road').length,
        house: buildings.filter(b => b === 'house').length,
        powerplant: buildings.filter(b => b === 'powerplant').length,
        hospital: buildings.filter(b => b === 'hospital').length,
        school: buildings.filter(b => b === 'school').length
    };
    
    if (statHouses) {
        statHouses.textContent = buildingCounts.house.toString();
    }
    
    // Opdater bygnings stats
    const statRoads = document.getElementById('stat-roads');
    const statPowerplants = document.getElementById('stat-powerplants');
    const statHospitals = document.getElementById('stat-hospitals');
    const statSchools = document.getElementById('stat-schools');
    
    if (statRoads) {
        statRoads.textContent = buildingCounts.road.toString();
    }
    
    if (statPowerplants) {
        statPowerplants.textContent = buildingCounts.powerplant.toString();
    }
    
    if (statHospitals) {
        statHospitals.textContent = buildingCounts.hospital.toString();
    }
    
    if (statSchools) {
        statSchools.textContent = buildingCounts.school.toString();
    }
    
    // Opdater forskning stats
    const statExpansion = document.getElementById('stat-expansion');
    const statSlots = document.getElementById('stat-slots');
    
    if (statExpansion) {
        const isResearched = gameState.research && gameState.research.cityExpansion;
        statExpansion.textContent = isResearched ? '✅ Færdig' : '❌ Ikke forsket';
    }
    
    if (statSlots) {
        statSlots.textContent = gameState.maxBuildingSlots + '/12';
    }
}

// Eksporter funktioner
window.initializeStats = initializeStats;
window.updateStatsPage = updateStatsPage;
