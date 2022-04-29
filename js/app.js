let currentGame = null;
const popUpBox = document.querySelector("#pop-up");
const iconsClasses = ["fas fa-asterisk", "fas fa-angry", "fas fa-binoculars", "fas fa-bath", "fas fa-basketball-ball", "fas fa-bed", "fas fa-biohazard", "fas fa-biking", "fas fa-bus", "far fa-calendar-check", "fas fa-car-crash", "fas fa-certificate", "fas fa-chart-line", "fas fa-chess-knight", "fas fa-chess-king", "fas fa-city", "fas fa-cloud-showers-heavy", "fas fa-cookie-bite"];

let settings = {
    grid: "",
    theme: ""
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomArray(arr) {
    let arrCopy = [...arr];
    let pickedArr = [];
    while (pickedArr.length !== arr.length) {
        let pickedItem = arrCopy[Math.floor(Math.random() * arrCopy.length)];
        pickedArr.unshift(pickedItem)
        arrCopy.splice(arrCopy.indexOf(pickedItem), 1);
    }
    return pickedArr;
}

function switchToMenu() {
    $("#game").fadeOut(100);
    setTimeout(() => $("#menu-page").fadeIn(100), 100);
    setTimeout(() => document.querySelector("body").classList.remove("light-background"), 50) ;
}

function switchToGame() {
    $("#menu-page").fadeOut(100);
    setTimeout(() => $("#game").fadeIn(100), 100);
    setTimeout(() => document.querySelector("body").classList.add("light-background"), 50) ;
}


function restartGame() {
    currentGame.remove();
    currentGame = new Game(settings);
    currentGame.start();
    popUpBox.classList.add("hidden");
}

function newGame() {
    currentGame.remove();
    switchToMenu();
    popUpBox.classList.add("hidden");
}

class Radio {
    constructor(selector, name, buttons) {
        this.htmlElement = document.querySelector(selector);
        this.buttons = buttons;
        this.name = name

        this.select(buttons[0]);
    }
    static isvalidRadio(...buttons) {
        activeButtonsCount = 0;
        for (button of buttons) {
            if (button.isActive) {
                activeButtonsCount++;
            }
        }
        return (activeButtonsCount === 1);
    }

    select(selectedButton) {
        this.buttons.forEach(button => button.isActive = false);
        settings[this.name] = selectedButton.htmlElement.getAttribute("value");
        selectedButton.isActive = true;
    }
}






class Button {
    constructor(selector) {
        this.htmlElement = document.querySelector(selector);
        this.isActive = false;
    }


    set isActive(value) {
        if (!value) {
            this.htmlElement.classList.remove("active-selection");
            return value;

        } else {
            this.htmlElement.classList.add("active-selection");
            return value;

        }
    }
}


const themeSelection = new Radio("#theme-selection", "theme", [new Button(".numbers.btn"), new Button(".icons.btn")]);
const gridSelection = new Radio("#grid-selection", "grid", [new Button(".grid4x4.btn"), new Button(".grid6x6.btn")]);

const menuSelections = [themeSelection, gridSelection];

for (let selection of menuSelections) {
    selection.htmlElement.addEventListener("click", (e) => {
        if (!e.target.getAttribute("value")) {return;}
        selection.select(selection.buttons.find(button => button.htmlElement.getAttribute("value") === e.target.getAttribute("value")));
        settings[selection.name] = e.target.getAttribute("value");
    });
}

class Game {
    constructor(settings) {
        this.hold = 0;
        this.delayAfterClick = 500;
        this.grid = settings.grid;
        this.theme = settings.theme;
        this.time = "00:00";
        this.moves = 0;
        this.running = false;
        this.gameCardsParentElement = document.querySelector("#game-cards");
        this.cards = [];
        this.cardsWon = [];
        this.cardsVisable = [];
    }

    start() {
        this.running = true;
        this.startTime = Date.now();

        const gameCards = document.createDocumentFragment();

        if (this.theme === "icons") {
            let randomIconsClasses = randomArray(iconsClasses.slice(0, this.grid[0]*this.grid[0]/2).concat(iconsClasses.slice(0, this.grid[0]*this.grid[0]/2)));
            for (let i = 0; i < (parseInt(this.grid[0]*this.grid[0])); i++) {
                const card = new GameCard();
                gameCards.append(card.initWIcon(randomIconsClasses[i]));
                this.cards.push(card);
            }
        } else if (this.theme === "numbers") {
            let randomNumbers = randomArray([...Array(this.grid[0]*this.grid[0]/2).keys()].concat([...Array(this.grid[0]*this.grid[0]/2).keys()]));
            for (let numberIcon of randomNumbers) {
                const card = new GameCard();
                gameCards.append(card.initWNumber(numberIcon));
                this.cards.push(card);
            }
        }

        this.gameCardsParentElement.classList.add(`grid${this.grid}`);
        this.gameCardsParentElement.append(gameCards);

        this.run();
    }

    handleCardClick(card) {
        if (
        (this.cardsWon.indexOf(card) !== -1) || 
        (this.cardsVisable.length === 1 && this.cardsVisable[0] === card) || 
        (this.hold > 0)) {return;} 

        card.show();
        this.cardsVisable.push(card);
        this.moves += 1;
        document.querySelector("#game-moves .data").textContent = this.moves;

        if (this.cardsVisable.length >= 2){
            if (this.cardsVisable[0].icon === this.cardsVisable[1].icon) {
                this.cardsWon = this.cardsWon.concat(this.cardsVisable);
            } else {
                for (let card of this.cardsVisable) {
                    setTimeout(() => card.hide(), this.delayAfterClick);
                }
                this.hold = this.delayAfterClick;
            }
            this.cardsVisable = [];
        }
        if (this.cardsWon.length === this.cards.length) {
            this.end();
        }
    }
    
    run() {
        switchToGame();
        this.timeInterval = window.setInterval(() => this.updateTime(), 1000);
        this.holdInterval = window.setInterval(() => this.holdHandle(100), 100);
        for (let card of this.cards) {
            card.element.addEventListener("click", () => this.handleCardClick(card));
        }
    }
    
    updateTime() {
        const minutes = Math.floor(((Date.now() - this.startTime)/1000)/60);
        const seconds = Math.round(((Date.now() - this.startTime)/1000) - (minutes * 60));
        this.time = `${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`;
        document.querySelector("#game-time p").textContent = this.time;
    }
    
    holdHandle(holdDecrease) {
        if (this.hold > 0) {
            this.hold -= holdDecrease;
        }
    }

    remove() {
        document.querySelector("#game-cards").innerHTML = "";
        document.querySelector("#game-moves p").textContent = 0;
        document.querySelector("#game-time p").textContent = "00:00";
        this.gameCardsParentElement.classList.remove(`grid${this.grid}`);
        clearInterval(this.timeInterval);
        document.querySelector("#restart-button-popupbox").removeEventListener("click", restartGame);
        document.querySelector("#new-game-button-popupbox").removeEventListener("click", newGame);
    }

    end() {
        const pubTime = document.querySelector("#time-info .data");
        const pubRestart = document.querySelector("#restart-button-popupbox");
        const pubNewGame = document.querySelector("#new-game-button-popupbox");
        const pubMoves = document.querySelector("#moves-info .data");

        popUpBox.classList.remove("hidden");
        pubTime.textContent = this.time;
        pubMoves.textContent = this.moves;

        pubRestart.addEventListener("click", restartGame);
        pubNewGame.addEventListener("click", newGame);
    }
}

class GameCard {
    constructor() {
        this.id = Math.floor(Math.random() * 1000000);
    }

    initWIcon(iconClass) {
        this.element = document.createElement("div");
        this.element.classList.add("card");
        this.element.id = `card-${this.id}`;
        this.iconElement = document.createElement("i");
        this.iconElement.className = `${iconClass} fa-6x icon hidden`
        this.icon = iconClass;
        this.element.append(this.iconElement);
        return this.element
    }
    
    initWNumber(number) {
        this.element = document.createElement("div");
        this.element.classList.add("card");
        this.element.id = `card-${this.id}`;

        this.iconElement = document.createElement("div");
        this.iconElement.className = `${number}-icon icon hidden`;
        this.iconElement.textContent = number;

        this.icon = `${number}-icon`;
        this.element.append(this.iconElement);
        return this.element
    }

    hide() {
        this.iconElement.classList.add("hidden");
    }

    show() {
        this.iconElement.classList.remove("hidden");
    }
}



const startBtn = document.querySelector("#start-button");
const resetBtn = document.querySelector("#reset-button");
const newGameBtn = document.querySelector("#new-game-button");

startBtn.addEventListener("click", () => {
    currentGame = new Game(settings);
    currentGame.start();
});
resetBtn.addEventListener("click", restartGame);
newGameBtn.addEventListener("click", newGame);
