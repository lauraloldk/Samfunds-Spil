// Towns/Cities management system
class CityManager {
    constructor() {
        this.cities = this.loadCities();
        this.currentCityId = null;
        this.nextCityId = this.cities.length > 0 ? Math.max(...this.cities.map(c => c.id)) + 1 : 1;
    }

    // Load cities from localStorage
    loadCities() {
        const saved = localStorage.getItem('samfunds-spil-cities');
        return saved ? JSON.parse(saved) : [];
    }

    // Save cities to localStorage
    saveCities() {
        localStorage.setItem('samfunds-spil-cities', JSON.stringify(this.cities));
    }

    // Create new city
    createCity(name, type, budget) {
        const city = {
            id: this.nextCityId++,
            name: name,
            type: type,
            budget: parseInt(budget),
            population: this.getInitialPopulation(type),
            happiness: 50,
            buildings: {},
            policies: {},
            status: 'active',
            founded: new Date().toISOString(),
            lastPlayed: new Date().toISOString()
        };

        this.cities.push(city);
        this.saveCities();
        return city;
    }

    // Get initial population based on city type
    getInitialPopulation(type) {
        const populations = {
            residential: 150,
            industrial: 75,
            commercial: 100,
            mixed: 125
        };
        return populations[type] || 100;
    }

    // Update city
    updateCity(cityId, updates) {
        const city = this.cities.find(c => c.id === cityId);
        if (city) {
            Object.assign(city, updates);
            city.lastPlayed = new Date().toISOString();
            this.saveCities();
        }
    }

    // Delete city
    deleteCity(cityId) {
        this.cities = this.cities.filter(c => c.id !== cityId);
        this.saveCities();
    }

    // Get city by ID
    getCity(cityId) {
        return this.cities.find(c => c.id === cityId);
    }

    // Get all cities
    getAllCities() {
        return this.cities;
    }

    // Set city status
    setCityStatus(cityId, status) {
        const city = this.cities.find(c => c.id === cityId);
        if (city) {
            city.status = status;
            this.saveCities();
        }
    }

    // Get city statistics
    getCityStats(cityId) {
        const city = this.getCity(cityId);
        if (!city) return null;

        const buildings = Object.values(city.buildings);
        const buildingCount = buildings.length;
        const housingCount = buildings.filter(b => b === 'house').length;
        const industrialCount = buildings.filter(b => b === 'powerplant').length;
        const serviceCount = buildings.filter(b => ['hospital', 'school'].includes(b)).length;

        return {
            totalBuildings: buildingCount,
            housing: housingCount,
            industrial: industrialCount,
            services: serviceCount,
            populationGrowth: this.calculatePopulationGrowth(city),
            economicHealth: this.calculateEconomicHealth(city)
        };
    }

    // Calculate population growth trend
    calculatePopulationGrowth(city) {
        // Simplified calculation - in a real game this would be more complex
        const buildings = Object.values(city.buildings);
        const housingRatio = buildings.filter(b => b === 'house').length / Math.max(1, buildings.length);
        return housingRatio > 0.3 ? 'positive' : housingRatio > 0.1 ? 'stable' : 'negative';
    }

    // Calculate economic health
    calculateEconomicHealth(city) {
        const ratio = city.budget / (city.population * 50); // 50 kr per citizen minimum
        return ratio > 2 ? 'excellent' : ratio > 1 ? 'good' : ratio > 0.5 ? 'fair' : 'poor';
    }

    // Export city data for use in main game
    exportCityData(cityId) {
        const city = this.getCity(cityId);
        if (!city) return null;

        return {
            money: city.budget,
            population: city.population,
            happiness: city.happiness,
            buildings: city.buildings,
            policies: city.policies
        };
    }

    // Import city data from main game
    importCityData(cityId, gameState) {
        const city = this.getCity(cityId);
        if (!city) return false;

        city.budget = gameState.money;
        city.population = gameState.population;
        city.happiness = gameState.happiness;
        city.buildings = gameState.buildings;
        city.policies = gameState.policies || {};
        city.lastPlayed = new Date().toISOString();

        this.saveCities();
        return true;
    }
}

