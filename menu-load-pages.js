// Menu og side-navigation system
class PageManager {
    constructor() {
        this.currentPage = 'game';
        this.pages = {};
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            // Indlæs menu først
            await this.loadMenu();
            
            // Indlæs initial side (game)
            await this.loadPage('game');
            
            this.initialized = true;
            console.log('PageManager initialized');
        } catch (error) {
            console.error('Failed to initialize PageManager:', error);
        }
    }

    async loadMenu() {
        try {
            // Fallback for file:// protocol
            if (window.location.protocol === 'file:') {
                this.loadMenuFallback();
                return;
            }
            
            const response = await fetch('menu.html');
            const html = await response.text();
            
            const menuContainer = document.getElementById('menu-container');
            if (menuContainer) {
                menuContainer.innerHTML = html;
                this.setupMenuEvents();
            }
        } catch (error) {
            console.error('Failed to load menu:', error);
            this.loadMenuFallback();
        }
    }

    async loadPage(pageName) {
        try {
            // Fallback for file:// protocol
            if (window.location.protocol === 'file:') {
                this.loadPageFallback(pageName);
                return;
            }
            
            // Cache pages for performance
            if (!this.pages[pageName]) {
                const response = await fetch(`${pageName}.html`);
                const html = await response.text();
                this.pages[pageName] = html;
            }

            const contentContainer = document.getElementById('page-content');
            if (contentContainer) {
                contentContainer.innerHTML = this.pages[pageName];
                this.currentPage = pageName;
                
                // Opdater aktiv menu-knap
                this.updateActiveMenu(pageName);
                
                // Kør side-specifik initialisering
                this.initializePage(pageName);
            }
        } catch (error) {
            console.error(`Failed to load page ${pageName}:`, error);
            this.loadPageFallback(pageName);
        }
    }

    setupMenuEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pageName = e.target.getAttribute('data-page');
                if (pageName) {
                    this.loadPage(pageName);
                }
            });
        });
    }

    updateActiveMenu(pageName) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-page') === pageName) {
                btn.classList.add('active');
            }
        });
    }

    initializePage(pageName) {
        switch(pageName) {
            case 'game':
                if (typeof initializeGame === 'function') {
                    initializeGame();
                }
                break;
            case 'towns':
                if (typeof initializeTowns === 'function') {
                    initializeTowns();
                }
                break;
            case 'stats':
                if (typeof initializeStats === 'function') {
                    initializeStats();
                }
                break;
            case 'settings':
                if (typeof initializeSettings === 'function') {
                    initializeSettings();
                }
                break;
        }
    }

    loadMenuFallback() {
        // Hardcoded menu HTML for file:// protocol
        const menuHTML = `
            <header>
                <h1>🏛️ Samfunds Simulator</h1>
                <div class="resources">
                    <div class="resource">
                        <span class="resource-label">💰 Penge</span>
                        <span id="money">10000</span> kr
                    </div>
                    <div class="resource">
                        <span class="resource-label">👥 Befolkning</span>
                        <span id="population">100</span> borgere
                    </div>
                    <div class="resource">
                        <span class="resource-label">😊 Tilfredshed</span>
                        <span id="happiness">75</span>%
                    </div>
                    <div class="resource">
                        <span class="resource-label">💪 Stamina</span>
                        <span id="stamina">10</span>
                    </div>
                    <div class="resource">
                        <span class="resource-label">📅 År</span>
                        <span id="year">1930</span>
                    </div>
                </div>
                
                <div class="navigation">
                    <button class="nav-btn active" data-page="game">🎮 Spil</button>
                    <button class="nav-btn" data-page="towns">🏙️ Byer</button>
                    <button class="nav-btn" data-page="stats">📊 Statistik</button>
                    <button class="nav-btn" data-page="settings">⚙️ Indstillinger</button>
                </div>
            </header>
        `;
        
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer) {
            menuContainer.innerHTML = menuHTML;
            this.setupMenuEvents();
        }
    }

    loadPageFallback(pageName) {
        const contentContainer = document.getElementById('page-content');
        if (!contentContainer) return;
        
        let html = '';
        
        switch(pageName) {
            case 'game':
                html = `
                    <div class="city-view">
                        <h2>🏙️ Din By</h2>
                        <div class="buildings-grid">
                            <div class="building-slot" id="slot-1">
                                <div class="empty-slot">Tom grund<br>Klik for at bygge</div>
                            </div>
                            <div class="building-slot" id="slot-2">
                                <div class="empty-slot">Tom grund<br>Klik for at bygge</div>
                            </div>
                            <div class="building-slot" id="slot-3">
                                <div class="empty-slot">Tom grund<br>Klik for at bygge</div>
                            </div>
                            <div class="building-slot" id="slot-4">
                                <div class="empty-slot">Tom grund<br>Klik for at bygge</div>
                            </div>
                            <div class="building-slot" id="slot-5">
                                <div class="empty-slot">Tom grund<br>Klik for at bygge</div>
                            </div>
                            <div class="building-slot" id="slot-6">
                                <div class="empty-slot">Tom grund<br>Klik for at bygge</div>
                            </div>
                        </div>
                    </div>

                    <div class="sidebar">
                        <div class="actions-panel">
                            <h3>🏗️ Byg</h3>
                            <button class="build-btn" onclick="selectBuilding('road')">
                                🛣️ Vej (100 kr, 1 💪)<br>
                                <small>Grundlag for andre bygninger</small>
                            </button>
                            <button class="build-btn" onclick="selectBuilding('house')">
                                🏠 Hus (500 kr, 2 💪)<br>
                                <small>+10 befolkning (kræver vej)</small>
                            </button>
                            <button class="build-btn" onclick="selectBuilding('powerplant')">
                                ⚡ Kraftværk (2000 kr, 3 💪)<br>
                                <small>Giver strøm (kræver vej)</small>
                            </button>
                            <button class="build-btn" onclick="selectBuilding('hospital')">
                                🏥 Hospital (3000 kr, 4 💪)<br>
                                <small>Forbedrer sundhed (kræver vej)</small>
                            </button>
                            <button class="build-btn" onclick="selectBuilding('school')">
                                🏫 Skole (1500 kr, 3 💪)<br>
                                <small>Giver uddannelse (kræver vej)</small>
                            </button>
                        </div>

                        <div class="status-panel">
                            <h3>📊 Status</h3>
                            <div class="status-item">
                                <span>🛣️ Veje:</span>
                                <span id="road-status" class="status-bad">Ingen</span>
                            </div>
                            <div class="status-item">
                                <span>⚡ Strøm:</span>
                                <span id="power-status" class="status-bad">Ingen</span>
                            </div>
                            <div class="status-item">
                                <span>🏥 Sundhed:</span>
                                <span id="health-status" class="status-bad">Dårlig</span>
                            </div>
                            <div class="status-item">
                                <span>📚 Uddannelse:</span>
                                <span id="education-status" class="status-bad">Ingen</span>
                            </div>
                            <div class="status-item">
                                <span>🏠 Boliger:</span>
                                <span id="housing-status" class="status-bad">Få</span>
                            </div>
                        </div>

                        <div class="economy-panel">
                            <h3>💰 Økonomi</h3>
                            <div class="status-item">
                                <span>Årlig indtægt:</span>
                                <span id="annual-income" class="status-neutral">0 kr</span>
                            </div>
                            <div class="status-item">
                                <span>Årlige udgifter:</span>
                                <span id="annual-expenses" class="status-neutral">0 kr</span>
                            </div>
                            <div class="status-item">
                                <span>Netto resultat:</span>
                                <span id="net-result" class="status-neutral">0 kr</span>
                            </div>
                            <button class="build-btn" onclick="nextYear()" style="margin-top: 10px;">
                                📅 Næste År
                            </button>
                        </div>
                    </div>
                `;
                break;
            case 'towns':
                html = `
                    <div class="cities-container">
                        <h2>🌆 Byer Oversigt</h2>
                        <p>Administrer dine byer og samfund</p>
                        
                        <div class="cities-grid" id="citiesGrid">
                            <div class="city-card" style="border: 2px dashed #3498db; text-align: center; padding: 40px;">
                                <h3>🏗️ Opret Ny By</h3>
                                <p>Klik for at oprette en ny by</p>
                                <button class="build-btn" onclick="createNewCity()">Opret By</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'stats':
                html = `
                    <div class="stats-container">
                        <h2>📊 Detaljerede Statistikker</h2>
                        <div class="stats-grid" id="statsGrid">
                            <div class="stat-card">
                                <h3>📈 Økonomi</h3>
                                <p>Vis økonomiske trends</p>
                            </div>
                            <div class="stat-card">
                                <h3>👥 Befolkning</h3>
                                <p>Befolkningsudvikling</p>
                            </div>
                            <div class="stat-card">
                                <h3>😊 Tilfredshed</h3>
                                <p>Borgernes tilfredshed</p>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'settings':
                html = `
                    <div class="settings-container">
                        <h2>⚙️ Indstillinger</h2>
                        <div class="settings-panel">
                            <h3>💾 Data</h3>
                            <button class="build-btn" onclick="exportData()">📤 Eksporter Data</button>
                            <button class="build-btn" onclick="importData()">📥 Importer Data</button>
                            <button class="build-btn" onclick="resetData()">🔄 Nulstil Alt</button>
                        </div>
                    </div>
                `;
                break;
        }
        
        contentContainer.innerHTML = html;
        this.currentPage = pageName;
        this.updateActiveMenu(pageName);
        this.initializePage(pageName);
    }
}

// Global PageManager instance
const pageManager = new PageManager();

// Utilities for andre scripts
function showPage(pageName) {
    pageManager.loadPage(pageName);
}

function getCurrentPage() {
    return pageManager.currentPage;
}

// Initialize når DOM er klar
document.addEventListener('DOMContentLoaded', () => {
    pageManager.init();
});
