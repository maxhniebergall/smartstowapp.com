/**
 * SmartStow "Science of Moving" Calculator Logic v2.1
 * Updates: Separated Hobby volumes into "Boxable" (contents) and "Non-Boxable" (furniture)
 * based on item descriptions in PRD v2.0.
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
    'studio': 30,
    '1bed': 60,
    '2bed': 100,
    '3bed': 150,
    '4bed': 250
};

const STUFF_MULTIPLIERS = {
    'minimalist': 0.70,
    'average': 1.00,
    'aboveAverage': 1.30,
    'collector': 1.60
};

/**
 * HOBBY DATA v2.1
 * 'val': Total Volume (ft3) from PRD
 * 'boxRatio': Percentage of volume that goes into boxes (0.0 to 1.0). 
 * The remainder is treated as "Furniture" (Truck space only).
 */
const HOBBY_DATA = [
    { 
        id: 'cycling', 
        name: 'Cycling', 
        icon: '🚴', 
        // Bikes are effectively furniture/loose items.
        levels: { 
            min: { val: 15, boxRatio: 0.0 }, // 1 Bike
            avg: { val: 30, boxRatio: 0.0 }, // 2 Bikes
            high: { val: 50, boxRatio: 0.1 }, // 3+ Bikes + Parts (10% parts)
            pro: { val: 80, boxRatio: 0.2 }   // Team Setup (Tools/Parts)
        } 
    },
    { 
        id: 'golf', 
        name: 'Golf', 
        icon: '⛳', 
        // Golf bags are loose items.
        levels: { 
            min: { val: 5, boxRatio: 0.0 },  // 1 Bag
            avg: { val: 10, boxRatio: 0.0 }, // Travel Case
            high: { val: 20, boxRatio: 0.0 }, // 2 Bags/Nets
            pro: { val: 40, boxRatio: 0.1 }   // Sim Setup (mostly screens/mats)
        } 
    },
    { 
        id: 'ski', 
        name: 'Ski/Snow', 
        icon: '🎿', 
        // Skis/Boards are loose/bundled.
        levels: { 
            min: { val: 5, boxRatio: 0.0 }, 
            avg: { val: 10, boxRatio: 0.0 }, 
            high: { val: 25, boxRatio: 0.0 }, 
            pro: { val: 40, boxRatio: 0.0 } 
        } 
    },
    { 
        id: 'camping', 
        name: 'Camping', 
        icon: '⛺', 
        // Mix of gear (boxable) and bulky items (tents/coolers).
        levels: { 
            min: { val: 5, boxRatio: 1.0 },   // Basic (Sleeping bag - Boxable)
            avg: { val: 25, boxRatio: 0.5 },  // Family Tent (Tent is loose, Kitchen is box)
            high: { val: 50, boxRatio: 0.4 }, // Glamping (Furniture heavy)
            pro: { val: 100, boxRatio: 0.4 }  // Expedition
        } 
    },
    { 
        id: 'musician', 
        name: 'Musician', 
        icon: '🎸', 
        // Instruments vs Amps vs Cables
        levels: { 
            min: { val: 5, boxRatio: 0.0 },   // 1 Instr (Case - Loose)
            avg: { val: 15, boxRatio: 0.2 },  // Amps (Loose) + Pedals (Box)
            high: { val: 40, boxRatio: 0.3 }, // Band Gear
            pro: { val: 100, boxRatio: 0.4 }  // Studio (Rack gear/Monitors)
        } 
    },
    { 
        id: 'gaming', 
        name: 'Gaming', 
        icon: '🎮', 
        // Mostly boxable until Arcade level
        levels: { 
            min: { val: 3, boxRatio: 1.0 },   // Console (Box)
            avg: { val: 10, boxRatio: 1.0 },  // PC Rig (Box)
            high: { val: 25, boxRatio: 1.0 }, // Server/VR (Box)
            pro: { val: 60, boxRatio: 0.5 }   // Arcade Cabinet (Furniture)
        } 
    },
    { 
        id: 'garden', 
        name: 'Garden', 
        icon: '🌻', 
        // Tools vs Machinery
        levels: { 
            min: { val: 2, boxRatio: 0.5 },   // Hand tools
            avg: { val: 10, boxRatio: 0.1 },  // Mower (Furn)
            high: { val: 30, boxRatio: 0.1 }, // Wheelbarrow (Furn)
            pro: { val: 60, boxRatio: 0.05 }  // Tractor (Furn)
        } 
    },
    { 
        id: 'crafter', 
        name: 'Crafts', 
        icon: '🎨', 
        // Mostly small items
        levels: { 
            min: { val: 5, boxRatio: 1.0 },   // Sewing (Box)
            avg: { val: 15, boxRatio: 1.0 },  // Paints (Box)
            high: { val: 35, boxRatio: 0.9 }, // Stash (Box)
            pro: { val: 70, boxRatio: 0.6 }   // Industrial Table (Furn)
        } 
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
 * Note: Stores the Level String ('min', 'avg', etc.) instead of raw volume
 * to allow looking up the boxRatio later.
 */
function renderHobbies() {
    const container = document.getElementById('hobbyList');
    
    container.innerHTML = HOBBY_DATA.map(hobby => `
        <div class="hobby-card" id="card_${hobby.id}" onclick="toggleHobby('${hobby.id}')">
            <div class="hobby-icon">${hobby.icon}</div>
            <div class="hobby-name">${hobby.name}</div>
            
            <input type="hidden" id="level_${hobby.id}" value="">
            
            <div class="intensity-selector" onclick="event.stopPropagation()">
                <button type="button" class="level-btn" onclick="setHobbyLevel('${hobby.id}', 'min', this)">Min</button>
                <button type="button" class="level-btn selected" onclick="setHobbyLevel('${hobby.id}', 'avg', this)">Avg</button>
                <button type="button" class="level-btn" onclick="setHobbyLevel('${hobby.id}', 'high', this)">High</button>
                <button type="button" class="level-btn" onclick="setHobbyLevel('${hobby.id}', 'pro', this)">Pro</button>
            </div>
        </div>
    `).join('');
}

window.toggleHobby = function(hobbyId) {
    const card = document.getElementById(`card_${hobbyId}`);
    const input = document.getElementById(`level_${hobbyId}`);
    
    if (card.classList.contains('active')) {
        // Deactivate
        card.classList.remove('active');
        input.value = "";
    } else {
        // Activate (Default to Average)
        card.classList.add('active');
        input.value = "avg";
        
        // Visuals
        const buttons = card.querySelectorAll('.level-btn');
        buttons.forEach(btn => btn.classList.remove('selected'));
        buttons[1].classList.add('selected'); // Index 1 is Avg
    }
};

window.setHobbyLevel = function(hobbyId, levelKey, btnElement) {
    const input = document.getElementById(`level_${hobbyId}`);
    const card = document.getElementById(`card_${hobbyId}`);
    
    if (!card.classList.contains('active')) {
        card.classList.add('active');
    }
    
    // Set Level Key
    input.value = levelKey;
    
    // Visuals
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
    
    // A. Base Contents (100% Boxable)
    const baseVol = BASE_VOLUMES[homeSize];
    const multiplier = STUFF_MULTIPLIERS[stuffLevel];
    const baseContentsVol = baseVol * multiplier;
    
    // B. Hobby Volume (Split: Boxable vs Furniture)
    let hobbyBoxVol = 0;
    let hobbyFurnVol = 0;
    
    HOBBY_DATA.forEach(hobby => {
        const levelKey = document.getElementById(`level_${hobby.id}`).value;
        if (levelKey) {
            const data = hobby.levels[levelKey];
            const totalHobbyVol = data.val;
            const boxVol = totalHobbyVol * data.boxRatio;
            const furnVol = totalHobbyVol * (1 - data.boxRatio);
            
            hobbyBoxVol += boxVol;
            hobbyFurnVol += furnVol;
        }
    });
    
    // C. Furniture Volume
    let houseFurnVol = 0;
    let houseFurnCount = 0;
    for (const [key, vol] of Object.entries(FURNITURE_VOLS)) {
        const count = parseInt(document.getElementById(`furn_${key}`).value) || 0;
        houseFurnVol += count * vol;
        houseFurnCount += count;
    }
    
    // D. Totals
    // Total Boxable Volume (Base + Hobby Parts)
    const totalBoxableVol = baseContentsVol + hobbyBoxVol;
    
    // Total Furniture Volume (House Furniture + Hobby Furniture)
    const totalFurnVol = houseFurnVol + hobbyFurnVol;
    
    // Total Move Volume
    const totalMoveVol = totalBoxableVol + totalFurnVol;
    
    // 3. Truck Sizing (Efficiency Adjusted)
    const reqTruckSpace = totalMoveVol / CONSTANTS.EFFICIENCY_FACTOR;
    
    // 4. Box & Item Quantification
    // Only use Boxable Volume for box count
    const boxCount = Math.ceil(totalBoxableVol / 3.0); 
    const itemCount = boxCount * CONSTANTS.ITEMS_PER_BOX;
    
    // 5. Labor Forecasting
    const packingHours = boxCount / CONSTANTS.PACKING_SPEED;
    
    // Loading: (Boxes / (10 * Helpers)) + (Furniture / Helpers)
    const activeHelpers = Math.max(helpers, 1);
    
    // We treat Hobby Furniture (e.g., Bikes) as "Furniture pieces" for loading time.
    // Approx: 15 mins (0.25 hrs) per 20 cu ft of furniture? 
    // Or simplified: Estimate piece count from volume (avg 20cf per piece)
    const estHobbyPieces = Math.ceil(hobbyFurnVol / 20); 
    const totalFurnPieces = houseFurnCount + estHobbyPieces;
    
    const loadingHours = (boxCount / (10 * activeHelpers)) + ((totalFurnPieces * 0.25) / activeHelpers);
    
    const totalLabor = packingHours + loadingHours;
    const smartStowTime = (itemCount * CONSTANTS.SMARTSTOW_SEC_PER_ITEM) / 3600;

    // --- Render Results ---
    
    const smallBoxes = Math.round(boxCount * 0.5);
    const medBoxes = Math.round(boxCount * 0.3);
    const lgBoxes = boxCount - smallBoxes - medBoxes;

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
    document.getElementById('resTotalWeight').textContent = Math.round(reqTruckSpace * 7).toLocaleString();
    document.getElementById('resTruckWarning').textContent = truckWarn;
    
    document.getElementById('resTotalLabor').textContent = Math.round(totalLabor) + " hrs";
    document.getElementById('resPackTime').textContent = packingHours.toFixed(1) + " hrs";
    document.getElementById('resLoadTime').textContent = loadingHours.toFixed(1) + " hrs";
    document.getElementById('resSmartStowTime').textContent = smartStowTime.toFixed(1);

    const pivotMsg = document.getElementById('pivotMessage');
    const recPlan = document.getElementById('resRecPlan');
    
    if (itemCount > 1000) {
        pivotMsg.innerHTML = `You have <strong style="color:#e11d48">${itemCount.toLocaleString()} items</strong>. That is a £410 mistake waiting to happen if you rely on memory.`;
        recPlan.textContent = "Premium or Pro";
    } else {
        pivotMsg.innerHTML = `You have <strong>${itemCount.toLocaleString()} items</strong>. Organization is key to a stress-free move.`;
        recPlan.textContent = "Plus or Premium";
    }

    document.getElementById('resultsArea').classList.remove('hidden');
    document.getElementById('resultsArea').scrollIntoView({ behavior: 'smooth' });
}