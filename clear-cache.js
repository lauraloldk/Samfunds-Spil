// CACHE CLEARING SCRIPT - Kør denne for at rydde alle cache problemer
console.log('🧹 CLEARING ALL CACHE AND STORAGE...');

// Ryd localStorage
try {
    localStorage.clear();
    console.log('✅ localStorage cleared');
} catch (e) {
    console.log('❌ localStorage clear failed:', e);
}

// Ryd sessionStorage
try {
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
} catch (e) {
    console.log('❌ sessionStorage clear failed:', e);
}

// Genindlæs siden uden cache
function hardReload() {
    console.log('🔄 HARD RELOADING PAGE...');
    // Force reload uden cache
    window.location.reload(true);
}

// Ryd også service workers hvis de findes
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
            console.log('✅ Service worker cleared');
        }
    });
}

// Simuler Ctrl+F5 hard reload
window.addEventListener('load', function() {
    // Tilføj timestamp til alle links og scripts for cache busting
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');
    const timestamp = Date.now();
    
    links.forEach(link => {
        if (!link.href.includes('?v=')) {
            link.href += `?v=${timestamp}`;
        }
    });
    
    scripts.forEach(script => {
        if (!script.src.includes('?v=')) {
            script.src += `?v=${timestamp}`;
        }
    });
});

console.log('✅ CACHE CLEARING COMPLETE!');
console.log('🎯 Use index-fresh.html for completely clean start');

// Auto-reload efter 2 sekunder
setTimeout(hardReload, 2000);
