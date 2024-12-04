let timeLeft = 60; // Timer for the quiz
let timerId;
let score = 0;
let pin = "";
let currentQuestionIndex = 0;

// Simulate database for results
let results = [];

// Simulate teacher credentials
const teacherCredentials = {
    username: "teacher",
    password: "password123"
};

// Array of quiz questions
const questions = [
    {
        question: "Which component is considered the brain of a computer?",
        options: ["Hard Disk", "CPU", "RAM", "Power Supply"],
        correctIndex: 1
    },
    {
        question: "What does HTTP stand for?",
        options: [
            "HyperText Transfer Protocol",
            "HyperText Transmission Protocol",
            "HyperText Transfer Process",
            "High Transmission Text Protocol"
        ],
        correctIndex: 0
    },
    {
        question: "Which programming language is primarily used for web development?",
        options: ["Python", "C", "JavaScript", "Java"],
        correctIndex: 2
    },
    {
        question: "Which device is used to connect multiple computers in a network?",
        options: ["Router", "Monitor", "CPU", "Keyboard"],
        correctIndex: 0
    },
    {
        question: "Which of these is an example of system software?",
        options: ["MS Word", "Windows OS", "Chrome Browser", "Photoshop"],
        correctIndex: 1
    }
];

// Track user answers
let userAnswers = new Array(questions.length).fill(null);

// Display the next question
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById("question").textContent = currentQuestion.question;

    const optionButtons = document.querySelectorAll(".options button");
    optionButtons.forEach((button, index) => {
        button.textContent = currentQuestion.options[index];
        button.disabled = false; // Enable all buttons
        button.classList.remove("selected"); // Remove any selection class
    });

    // Hide Next button initially
    document.getElementById("next-button").style.display = "none";
}

// Handle answer selection
function selectAnswer(button) {
    const optionButtons = document.querySelectorAll(".options button");

    // Remove "selected" class from all buttons before adding it to the clicked one
    optionButtons.forEach(btn => btn.classList.remove("selected"));

    // Add "selected" class to the clicked button
    button.classList.add("selected");

    // Save the user's selected answer
    userAnswers[currentQuestionIndex] = button.dataset.index;

    // Show the Next button
    document.getElementById("next-button").style.display = "inline-block";
}

// Check the answer and update the score
function checkAnswer() {
    const selectedAnswerIndex = userAnswers[currentQuestionIndex];
    if (selectedAnswerIndex == questions[currentQuestionIndex].correctIndex) {
        score++;
    }
}

// Move to the next question manually
function nextQuestion() {
    checkAnswer(); // Check the latest answer before moving on
    currentQuestionIndex++;
    loadQuestion();
    document.getElementById("next-button").style.display = "none"; // Hide next button after moving to the next question
}

// Show quiz page after entering PIN
function startQuiz() {
    const pinInput = document.getElementById("pin-input").value;
    if (pinInput.trim() === "") {
        alert("Please enter a valid PIN.");
        return;
    }
    pin = pinInput;
    document.getElementById("pin-page").classList.add("hidden");
    document.getElementById("quiz-page").classList.remove("hidden");
    startTimer();
    loadQuestion();
}

// Start countdown timer
function startTimer() {
    timerId = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerId);
            endQuiz();
        } else {
            document.getElementById("time").textContent = --timeLeft;
        }
    }, 1000);
}

// Show results page and display details
function endQuiz() {
    clearInterval(timerId);
    const date = new Date();
    const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

    results.push({ pin, score, dateTime });
    document.getElementById("quiz-page").classList.add("hidden");
    document.getElementById("result-page").classList.remove("hidden");
    document.getElementById("result-pin").textContent = pin;
    document.getElementById("result-score").textContent = `${score} / ${questions.length}`;
}
 

// Download quiz results
async function downloadResults() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Quiz Results", 20, 20);

    doc.setFontSize(12);
    doc.text(`PIN: ${pin}`, 20, 40);
    doc.text(`Score: ${score} / ${questions.length}`, 20, 60);

    let yPosition = 80;
    questions.forEach((question, index) => {
        // Add question
        doc.text(`${index + 1}. ${question.question}`, 20, yPosition);
        yPosition += 10;

        // Add user's selected answer
        const userAnswer = userAnswers[index] || "Not Answered";
        doc.text(`Your Answer: ${userAnswer}`, 20, yPosition);
        yPosition += 10;

        // Add correct answer
        doc.text(`Correct Answer: ${question.options[question.correctIndex]}`, 20, yPosition);
        yPosition += 20;

        // Check for page break
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
    });

    doc.save(`quiz_results_${pin}.pdf`);
}

// Show teacher login page
function showTeacherLogin() {
    document.getElementById("pin-page").classList.add("hidden");
    document.getElementById("login-page").classList.remove("hidden");
}

// Teacher login logic
function loginTeacher() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === teacherCredentials.username && password === teacherCredentials.password) {
        document.getElementById("login-page").classList.add("hidden");
        document.getElementById("dashboard-page").classList.remove("hidden");
        populateDashboard();
    } else {
        alert("Invalid credentials.");
    }
}

// Function to log out the teacher and return to the first page (PIN entry page)
function logoutTeacher() {
    // Hide the dashboard page
    document.getElementById("dashboard-page").classList.add("hidden");
    
    // Hide the login page
    document.getElementById("login-page").classList.add("hidden");

    // Show the first page (PIN entry page)
    document.getElementById("pin-page").classList.remove("hidden");
}

const apiKey = 'AIzaSyADsHxDIUENkmJWcM8ZVEdStAch2tGm7sI'; // Replace with your actual API key
const sheetId = '1za2z5QCADKjaCWoKtQWQoLVxPxsEXDYipywa3uxZj5Q'; // Replace with your actual Sheet ID

// Fetch data from Google Sheets (Read)
function fetchDataFromSheet() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data fetched:', data);
            displayDataOnDashboard(data.values); // Function to display fetched data on your dashboard
        })
        .catch(error => console.error('Error fetching data:', error));
}



// Append data to Google Sheets (Write)
function appendDataToSheet(pin, score) {
    const requestBody = {
        range: "Sheet1!A2:D2", // Modify based on your sheet structure
        majorDimension: "ROWS",
        values: [
            [pin, score, new Date().toLocaleString(), "Status"] // Add relevant data like status if needed
        ]
    };

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A2:D2:append?valueInputOption=RAW&key=${apiKey}`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Data appended:', data);
    })
    .catch(error => console.error('Error appending data:', error));
}

// Display the fetched data on the dashboard
function displayDataOnDashboard(data) {
    const tableBody = document.getElementById('results-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear existing table data

    data.forEach(row => {
        const newRow = tableBody.insertRow();
        row.forEach(cell => {
            const newCell = newRow.insertCell();
            newCell.textContent = cell;
        });
    });
}

// Call fetchDataFromSheet on page load
window.onload = function() {
    fetchDataFromSheet();
};

// Call appendDataToSheet when a new result is submitted
function submitQuizResult(pin, score) {
    appendDataToSheet(pin, score);
    fetchDataFromSheet(); // Refresh dashboard after submitting data
}

// Example: Call submitQuizResult() with student PIN and score (this would be triggered by your quiz flow)
submitQuizResult('PIN123', 90);
