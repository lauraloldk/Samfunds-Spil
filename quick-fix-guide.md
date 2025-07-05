# 🛠️ Quick Fix for "Køb byggeplads" Button Problem

Hvis knappen "Køb byggeplads (500 kr)" stadig er disabled, prøv denne løsning:

## 🔧 Debug Steps

### 1. Åbn Browser Console
- Tryk `F12` eller `Ctrl+Shift+I`
- Gå til **Console** tab

### 2. Test Current State
Skriv disse kommandoer i console:

```javascript
// Test hvad tier systemet returnerer
debugBuildingsGrid()

// Test om slot kan købes
testPurchaseSlot()
```

### 3. Quick Fix Solution
Hvis tier vises som 0 selvom du har forskning, kør:

```javascript
// Sæt tier til 1 og fix alle dependencies
quickFixTier()
```

### 4. Force Update
Kør derefter:

```javascript
// Tving opdatering af expansion panel
forceExpansionUpdate()
```

## 🎯 Alternative Solution

### Via Research Page
1. Gå til **Research** siden
2. Tjek at "Byudvikling" er låst op
3. Hvis ikke, lås det op (kræver 100 forskningspoint)
4. Gå tilbage til hovedspillet

### Manual Research Unlock
I console:

```javascript
// Unlock research hvis det ikke er gjort
if (window.researchSystem) {
    window.researchSystem.researchData.currentTier = 1;
    window.researchSystem.researchData.unlockedFeatures.push('city_expansion');
    window.researchSystem.saveData();
}
```

## 🔍 Debug Information

Hvis du vil se detaljeret information om hvad der foregår:

```javascript
// Se alle tier-checks
window.buildingsGridManager.getCurrentTier()

// Se purchase-check details
window.buildingsGridManager.canPurchaseSlot()

// Se grid statistikker
window.buildingsGridManager.getGridStatistics()
```

## ✅ Expected Results

Efter fix skulle du se:
- Expansion panel synlig
- "Køb byggeplads (500 kr)" knap aktiv
- Tier vises som 1 i slots-info

## 🆘 If Nothing Works

Sidste udvej - helt reset:

```javascript
// Reset alt research data
localStorage.removeItem('research-data');
localStorage.removeItem('samfunds-spil-data');

// Reload siden
location.reload();
```

Derefter skal du:
1. Gå til Research siden
2. Lås "Byudvikling" op igen
3. Gå tilbage til hovedspillet

## 📞 Still Having Issues?

Dette er sandsynligvis en synkroniserings-fejl mellem research-systemet og buildings-grid systemet. `quickFixTier()` kommandoen skulle løse det i 99% af tilfældene.
