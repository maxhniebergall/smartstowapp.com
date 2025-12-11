/**
 * SmartStow "Science of Moving" Calculator Logic v2.5
 * Updates:
 * - Added labor time for Wardrobe Boxes and Vacuum Bags to Packing Hours.
 * - Wardrobe Boxes: Calculated at standard box rate (approx 15 mins).
 * - Vacuum Bags: Calculated at ~10 mins per bag.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
});

// --- Constants & Data Models ---

const CONSTANTS = {
    EFFICIENCY_FACTOR: 0.70, // Amateurs pack inefficiently
    ITEMS_PER_BOX: 18,       // "Ground Truth" metric
    PACKING_SPEED: 2,        // Boxes per hour (DIY average - 15 mins/box)
    VACUUM_BAG_TIME_MIN: 20, // Minutes to stuff & vacuum a jumbo bag
    SMARTSTOW_SEC_PER_ITEM: 5.38,
    // Truck Capacities (Approx Cubic Feet)
    CAPACITY_VAN: 240,
    CAPACITY_10FT: 400,
    CAPACITY_15FT: 760,
    CAPACITY_20FT: 1015,
    CAPACITY_26FT: 1600,
    CAPACITY_TRAILER: 390
};

// Base contents volume (loose items) excluding furniture
const BASE_VOLUMES = {
    'studio': 30, '1bed': 60, '2bed': 100, '3bed': 150, '4bed': 250
};

// Supply Calcs
const BEDROOM_COUNT = {
    'studio': 1, '1bed': 1, '2bed': 2, '3bed': 3, '4bed': 4
};

const STUFF_MULTIPLIERS = {
    'minimalist': 0.70, 'average': 1.00, 'aboveAverage': 1.30, 'collector': 1.60
};

// Hobby Data
const HOBBY_DATA = [
    { 
        id: 'cycling', name: 'Cycling', icon: '🚴', 
        levels: { min: { val: 15, boxRatio: 0.0 }, avg: { val: 30, boxRatio: 0.0 }, high: { val: 50, boxRatio: 0.1 }, pro: { val: 80, boxRatio: 0.2 } } 
    },
    { 
        id: 'golf', name: 'Golf', icon: '⛳', 
        levels: { min: { val: 5, boxRatio: 0.0 }, avg: { val: 10, boxRatio: 0.0 }, high: { val: 20, boxRatio: 0.0 }, pro: { val: 40, boxRatio: 0.1 } } 
    },
    { 
        id: 'ski', name: 'Ski/Snow', icon: '🎿', 
        levels: { min: { val: 5, boxRatio: 0.0 }, avg: { val: 10, boxRatio: 0.0 }, high: { val: 25, boxRatio: 0.0 }, pro: { val: 40, boxRatio: 0.0 } } 
    },
    { 
        id: 'camping', name: 'Camping', icon: '⛺', 
        levels: { min: { val: 5, boxRatio: 1.0 }, avg: { val: 25, boxRatio: 0.5 }, high: { val: 50, boxRatio: 0.4 }, pro: { val: 100, boxRatio: 0.4 } } 
    },
    { 
        id: 'musician', name: 'Musician', icon: '🎸', 
        levels: { min: { val: 5, boxRatio: 0.0 }, avg: { val: 15, boxRatio: 0.2 }, high: { val: 40, boxRatio: 0.3 }, pro: { val: 100, boxRatio: 0.4 } } 
    },
    { 
        id: 'gaming', name: 'Gaming', icon: '🎮', 
        levels: { min: { val: 3, boxRatio: 1.0 }, avg: { val: 10, boxRatio: 1.0 }, high: { val: 25, boxRatio: 1.0 }, pro: { val: 60, boxRatio: 0.5 } } 
    },
    { 
        id: 'garden', name: 'Garden', icon: '🌻', 
        levels: { min: { val: 2, boxRatio: 0.5 }, avg: { val: 10, boxRatio: 0.1 }, high: { val: 30, boxRatio: 0.1 }, pro: { val: 60, boxRatio: 0.05 } } 
    },
    { 
        id: 'crafter', name: 'Crafts', icon: '🎨', 
        levels: { min: { val: 5, boxRatio: 1.0 }, avg: { val: 15, boxRatio: 1.0 }, high: { val: 35, boxRatio: 0.9 }, pro: { val: 70, boxRatio: 0.6 } } 
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
    'sofa': 50, 'table': 30, 'bed': 60, 'dresser': 40, 'desk': 30
};

// --- Initialization ---

function initCalculator() {
    renderHobbies();
    renderFurniture();
    
    // Attempt to load saved state
    const loaded = loadState();

    // If no save found, set defaults
    if (!loaded) {
        updateFurnitureDefaults();
    }
    
    // Global Event Listeners
    document.getElementById('homeSize').addEventListener('change', () => {
        updateFurnitureDefaults();
        saveState();
    });

    document.getElementById('calculateBtn').addEventListener('click', calculateMove);
    document.getElementById('printPlan').addEventListener('click', () => window.print());

    attachAutoSaveListeners();

    if (loaded) {
        calculateMove();
    }
}

function attachAutoSaveListeners() {
    const ids = ['occupants', 'helpers'];
    ids.forEach(id => {
        document.getElementById(id).addEventListener('input', saveState);
    });

    const radios = document.querySelectorAll('input[name="stuffLevel"]');
    radios.forEach(r => r.addEventListener('change', saveState));

    Object.keys(FURNITURE_VOLS).forEach(key => {
        document.getElementById(`furn_${key}`).addEventListener('input', saveState);
    });
}

// --- DOM Rendering & Logic ---

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
        card.classList.remove('active');
        input.value = "";
    } else {
        card.classList.add('active');
        input.value = "avg";
        
        const buttons = card.querySelectorAll('.level-btn');
        buttons.forEach(btn => btn.classList.remove('selected'));
        buttons[1].classList.add('selected'); 
    }
    saveState();
};

window.setHobbyLevel = function(hobbyId, levelKey, btnElement) {
    const input = document.getElementById(`level_${hobbyId}`);
    const card = document.getElementById(`card_${hobbyId}`);
    
    if (!card.classList.contains('active')) {
        card.classList.add('active');
    }
    input.value = levelKey;
    
    const buttons = card.querySelectorAll('.level-btn');
    buttons.forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
    
    saveState();
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

// --- State Management ---

function saveState() {
    const state = {
        homeSize: document.getElementById('homeSize').value,
        occupants: document.getElementById('occupants').value,
        helpers: document.getElementById('helpers').value,
        stuffLevel: document.querySelector('input[name="stuffLevel"]:checked').value,
        hobbies: {},
        furniture: {}
    };

    HOBBY_DATA.forEach(hobby => {
        const level = document.getElementById(`level_${hobby.id}`).value;
        if (level) {
            state.hobbies[hobby.id] = level;
        }
    });

    Object.keys(FURNITURE_VOLS).forEach(key => {
        state.furniture[key] = document.getElementById(`furn_${key}`).value;
    });

    localStorage.setItem('smartStowState_v1', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('smartStowState_v1');
    if (!saved) return false;

    try {
        const state = JSON.parse(saved);

        document.getElementById('homeSize').value = state.homeSize || '1bed';
        document.getElementById('occupants').value = state.occupants || 1;
        document.getElementById('helpers').value = state.helpers || 0;

        const radio = document.querySelector(`input[name="stuffLevel"][value="${state.stuffLevel}"]`);
        if (radio) radio.checked = true;

        if (state.furniture) {
            for (const [key, val] of Object.entries(state.furniture)) {
                const el = document.getElementById(`furn_${key}`);
                if (el) el.value = val;
            }
        }

        if (state.hobbies) {
            for (const [hobbyId, level] of Object.entries(state.hobbies)) {
                const card = document.getElementById(`card_${hobbyId}`);
                const input = document.getElementById(`level_${hobbyId}`);
                
                if (card && input) {
                    card.classList.add('active');
                    input.value = level;
                    
                    const buttons = card.querySelectorAll('.level-btn');
                    const map = { 'min': 0, 'avg': 1, 'high': 2, 'pro': 3 };
                    if (map[level] !== undefined && buttons[map[level]]) {
                        buttons.forEach(b => b.classList.remove('selected'));
                        buttons[map[level]].classList.add('selected');
                    }
                }
            }
        }
        return true;
    } catch (e) {
        console.error("Failed to load state", e);
        return false;
    }
}

// --- Calculation Logic ---

function calculateMove() {
    // 1. Inputs
    const homeSizeKey = document.getElementById('homeSize').value;
    const occupants = parseInt(document.getElementById('occupants').value) || 1;
    const helpers = parseInt(document.getElementById('helpers').value) || 0;
    const stuffLevel = document.querySelector('input[name="stuffLevel"]:checked').value;
    
    // 2. Volume Calculations
    const baseVol = BASE_VOLUMES[homeSizeKey]; 
    const multiplier = STUFF_MULTIPLIERS[stuffLevel];
    const baseContentsVol = baseVol * multiplier;
    
    // Hobby Vol
    let hobbyBoxVol = 0;
    let hobbyFurnVol = 0;
    
    HOBBY_DATA.forEach(hobby => {
        const levelKey = document.getElementById(`level_${hobby.id}`).value;
        if (levelKey) {
            const data = hobby.levels[levelKey];
            const totalHobbyVol = data.val;
            hobbyBoxVol += totalHobbyVol * data.boxRatio;
            hobbyFurnVol += totalHobbyVol * (1 - data.boxRatio);
        }
    });
    
    // Furniture Vol
    let houseFurnVol = 0;
    let houseFurnCount = 0;
    for (const [key, vol] of Object.entries(FURNITURE_VOLS)) {
        const count = parseInt(document.getElementById(`furn_${key}`).value) || 0;
        houseFurnVol += count * vol;
        houseFurnCount += count;
    }
    
    // Totals
    const totalBoxableVol = baseContentsVol + hobbyBoxVol;
    const totalFurnVol = houseFurnVol + hobbyFurnVol;
    const totalMoveVol = totalBoxableVol + totalFurnVol;
    
    // 3. Truck Sizing
    const reqTruckSpace = totalMoveVol / CONSTANTS.EFFICIENCY_FACTOR;
    
    let truckRec = "";
    let truckWarn = "";

    if (reqTruckSpace <= CONSTANTS.CAPACITY_VAN) {
        truckRec = "Cargo Van";
    } else if (reqTruckSpace <= CONSTANTS.CAPACITY_10FT) {
        truckRec = "10' Truck";
    } else if (reqTruckSpace <= CONSTANTS.CAPACITY_15FT) {
        truckRec = "15' Truck";
    } else if (reqTruckSpace <= CONSTANTS.CAPACITY_20FT) {
        truckRec = "20' Truck";
    } else if (reqTruckSpace <= CONSTANTS.CAPACITY_26FT) {
        truckRec = "26' Truck";
    } else if (reqTruckSpace <= (CONSTANTS.CAPACITY_20FT + CONSTANTS.CAPACITY_TRAILER)) {
        truckRec = "20' Truck + Trailer";
        truckWarn = "Heavy load: A trailer is recommended.";
    } else if (reqTruckSpace <= (CONSTANTS.CAPACITY_26FT + CONSTANTS.CAPACITY_TRAILER)) {
        truckRec = "26' Truck + Trailer";
        truckWarn = "Max Capacity: Requires precise packing.";
    } else {
        truckRec = "26' Truck + Trailer (Tight)";
        truckWarn = "CRITICAL: You likely need 2 trips or a 53' semi.";
    }

    // 4. Box & Item Quantification
    const boxCount = Math.ceil(totalBoxableVol / 3.0); 
    const itemCount = boxCount * CONSTANTS.ITEMS_PER_BOX;
    
    // 5. Specialty Supplies
    const numBedrooms = BEDROOM_COUNT[homeSizeKey];
    const rawWardrobe = (occupants * 1.5) + (numBedrooms * 1.0);
    const wardrobeBoxes = Math.ceil(rawWardrobe * multiplier);
    const vacuumBags = Math.ceil((numBedrooms * 2) + occupants);

    // 6. Labor Forecasting (UPDATED)
    const stdBoxHours = boxCount / CONSTANTS.PACKING_SPEED;
    
    // Wardrobe Boxes: Assumed same speed as standard boxes for assembly/transfer 
    const wardrobeHours = wardrobeBoxes / CONSTANTS.PACKING_SPEED;
    
    // Vacuum Bags: Specific time per bag
    const vacuumHours = vacuumBags * (CONSTANTS.VACUUM_BAG_TIME_MIN / 60);

    // Total Packing Time
    const packingHours = stdBoxHours + wardrobeHours + vacuumHours;
    
    // Loading Time (Unchanged)
    const activeHelpers = Math.max(helpers, 1);
    const estHobbyPieces = Math.ceil(hobbyFurnVol / 20); 
    const totalFurnPieces = houseFurnCount + estHobbyPieces;
    const loadingHours = (boxCount / (10 * activeHelpers)) + ((totalFurnPieces * 0.25) / activeHelpers);
    
    const totalLabor = packingHours + loadingHours;
    const smartStowTime = (itemCount * CONSTANTS.SMARTSTOW_SEC_PER_ITEM) / 3600;

    // --- Render Results ---
    
    const smallBoxes = Math.round(boxCount * 0.5);
    const medBoxes = Math.round(boxCount * 0.3);
    const lgBoxes = boxCount - smallBoxes - medBoxes;

    document.getElementById('resTotalItems').textContent = itemCount.toLocaleString();
    
    document.getElementById('resBoxCount').textContent = boxCount;
    document.getElementById('resSmallBoxes').textContent = smallBoxes;
    document.getElementById('resMedBoxes').textContent = medBoxes;
    document.getElementById('resLgBoxes').textContent = lgBoxes;

    const resWardrobe = document.getElementById('resWardrobeBoxes');
    if (resWardrobe) resWardrobe.textContent = wardrobeBoxes;

    const resVacuum = document.getElementById('resVacuumBags');
    if (resVacuum) resVacuum.textContent = vacuumBags;
    
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
}