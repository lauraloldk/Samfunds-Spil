# Event System - Dokumentation

## Oversigt
Event-systemet introducerer tilfældige begivenheder der kan påvirke din by positivt eller negativt hvert år. Systemet er tier-baseret og skalerer med byens størrelse.

## Hvordan Det Fungerer

### Tier-baserede Events
- **Tier 0**: Ingen events kan ske
- **Tier 1**: 0-5 events per år (baseret på befolkning)
- **Tier 2+**: Flere events bliver tilgængelige (kan udvides senere)

### Event Chance
Antallet af events per år beregnes baseret på:
```javascript
let baseChance = Math.min(population / 20, 5); // Max 5 events
return Math.floor(Math.random() * (baseChance + 1));
```

## Tier 1 Events

### Positive Events

#### 1. Baby Boom 👶
- **Beskrivelse**: En masse babyer er blevet født i byen!
- **Krav**: Min. 20 borgere, min. 50% tilfredshed
- **Effekter**: +5-20 borgere, +3-8% tilfredshed
- **Vægt**: 30% (høj chance)
- **Cooldown**: 3 år

#### 2. Byfestival 🎉
- **Beskrivelse**: En stor festival har bragt glæde til borgerne!
- **Krav**: Min. 40 borgere, min. 60% tilfredshed
- **Effekter**: +10-25% tilfredshed, +500-2500 kr
- **Vægt**: 25%
- **Cooldown**: 5 år

### Negative Events

#### 3. Naturlige Dødsfald ⚰️
- **Beskrivelse**: Nogle ældre borgere er gået bort på grund af alderdom
- **Krav**: Min. 30 borgere
- **Effekter**: -2-10 borgere, -1-4% tilfredshed
- **Vægt**: 20%
- **Cooldown**: 4 år

#### 4. Mindre Epidemi 🦠
- **Beskrivelse**: En mindre sygdom har ramt byen
- **Krav**: Min. 50 borgere, max. 1 hospital
- **Effekter**: -3-15 borgere, -5-15% tilfredshed
- **Vægt**: 15%
- **Cooldown**: 8 år

#### 5. Brand 🔥
- **Beskrivelse**: En brand har skadet byens økonomi
- **Krav**: Min. 60 borgere
- **Effekter**: -1000-4000 kr, -2-10% tilfredshed
- **Vægt**: 10% (lav chance)
- **Cooldown**: 10 år

## Teknisk Implementation

### EventManager Klasse
```javascript
class EventManager {
    constructor() {
        this.eventHistory = [];
        this.availableEvents = {};
        this.activeEvents = [];
        this.eventCooldowns = {};
    }
}
```

### Vigtige Metoder
- `processYearlyEvents()`: Proces events for et år
- `calculateEventCount()`: Beregn antal events
- `selectRandomEvents()`: Vælg tilfældige events baseret på vægt
- `executeEvent()`: Udfør et event og gem effekterne
- `showEventNotification()`: Vis pop-up notifikation

### Integration
Events bliver automatisk processeret i `nextTurn()` funktionen:
```javascript
// Proces årlige events
let yearlyEvents = [];
if (window.eventManager) {
    yearlyEvents = eventManager.processYearlyEvents();
}
```

## UI Komponenter

### Events-side
- **Event Statistikker**: Totalt, positive, negative events
- **Filtre**: Vis/skjul event-typer, vælg tidsperiode
- **Event Historik**: Kronologisk liste over alle events
- **Information**: Hjælp og tips om event-systemet

### Notifikationer
- Pop-up notifikationer når events sker
- Automatisk forsvinder efter 6 sekunder
- Viser alle event-effekter

## Strategiske Elementer

### Risiko-management
- **Hospitaler**: Reducerer risiko for epidemier
- **Høj tilfredshed**: Øger chance for positive events
- **Befolkningsstørrelse**: Påvirker event-frekvens

### Cooldown System
- Events kan ikke ske for ofte
- Forhindrer spam af samme event
- Balancerer spillet

## Fremtidige Udvidelser

### Tier 2+ Events
- Naturkatastrofer
- Økonomiske kriser
- Teknologiske gennembrud
- Internationale events

### Specialiserede Events
- Politik-relaterede events
- Miljø-events
- Kultur-events
- Sport-events

## Konfiguration

### Tilpasse Event-vægte
```javascript
weight: 30, // Højere vægt = større chance
```

### Tilpasse Krav
```javascript
requirements: {
    minPopulation: 20,
    minHappiness: 50,
    maxHospitals: 1
}
```

### Tilpasse Effekter
```javascript
effects: {
    population: () => Math.floor(Math.random() * 15) + 5,
    happiness: () => Math.floor(Math.random() * 5) + 3,
    money: () => Math.floor(Math.random() * 1000) + 500
}
```

## Testing
- `test-events.html`: Test event-beregninger og simulering
- Mulighed for at teste forskellige scenarios
- Viser alle tilgængelige events og deres krav
