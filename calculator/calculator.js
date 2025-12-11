/**
 * SmartStow "Science of Moving" Calculator Logic v2.0
 * Based on Product Requirement Document v2.0
 */

document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
});

// --- Constants & Data Models ---

const CONSTANTS = {
    EFFICIENCY_FACTOR: 0.70, // Amateurs pack inefficiently
    ITEMS_PER_BOX: 18,       // "Ground Truth" metric
    PACKING_SPEED: 4,        // Boxes per hour (DIY average)
    SMARTSTOW_SEC_PER_ITEM: 5.38,
    SMALL_BOX_VOL: 1.5,
    MED_BOX_VOL: 3.0,
    LG_BOX_VOL: 4.5
};

// Base contents volume (loose items) excluding furniture
const BASE_VOLUMES = {
    'studio': 100,
    '1bed': 200,
    '2bed': 350,
    '3bed': 500,
    '4bed': 700
};

const STUFF_MULTIPLIERS = {
    'minimalist': 0.70,
    'average': 1.00,
    'aboveAverage': 1.30,
    'collector': 1.60
};

// Updated Hobby Data with Icons and Short Labels for Segmented Control
const HOBBY_DATA = [
    { 
        id: 'cycling', 
        name: 'Cycling', 
        icon: '🚴', 
        levels: { min: 15, avg: 30, high: 50, pro: 80 } 
    },
    { 
        id: 'golf', 
        name: 'Golf', 
        icon: '⛳', 
        levels: { min: 5, avg: 10, high: 20, pro: 40 } 
    },
    { 
        id: 'ski', 
        name: 'Ski/Snow', 
        icon: '🎿', 
        levels: { min: 5, avg: 10, high: 25, pro: 40 } 
    },
    { 
        id: 'camping', 
        name: 'Camping', 
        icon: '⛺', 
        levels: { min: 5, avg: 25, high: 50, pro: 100 } 
    },
    { 
        id: 'musician', 
        name: 'Musician', 
        icon: '🎸', 
        levels: { min: 5, avg: 15, high: 40, pro: 100 } 
    },
    { 
        id: 'gaming', 
        name: 'Gaming', 
        icon: '🎮', 
        levels: { min: 3, avg: 10, high: 25, pro: 60 } 
    },
    { 
        id: 'garden', 
        name: 'Garden', 
        icon: '🌻', 
        levels: { min: 2, avg: 10, high: 30, pro: 60 } 
    },
    { 
        id: 'crafter', 
        name: 'Crafts', 
        icon: '🎨', 
        levels: { min: 5, avg: 15, high: 35, pro: 70 } 
    }
];

const FURNITURE_DEFAULTS = {
    'studio': { sofa: 1, table: 0, bed: 1, dresser: 1, desk: 1 },
    '1bed': { sofa: 1, table: 1, bed: 1, dresser: 1, desk: 1 },
    '2bed': { sofa: 1, table: 1, bed: 2, dresser: 2, desk: 1 },
    '3bed': { sofa: 2, table: 1, bed: 3, dresser: 3, desk: 2 },
    '4bed': { sofa: 2, table: 1, bed: 4, dresser: 4, desk: 3 }
};

const FURNITURE_VOLS = {
    'sofa': 50,
    'table': 30, // Dining table
    'bed': 60,   // Avg Queen
    'dresser': 40,
    'desk': 30
};

// --- Initialization ---

function initCalculator() {
    renderHobbies();
    renderFurniture();
    
    // Event Listeners
    document.getElementById('homeSize').addEventListener('change', updateFurnitureDefaults);
    document.getElementById('calculateBtn').addEventListener('click', calculateMove);
    document.getElementById('printPlan').addEventListener('click', () => window.print());
    
    // Initial UI setup
    updateFurnitureDefaults();
}

/**
 * Renders the "Active Card" Hobby Matrix
 * Features: Click to activate (defaults to Average), then micro-adjust intensity.
 */
