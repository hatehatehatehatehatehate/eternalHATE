import { getTestSymbols } from './modules/data.js';
import { createElement, clearElement } from './modules/dom.js';

const testArea = document.getElementById("testArea");
const startButton = document.getElementById("startButton");
const timeRemaining = document.getElementById("timeRemaining");
const correctAnswersElement = document.getElementById("correctAnswers");
const incorrectAnswersElement = document.getElementById("incorrectAnswers");
const feedbackForm = document.getElementById("feedbackForm");

const correctSound = document.getElementById("correctSound");
const incorrectSound = document.getElementById("incorrectSound");
const results = document.getElementById("results");
const finalCorrectAnswers = document.getElementById("finalCorrectAnswers");
const finalIncorrectAnswers = document.getElementById("finalIncorrectAnswers");
const restartButton = document.getElementById("restartButton");

let testDuration = 300; // Test duration in seconds (e.g., 5 minutes)
let timer;
let correctAnswers = 0;
let incorrectAnswers = 0;
let testEnded = false;
let remainingD2;

function generateTestSymbols() {
    const { testSymbols, remainingD2: remaining } = getTestSymbols();
    remainingD2 = remaining;

    clearElement(testArea);

    testSymbols.forEach(rowSymbols => {
        const rowDiv = createElement('div', { style: { display: 'flex' } });

        rowSymbols.forEach(({ symbol, color }) => {
            const symbolElement = createElement('span', {
                classList: 'testSymbol',
                textContent: symbol,
                style: { backgroundColor: color },
                listeners: [{ event: 'click', handler: handleSymbolClick }],
            });

            rowDiv.appendChild(symbolElement);
        });

        testArea.appendChild(rowDiv);
    });
}

function handleSymbolClick(e) {
    if (testDuration > 0) {
        const symbol = e.target;
        if (symbol.textContent === "d2") {
            symbol.style.backgroundColor = "green";
            correctAnswers++;
            correctSound.play();
            remainingD2--;
            if (remainingD2 === 0) {
                testDuration = 0;
                disableTestSymbols();
                alert("Тест окончен!");
            }
        } else {
            symbol.style.backgroundColor = "red";
            symbol.classList.add("incorrect");
            incorrectAnswers++;
            incorrectSound.play();
        }
        correctAnswersElement.textContent = correctAnswers;
        incorrectAnswersElement.textContent = incorrectAnswers;
        symbol.removeEventListener("click", handleSymbolClick);
    }
}

function startTimer() {
    if (testDuration > 0) {
        testDuration--;
        const minutes = Math.floor(testDuration / 60);
        const seconds = testDuration % 60;
        timeRemaining.textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
        setTimeout(startTimer, 1000);
    } else if (!testEnded) {
        testEnded = true;
        disableTestSymbols();
    }
}

function disableTestSymbols() {
    const testSymbols = document.querySelectorAll(".testSymbol");
    testSymbols.forEach((symbol) => {
        symbol.removeEventListener("click", handleSymbolClick);
        symbol.style.cursor = "default";
    });
    showResults();
    startButton.style.display = "none";
    restartButton.style.display = "inline-block";
}

function saveResults() {
    const resultsString = `Правильные ответы: ${correctAnswers}\nНеправильные ответы: ${incorrectAnswers}`;
    const blob = new Blob([resultsString], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'D2_test_results.txt';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function showResults() {
    timeRemaining.parentElement.style.display = 'none';
    correctAnswersElement.parentElement.style.display = 'none';
    incorrectAnswersElement.parentElement.style.display = 'none';

    results.style.display = 'block';
    finalCorrectAnswers.textContent = correctAnswers;
    finalIncorrectAnswers.textContent = incorrectAnswers;

    clearElement(results); // Очищаем блок с результатами перед добавлением кнопки

    const saveResultsButton = createElement('button', {
        textContent: 'Сохранить результаты',
        listeners: [{ event: 'click', handler: saveResults }],
    });

    results.appendChild(saveResultsButton);
    startButton.style.display = "none";
    restartButton.style.display = "block";
}

function resetTest() {
    testArea.innerHTML = "";
    generateTestSymbols();
    correctAnswers = 0;
    incorrectAnswers = 0;
    testEnded = false;
    correctAnswersElement.textContent = correctAnswers;
    incorrectAnswersElement.textContent = incorrectAnswers;
    testDuration = 300;
    timeRemaining.textContent = "05:00";
    startButton.textContent = "Start";
    results.style.display = "none";
    timeRemaining.parentElement.style.display = 'block';
    correctAnswersElement.parentElement.style.display = 'block';
    incorrectAnswersElement.parentElement.style.display = 'block';
    startButton.style.display = "inline-block";
    restartButton.style.display = "none";
}

startButton.addEventListener("click", () => {
    if (testEnded) {
        resetTest();
    } else {
        testArea.innerHTML = "";
        generateTestSymbols();
        correctAnswers = 0;
        incorrectAnswers = 0;
        correctAnswersElement.textContent = correctAnswers;
        incorrectAnswersElement.textContent = incorrectAnswers;
        testDuration = 300;
        timeRemaining.textContent = "05:00";
        startTimer();
    }
});

restartButton.addEventListener("click", () => {
    if (testEnded) {
        resetTest();
        startTest()
    } else {
        resetTest();
        startTest()
        startButton.click();
    }
});

feedbackForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const feedbackText = document.getElementById("feedbackText");
    const feedback = feedbackText.value.trim();
    if (feedback) {
        alert("Спасибо за ваше сообщение!");
        feedbackText.value = "";
    } else {
        alert("Пожалуйста, напишите ваше сообщение.");
    }
});

generateTestSymbols();