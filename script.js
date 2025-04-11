// --- DOM Element References ---
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

// --- Game Data (med distractors) ---
const phraseBuildingTasks = [
    {
        type: "Nomenfrase (determinativ + adjektiv + substantiv)",
        components: [ // Disse skal brukes
            { id: 'w1', word: 'den', role: 'determinativ' },
            { id: 'w2', word: 'røde', role: 'adjektiv' },
            { id: 'w3', word: 'bilen', role: 'substantiv_kjerne' },
        ],
        distractors: [ // Disse skal IKKE brukes
            { id: 'd1', word: 'kjører', role: 'verb' },
            { id: 'd2', word: 'fort', role: 'adverb' },
        ],
        solution: ['determinativ', 'adjektiv', 'substantiv_kjerne']
    },
    {
        type: "Preposisjonsfrase (preposisjon + nomenfrase)",
        components: [
            { id: 'w4', word: 'på', role: 'preposisjon_kjerne' },
            { id: 'w5', word: 'bordet', role: 'nomenfrase_utfylling' }, // Forenklet
        ],
        distractors: [
            { id: 'd3', word: 'under', role: 'preposisjon' }, // Feil preposisjon
            { id: 'd4', word: 'står', role: 'verb' },
        ],
        solution: ['preposisjon_kjerne', 'nomenfrase_utfylling']
    },
    {
        type: "Nomenfrase (substantiv + eieord)",
        components: [
            { id: 'w6', word: 'boka', role: 'substantiv_kjerne' },
            { id: 'w7', word: 'mi', role: 'eieord_etterstilt' },
        ],
        distractors: [
            { id: 'd5', word: 'din', role: 'eieord' }, // Feil eieord
            { id: 'd6', word: 'leser', role: 'verb' },
            { id: 'd7', word: 'er', role: 'verb' },
        ],
        solution: ['substantiv_kjerne', 'eieord_etterstilt']
    },
    {
        type: "Adjektivfrase (gradsadverb + adjektiv)",
        components: [
            { id: 'w8', word: 'svært', role: 'gradsadverb' },
            { id: 'w9', word: 'god', role: 'adjektiv_kjerne' },
        ],
        distractors: [
            { id: 'd8', word: 'litt', role: 'gradsadverb' }, // Alternativt gradsadverb
            { id: 'd9', word: 'snill', role: 'adjektiv' }, // Annet adjektiv
            { id: 'd10', word: 'var', role: 'verb' },
        ],
        solution: ['gradsadverb', 'adjektiv_kjerne']
    },
     {
        type: "Nomenfrase (adjektiv + substantiv)",
        components: [
            { id: 'w10', word: 'gul', role: 'adjektiv' },
            { id: 'w11', word: 'sol', role: 'substantiv_kjerne' },
        ],
        distractors: [
            { id: 'd11', word: 'skinner', role: 'verb' },
            { id: 'd12', word: 'varm', role: 'adjektiv' }, // Ekstra adjektiv
            { id: 'd13', word: 'måne', role: 'substantiv' }, // Feil substantiv
        ],
        solution: ['adjektiv', 'substantiv_kjerne']
    },
    {
        type: "Preposisjonsfrase (preposisjon + determinativ + substantiv)",
        components: [
            { id: 'w12', word: 'til', role: 'preposisjon_kjerne' },
            { id: 'w13', word: 'den', role: 'determinativ' },
            { id: 'w14', word: 'byen', role: 'substantiv_kjerne' },
        ],
         distractors: [
            { id: 'd14', word: 'fra', role: 'preposisjon' },
            { id: 'd15', word: 'lille', role: 'adjektiv' }, // Kunne passet, men ikke bedt om
            { id: 'd16', word: 'reiser', role: 'verb' },
         ],
         solution: ['preposisjon_kjerne', 'determinativ', 'substantiv_kjerne']
    }
];

// --- Game State Variables ---
let currentScore = 0;
let currentTask = null;
let shuffledTasks = [];
let currentTaskIndex = 0;
let draggedElement = null;

// --- Utility Functions ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Drag and Drop Event Handlers ---
// (Disse er uendret fra forrige versjon)
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

// *** NY displayTask FUNKSJON ***
function displayTask(task) {
    currentTask = task;
    targetPhraseTypeDisplay.textContent = task.type;
    feedbackMessage.textContent = '';
    feedbackMessage.className = '';
    checkBtn.disabled = false;
    nextTaskBtn.style.display = 'none';

    wordSource.innerHTML = '';
    dropZone.innerHTML = '';

    // Kombiner riktige komponenter og distraktører
    const allAvailableComponents = [...task.components, ...task.distractors];

    // Bland alle tilgjengelige komponenter
    const componentsToShow = shuffleArray(allAvailableComponents);

    // Lag og legg til draggable elementer i kilden
    componentsToShow.forEach(comp => {
        const wordBlock = document.createElement('div');
        wordBlock.id = comp.id;
        wordBlock.classList.add('word-block', 'draggable');
        wordBlock.draggable = true;
        wordBlock.textContent = comp.word;
        wordBlock.dataset.role = comp.role; // Viktig for validering

        wordBlock.addEventListener('dragstart', handleDragStart);
        wordBlock.addEventListener('dragend', handleDragEnd);

        wordSource.appendChild(wordBlock);
    });
}
// *** SLUTT PÅ NY displayTask FUNKSJON ***

// (checkPhrase er uendret)
function checkPhrase() {
    if (!currentTask) return;

    const droppedBlocks = Array.from(dropZone.children);
    const currentSolutionRoles = droppedBlocks.map(block => block.dataset.role);
    const correctSolutionRoles = currentTask.solution;

    let isCorrect = currentSolutionRoles.length === correctSolutionRoles.length &&
                    currentSolutionRoles.every((role, index) => role === correctSolutionRoles[index]);

    if (isCorrect) {
        currentScore += 10;
        feedbackMessage.textContent = "Korrekt frase bygget!";
        feedbackMessage.className = 'correct';
        checkBtn.disabled = true;
        nextTaskBtn.style.display = 'inline-block';
        droppedBlocks.forEach(block => block.draggable = false);
        const sourceBlocks = Array.from(wordSource.children);
        sourceBlocks.forEach(block => block.draggable = false); // Deaktiver også kilden

    } else {
        feedbackMessage.textContent = "Ikke helt riktig. Sjekk både rekkefølge og hvilke klosser du har brukt. Prøv igjen!";
        feedbackMessage.className = 'incorrect';
         // La blokkene i dropzone være draggable, men ikke de i source?
         // Eller la alt være draggable for å kunne bytte. La oss la alt være draggable.
         droppedBlocks.forEach(block => block.draggable = true);
         const sourceBlocks = Array.from(wordSource.children);
         sourceBlocks.forEach(block => block.draggable = true);

    }

    updateProgressUI();
}

function displayNextTask() {
    currentTaskIndex++;
    if (currentTaskIndex >= shuffledTasks.length) {
        endGame();
    } else {
        updateProgressUI();
        displayTask(shuffledTasks[currentTaskIndex]);
        // Sørg for at blokker er draggable ved ny oppgave (hvis de ble deaktivert)
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

// --- Initial Setup & Event Listeners ---
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
checkBtn.addEventListener('click', checkPhrase);
nextTaskBtn.addEventListener('click', displayNextTask);

dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);

// Skjul spillområdet før start
gameArea.style.display = 'none';
gameOverScreen.style.display = 'none';