function renderHobbies() {
    const container = document.getElementById('hobbyList');
    
    container.innerHTML = HOBBY_DATA.map(hobby => `
        <div class="hobby-card" id="card_${hobby.id}" onclick="toggleHobby('${hobby.id}')">
            <div class="hobby-icon">${hobby.icon}</div>
            <div class="hobby-name">${hobby.name}</div>
            
            <input type="hidden" id="val_${hobby.id}" value="0">
            
            <div class="intensity-selector" onclick="event.stopPropagation()">
                <button type="button" class="level-btn" onclick="setHobbyLevel('${hobby.id}', ${hobby.levels.min}, this)">Min</button>
                <button type="button" class="level-btn selected" onclick="setHobbyLevel('${hobby.id}', ${hobby.levels.avg}, this)">Avg</button>
                <button type="button" class="level-btn" onclick="setHobbyLevel('${hobby.id}', ${hobby.levels.high}, this)">High</button>
                <button type="button" class="level-btn" onclick="setHobbyLevel('${hobby.id}', ${hobby.levels.pro}, this)">Pro</button>
            </div>
        </div>
    `).join('');
}

/**
 * Toggles a hobby card's active state.
 * If activating: Sets value to 'Average' by default.
 * If deactivating: Sets value to 0.
 */
window.toggleHobby = function(hobbyId) {
    const card = document.getElementById(`card_${hobbyId}`);
    const input = document.getElementById(`val_${hobbyId}`);
    const hobby = HOBBY_DATA.find(h => h.id === hobbyId);
    
    // Toggle Active Class
    if (card.classList.contains('active')) {
        // Deactivate
        card.classList.remove('active');
        input.value = 0;
    } else {
        // Activate (Default to Average)
        card.classList.add('active');
        input.value = hobby.levels.avg;
        
        // Reset buttons to show Avg as selected
        const buttons = card.querySelectorAll('.level-btn');
        buttons.forEach(btn => btn.classList.remove('selected'));
        buttons[1].classList.add('selected'); // Index 1 is Average
    }
};

/**
 * Sets specific intensity level without toggling the card off.
 */
window.setHobbyLevel = function(hobbyId, volume, btnElement) {
    const input = document.getElementById(`val_${hobbyId}`);
    const card = document.getElementById(`card_${hobbyId}`);
    
    // Ensure card is active
    if (!card.classList.contains('active')) {
        card.classList.add('active');
    }
    
    // Update Value
    input.value = volume;
    
    // Update Visuals
    const buttons = card.querySelectorAll('.level-btn');
    buttons.forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
};

function renderFurniture() {
    const container = document.getElementById('furnitureList');
    container.innerHTML = Object.keys(FURNITURE_VOLS).map(key => `
        <div class="furn-item">
            <label>${key.charAt(0).toUpperCase() + key.slice(1)}</label>
            <input type="number" id="furn_${key}" min="0" value="0">
        </div>
    `).join('');
}

function updateFurnitureDefaults() {
    const homeSize = document.getElementById('homeSize').value;
    const defaults = FURNITURE_DEFAULTS[homeSize];
    
    for (const [key, count] of Object.entries(defaults)) {
        const input = document.getElementById(`furn_${key}`);
        if (input) input.value = count;
    }
}

// --- Calculation Logic ---

