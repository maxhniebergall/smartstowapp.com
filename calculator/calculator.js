/**
 * SmartStow "Science of Moving" Calculator Logic v3.1 (Range-Based)
 * * UPDATES:
 * - Implements Upper/Lower bounds for all metrics as requested.
 * - Packing Speed: Range of 3-5 boxes/hr (Source: Research Report).
 * - Item Density: Range of 15-22 items/box (Source: Research Report).
 * - Efficiency: Range of 65%-75% for truck sizing.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
});

// --- Constants & Data Models ---

const CONSTANTS = {
    // Range Factors
    EFFICIENCY_MIN: 0.75,    // Better packing (Professional-ish)
    EFFICIENCY_MAX: 0.65,    // Worse packing (Hasty Amateur)
    
    ITEMS_PER_BOX_MIN: 15,   // Bulky items (Linens, Pots)
    ITEMS_PER_BOX_MAX: 22,   // Dense items (Books, Pantry)
    
    PACKING_SPEED_MIN: 5,    // Fast DIY (Boxes per hour)
    PACKING_SPEED_MAX: 1,    // Slow/Tired DIY (Boxes per hour)
    
    VACUUM_BAG_TIME_MIN: 15, 
    VACUUM_BAG_TIME_MAX: 30, 
    
    SMARTSTOW_SEC_PER_ITEM: 5.38, // Fixed digital benchmark
    
    // Truck Capacities (Approx Cubic Feet)
    CAPACITY_VAN: 240,
    CAPACITY_10FT: 400,
    CAPACITY_15FT: 760,
    CAPACITY_20FT: 1015,
    CAPACITY_26FT: 1600,
    CAPACITY_TRAILER: 390
};

// Base contents volume (loose items) excluding furniture [Source: PRD v2.0]
const BASE_VOLUMES = {
    'studio': 100, 
    '1bed': 200, 
    '2bed': 350, 
    '3bed': 500, 
    '4bed': 700
};

// Supply Calcs
const BEDROOM_COUNT = {
    'studio': 1, '1bed': 1, '2bed': 2, '3bed': 3, '4bed': 4
};

const STUFF_MULTIPLIERS = {
    'minimalist': 0.70,
    'average': 1.00,
    'aboveAverage': 1.30,
    'collector': 1.60
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

const FURNITURE_VOLS = {
    'sofa': 50, 'sectional': 100, 'armchair': 20, 'coffeeTable': 5, 'tvConsole': 15,
    'bookcase': 20, 'diningTable': 30, 'diningChair': 5, 'buffet': 40,
    'kingBed': 75, 'queenBed': 60, 'twinBed': 40, 'dresser': 40, 'nightstand': 5,
    'officeDesk': 30, 'appliance': 40, 'exerciseMachine': 35
};

const FURNITURE_DEFAULTS = {
    'studio': { sofa: 1, coffeeTable: 1, queenBed: 1, dresser: 1, officeDesk: 1 },
    '1bed':   { sofa: 1, coffeeTable: 1, tvConsole: 1, queenBed: 1, dresser: 1, nightstand: 1, officeDesk: 1, diningTable: 1, diningChair: 2 },
    '2bed':   { sofa: 1, armchair: 1, coffeeTable: 1, tvConsole: 1, queenBed: 1, twinBed: 1, dresser: 2, nightstand: 2, officeDesk: 1, diningTable: 1, diningChair: 4 },
    '3bed':   { sofa: 1, sectional: 0, armchair: 1, coffeeTable: 1, tvConsole: 1, bookcase: 1, queenBed: 1, twinBed: 2, dresser: 3, nightstand: 3, officeDesk: 1, diningTable: 1, diningChair: 4 },
    '4bed':   { sofa: 1, sectional: 1, armchair: 1, coffeeTable: 1, tvConsole: 2, bookcase: 2, kingBed: 1, queenBed: 1, twinBed: 2, dresser: 4, nightstand: 4, officeDesk: 2, diningTable: 1, diningChair: 6 }
};

// --- Initialization ---

function initCalculator() {
    renderHobbies();
    renderFurniture();
    
    const loaded = loadState();
    if (!loaded) updateFurnitureDefaults();
    
    document.getElementById('homeSize').addEventListener('change', () => {
        updateFurnitureDefaults();
        saveState();
    });

    document.getElementById('calculateBtn').addEventListener('click', calculateMove);
    document.getElementById('printPlan').addEventListener('click', () => window.print());

    attachAutoSaveListeners();

    if (loaded) calculateMove();
}

function attachAutoSaveListeners() {
    const ids = ['occupants', 'helpers'];
    ids.forEach(id => {
        document.getElementById(id).addEventListener('input', saveState);
    });

    const radios = document.querySelectorAll('input[name="stuffLevel"]');
    radios.forEach(r => r.addEventListener('change', saveState));

}

// --- DOM Rendering ---

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
    if (!card.classList.contains('active')) card.classList.add('active');
    input.value = levelKey;
    const buttons = card.querySelectorAll('.level-btn');
    buttons.forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
    saveState();
};

function renderFurniture() {
    const container = document.getElementById('furnitureList');
    container.innerHTML = Object.keys(FURNITURE_VOLS).map(key => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `
            <div class="furn-item">
                <label>${label}</label>
                <div class="quantity-selector">
                    <button type="button" class="qty-btn minus" onclick="adjustFurniture('${key}', -1)">-</button>
                    <span class="qty-display" id="qty_${key}">0</span>
                    <button type="button" class="qty-btn plus" onclick="adjustFurniture('${key}', 1)">+</button>
                </div>
                <input type="hidden" id="furn_${key}" value="0">
            </div>
        `;
    }).join('');
}

window.adjustFurniture = function(key, delta) {
    const hidden = document.getElementById(`furn_${key}`);
    const display = document.getElementById(`qty_${key}`);
    let val = parseInt(hidden.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    hidden.value = val;
    display.textContent = val;
    saveState();
};

function updateFurnitureDefaults() {
    const homeSize = document.getElementById('homeSize').value;
    const defaults = FURNITURE_DEFAULTS[homeSize];
    Object.keys(FURNITURE_VOLS).forEach(key => {
        const input = document.getElementById(`furn_${key}`);
        const display = document.getElementById(`qty_${key}`);
        if (input) input.value = 0;
        if (display) display.textContent = 0;
    });
    for (const [key, count] of Object.entries(defaults)) {
        const input = document.getElementById(`furn_${key}`);
        const display = document.getElementById(`qty_${key}`);
        if (input) input.value = count;
        if (display) display.textContent = count;
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
        if (level) state.hobbies[hobby.id] = level;
    });
    Object.keys(FURNITURE_VOLS).forEach(key => {
        const el = document.getElementById(`furn_${key}`);
        if (el) state.furniture[key] = el.value;
    });
    localStorage.setItem('smartStowState_v3', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('smartStowState_v3');
    if (!saved) return false;
    try {
        const state = JSON.parse(saved);
        document.getElementById('homeSize').value = state.homeSize || '3bed';
        document.getElementById('occupants').value = state.occupants || 2;
        document.getElementById('helpers').value = state.helpers || 2;
        const radio = document.querySelector(`input[name="stuffLevel"][value="${state.stuffLevel}"]`);
        if (radio) radio.checked = true;
        if (state.furniture) {
            for (const [key, val] of Object.entries(state.furniture)) {
                const el = document.getElementById(`furn_${key}`);
                const display = document.getElementById(`qty_${key}`);
                if (el) el.value = val;
                if (display) display.textContent = val;
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

// --- Helpers ---

function formatRange(min, max, unit = "") {
    if (Math.round(min) === Math.round(max)) return `${Math.round(max)}${unit}`;
    return `${Math.round(min)} - ${Math.round(max)}${unit}`;
}

function getTruckRec(vol) {
    if (vol <= CONSTANTS.CAPACITY_VAN) return "Cargo Van";
    if (vol <= CONSTANTS.CAPACITY_10FT) return "10' Truck";
    if (vol <= CONSTANTS.CAPACITY_15FT) return "15' Truck";
    if (vol <= CONSTANTS.CAPACITY_20FT) return "20' Truck";
    if (vol <= CONSTANTS.CAPACITY_26FT) return "26' Truck";
    if (vol <= (CONSTANTS.CAPACITY_20FT + CONSTANTS.CAPACITY_TRAILER)) return "20' Truck + Trailer";
    if (vol <= (CONSTANTS.CAPACITY_26FT + CONSTANTS.CAPACITY_TRAILER)) return "26' Truck + Trailer";
    return "26' Truck + Trailer (Tight)";
}

// --- Main Calculation ---

function calculateMove() {
    // 1. Inputs
    const homeSizeKey = document.getElementById('homeSize').value;
    const occupants = parseInt(document.getElementById('occupants').value) || 1;
    const helpers = parseInt(document.getElementById('helpers').value) || 0;
    const stuffLevel = document.querySelector('input[name="stuffLevel"]:checked').value;
    
    // 2. Volume Calculations (Base + Uncertainty)
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
    
    // Total Volume Bounds (Assuming +/- 10% variance on base volume estimations)
    const totalBoxableVol = baseContentsVol + hobbyBoxVol;
    const totalFurnVol = houseFurnVol + hobbyFurnVol;

    // Specialty Supplies
    const numBedrooms = BEDROOM_COUNT[homeSizeKey];
    const rawWardrobe = (occupants * 1.5);
    const wardrobeBoxes = Math.ceil(rawWardrobe * multiplier);
    const vacuumBags = Math.ceil((numBedrooms * 2) + occupants);
    
    const volMin = (totalBoxableVol + totalFurnVol + (3*vacuumBags)) * 0.9 + (16*wardrobeBoxes);
    const volMax = (totalBoxableVol + totalFurnVol + (3*vacuumBags)) * 1.1 + (16*wardrobeBoxes);

    // 3. Truck Sizing (Efficiency Ranges)
    // Low efficiency (0.65) = High Required Space (Upper Bound)
    // High efficiency (0.75) = Low Required Space (Lower Bound)
    const reqTruckSpaceMin = volMin / CONSTANTS.EFFICIENCY_MIN;
    const reqTruckSpaceMax = volMax / CONSTANTS.EFFICIENCY_MAX;
    
    const truckRecMin = getTruckRec(reqTruckSpaceMin);
    const truckRecMax = getTruckRec(reqTruckSpaceMax);
    
    let truckDisplayTop = truckRecMax;
    let truckDisplayBot = null;
    let truckDisplayOr = null;
    if (truckRecMin !== truckRecMax) {
        truckDisplayBot = truckRecMin;
        truckDisplayTop = truckRecMax;
        truckDisplayOr="OR";
    } 

    const truckWarn = reqTruckSpaceMax > CONSTANTS.CAPACITY_26FT ? "Warning: Load may exceed single truck capacity." : "";

    // 4. Box & Item Quantification
    // Box Min = Lower Volume / 3.0
    const boxCountMin = Math.ceil((totalBoxableVol * 0.9) / 3.0);
    const boxCountMax = Math.ceil((totalBoxableVol * 1.1) / 3.0);
    
    // Items: Min = Boxes * 15, Max = Boxes * 22
    const itemCountMin = boxCountMin * CONSTANTS.ITEMS_PER_BOX_MIN;
    const itemCountMax = boxCountMax * CONSTANTS.ITEMS_PER_BOX_MAX;
    

    // 6. Labor Forecasting (Ranges)
    // Packing: Min Time (Fast Speed, Few Boxes) vs Max Time (Slow Speed, Many Boxes)
    
    const packTimeMin = (boxCountMin / CONSTANTS.PACKING_SPEED_MIN) + (wardrobeBoxes / CONSTANTS.PACKING_SPEED_MIN) + (vacuumBags * CONSTANTS.VACUUM_BAG_TIME_MIN / 60);
    const packTimeMax = (boxCountMax / CONSTANTS.PACKING_SPEED_MAX) + (wardrobeBoxes / CONSTANTS.PACKING_SPEED_MAX) + (vacuumBags * CONSTANTS.VACUUM_BAG_TIME_MAX / 60);
    
    // Loading Time (Dependent on helpers)
    const activeHelpers = Math.max(helpers, 1);
    const estHobbyPieces = Math.ceil(hobbyFurnVol / 20); 
    const totalFurnPieces = houseFurnCount + estHobbyPieces;
    
    // Load Time Bounds (Variation in stamina/stairs not modeled, using standard algo)
    const loadTimeMin = (boxCountMin / (12 * activeHelpers)) + ((totalFurnPieces * 0.20) / activeHelpers); // Efficient
    const loadTimeMax = (boxCountMax / (8 * activeHelpers)) + ((totalFurnPieces * 0.30) / activeHelpers);  // Slow
    
    const totalLaborMin = packTimeMin + loadTimeMin;
    const totalLaborMax = packTimeMax + loadTimeMax;
    
    const smartStowTimeMin = (itemCountMin * CONSTANTS.SMARTSTOW_SEC_PER_ITEM) / 3600;
    const smartStowTimeMax = (itemCountMax * CONSTANTS.SMARTSTOW_SEC_PER_ITEM) / 3600;

    // --- Render Results ---
    
    // Box Splits (using Max for supply list safety)
    const smallBoxes = Math.round(boxCountMax * 0.5);
    const medBoxes = Math.round(boxCountMax * 0.3);
    const lgBoxes = boxCountMax - smallBoxes - medBoxes;

    // Render Ranges
    document.getElementById('resTotalItems').textContent = formatRange(itemCountMin, itemCountMax);
    document.getElementById('resBoxCount').textContent = formatRange(boxCountMin, boxCountMax);
    
    // Supply breakdown uses MAX to ensure user buys enough
    document.getElementById('resSmallBoxes').textContent = smallBoxes;
    document.getElementById('resMedBoxes').textContent = medBoxes;
    document.getElementById('resLgBoxes').textContent = lgBoxes;

    const resWardrobe = document.getElementById('resWardrobeBoxes');
    if (resWardrobe) resWardrobe.textContent = wardrobeBoxes;

    const resVacuum = document.getElementById('resVacuumBags');
    if (resVacuum) resVacuum.textContent = vacuumBags;
    
    document.getElementById('resTruckSizeBot').textContent = truckDisplayBot;
    document.getElementById('resTruckSizeTop').textContent = truckDisplayTop;
    document.getElementById('resTruckSizeOR').textContent = truckDisplayOr;
    document.getElementById('resTotalVol').textContent = formatRange(reqTruckSpaceMin, reqTruckSpaceMax);
    document.getElementById('resTotalWeight').textContent = formatRange(reqTruckSpaceMin * 6, reqTruckSpaceMax * 7); // 6-7 lbs density range
    document.getElementById('resTruckWarning').textContent = truckWarn;
    
    document.getElementById('resTotalLabor').textContent = formatRange(totalLaborMin, totalLaborMax, " hrs");
    document.getElementById('resPackTime').textContent = formatRange(packTimeMin, packTimeMax, " hrs");
    document.getElementById('resLoadTime').textContent = formatRange(loadTimeMin, loadTimeMax, " hrs");
    
    // SmartStow savings
    document.getElementById('resSmartStowTime').textContent = formatRange(smartStowTimeMin, smartStowTimeMax);

    // Dynamic messaging
    const pivotMsg = document.getElementById('pivotMessage');
    const recPlan = document.getElementById('resRecPlan');
    
    // Use Max Item Count for Plan Recommendation (Upsell safety)
    if (itemCountMax > 950) {
        pivotMsg.innerHTML = `You have between <strong>${itemCountMin.toLocaleString()} and ${itemCountMax.toLocaleString()} items</strong>.`;
        recPlan.textContent = "Pro ($200)";
    } else if (itemCountMax > 450) {
        pivotMsg.innerHTML = `You have between <strong>${itemCountMin.toLocaleString()} and ${itemCountMax.toLocaleString()} items</strong>.`;
        recPlan.textContent = "Premium ($100)";
    } else {
        pivotMsg.innerHTML = `You have between <strong>${itemCountMin.toLocaleString()} and ${itemCountMax.toLocaleString()} items</strong>.`;
        recPlan.textContent = "Plus ($40)";
    }

    document.getElementById('resultsArea').classList.remove('hidden');
}