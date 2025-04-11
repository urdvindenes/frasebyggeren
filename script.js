// --- DOM Element References --- (Uendret)
const targetPhraseTypeDisplay = document.getElementById('target-phrase-type');
const wordSource = document.getElementById('word-source');
const dropZone = document.getElementById('drop-zone');
const checkBtn = document.getElementById('check-btn');
const nextTaskBtn = document.getElementById('next-task-btn');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const currentTaskNumberDisplay = document.getElementById('current-task-number');
const totalTasksDisplay = document.getElementById('total-tasks');
const feedbackMessage = document.getElementById('feedback-message');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const gameArea = document.getElementById('game-area');
const instructionDisplay = document.getElementById('instruction');

// --- Game Data (med distractors OG solution som array av arrays) ---
const phraseBuildingTasks = [
    {
        type: "Nomenfrase (determinativ + adjektiv + substantiv)",
        components: [
            { id: 'w1', word: 'den', role: 'determinativ' },
            { id: 'w2', word: 'røde', role: 'adjektiv' },
            { id: 'w3', word: 'bilen', role: 'substantiv_kjerne' },
        ],
        distractors: [
            { id: 'd1', word: 'kjører', role: 'verb' },
            { id: 'd2', word: 'fort', role: 'adverb' },
        ],
        solution: [ // Liste med én gyldig løsning
            ['determinativ', 'adjektiv', 'substantiv_kjerne']
        ]
    },
    {
        // *** EKSEMPEL MED FLERE GYLDIGE PREPOSISJONER ***
        type: "Preposisjonsfrase (velg preposisjon + nomenfrase)",
        components: [
            { id: 'w_til', word: 'til', role: 'preposisjon_kjerne' }, // Gyldig
            { id: 'w_fra', word: 'fra', role: 'preposisjon_kjerne' }, // Også gyldig
            { id: 'w_huset', word: 'huset', role: 'nomenfrase_utfylling' },
        ],
        distractors: [
            { id: 'd_under', word: 'under', role: 'ugyldig_preposisjon' }, // Ugyldig
            { id: 'd_løp', word: 'løp', role: 'verb' },
        ],
        solution: [ // Begge preposisjonene gir samme *rolle*-sekvens
            ['preposisjon_kjerne', 'nomenfrase_utfylling']
        ]
        // MERK: Siden både 'til' og 'fra' har *samme rolle*,
        // trenger vi strengt tatt bare én løsningssekvens her.
        // Men strukturen støtter nå flere hvis rollene var ulike.
    },
    {
        type: "Nomenfrase (substantiv + eieord)",
        components: [
            { id: 'w6', word: 'boka', role: 'substantiv_kjerne' },
            { id: 'w7', word: 'mi', role: 'eieord_etterstilt' },
            { id: 'w_di', word: 'di', role: 'eieord_etterstilt' }, // Alternativt eieord
        ],
        distractors: [
            { id: 'd6', word: 'leser', role: 'verb' },
            { id: 'd7', word: 'er', role: 'verb' },
        ],
        solution: [
            ['substantiv_kjerne', 'eieord_etterstilt'] // Begge eieordene gir samme rollesekvens
        ]
    },
    {
        type: "Adjektivfrase (gradsadverb + adjektiv)",
        components: [
            { id: 'w8', word: 'svært', role: 'gradsadverb' },
            { id: 'w_ganske', word: 'ganske', role: 'gradsadverb' }, // Alternativt gradsadverb
            { id: 'w9', word: 'god', role: 'adjektiv_kjerne' },
        ],
        distractors: [
            { id: 'd9', word: 'snill', role: 'annet_adjektiv' },
            { id: 'd10', word: 'var', role: 'verb' },
        ],
        solution: [
            ['gradsadverb', 'adjektiv_kjerne']
        ]
    },
    {
       // *** EKSEMPEL MED FLERE GYLDIGE STRUKTURER ***
       type: "Nomenfrase (substantiv, valgfritt adjektiv foran)",
       components: [
           { id: 'w_stor', word: 'stor', role: 'adjektiv_foranstilt' },
           { id: 'w_hund', word: 'hund', role: 'substantiv_kjerne' },
       ],
       distractors: [
           { id: 'd_bjeffer', word: 'bjeffer', role: 'verb' },
           { id: 'd_liten', word: 'liten', role: 'adjektiv_foranstilt' }, // Ekstra adjektiv
       ],
       solution: [ // To mulige gyldige strukturer/sekvenser
           ['adjektiv_foranstilt', 'substantiv_kjerne'], // "stor hund" / "liten hund"
           ['substantiv_kjerne']             // "hund" (hvis man dropper adjektivet)
       ]
   },
    {
        type: "Preposisjonsfrase (preposisjon + determinativ + substantiv)",
        components: [
            { id: 'w12', word: 'til', role: 'preposisjon_kjerne' },
            { id: 'w13', word: 'den', role: 'determinativ' },
            { id: 'w_ei', word: 'ei', role: 'determinativ'}, // Alternativ
            { id: 'w14', word: 'byen', role: 'substantiv_kjerne' },
            { id: 'w_hytte', word: 'hytte', role: 'substantiv_kjerne'} // Alternativ
        ],
         distractors: [
            { id: 'd14', word: 'fra', role: 'ugyldig_preposisjon' },
            { id: 'd15', word: 'lille', role: 'adjektiv' },
            { id: 'd16', word: 'reiser', role: 'verb' },
         ],
         solution: [ // Alle disse kombinasjonene gir samme rollesekvens
             ['preposisjon_kjerne', 'determinativ', 'substantiv_kjerne']
         ]
         // MERK: Hvis 'ei hytte' skulle hatt en annen *rolle*-struktur
         // enn 'den byen', måtte vi lagt til en ny løsningsliste.
    }
];


