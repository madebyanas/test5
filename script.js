// Variables globales
let questions = [];
let currentQuestionIndex = 0;
let selectedLanguage = '';
let userAnswers = [];
let competencyScores = {
    grammar: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 }
};
let levelScores = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
    C2: { correct: 0, total: 0 }
};

let timerInterval;
let timerSeconds = 0;
let timerMinutes = 0;

let screens;
let languageBtns;
let startTestBtn;
let questionText;
let optionsContainer;
let currentQuestionEl;
let totalQuestionsEl;
let competencyBadge;
let contactForm;
let restartTestBtn;
let menuToggle;
let navLinks;
let startBtn;
let quizNavbar;
let quizTimer;

document.addEventListener('DOMContentLoaded', () => {
    screens = document.querySelectorAll('.screen');
    languageBtns = document.querySelectorAll('.language-btn');
    startTestBtn = document.getElementById('start-test');
    questionText = document.getElementById('question-text');
    optionsContainer = document.getElementById('options');
    currentQuestionEl = document.getElementById('current-question');
    totalQuestionsEl = document.getElementById('total-questions');
    competencyBadge = document.getElementById('current-competency');
    contactForm = document.getElementById('contact-form');
    restartTestBtn = document.getElementById('restart-test');
    menuToggle = document.querySelector('.menu-toggle');
    navLinks = document.querySelector('.nav-links');
    startBtn = document.querySelector('.start-btn');
    quizNavbar = document.getElementById('quiz-navbar');
    quizTimer = document.getElementById('quiz-timer');

    languageBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            selectedLanguage = btn.getAttribute('data-lang');
            await fetchQuestions();
            startQuiz();
            updateUILanguage(selectedLanguage);
        });
    });

    startBtn.addEventListener('click', () => {
        showScreen('language-selection');
    });

    contactForm.addEventListener('submit', handleFormSubmit);

    restartTestBtn.addEventListener('click', restartQuiz);
});

async function fetchQuestions() {
    let jsonFile = 'english_level_test.json';
    if (selectedLanguage) {
        const languageFiles = {
            'en': 'english_level_test.json',
            'fr': 'french_level_test.json',
            'es': 'spanish_level_test.json',
            'de': 'german_level_test.json'
        };
        jsonFile = languageFiles[selectedLanguage] || jsonFile;
    }

    const response = await fetch(jsonFile);
    const data = await response.json();
    questions = data.questions;
    totalQuestionsEl.textContent = questions.length;
}

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    quizNavbar.style.display = screenId === 'quiz' ? 'flex' : 'none';

    if (screenId === 'language-selection') {
        startBtn.textContent = 'Commencez le test';
    }
}

function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    resetScores();
    showScreen('quiz');
    loadQuestion();
    startBtn.textContent = 'Recommencer le Test';
    startTimer();
}

function loadQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.textContent = question.question;
    currentQuestionEl.textContent = currentQuestionIndex + 1;

    document.documentElement.style.setProperty('--current-question', currentQuestionIndex + 1);
    document.documentElement.style.setProperty('--total-questions', questions.length);

    updateCompetencyBadge(question.competency);

    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(index, question.answer));
        optionsContainer.appendChild(optionElement);
    });
}

function resetScores() {
    competencyScores = {
        grammar: { correct: 0, total: 0 },
        vocabulary: { correct: 0, total: 0 },
        reading: { correct: 0, total: 0 }
    };

    levelScores = {
        A1: { correct: 0, total: 0 },
        A2: { correct: 0, total: 0 },
        B1: { correct: 0, total: 0 },
        B2: { correct: 0, total: 0 },
        C1: { correct: 0, total: 0 },
        C2: { correct: 0, total: 0 }
    };
}

function updateCompetencyBadge(competency) {
    competencyBadge.textContent = competency.charAt(0).toUpperCase() + competency.slice(1);
}

