# Befolkningsbonus System - Dokumentation

## Oversigt
Befolkningsbonussystemet giver spilleren en årlig pengebonus baseret på byens befolkning, forsknings-tier og antal skoler.

## Bonus-formel
```
Bonus per borger = [1 + (2 × Tier)] + [Antal_skoler × 2 × max(Tier, 1)]
Total årlig bonus = Befolkning × Bonus per borger
```

## Komponenter

### 1. Base Bonus (Tier-baseret)
- **Tier 0**: 1 kr per borger
- **Tier 1**: 3 kr per borger (1 + 2×1)
- **Tier 2**: 5 kr per borger (1 + 2×2)
- **Tier 3**: 7 kr per borger (1 + 2×3)
- osv.

### 2. Skole Bonus
- **Tier 0**: 2 kr per borger per skole (2 × max(0,1) = 2)
- **Tier 1**: 2 kr per borger per skole (2 × max(1,1) = 2)
- **Tier 2**: 4 kr per borger per skole (2 × max(2,1) = 4)
- **Tier 3**: 6 kr per borger per skole (2 × max(3,1) = 6)
- osv.

## Eksempler

### Eksempel 1: Tier 0, ingen skoler
- Befolkning: 100 borgere
- Base bonus: 1 kr/borger
- Skole bonus: 0 kr/borger
- Total: 100 × 1 = **100 kr årligt**

### Eksempel 2: Tier 1, ingen skoler
- Befolkning: 100 borgere
- Base bonus: 3 kr/borger
- Skole bonus: 0 kr/borger
- Total: 100 × 3 = **300 kr årligt**

### Eksempel 3: Tier 1, 1 skole
- Befolkning: 100 borgere
- Base bonus: 3 kr/borger
- Skole bonus: 1 × 2 × 1 = 2 kr/borger
- Total: 100 × (3 + 2) = **500 kr årligt**

### Eksempel 4: Tier 2, 2 skoler
- Befolkning: 100 borgere
- Base bonus: 5 kr/borger
- Skole bonus: 2 × 2 × 2 = 8 kr/borger
- Total: 100 × (5 + 8) = **1.300 kr årligt**

## Strategiske Implikationer

1. **Tidlig fase**: Fokuser på befolkningsvækst for at maksimere den grundlæggende bonus
2. **Mellem fase**: Investér i forskning for at øge tier-niveau
3. **Sen fase**: Byg skoler for at multiplicere bonussen betydeligt

## Visning i Spillet

Bonusinformation kan ses på følgende steder:
- **Statistik-side**: Årlig befolkningsbonus vises i økonomi-sektionen
- **Års-feedback**: Detaljeret opdeling af bonussen når du går til næste år
- **Befolknings-detaljer**: Komplet beregning med formel og alle komponenter

## Tips til Spillere

- Skoler bliver mere værdifulde ved højere tiers
- Byg skoler tidligt for at maksimere den kumulative effekt
- Balancér mellem befolkningsvækst og skole-bygning
- Husk at skoler også forbedrer befolkningens tilfredshed, hvilket fører til flere borgere