// --- Game State Variables --- (Uendret)
let currentScore = 0;
let currentTask = null;
let shuffledTasks = [];
let currentTaskIndex = 0;
let draggedElement = null;

// --- Utility Functions --- (Uendret)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// *** NY HJELPEFUNKSJON for å sammenligne arrays ***
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}
// *** SLUTT PÅ NY HJELPEFUNKSJON ***

// --- Drag and Drop Event Handlers --- (Uendret)
function handleDragStart(event) {
    draggedElement = event.target;
    event.dataTransfer.setData('text/plain', event.target.id);
    event.target.classList.add('dragging');
}

function handleDragEnd(event) {
    if (draggedElement) {
       draggedElement.classList.remove('dragging');
    }
    draggedElement = null;
    dropZone.classList.remove('drag-over');
}

function handleDragOver(event) {
    event.preventDefault();
     if (event.target === dropZone || dropZone.contains(event.target)) {
        dropZone.classList.add('drag-over');
     }
}

function handleDragLeave(event) {
     if (event.target === dropZone || !dropZone.contains(event.relatedTarget)) {
        dropZone.classList.remove('drag-over');
     }
}

function handleDrop(event) {
    event.preventDefault();
    dropZone.classList.remove('drag-over');
    if (!draggedElement) return;
    let targetDropZone = (event.target.id === 'drop-zone') ? event.target : event.target.closest('#drop-zone');
    if (targetDropZone) {
        const dropZoneRect = targetDropZone.getBoundingClientRect();
        const offsetX = event.clientX - dropZoneRect.left;
        let insertBeforeElement = null;
        const children = Array.from(targetDropZone.children);
        for(const child of children) {
            if (child === draggedElement) continue;
            const childRect = child.getBoundingClientRect();
            const childCenterX = childRect.left + childRect.width / 2 - dropZoneRect.left;
             if (offsetX < childCenterX) {
                insertBeforeElement = child;
                break;
             }
        }
        if(insertBeforeElement) {
             targetDropZone.insertBefore(draggedElement, insertBeforeElement);
        } else {
             targetDropZone.appendChild(draggedElement);
        }
    }
    draggedElement = null;
}


// --- Game Logic Functions ---