function calculateMove() {
    // 1. Inputs
    const homeSize = document.getElementById('homeSize').value;
    const occupants = parseInt(document.getElementById('occupants').value) || 1;
    const helpers = parseInt(document.getElementById('helpers').value) || 0;
    
    const stuffLevel = document.querySelector('input[name="stuffLevel"]:checked').value;
    
    // 2. Volume Calculations
    // A. Base Contents
    const baseVol = BASE_VOLUMES[homeSize];
    const multiplier = STUFF_MULTIPLIERS[stuffLevel];
    const contentsVol = baseVol * multiplier;
    
    // B. Hobby Volume (Sum of hidden inputs)
    let hobbyVol = 0;
    HOBBY_DATA.forEach(hobby => {
        const val = parseInt(document.getElementById(`val_${hobby.id}`).value) || 0;
        hobbyVol += val;
    });
    
    // C. Furniture Volume
    let furnVol = 0;
    let furnCount = 0;
    for (const [key, vol] of Object.entries(FURNITURE_VOLS)) {
        const count = parseInt(document.getElementById(`furn_${key}`).value) || 0;
        furnVol += count * vol;
        furnCount += count;
    }
    
    // Total Volume
    const totalVol = contentsVol + hobbyVol + furnVol;
    
    // 3. Truck Sizing (Efficiency Adjusted)
    const reqTruckSpace = totalVol / CONSTANTS.EFFICIENCY_FACTOR;
    
    // 4. Box & Item Quantification
    const boxCount = Math.ceil((contentsVol + hobbyVol) / 3.0); // Avg 3.0 ft3 per box
    const itemCount = boxCount * CONSTANTS.ITEMS_PER_BOX;
    
    // 5. Labor Forecasting
    const packingHours = boxCount / CONSTANTS.PACKING_SPEED;
    
    // Loading: (Boxes / (10 * Helpers)) + (Furniture * 0.25 / Helpers)
    // Avoid divide by zero
    const activeHelpers = Math.max(helpers, 1); 
    const loadingHours = (boxCount / (10 * activeHelpers)) + ((furnCount * 0.25) / activeHelpers);
    
    const totalLabor = packingHours + loadingHours;
    const smartStowTime = (itemCount * CONSTANTS.SMARTSTOW_SEC_PER_ITEM) / 3600;

    // --- Render Results ---
    
    // Box Breakdown (Estimate)
    const smallBoxes = Math.round(boxCount * 0.5);
    const medBoxes = Math.round(boxCount * 0.3);
    const lgBoxes = boxCount - smallBoxes - medBoxes;

    // Truck Recommendation
    let truckRec = "";
    let truckWarn = "";
    if (reqTruckSpace < 400) truckRec = "Cargo Van";
    else if (reqTruckSpace < 800) truckRec = "10' - 15' Truck";
    else if (reqTruckSpace < 1600) truckRec = "26' Truck";
    else {
        truckRec = "26' Truck + Trailer";
        truckWarn = "Warning: High volume. You may need two trips.";
    }

    // Update DOM
    document.getElementById('resTotalItems').textContent = itemCount.toLocaleString();
    
    document.getElementById('resBoxCount').textContent = boxCount;
    document.getElementById('resSmallBoxes').textContent = smallBoxes;
    document.getElementById('resMedBoxes').textContent = medBoxes;
    document.getElementById('resLgBoxes').textContent = lgBoxes;
    
    document.getElementById('resTruckSize').textContent = truckRec;
    document.getElementById('resTotalVol').textContent = Math.round(reqTruckSpace).toLocaleString();
    document.getElementById('resTotalWeight').textContent = Math.round(reqTruckSpace * 7).toLocaleString(); // Rough density est
    document.getElementById('resTruckWarning').textContent = truckWarn;
    
    document.getElementById('resTotalLabor').textContent = Math.round(totalLabor) + " hrs";
    document.getElementById('resPackTime').textContent = packingHours.toFixed(1) + " hrs";
    document.getElementById('resLoadTime').textContent = loadingHours.toFixed(1) + " hrs";
    document.getElementById('resSmartStowTime').textContent = smartStowTime.toFixed(1);

    // Pivot Message
    const pivotMsg = document.getElementById('pivotMessage');
    const recPlan = document.getElementById('resRecPlan');
    
    if (itemCount > 1000) {
        pivotMsg.innerHTML = `You have <strong style="color:#f87171">${itemCount.toLocaleString()} items</strong>. That is a £410 mistake waiting to happen if you rely on memory.`;
        recPlan.textContent = "Premium or Pro";
    } else {
        pivotMsg.innerHTML = `You have <strong>${itemCount.toLocaleString()} items</strong>. Organization is key to a stress-free move.`;
        recPlan.textContent = "Plus or Premium";
    }

    // Show Results
    document.getElementById('resultsArea').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('resultsArea').scrollIntoView({ behavior: 'smooth' });
}