// Initialize city manager
const cityManager = new CityManager();

// UI Functions
function renderCities() {
    const grid = document.getElementById('citiesGrid');
    grid.innerHTML = '';

    // Add "Create New City" card
    const createCard = document.createElement('div');
    createCard.className = 'city-card create-city-card';
    createCard.innerHTML = `
        <div class="create-city-content">
            <div style="font-size: 3em; margin-bottom: 10px;">➕</div>
            <div>Opret Ny By</div>
            <div style="font-size: 0.9em; color: #666; margin-top: 5px;">Klik for at starte en ny by</div>
        </div>
    `;
    createCard.onclick = () => openCreateCityModal();
    grid.appendChild(createCard);

    // Add existing cities
    cityManager.getAllCities().forEach(city => {
        const cityCard = createCityCard(city);
        grid.appendChild(cityCard);
    });
}

function createCityCard(city) {
    const card = document.createElement('div');
    card.className = 'city-card';
    
    const stats = cityManager.getCityStats(city.id);
    const statusClass = `status-${city.status}`;
    const statusText = {
        active: 'Aktiv',
        planning: 'Planlægning',
        abandoned: 'Forladt'
    }[city.status];

    card.innerHTML = `
        <div class="city-header">
            <div class="city-name">${getTypeIcon(city.type)} ${city.name}</div>
            <div class="city-status ${statusClass}">${statusText}</div>
        </div>
        <div class="city-stats">
            <div class="stat-item">
                <div class="stat-value">${city.population}</div>
                <div class="stat-label">Borgere</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${city.budget.toLocaleString()}</div>
                <div class="stat-label">Kroner</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${city.happiness}%</div>
                <div class="stat-label">Tilfredshed</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.totalBuildings}</div>
                <div class="stat-label">Bygninger</div>
            </div>
        </div>
        <div class="city-actions">
            <button class="action-btn btn-primary" onclick="playCity(${city.id})">
                🎮 Spil
            </button>
            <button class="action-btn btn-warning" onclick="editCity(${city.id})">
                ✏️ Rediger
            </button>
            <button class="action-btn btn-danger" onclick="deleteCity(${city.id})">
                🗑️ Slet
            </button>
        </div>
    `;

    return card;
}

function getTypeIcon(type) {
    const icons = {
        residential: '🏘️',
        industrial: '🏭',
        commercial: '🏢',
        mixed: '🌆'
    };
    return icons[type] || '🏙️';
}

function openCreateCityModal() {
    document.getElementById('createCityModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('createCityModal').style.display = 'none';
}

function playCity(cityId) {
    // Store current city ID and redirect to main game
    localStorage.setItem('currentCityId', cityId);
    window.location.href = 'index.html';
}

function editCity(cityId) {
    const city = cityManager.getCity(cityId);
    if (!city) return;

    const newName = prompt('Nyt bynavn:', city.name);
    if (newName && newName.trim() !== '') {
        cityManager.updateCity(cityId, { name: newName.trim() });
        renderCities();
    }
}

function deleteCity(cityId) {
    const city = cityManager.getCity(cityId);
    if (!city) return;

    if (confirm(`Er du sikker på, at du vil slette "${city.name}"?`)) {
        cityManager.deleteCity(cityId);
        renderCities();
    }
}

// Event listeners
document.getElementById('createCityForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('cityName').trim();
    const type = formData.get('cityType');
    const budget = formData.get('startingBudget');

    if (!name) {
        alert('Indtast venligst et bynavn');
        return;
    }

    const city = cityManager.createCity(name, type, budget);
    closeModal();
    renderCities();
    
    // Reset form
    e.target.reset();
});

// Click outside modal to close
document.getElementById('createCityModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    renderCities();
});

// Export for global use
window.cityManager = cityManager;