function selectOption(optionIndex, correctAnswer) {
    if (userAnswers.length > currentQuestionIndex) return;

    const options = document.querySelectorAll('.option');
    const selectedOption = options[optionIndex];
    const question = questions[currentQuestionIndex];
    const isCorrect = question.options[optionIndex] === correctAnswer;

    userAnswers.push({
        questionId: question.id,
        selectedOption: question.options[optionIndex],
        isCorrect: isCorrect,
        competency: question.competency,
        level: question.level
    });

    updateScores(isCorrect, question.competency, question.level);

    options.forEach(option => {
        option.classList.remove('selected');
        option.style.pointerEvents = 'none';
    });

    selectedOption.classList.add('selected');
    selectedOption.style.backgroundColor = '#4a7bff';
    selectedOption.style.color = 'white';

    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            showScreen('user-form');
        }
    }, 1000);
}

function updateScores(isCorrect, competency, level) {
    competencyScores[competency].total++;
    if (isCorrect) competencyScores[competency].correct++;

    levelScores[level].total++;
    if (isCorrect) levelScores[level].correct++;
}

function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    const phoneRegex = /^(\+\d{1,3}\s?)?(\d{2}\s?){5}|(\+\d{1,3}\s?)?\d{10}$/;
    if (!phoneRegex.test(phone)) {
        alert('Veuillez entrer un numéro de téléphone valide.');
        return;
    }

    const finalScores = calculateFinalScores();

    showFormIframe(name, phone, finalScores);

    showScreen('results');
    setTimeout(() => {
        showPopup('school-popup');
    }, 1500);
}

function calculateFinalScores() {
    const grammarPercentage = Math.round((competencyScores.grammar.correct / competencyScores.grammar.total) * 100) || 0;
    const vocabularyPercentage = Math.round((competencyScores.vocabulary.correct / competencyScores.vocabulary.total) * 100) || 0;
    const readingPercentage = Math.round((competencyScores.reading.correct / competencyScores.reading.total) * 100) || 0;

    const levelPercentages = {};
    for (const level in levelScores) {
        levelPercentages[level] = Math.round((levelScores[level].correct / levelScores[level].total) * 100) || 0;
    }

    const overallLevel = determineOverallLevel(levelPercentages);

    return {
        competencies: {
            grammar: grammarPercentage,
            vocabulary: vocabularyPercentage,
            reading: readingPercentage
        },
        levels: levelPercentages,
        overallLevel: overallLevel
    };
}

function determineOverallLevel(levelPercentages) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let highestLevel = '';

    for (let i = 0; i < levels.length; i++) {
        const currentLevel = levels[i];
        const currentPercentage = levelPercentages[currentLevel];

        if (currentPercentage >= 60) {
            let allPreviousLevelsPassed = true;
            for (let j = 0; j < i; j++) {
                if (levelPercentages[levels[j]] < 60) {
                    allPreviousLevelsPassed = false;
                    break;
                }
            }

            if (allPreviousLevelsPassed) {
                highestLevel = currentLevel;
            } else {
                break;
            }
        } else {
            break;
        }
    }

    return highestLevel || 'A1';
}

function showFormIframe(name, phone, scores) {
    const params = new URLSearchParams({
        name: name,
        phone: phone,
        overallLevel: scores.overallLevel,
        grammar: scores.competencies.grammar,
        vocabulary: scores.competencies.vocabulary,
        reading: scores.competencies.reading,
        language: selectedLanguage,
        timestamp: new Date().toISOString()
    });

    const formURL = `https://script.google.com/macros/s/AKfycbwyAJItl6FqXkE6bFX-ZU0zmj0vIgU4kZCsYgDY8f4WmKji-7DLermEATt8lM_C2P8_/exec?${params.toString()}`;

    const iframe = document.createElement('iframe');
    iframe.src = formURL;
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);
}

function updateUILanguage(lang) {
    console.log(`Langue sélectionnée: ${lang}`);
}

function startTimer() {
    stopTimer();
    timerSeconds = 0;
    timerMinutes = 0;
    updateTimerDisplay();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timerSeconds++;
    if (timerSeconds >= 60) {
        timerSeconds = 0;
        timerMinutes++;
    }
    updateTimerDisplay();
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const formattedMinutes = timerMinutes.toString().padStart(2, '0');
    const formattedSeconds = timerSeconds.toString().padStart(2, '0');
    quizTimer.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.add('active');

    const closeBtn = popup.querySelector('.close-popup');
    closeBtn.addEventListener('click', () => closePopup(popupId));

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closePopup(popupId);
        }
    });
}

function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('active');
}
