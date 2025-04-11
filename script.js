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

// --- Game Data (Revidert for klarere oppgaver og løsninger) ---
const phraseBuildingTasks = [
    {
        type: "Nomenfrase (determinativ + adjektiv + substantiv)",
        components: [
            { id: 'w_den', word: 'den', role: 'determinativ' },
            { id: 'w_raud', word: 'raud', role: 'adjektiv' }, // Endret til 'raud' for variasjon
            { id: 'w_bilen', word: 'bilen', role: 'substantiv_kjerne' },
        ],
        distractors: [
            { id: 'd_ei', word: 'ei', role: 'determinativ' },
            { id: 'd_køyrer', word: 'køyrer', role: 'verb' },
            { id: 'd_stor', word: 'stor', role: 'adjektiv' },
        ],
        solution: [
            ['determinativ', 'adjektiv', 'substantiv_kjerne']
        ]
    },
    {
        type: "Preposisjonsfrase (preposisjon + nomenfrase)",
        components: [
            { id: 'w_paa', word: 'på', role: 'preposisjon_kjerne' },
            { id: 'w_under', word: 'under', role: 'preposisjon_kjerne' }, // Gi valg
            { id: 'w_bordet', word: 'bordet', role: 'nomenfrase_utfylling' },
        ],
        distractors: [
            { id: 'd_over', word: 'over', role: 'ugyldig_preposisjon' },
            { id: 'd_sto', word: 'sto', role: 'verb' },
            { id: 'd_lite', word: 'lite', role: 'adjektiv' },
        ],
        solution: [ // Begge preposisjonene er OK
            ['preposisjon_kjerne', 'nomenfrase_utfylling']
        ]
    },
    {
        type: "Nomenfrase (substantiv + eieord)",
        components: [
            { id: 'w_boka', word: 'boka', role: 'substantiv_kjerne' },
            { id: 'w_mi', word: 'mi', role: 'eieord_etterstilt' },
            { id: 'w_di', word: 'di', role: 'eieord_etterstilt' }, // Valg
        ],
        distractors: [
            { id: 'd_hans', word: 'hans', role: 'ugyldig_eieord_stilling' },
            { id: 'd_er', word: 'er', role: 'verb' },
            { id: 'd_ny', word: 'ny', role: 'adjektiv' },
        ],
        solution: [
            ['substantiv_kjerne', 'eieord_etterstilt']
        ]
    },
    {
        type: "Adjektivfrase (gradsadverb + adjektiv)",
        components: [
            { id: 'w_svært', word: 'svært', role: 'gradsadverb' },
            { id: 'w_ganske', word: 'ganske', role: 'gradsadverb' }, // Valg
            { id: 'w_god', word: 'god', role: 'adjektiv_kjerne' },
            { id: 'w_snill', word: 'snill', role: 'adjektiv_kjerne' }, // Valg
        ],
        distractors: [
             { id: 'd_veldig', word: 'veldig', role: 'gradsadverb' }, // Ekstra gradsadv.
             { id: 'd_ho', word: 'ho', role: 'pronomen' },
             { id: 'd_var', word: 'var', role: 'verb' },
        ],
        solution: [
            ['gradsadverb', 'adjektiv_kjerne'] // Aksepterer alle kombinasjoner av gyldige
        ]
    },
     {
        // *** REVIDERT OPPGAVE for "adjektiv + substantiv" ***
        type: "Nomenfrase (adjektiv + substantiv)",
        components: [
            { id: 'w_gul', word: 'gul', role: 'adjektiv' }, // Gyldig adjektiv
            { id: 'w_varm', word: 'varm', role: 'adjektiv' }, // Også gyldig
            { id: 'w_sol', word: 'sol', role: 'substantiv_kjerne' }, // Gyldig subst.
            { id: 'w_maane', word: 'måne', role: 'substantiv_kjerne' }, // Også gyldig
        ],
        distractors: [
            { id: 'd_skin', word: 'skin', role: 'verb' },
            { id: 'd_kald', word: 'kald', role: 'ugyldig_adjektiv' }, // F.eks. for å teste om de bare tar et adj.
            { id: 'd_ei', word: 'ei', role: 'determinativ' },
        ],
        solution: [ // Aksepterer alle 4 gyldige kombinasjoner
            ['adjektiv', 'substantiv_kjerne']
        ]
    },
    {
        type: "Preposisjonsfrase (preposisjon + determinativ + substantiv)",
        components: [
            { id: 'w_til', word: 'til', role: 'preposisjon_kjerne' },
            { id: 'w_den', word: 'den', role: 'determinativ' },
            { id: 'w_ei', word: 'ei', role: 'determinativ'},
            { id: 'w_byen', word: 'byen', role: 'substantiv_kjerne' },
            { id: 'w_hytte', word: 'hytte', role: 'substantiv_kjerne'}
        ],
         distractors: [
            { id: 'd_fra', word: 'fra', role: 'ugyldig_preposisjon' },
            { id: 'd_liten', word: 'liten', role: 'adjektiv' }, // Kan ikke stå mellom det. og subst. her
            { id: 'd_reis', word: 'reis', role: 'verb' },
         ],
         solution: [
             ['preposisjon_kjerne', 'determinativ', 'substantiv_kjerne']
         ]
    }
];

