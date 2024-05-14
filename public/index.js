let roomCount = 0
let roomArray = []
let matchArray = []

const playButton = $('#playButton');
const bottomContainer = $('.bottomContainer');
const topContainer = $('#topContainer')
const question = $("#question")
const btnMultipleChoice = $('.multipleChoice');
const quizContainer = $('.quizContainer');
const flashcardContainer = $('.flashcardContainer');
const flashcardText = $('#flashcardText');
const flashcardBtn = $('#flashcardBtn');
const choiceContainer = $('.choiceContainer');
const dropdownOption = $('.dropdown-menu');
const quizNav = $('.quizNav');
const resultDisplay = $('#result');
const pointsDisplay = $('#points');
let currentQuiz = "csit210_midterm";
let currentStyle = "guessWord";
let currentType = "quiz";

let i;
let abcdArray = ['a','b','c','d']
let correctIndex;
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

function quizSQLRequest(url = "", dataArray = [], index) {
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

function flashcardSQLRequest(url = "", dataArray = []) {
  MySQLFormDataRequest(url, dataArray)
  .then((data) => data.json())
  .then((data) => {
    console.log(data);
    displayChoices(0, data, ["vocab", "definition"]);
    $(flashcardText).css('backgroundColor', 'whitesmoke')
  })
  .then((data) => {$(playButton).prop('disabled', false); clearInterval(progressbarIncrease)})
}

async function requestApi(url = "", array = [], keys, position) {
  console.log(position)
  const response = await fetch(url)
  const quizData = await response.json()
  let exists = false;
  if (array.length > 0) {
    array.forEach((elem) => {
      if (elem["abilities"] == quizData['abilities'][0]['ability']['name']) {
        exists = true;
      }
    })
  }
  if (exists) {
    array[position] = {[keys[0]]: quizData['abilities'][1]['ability']['name'], [keys[1]]: quizData['name']}
  }
  else {
    array[position] = {[keys[0]]: quizData['abilities'][0]['ability']['name'], [keys[1]]: quizData['name']}
  }
  console.log(array)
  //return response
}

async function requestPokemon(url, array = [], keys = []) {
  const maxPokemon = 149;
  let numArray = [];
  let randIndex
  for (let i = 0; i < 4; i++) {
    do {
      randIndex = Math.floor(Math.random() * maxPokemon) + 1
      console.log(randIndex)
    }
    while (numArray.includes(randIndex))
    numArray.push(randIndex)
    await requestApi(url+numArray[i], array, keys, i)
  }
  console.log(array)
}

async function pokemonFetch(url = "", keys = [], index = 0) {
  let totalData = [];
  
  await requestPokemon(url, totalData, keys)
  console.log(totalData)
  displayChoices(index, totalData, keys);
  $(choiceContainer).filter(function(index, value) {
    if ((index%2 == 0)) {
      $(this).css('backgroundColor', 'whitesmoke')
    }
    else {
      $(this).css('backgroundColor', 'white')
    }
  })
  $(playButton).prop('disabled', false); clearInterval(progressbarIncrease)
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////


function addChoice(position, choice) {
  console.log(choice)
  switch(position) {
    case 0:
      if (currentType == "quiz") {
        $("#choiceA").removeClass('text-primary').text(choice)
        $("#choiceA").prev().show()
      }
      else {
        $("#flashcardText").removeClass('text-primary').text(choice)
        $("#flashcardText").prev().show()
      }
      break;
    case 1:
      $("#choiceB").removeClass('text-primary').text(choice)
      $("#choiceB").prev().show()
      break;
    case 2:
      $("#choiceC").removeClass('text-primary').text(choice)
      $("#choiceC").prev().show()
      break;
    case 3:
      $("#choiceD").removeClass('text-primary').text(choice)
      $("#choiceD").prev().show()
    }
}

function displayChoices(index, data, keys) {
  console.log(data.length)
  for (let i = 0; i< data.length; i++) {
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
let currentProgress
function increaseProgress() {
  let percent = 100 + "%" 
  $(progressbar).css('width', percent)
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

function createQuiz() {
  $('.quizText').html('<div class="spinner-border text-primary"></div>')
  $(btnMultipleChoice).hide()
  $(choiceContainer).css('backgroundColor', 'transparent')
  correctIndex = Math.floor(Math.random() * 4)

  setTimeout(() => {
    if (currentQuiz != "pokemon") {
      let dataArray = [["table", currentQuiz], ["type", currentType]]
      quizSQLRequest("https://quizmaniaapi.azurewebsites.net", dataArray, correctIndex)
    }
    else {
      pokemonFetch("https://pokeapi.co/api/v2/pokemon/", ['abilities', 'name'], correctIndex)
    }
  }, 300)
}

function createFlashcard() {
  $('#flashcardText').html('<div class="spinner-border text-primary"></div>')
  $(".flashcardBtn").hide()
  $(flashcardText).fadeOut(0);
  $(choiceContainer).css('backgroundColor', 'transparent')
  let correctIndex = Math.floor(Math.random() * 4)
  console.log(currentQuiz)

  setTimeout(() => {
    if (currentQuiz != "pokemon") {
      let dataArray = [["table", currentQuiz], ["type", currentType]]
      flashcardSQLRequest("https://quizmaniaapi.azurewebsites.net", dataArray)
    }
    else {
      pokemonFetch("https://pokeapi.co/api/v2/pokemon/", ['abilities', "name"], correctIndex)
    }
  }, 300)
}

function createQuestion() {
  $(resultDisplay).text(displayQuizName());
  $(playButton).prop('disabled', true)
  $(question).text("").append('<div class="progress" style = "width: 300px; max-width: 90vw"><div class="progress-bar" style="width:5%" aria-valuenow = "0"></div></div>')
  currentProgress = 0;
  progressbar = $('.progress-bar');
  progressbarIncrease = setInterval(increaseProgress, 30)
  $('.message').remove()
  if (currentType == "quiz") {
    createQuiz();
  }
  else {
    createFlashcard();
  }
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

function playGame() {
  $(btnMultipleChoice).click((e) => {
    let userChoice = $(e.target);
    checkAnswer($(userChoice));
  })

  $(".choiceText").click((e) => {
    let userChoice = $(e.target);
    let answer = $(userChoice).siblings("button:first-of-type")
    console.log(answer)
    checkAnswer($(answer));
  })   
}


$(flashcardBtn).click((e) => {
  $(flashcardBtn).fadeOut(150, function() {
    $(flashcardBtn).hide();
    $(flashcardText).fadeIn(200);
  })
})

$(dropdownOption).click((e) => {
  target = $(e.target);
  console.log(target)
  switch ($(target).attr('class')) {
    case "dropdown-item-text quizOption":
      currentQuiz = $(target).attr("id");
      console.log(currentQuiz)
      break;
    case "dropdown-item-text quizStyle":
      currentStyle = $(target).attr("id");
      break;
    case "dropdown-item-text quizType":
      currentType = $(target).attr("id");
      break;
  }
})

$(playButton).click( (e) => {

  //if (currentQuiz != "pokemon") {
    if (currentType == "quiz") {
      $(flashcardContainer).fadeOut(20)
      $(quizContainer).fadeIn(20)
    }
    else {
      $(quizContainer).fadeOut(20)
      $(flashcardContainer).fadeIn(20)
    }
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
  //}
})

$("*").on("touchend", function(e) { $(this).focus(); });


let gameStarted = false;
$('.quizNav').fadeOut(0);
$(playButton).fadeOut(0);
$('.quizNav').fadeIn(1000);
$(playButton).fadeIn(1000);
$(flashcardContainer).fadeOut(0);
$(flashcardText).fadeOut(0);
$(quizContainer).fadeOut(0);
