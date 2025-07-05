# Tier 2 Implementation - Bysammenslutning & Flække

## ✅ COMPLETED FEATURES

### 1. Ny Bygning: Flække 🏘️
- **Kost**: 1000 kr, 3 stamina
- **Befolkning**: +17 indbyggere (vs 12 for Lille Flække)
- **Event Beskyttelse**: 10% reduktion i negative events
- **Krav**: Tier 2 forskning og vej-adgang

### 2. Tier 2 Forskning
- **Krav**: 300 forskningspoint + Tier 1 ulåst
- **Kost**: 300 forskningspoint
- **Låser op**:
  - Flække bygning
  - Merge funktionalitet
  - Event beskyttelse system

### 3. Merge System 🔄
- **Gratis Upgrade**: Merge 3 "Lille Flække" → 1 "Flække"
- **Effekt**: Mister 36 befolkning (3×12), får 17 befolkning + event beskyttelse
- **Net Tab**: -19 befolkning, men får event beskyttelse og frigør 2 byggepladser

### 4. Event Beskyttelse System 🛡️
- **10% beskyttelse per Flække**: Hver Flække bygning giver 10% chance for at blokere negative events
- **Kun negative events**: Positive events påvirkes ikke
- **Stackable**: Flere Flæker = højere beskyttelse (maks 100%)

## 📁 UPDATED FILES

### Core Files
- **`gamedata.js`**: Tilføjet Flække bygning med alle properties
- **`research.html`**: Tilføjet Tier 2 sektion med UI
- **`research.js`**: Tilføjet Tier 2 definition og krav
- **`game.html`**: Tilføjet Flække bygge-knap og merge panel
- **`styles.css`**: Tilføjet styling for Tier 2 bygninger og merge UI

### Logic Files
- **`game-logic.js`**: 
  - Tier kontrol i `buildBuilding`
  - Merge funktionalitet (`mergeBuildings`, `showMergeOptions`)
  - UI opdateringer (`updateTierUI`, `updateStatusPanel`)
- **`events.js`**: Event beskyttelse logik i `selectRandomEvents`

### Supporting Files
- **`population.js`**: Opdateret til at håndtere Flække befolkning og boliger
- **`stats.js`**: Opdateret til at tælle Flække bygninger
- **`gamedata.js`**: Score beregning inkluderer Flække bygninger

## 🔧 TECHNICAL DETAILS

### Flække Building Definition
```javascript
town: {
    name: 'Flække',
    icon: '🏘️',
    cost: 1000,
    staminaCost: 3,
    description: 'En større bebyggelse der giver plads til 17 borgere og reducerer negative events med 10%',
    effects: {
        population: 17,
        happiness: 5,
        maintenance: 75,
        eventProtection: 0.1
    },
    requiresRoad: true,
    tier: 2
}
```

### Tier Control Logic
```javascript
function canBuildTier(tier) {
    if (!window.researchSystem) return tier === 0;
    return window.researchSystem.isTierUnlocked(tier);
}
```

### Event Protection System
```javascript
// Beregn protection fra Flække bygninger
const townCount = buildings.filter(b => getBuildingType(b) === 'town').length;
const eventProtection = townCount * 0.1; // 10% per Flække

// Tjek protection for negative events
if (selectedEvent.type === 'negative' && eventProtection > 0) {
    const protectionRoll = Math.random();
    if (protectionRoll < eventProtection) {
        // Event blocked!
        continue;
    }
}
```

### Merge Logic
```javascript
function mergeBuildings() {
    // Find 3 huse
    const houseBuildings = buildings.filter(([slotId, building]) => {
        return getBuildingType(building) === 'house';
    });
    
    if (houseBuildings.length < 3) return;
    
    // Slet 3 huse, tilføj 1 Flække
    const housesToMerge = houseBuildings.slice(0, 3);
    housesToMerge.forEach(([slotId, building]) => {
        delete window.gameState.buildings[slotId];
        window.gameState.population -= 12; // Træk hus befolkning
    });
    
    // Tilføj Flække
    window.gameState.buildings[firstSlot] = {
        type: 'town',
        name: newName,
        builtYear: window.gameState.year,
        id: generateBuildingId()
    };
    window.gameState.population += 17; // Tilføj Flække befolkning
}
```

## 🎯 BENEFITS & STRATEGY

### Building Strategy
1. **Early Game**: Byg Lille Flæker for hurtig befolkning
2. **Mid Game**: Forsk Tier 2 når du har 300+ research points
3. **Late Game**: Merge gamle Lille Flæker til Flæker for bedre effektivitet

### Event Protection Strategy
- **1 Flække = 10% beskyttelse**: Reducerer negative events moderat
- **3 Flæker = 30% beskyttelse**: Betydelig reduktion i katastrofer
- **5+ Flæker = 50%+ beskyttelse**: Meget sikker by

### Resource Efficiency
- **Space Optimization**: Merge frigør byggepladser
- **Population Quality**: Mindre folk, men bedre beskyttet
- **Long-term Investment**: Event beskyttelse bliver vigtigere over tid

## 🧪 TESTING CHECKLIST

### Tier 2 Research
- ✅ Tier 2 vises som låst indtil Tier 1 er fuldført
- ✅ Tier 2 kræver 300 research points
- ✅ Tier 2 låser op for Flække og merge funktioner

### Flække Building
- ✅ Kun synlig efter Tier 2 forskning
- ✅ Koster 1000 kr og 3 stamina
- ✅ Giver 17 befolkning
- ✅ Kræver vej-adgang

### Merge System
- ✅ Merge panel kun synlig efter Tier 2
- ✅ Kræver mindst 3 Lille Flæker
- ✅ Gratis operation
- ✅ Korrekt befolknings-beregning

### Event Protection
- ✅ Negative events kan blive blokeret
- ✅ Positive events ikke påvirket
- ✅ 10% per Flække bygning
- ✅ Beskyttelse stackable

## 🔮 FUTURE EXTENSIONS

### Tier 3+ Possibilities
- **Storby**: Merge 3 Flæker → 1 Storby (50+ befolkning)
- **Specialiserede Flæker**: Industriflække, Boligflække, etc.
- **Advanced Protection**: Forsikringssystem, katastrofeberedskab

### Enhanced Merge Options
- **Selective Merge**: Vælg hvilke bygninger der skal merges
- **Cross-type Merge**: Merge forskellige bygningstyper
- **Upgrade Paths**: Flere tier-baserede upgrades

## 🎉 CONCLUSION

Tier 2 systemet tilføjer betydelig strategisk dybde til spillet:

- **Progression**: Spillere har nu langsigtede forskningsmål
- **Valg**: Merge vs. nye bygninger skaber interessante beslutninger  
- **Beskyttelse**: Event protection reducerer frustrerende RNG
- **Skalering**: Forberedelse til flere tiers og komplekse systemer

Det nye system fungerer sømløst med den eksisterende building names implementation og bevarer fuld bagudkompatibilitet.