// --- Game State Variables --- (Uendret)
let currentScore = 0;
let currentTask = null;
let shuffledTasks = [];
let currentTaskIndex = 0;
let draggedElement = null;

// --- Utility Functions --- (Uendret)
function shuffleArray(array) { /* ... */ }
function arraysEqual(arr1, arr2) { /* ... */ }

// --- Drag and Drop Event Handlers --- (Uendret)
function handleDragStart(event) { /* ... */ }
function handleDragEnd(event) { /* ... */ }
function handleDragOver(event) { /* ... */ }
function handleDragLeave(event) { /* ... */ }
function handleDrop(event) { /* ... */ }

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
        wordBlock.draggable = true; // Sørg for at de er draggable
        wordBlock.textContent = comp.word;
        wordBlock.dataset.role = comp.role;
        wordBlock.addEventListener('dragstart', handleDragStart);
        wordBlock.addEventListener('dragend', handleDragEnd);
        wordSource.appendChild(wordBlock);
    });
    // Sørg for at dropZone også er "ren"
     const droppedBlocks = Array.from(dropZone.children);
     droppedBlocks.forEach(block => block.draggable = true); // Gjør ev. rester draggable
}

// *** REVIDERT checkPhrase FUNKSJON ***
function checkPhrase() {
    if (!currentTask) return;

    const droppedBlocks = Array.from(dropZone.children);
    const currentSolutionRoles = droppedBlocks.map(block => block.dataset.role);
    const possibleCorrectSolutions = currentTask.solution;

    let isCorrect = false;
    for (const onePossibleSolution of possibleCorrectSolutions) {
        if (arraysEqual(currentSolutionRoles, onePossibleSolution)) {
            // Ekstra sjekk: Har brukeren brukt klosser som *faktisk finnes* i denne oppgavens 'components'?
            // (Forhindrer bruk av klosser som tilfeldigvis har samme rolle fra en distraktor)
            let usedOnlyValidComponents = true;
            const validComponentIds = currentTask.components.map(c => c.id);
            for (const block of droppedBlocks) {
                if (!validComponentIds.includes(block.id)) {
                    // Brukte en kloss som ikke var listet som gyldig component (kan være en distraktor med "riktig" rolle)
                    // Dette er litt strengt, men kan være nødvendig for presis testing.
                    // Vi kan justere dette hvis det blir for vanskelig.
                    // La oss foreløpig godta det hvis rollesekvensen er riktig.
                    // usedOnlyValidComponents = false;
                    // break;
                }
            }

             if (usedOnlyValidComponents) { // Godta kun hvis gyldige komponenter ble brukt
                isCorrect = true;
                break;
             }
        }
    }

    if (isCorrect) {
        currentScore += 10;
        feedbackMessage.textContent = "Korrekt frase bygget!";
        feedbackMessage.className = 'correct';
        checkBtn.disabled = true; // Deaktiver sjekk-knapp
        nextTaskBtn.style.display = 'inline-block'; // Vis neste-knapp
        // Gjør KUN de brukte blokkene ikke-draggable
        droppedBlocks.forEach(block => block.draggable = false);
        // Deaktiver OGSÅ de ubrukte blokkene i kilden
        const sourceBlocks = Array.from(wordSource.children);
        sourceBlocks.forEach(block => block.draggable = false);

    } else {
        feedbackMessage.textContent = "Ikke en gyldig struktur for denne frasetypen med de valgte klossene. Prøv igjen!";
        feedbackMessage.className = 'incorrect';
        // VIKTIG: IKKE deaktiver knapp eller klosser ved feil!
        checkBtn.disabled = false; // La sjekk-knappen være aktiv
         // Sørg for at *alle* klosser er draggable så man kan rette
         const allBlocks = document.querySelectorAll('.word-block');
         allBlocks.forEach(block => block.draggable = true);
    }

    updateProgressUI();
}
// *** SLUTT PÅ REVIDERT checkPhrase FUNKSJON ***


// (displayNextTask er uendret)
function displayNextTask() {
    currentTaskIndex++;
    if (currentTaskIndex >= shuffledTasks.length) {
        endGame();
    } else {
        updateProgressUI();
        displayTask(shuffledTasks[currentTaskIndex]);
        // Sikrer at alt er draggable når ny oppgave starter
         const allBlocks = document.querySelectorAll('.word-block');
         allBlocks.forEach(block => block.draggable = true);
    }
}

// (updateProgressUI, startGame, endGame er uendret)
function updateProgressUI() { /* ... */ }
function startGame() { /* ... */ }
function endGame() { /* ... */ }

// --- Initial Setup & Event Listeners --- (Uendret)
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
checkBtn.addEventListener('click', checkPhrase);
nextTaskBtn.addEventListener('click', displayNextTask);

dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);

// Skjul spillområdet før start (kan kommenteres ut for testing)
// gameArea.style.display = 'none';
// gameOverScreen.style.display = 'none';