# Power Plant Stamina Bonus Implementation

## 🎯 Feature Overview
Power plants now provide a **stamina bonus** to the player:
- Each power plant increases **max stamina by 10**
- Base stamina remains 10
- With power plants: Max stamina = 10 + (number of power plants × 10)

## ⚡ Implementation Details

### 1. **Max Stamina Calculation**
```javascript
function getMaxStamina() {
    const buildings = Object.values(window.gameState.buildings);
    const powerPlantCount = buildings.filter(b => getBuildingType(b) === 'powerplant').length;
    
    // Basis stamina: 10, + 10 per kraftværk
    return 10 + (powerPlantCount * 10);
}
```

### 2. **UI Updates**
- **Stamina display**: Now shows "current/max" format (e.g., "15/20")
- **Power plant description**: Updated to mention the stamina bonus
- **Building effects**: Added `maxStamina: 10` to power plant effects

### 3. **Dynamic Stamina Management**
- **Turn regeneration**: Uses dynamic max stamina instead of hardcoded 10
- **Building construction**: Grants immediate stamina boost when building power plants
- **Demolition**: Caps current stamina to new max when removing power plants

## 🔧 Technical Changes

### Files Modified:

#### `game-logic.js`
- Added `getMaxStamina()` function
- Updated `updateUI()` to show current/max stamina
- Modified `nextTurn()` to use dynamic max stamina for regeneration
- Enhanced `buildBuilding()` to grant immediate stamina when building power plants
- Updated `demolishBuilding()` to cap stamina when removing power plants

#### `gamedata.js`
- Updated power plant description: "Giver strøm til byen og øger max stamina med 10"
- Added `maxStamina: 10` to power plant effects

## 🎮 Gameplay Impact

### Strategic Value
- **Power plants** are now more valuable beyond just providing power
- **Stamina management** becomes a key strategic consideration
- **Building order** matters - power plants enable more construction

### Balance Considerations
- **Cost vs benefit**: Power plants cost 2000 kr and 3 stamina, but provide 10 max stamina
- **Scalability**: Each additional power plant provides consistent +10 max stamina
- **Investment**: Early power plants enable more aggressive building strategies

## 📊 Examples

### Base Game
- **0 power plants**: Max stamina = 10
- **Current stamina**: Regenerates to max 10 per turn

### With Power Plants
- **1 power plant**: Max stamina = 20
- **2 power plants**: Max stamina = 30
- **3 power plants**: Max stamina = 40

### Practical Scenarios
1. **Early game**: Build 1 power plant → Max stamina 20 → Can build more per turn
2. **Mid game**: Build 2-3 power plants → Max stamina 30-40 → Major construction projects
3. **Late game**: Multiple power plants → High max stamina → Rapid city development

## ✅ Testing Completed
- [x] Power plant increases max stamina by 10
- [x] UI shows current/max stamina format
- [x] Stamina regeneration respects dynamic max
- [x] Building power plants grants immediate stamina boost
- [x] Demolishing power plants caps current stamina properly
- [x] Description updated to reflect new functionality

## 🚀 Result
Power plants are now strategic buildings that not only provide power but also enable more active gameplay through increased stamina capacity. This makes them valuable investments for players who want to accelerate their city development! ⚡