// (displayTask er uendret fra forrige versjon med distraktører)
function displayTask(task) {
    currentTask = task;
    targetPhraseTypeDisplay.textContent = task.type;
    feedbackMessage.textContent = '';
    feedbackMessage.className = '';
    checkBtn.disabled = false;
    nextTaskBtn.style.display = 'none';
    wordSource.innerHTML = '';
    dropZone.innerHTML = '';
    const allAvailableComponents = [...task.components, ...task.distractors];
    const componentsToShow = shuffleArray(allAvailableComponents);
    componentsToShow.forEach(comp => {
        const wordBlock = document.createElement('div');
        wordBlock.id = comp.id;
        wordBlock.classList.add('word-block', 'draggable');
        wordBlock.draggable = true;
        wordBlock.textContent = comp.word;
        wordBlock.dataset.role = comp.role;
        wordBlock.addEventListener('dragstart', handleDragStart);
        wordBlock.addEventListener('dragend', handleDragEnd);
        wordSource.appendChild(wordBlock);
    });
}

// *** OPPDATERT checkPhrase FUNKSJON ***
function checkPhrase() {
    if (!currentTask) return;

    const droppedBlocks = Array.from(dropZone.children);
    const currentSolutionRoles = droppedBlocks.map(block => block.dataset.role);
    const possibleCorrectSolutions = currentTask.solution; // Henter listen av lister

    let isCorrect = false; // Start med antagelsen om at det er feil

    // Gå gjennom hver mulige korrekte løsning
    for (const onePossibleSolution of possibleCorrectSolutions) {
        // Bruk hjelpefunksjonen til å sammenligne brukerens løsning med denne mulige løsningen
        if (arraysEqual(currentSolutionRoles, onePossibleSolution)) {
            isCorrect = true; // Fant et treff!
            break; // Trenger ikke sjekke flere mulige løsninger
        }
    }

    // Resten av logikken er den samme som før, basert på om isCorrect ble true eller false
    if (isCorrect) {
        currentScore += 10;
        feedbackMessage.textContent = "Korrekt frase bygget!";
        feedbackMessage.className = 'correct';
        checkBtn.disabled = true;
        nextTaskBtn.style.display = 'inline-block';
        droppedBlocks.forEach(block => block.draggable = false);
        const sourceBlocks = Array.from(wordSource.children);
        sourceBlocks.forEach(block => block.draggable = false);

    } else {
        feedbackMessage.textContent = "Ikke en gyldig struktur for denne frasetypen med de valgte klossene. Prøv igjen!";
        feedbackMessage.className = 'incorrect';
         droppedBlocks.forEach(block => block.draggable = true);
         const sourceBlocks = Array.from(wordSource.children);
         sourceBlocks.forEach(block => block.draggable = true);
    }

    updateProgressUI();
}
// *** SLUTT PÅ OPPDATERT checkPhrase FUNKSJON ***


// (displayNextTask, updateProgressUI, startGame, endGame er uendret)
function displayNextTask() {
    currentTaskIndex++;
    if (currentTaskIndex >= shuffledTasks.length) {
        endGame();
    } else {
        updateProgressUI();
        displayTask(shuffledTasks[currentTaskIndex]);
        const allBlocks = document.querySelectorAll('.word-block');
        allBlocks.forEach(block => block.draggable = true);
    }
}

function updateProgressUI() {
    scoreDisplay.textContent = currentScore;
    currentTaskNumberDisplay.textContent = currentTaskIndex + 1;
}

function startGame() {
    currentScore = 0;
    currentTaskIndex = -1;
    shuffledTasks = shuffleArray([...phraseBuildingTasks]);
    totalTasksDisplay.textContent = shuffledTasks.length;
    updateProgressUI();
    feedbackMessage.textContent = '';
    feedbackMessage.className = '';
    gameOverScreen.style.display = 'none';
    gameArea.style.display = 'block';
    startBtn.style.display = 'none';
    displayNextTask();
}

function endGame() {
    gameArea.style.display = 'none';
    finalScoreDisplay.textContent = currentScore;
    gameOverScreen.style.display = 'block';
}

// --- Initial Setup & Event Listeners --- (Uendret)
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
checkBtn.addEventListener('click', checkPhrase);
nextTaskBtn.addEventListener('click', displayNextTask);

dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);

// Skjul spillområdet før start
// gameArea.style.display = 'none'; // Kommenter ut for enklere testing under utvikling
// gameOverScreen.style.display = 'none';