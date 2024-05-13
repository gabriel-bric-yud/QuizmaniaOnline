let roomCount = 0
let roomArray = []
let matchArray = []

const playButton = $('#playButton');
const bottomContainer = $('.bottomContainer');
const topContainer = $('#topContainer')
const question = $("#question")
const btnMultipleChoice = $('.multipleChoice');
const choiceContainer = $('.choiceContainer')
const dropdownOption = $('.dropdown-menu')
const quizNav = $('.quizNav')
const resultDisplay = $('#result');
const pointsDisplay = $('#points');
let currentQuiz = "csit210_midterm"
let currentStyle = "guessWord";

let i;
let abcdArray = ['a','b','c','d']
let points = 0;
let newPoint = false;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function notification(msg, parent, colorData, speed) {
    $('.message').remove();
    const messageDiv = document.createElement('div')
    messageDiv.classList.add('message')
    messageDiv.style.opacity = 0
    messageDiv.style.borderColor = colorData
    const messageText = document.createElement('p')
    messageText.textContent = msg
    messageText.classList.add('messageText')
    messageDiv.appendChild(messageText)
    parent.append(messageDiv)
  
    fadeInCustom(messageDiv, .05, 20)
    slideInCustom(messageDiv, 0, 5, 'top', 1)
    fadeOutCustom(messageDiv, speed, 5, -10, true)
}

function slideInCustom(elem, startPosition, endPosition, direction, increment) {
    let position = startPosition
    let directionOption = direction.toString()
    let slideI = setInterval(() => {
    position += increment //1
    elem.style[directionOption] = `${position}px`
    if (position == endPosition) {
      clearInterval(slideI)
    }
  }, 20)
}
  

function fadeInCustom(elem, increment, interval) {
    let opacity = 0
    let fadeI = setInterval(() => {
        opacity += increment//.05
        elem.style.opacity = opacity
        if (elem.style.opacity >= 1) {
            clearInterval(fadeI)
        } 
  }, interval) //20
}

function fadeOutCustom(elem, speed, startPosition, endPosition, bool) {
    setTimeout(() => {
      let opacity = 1
      let bottom = startPosition
      
      let fadeO = setInterval(() => {
        opacity -= .05
        elem.style.opacity = opacity
  
        if (bottom >= endPosition) {
          bottom -= 1
          elem.style.bottom = `${bottom}px`
        }
  
        if (elem.style.opacity <= 0) {
          if (bool === true) {
            elem.remove()
          }
          clearInterval(fadeO)
        } 
    }, 20)
  }, speed)
}

