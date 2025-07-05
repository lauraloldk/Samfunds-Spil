# Buildings Grid System Documentation

## Oversigt
Buildings Grid System er et dynamisk system til håndtering af bygge-slots i Samfunds-spil. Det understøtter ubegrænsede slots med tier-baserede grænser, dynamisk prisberegning og pris-modifiers fra events og bygninger.

## Hovedfunktioner

### 1. Tier-baserede Slot-grænser
- **Tier 0**: 6 slots (standard)
- **Tier 1**: 12 slots
- **Tier 2**: 20 slots
- **Tier 3**: 30 slots
- **Tier 4**: 45 slots
- **Tier 5**: 60 slots

### 2. Dynamisk Prisberegning
- **Startpris**: 500 kr for første ekstra slot
- **Prisstigning**: 10% for hver købt slot
- **Formel**: `pris = 500 × (1.1)^(antal_købte_slots)`

### 3. Pris-modifiers
Events og bygninger kan påvirke slot-priser:
- **Positive modifiers**: Øger prisen (f.eks. +50%)
- **Negative modifiers**: Reducerer prisen (f.eks. -30%)
- **Varighed**: Kan være midlertidige (antal år) eller permanente

## API Reference

### BuildingsGridManager Class

#### Constructor
```javascript
new BuildingsGridManager()
```

#### Vigtige Metoder

##### `calculateNextSlotPrice()`
Beregner prisen for den næste slot inklusive alle aktive modifiers.

```javascript
const price = buildingsGridManager.calculateNextSlotPrice();
```

##### `purchaseSlot()`
Køber en ny slot hvis spilleren opfylder kravene.

```javascript
const success = buildingsGridManager.purchaseSlot();
```

##### `addPriceModifier(id, percentage, duration, description)`
Tilføjer en pris-modifier.

```javascript
buildingsGridManager.addPriceModifier(
    'construction_boom',  // Unique ID
    0.5,                  // +50% pris
    3,                    // 3 år varighed
    'Byggekrise (+50% slot-pris)'
);
```

##### `onTierUpgrade(newTier)`
Kaldes når spilleren opgraderer til en ny tier.

```javascript
buildingsGridManager.onTierUpgrade(2);
```

##### `updateGridDisplay()`
Opdaterer DOM-visningen af slots.

```javascript
buildingsGridManager.updateGridDisplay();
```

##### `getGridStatistics()`
Returnerer statistikker om grid-systemet.

```javascript
const stats = buildingsGridManager.getGridStatistics();
console.log(stats);
```

## Integration med Game Logic

### Game State Properties
Systemet kræver følgende properties i `gameState`:

```javascript
gameState = {
    money: 10000,
    maxBuildingSlots: 6,
    purchasedSlots: 0,
    researchData: {
        currentTier: 0
    }
}
```

### Event System Integration
Events kan påvirke slot-priser ved at kalde `addPriceModifier()`:

```javascript
{
    id: 'construction_boom',
    name: 'Byggekrise',
    effects: {
        custom: () => {
            buildingsGridManager.addPriceModifier(
                'construction_boom',
                0.5, // +50%
                3,   // 3 år
                'Byggekrise (+50% slot-pris)'
            );
        }
    }
}
```

### Research System Integration
Når spilleren låser op for en ny tier:

```javascript
function unlockTier(tier) {
    // ... research logic ...
    
    if (window.buildingsGridManager) {
        buildingsGridManager.onTierUpgrade(tier);
    }
}
```

## Slot-pris Events

### Implementerede Events

#### 1. Byggekrise (construction_boom)
- **Effekt**: +50% slot-pris
- **Varighed**: 3 år
- **Krav**: Min. 100 befolkning, Tier 1+

#### 2. Regeringsstøtte (government_subsidy)
- **Effekt**: -30% slot-pris
- **Varighed**: 5 år
- **Krav**: Min. 150 befolkning, Tier 1+

#### 3. Grundspekulation (land_speculation)
- **Effekt**: +75% slot-pris
- **Varighed**: 2 år
- **Krav**: Min. 200 befolkning, Tier 1+

#### 4. Planreform (planning_reform)
- **Effekt**: -40% slot-pris
- **Varighed**: 4 år
- **Krav**: Min. 250 befolkning, Tier 1+

## CSS Styling

### Vigtige CSS Klasser

#### `.building-slot`
Styling for individuelle bygge-slots.

#### `.expansion-panel`
Panel til køb af nye slots.

#### `.build-btn.disabled`
Styling for deaktiverede knapper.

## Test og Debug

### Test Side
`test-buildings-grid.html` indeholder en komplet test-suite med:
- Game state control
- Price modifier testing
- Event triggering
- Visual display af statistikker

### Debug Information
```javascript
// Få debug information
const debug = buildingsGridManager.debugInfo();
console.log(debug);
```

## Fremtidige Udvidelser

### Planlagte Funktioner
1. **Bygnings-specifikke modifiers**: Visse bygninger kan påvirke slot-priser
2. **Geografiske zones**: Forskellige priser for forskellige områder
3. **Sæsonale variationer**: Priser der ændrer sig over tid
4. **Specialiserede slots**: Slots der kun kan rumme bestemte bygningstyper

### Udvidelse af Tier System
Når nye tiers tilføjes:

```javascript
// Tilføj ny tier-grænse
buildingsGridManager.tierSlotLimits[6] = 80; // Tier 6: 80 slots
```

## Fejlfinding

### Almindelige Problemer

1. **Slots vises ikke**: Tjek at `updateGridDisplay()` kaldes efter ændringer
2. **Forkert pris**: Tjek at `calculateNextSlotPrice()` inkluderer alle modifiers
3. **Modifiers virker ikke**: Tjek at `updatePriceModifiers()` kaldes hvert år
4. **Tier-upgrade fungerer ikke**: Tjek at `onTierUpgrade()` kaldes korrekt

### Logging
Systemet logger vigtige begivenheder til console:
```javascript
console.log('Buildings grid system loaded successfully');
console.log('Added price modifier: ...');
console.log('Purchased new slot for X kr');
```

## Performance Overvejelser

- Systemet bruger DOM manipulation til at vise/skjule slots
- `ensureSlotsExist()` opretter kun nye slots når nødvendigt
- Price calculations er optimeret til O(n) kompleksitet
- Event listeners tilføjes kun én gang per slot