function checkPoints() {
  if (newPoint == true) {
      pointsDisplay.innerText = points     
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////



async function MySQLFormDataRequest(url = "", dataArray = []) {
  let formData = new FormData();
  for (let i = 0; i < dataArray.length; i++) {
    formData.append(dataArray[i][0], dataArray[i][1])
  }
  const response = await fetch(url, { 
    method: "POST", 
    //mode: "cors", 
    body: formData 
  });
  return response; 
}

function MySQLFormData(url = "", dataArray = [], index) {
  MySQLFormDataRequest(url, dataArray)
  .then((data) => data.json())
  .then((data) => {
    console.log(data);
    displayChoices(index, data, ["vocab", "definition"]);
    $(choiceContainer).filter(function(index, value) {
      if ((index%2 == 0)) {
        $(this).css('backgroundColor', 'whitesmoke')
      }
      else {
        $(this).css('backgroundColor', 'white')
      }
    })
  })
  .then((data) => {$(playButton).prop('disabled', false); clearInterval(progressbarIncrease)})
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//let csit210MidtermVocab = [...csit210Ch1Vocab, ... csit210Ch2Vocab, ...csit210Ch3Vocab, ...csit210Ch4Vocab]
//let csit241MidtermVocab = [...csit241Ch1Vocab, ... csit241Ch2Vocab, ...csit241Ch3Vocab, ...csit241Ch4Vocab]


function getArray(target) {
  let testChoice;
  switch ($(target).attr('id')) {
    case "csit111Midterm":
      testChoice = "csit111_midterm";
      break;
    case "csit111Final":
      testChoice = "csit111_final";
      break;
    case "csit210Chapter1":
      testChoice = "csit210_ch1";
      break;
    case "csit210Chapter2":
      testChoice = "csit210_ch2";
      break;
    case "csit210Chapter3":
      testChoice = "csit210_ch3";
      break;
    case "csit210Chapter4":
      testChoice = "csit210_ch4";
      break;
    case "csit210Midterm":
      testChoice = "csit210_midterm";
      break;
    case "csit210Chapter5":
      testChoice = "csit210_ch5";
      break;
    case "csit241Chapter1":
      testChoice = "csit241_ch1";
      break;
    case "csit241Chapter2":
      testChoice = "csit241_ch2";
      break;
    case "csit241Chapter3":
      testChoice = "csit241_ch3";
      break;
    case "csit241Chapter4":
      testChoice = "csit241_ch4";
      break;
    case "csit241Midterm":
      testChoice = "csit241_midterm";
      break;
    case "pokemon":
      testChoice = "pokemon";
      break;
  }
  return testChoice;
}

function addChoice(position, choice) {
  switch(position) {
    case 0:
      $("#choiceA").removeClass('spinner-border').removeClass('text-primary').text(choice)
      $("#choiceA").prev().show()
      break;
    case 1:
      $("#choiceB").removeClass('spinner-border').removeClass('text-primary').text(choice)
      $("#choiceB").prev().show()
      break;
    case 2:
      $("#choiceC").removeClass('spinner-border').removeClass('text-primary').text(choice)
      $("#choiceC").prev().show()
      break;
    case 3:
      $("#choiceD").removeClass('spinner-border').removeClass('text-primary').text(choice)
      $("#choiceD").prev().show()
    }
}

function displayChoices(index, data, keys) {
  for (let i = 0; i< 4; i++) {
    if (i == index) {
      //question.textContent = data[i][0]
      currentStyle == "guessWord" ? $(question).text(data[i][keys[1]]) : $(question).text(data[i][keys[0]])
    }
    //addChoice(i, data[i][1]) 
    currentStyle == "guessWord" ? addChoice(i, data[i][keys[0]]) : addChoice(i, data[i][keys[1]])
  }
}

let progressbarIncrease
let progressbar

function increaseProgress() {
  currentProgress = $(progressbar).width();
  currentProgress += 600;
  $(progressbar).width(currentProgress)
    console.log($(progressbar))
    console.log($(progressbar).width())
}



function displayQuizName() {
  let quizName = currentQuiz.split("_")
  let displayTxt
  if (quizName != "pokemon") {
    quizName[0] = parseInt(quizName[0].replace("csit",""));
    quizName[1] = quizName[1].replace("ch", "Chapter ");
    quizName[1] = quizName[1].slice(0,1).toUpperCase() + quizName[1].slice(1)
  }
  
  switch(quizName[0]) {
    case 111:
      displayTxt = "Logic and Design " + quizName[1];
      break;
    case 210:
      displayTxt = "Intro to Programming " + quizName[1];
      break;
    case 211:
      displayTxt = "Advanced Programming " + quizName[1];
      break;
    case 212:
      displayTxt = "Visual Basic " + quizName[1];
      break;
    case 241:
      displayTxt = "Applied Systems Analysis and Design " + quizName[1];
      break;
    default:
      displayTxt = "Pokemon;"
  }
  return displayTxt;
}

async function requestApi(url = "", array = [] , index = 0) {
  const response = await fetch(url)
  array[index] = await response.json()
  return response
}



function pokemonFetch(url = "", endpoints = [], keys = [], index = 0) {
  let totalData = [];
  requestApi(url+endpoints[0], totalData, 0)
  .then((data) => requestApi(url+endpoints[1], totalData, 1))
  .then((data) => requestApi(url+endpoints[2], totalData, 2))
  .then((data) => requestApi(url+endpoints[3], totalData, 3))
  .then((data) => console.log(totalData))
  .then((data) => {
    displayChoices(index, totalData, keys);
    $(choiceContainer).filter(function(index, value) {
      if ((index%2 == 0)) {
        $(this).css('backgroundColor', 'whitesmoke')
      }
      else {
        $(this).css('backgroundColor', 'white')
      }
    })
  })
  .then((data) => {$(playButton).prop('disabled', false); clearInterval(progressbarIncrease)})
}

function createQuestion() {
  $(resultDisplay).text(displayQuizName());
  $(playButton).prop('disabled', true)
  $(question).text("").append('<div class="progress" style = "width: 300px; max-width: 90vw"><div class="progress-bar" style="width:0%"></div></div>')
  progressbar = $('.progress-bar');
    progressbarIncrease = setInterval(increaseProgress, 30)
  $('.message').remove()
  $('.choiceText').html('<div class="spinner-border text-primary"></div>')
  $(btnMultipleChoice).hide()
  $(choiceContainer).css('backgroundColor', '')
  correctIndex = Math.floor(Math.random() * 4)
  console.log(currentQuiz)

  setTimeout(() => {
    if (currentQuiz != "pokemon") {
      let dataArray = [["table", currentQuiz]]
      MySQLFormData("https://quizmaniaapi.azurewebsites.net", dataArray, correctIndex)
    }
    else {
      pokemonFetch("https://quizmaniaapi.azurewebsites.net", ["pikachu/", "charmander/", "squirtle/", "bulbasaur/"], ['abilities', "name"], correctIndex)
    }

  }, 300)

}


function checkAnswer(choice) {
    if ($(choice).attr("id") == abcdArray[correctIndex]) {
        $(choice).addClass('btn-success').toggleClass('animateCustom').css('fontWeight', 'bold');
        $(choice).parent().addClass('bg-success text-white')
        if (newPoint == false) {
            points += 1;
            $(pointsDisplay).text(points)
            checkPoints();
        }
        newPoint = true;
        notification('CORRECT!', quizNav, 'green', 600)
    }
    else {
        $(choice).addClass('btn-danger').toggleClass('animateCustom');
        $(choice).parent().addClass('bg-danger text-white');
        newPoint = true;
        notification('WRONG!', quizNav, 'red', 600)
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function clearColors() {
  $(btnMultipleChoice).each(function(index, value) {
    $(this).parent().removeClass('bg-success bg-danger text-white')
    $(this).css('fontWeight', 'normal').removeClass('btn-success btn-danger animateCustom')
    void $(this).offsetWidth;
    void $(this).offsetHeight;
    //$(this).setAttribute('class', 'multipleChoice'); 
  })
}

function clearResult() {
  newPoint = false
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

let correctIndex
function playGame() {
    $(btnMultipleChoice).click((e) => {
        let userChoice = $(e.target);
        checkAnswer(userChoice);
    })
}

$(choiceContainer).filter(function(index, value) {
  if ((index%2 == 0)) {
    $(this).css('backgroundColor', 'whitesmoke')
  }
  else {
    $(this).css('backgroundColor', 'white')
  }
})


let gameStarted = false;
$('.quizNav').fadeOut(0);
$(playButton).fadeOut(0);
$('.quizNav').fadeIn(1000);
$(playButton).fadeIn(1000);

$(dropdownOption).click((e) => {
  target = $(e.target);
  console.log(target)
  switch ($(target).attr('class')) {
    case "dropdown-item-text quizOption":
      currentQuiz = $(target).attr("id");;
      break;
    case "dropdown-item-text quizStyle":
      currentStyle = $(target).attr("id");
      break;
  }
})

$(playButton).click( (e) => {
  if (gameStarted == false) {
    //$('.dropdown').removeClass('dropdown').addClass('dropup')
    $(topContainer).fadeOut().show().css('display', 'grid').fadeIn()
    $(playButton).text('Random Question')
    playGame();
    gameStarted = true
  }
  clearColors(); 
  clearResult();
  createQuestion()
})

$("*").on("touchend", function(e) { $(this).focus(); });
