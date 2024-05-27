import {HeartsRobotKmp} from "./hearts_robot_kmp.js";
import {MyEasiestRobot} from "./my_hearts_robot.js";
export class HeartsView {
    #model;
    #controller;
    #userName;
    #initial
    #winner;
    #playSound;

    constructor(model, controller) {
        this.#model = model;
        this.#controller = controller;
        this.#userName = '';
        this.selectedCards = [];
        this.#initial = false;
        this.#winner = false;
        this.#playSound = new Audio("sounds/play_card_sound.mp3");
    }

    render(render_div) {
        render_div.innerHTML = `
            <div id="header">
                <span id="title">Hearts</span>
                <button id="start">Start</button>
                <input type="text" id="input-name" placeholder="Enter your name">
                <button id="confirm">Confirm</button>
            </div>
        `;

        render_div.querySelector('#confirm').addEventListener('click', () => {
            if(document.getElementById('input-name').value != ''){
                this.#userName = document.getElementById('input-name').value;
                document.getElementById('header').removeChild(document.getElementById('input-name'));
                document.getElementById('header').removeChild(document.getElementById('confirm')); 
            } else {
                let nameAlert = document.getElementById('name-alert');
                if(!nameAlert){
                    nameAlert = document.createElement('span');
                    nameAlert.id = 'name-alert';
                    nameAlert.textContent = 'You must enter a name'
                    document.getElementById('header').appendChild(nameAlert);
                    setTimeout(() => {
                        while (document.getElementById('name-alert')) {
                            nameAlert.remove();
                        }
                    }, 2000);
                }
            }
        });

        render_div.querySelector('#start').addEventListener('click', () => {
            if(this.#model.getState() == "uninitialized" && this.#userName != ''){
                let west_robot = new MyEasiestRobot(this.#model, this.#controller, 'west');
                let north_robot = new MyEasiestRobot(this.#model, this.#controller, 'north');
                let east_robot = new MyEasiestRobot(this.#model, this.#controller, 'east');
                //let auto = new HeartsRobotKmp(this.#model, this.#controller, 'south');
                this.#controller.startGame("north_robot", "east_robot", "user", "west_robot");
                setTimeout(() => document.getElementById('header').removeChild(document.getElementById('input-name')), 5);
                setTimeout(() => document.getElementById('header').removeChild(document.getElementById('confirm')), 5);
                setTimeout(() => document.getElementById('header').removeChild(document.getElementById('start')), 5);
                setTimeout(() => this.setupGameArea(render_div), 20);
            } else{
                let nameAlert = document.getElementById('name-alert');
                if(!nameAlert){
                    nameAlert = document.createElement('span');
                    nameAlert.id = 'name-alert';
                    nameAlert.textContent = 'You must enter a name'
                    document.getElementById('header').appendChild(nameAlert);
                    setTimeout(() => {
                        while (document.getElementById('name-alert')) {
                            nameAlert.remove();
                        }
                    }, 2000);
                }
            }

        });

        this.#model.addEventListener('stateupdate', () => {
            if(this.#model.getState() == 'passing' && this.#initial == true){
                setTimeout(() => this.createScoreTable(render_div), 20);
                setTimeout(() => this.setupGameArea(render_div), 1000);
            } else if(this.#model.getState() == 'complete'){
                setTimeout(() => this.createScoreTable(render_div), 20);
                setTimeout(() => this.showFinalWinner(render_div), 20);
            }
        });
    }

    showFinalWinner(render_div) {
        let winners = this.getGameWinners().join(', ');
        render_div.removeChild(document.getElementById('table'));
        let final = document.getElementById('final');
        if (!final) {
            final = document.createElement('div');
            final.id = 'final';
            render_div.appendChild(final);
        }
        let showWinner = document.createElement('span');
        showWinner.textContent = "GAME OVER! " + winners + " won!";
        final.appendChild(showWinner);
    }

    createScoreTable(render_div) {
        let existingTable = render_div.querySelector('table');
        if (existingTable) { 
            render_div.removeChild(existingTable);
        }

        let scoreTable = document.createElement('table');
        scoreTable.style.border = '3px solid black';
        scoreTable.style.borderCollapse = 'collapse';
        scoreTable.style.width = '100%';
        scoreTable.style.textAlign = 'center';
        scoreTable.style.marginTop = '20px';

        let headerRow = scoreTable.insertRow();
        ['Hand', this.#userName, 'Gav1nyyyy', 'ihoo', 'AsianGuy', 'Winner(s)'].forEach(text => {
            let headerCell = document.createElement('th');
            headerCell.textContent = text;
            headerCell.style.border = '1px solid black';
            headerRow.appendChild(headerCell);
        });

        let scoreLog = this.#model.getScoreLog();
        scoreLog.forEach((round, index) => {
            let row = scoreTable.insertRow();
            let handCell = row.insertCell();
            handCell.textContent = index + 1;
            handCell.style.border = '1px solid black';

            let roundScores = ['south', 'east', 'north', 'west'].map(position => round[position]);
            let minScore = Math.min(...roundScores);
            let winners = [];
            for (let i = 0; i < roundScores.length; i++) {
                let score = roundScores[i];
                let position = ['south', 'east', 'north', 'west'][i];
                if (score == minScore) {
                    winners.push(this.positionToName(position));
                }
            }

            ['south', 'east', 'north', 'west'].forEach(position => {
                let cell = row.insertCell();
                cell.textContent = round[position];
                cell.style.border = '1px solid black';
            });

            let winnerCell = row.insertCell();
            winnerCell.style.border = '1px solid black';
            if (this.#winner || index !== scoreLog.length - 1) {
                winnerCell.textContent = winners.join(', ');
            }
        });

        let totalRow = scoreTable.insertRow();
        let totalCell = totalRow.insertCell();
        totalCell.textContent = 'Total';
        totalCell.style.border = '1px solid black';

        let totalScores = ['south', 'east', 'north', 'west'].map(position => this.#model.getScore(position));
        let minTotalScore = Math.min(...totalScores);
        let totalWinners = [];
        for (let i = 0; i < totalScores.length; i++) {
            let score = totalScores[i];
            let position = ['south', 'east', 'north', 'west'][i];
            if (score == minTotalScore) {
                totalWinners.push(this.positionToName(position));
            }
        }

        ['south', 'east', 'north', 'west'].forEach(position => {
            let cell = totalRow.insertCell();
            cell.textContent = this.#model.getScore(position);
            cell.style.border = '1px solid black';
        });

        let totalWinnerCell = totalRow.insertCell();
        totalWinnerCell.style.border = '1px solid black';
        if (this.#winner) {
            totalWinnerCell.textContent = totalWinners.join(', ');
        }

        render_div.appendChild(scoreTable);
    }

    positionToName(position) {
        switch (position) {
            case 'south': return this.#userName;
            case 'east': return 'Gav1nyyyy';
            case 'north': return 'ihoo';
            case 'west': return 'AsianGuy';
            default: return 'Unknown';
        }
    }

    setupGameArea(render_div) {
        let table = document.getElementById('table');
        if (!table) {
            table = document.createElement('div');
            table.id = 'table';
            render_div.appendChild(table);
        }
        
        this.createBotPlayerArea('west-player', 'AsianGuy', table, 'west');
        this.createBotPlayerArea('east-player', 'Gav1nyyyy', table, 'east');
        this.createBotPlayerArea('north-player', 'ihoo', table, 'north');
        this.createPlayerArea('south-player', this.#userName, table, 'south');
        this.createTrickArea('west-trick', table, 'west');
        this.createTrickArea('east-trick', table, 'east');
        this.createTrickArea('north-trick', table, 'north');
        this.createTrickArea('south-trick', table, 'south');
        this.createAlertArea(render_div);

        if(this.#model.getState() == "passing"){
            let passButton = document.getElementById('pass-button');
            if(!passButton){
                passButton = document.createElement('button');
                passButton.setAttribute("id", "pass-button");
                passButton.textContent = "pass";
                table.appendChild(passButton);
            }
            
            passButton.addEventListener('click', () => {
                if(this.#model.getState() == "passing" && this.selectedCards.length == 3){
                    this.#controller.passCards('south', this.selectedCards);
                    let table = document.getElementById('table');
                    table.remove();
                    this.selectedCards = [];
                    this.#playSound.play();
                    setTimeout(() => this.setupGameArea(render_div), 20);
                } else if(this.selectedCards.length < 3){
                    this.updateAlert('You need to select 3 cards');
                }
            });
        }
        this.createScoreTable(render_div);
    }

    createAlertArea(render_div){
        let alertArea = document.getElementById('alert');
        if(!alertArea){
            alertArea = document.createElement('div');
            alertArea.setAttribute('id', 'alert');
            render_div.appendChild(alertArea);
        } else{
            render_div.appendChild(alertArea);
        }
    }

    updateAlert(alertInfo) {
        let alertArea = document.getElementById('alert');
        while (alertArea.firstChild) {
            alertArea.removeChild(alertArea.firstChild);
        }
        let alertSpan = document.createElement('span');
        alertSpan.textContent = alertInfo;
        alertArea.appendChild(alertSpan);
        setTimeout(() => {
            while (alertArea.firstChild) {
                alertArea.removeChild(alertArea.firstChild);
            }
        }, 2000);
    }
    

    createTrickArea(areaId, render_div, position){
        let trick = document.getElementById(areaId);
        if(!trick){
            trick = document.createElement('div');
            trick.id = areaId;
            render_div.appendChild(trick);
        }

        this.#model.addEventListener('trickplay', (e) => {
            let tempPosition = e.detail.position;
            if(tempPosition == position){
                while (trick.firstChild) {
                    trick.removeChild(trick.firstChild);
                }
                let cardTrickId = '';
                if(position == 'west'){
                    cardTrickId = 'card-image-west';
                } else if(position == 'east'){
                    cardTrickId = 'card-image-east';
                } else if(position == 'south'){
                    cardTrickId = 'card-image-south';
                } else {
                    cardTrickId = 'card-image-north';
                }
                let card = e.detail.card;
                let cardName = card.toString().replace(/\s+/g, '-');
                let cardImage = document.createElement('img');
                cardImage.src = `images/${cardName}.png`;
                cardImage.alt = card.toString();
                cardImage.classList.add('card-image', cardTrickId);
                trick.appendChild(cardImage);
            }
            this.#initial = true;
        });

        this.#model.addEventListener('trickcollected', () => {
            this.#winner = true;
            setTimeout(() => {
                while (trick.firstChild) {
                    trick.removeChild(trick.firstChild);
                }
            }, 1000);
        });
    }

    createBotPlayerArea(playerId, playerName, render_div, position) {
        let playerArea = document.getElementById(playerId);
        if (!playerArea) {
            playerArea = document.createElement('div');
            playerArea.setAttribute('id', playerId);
            playerArea.classList.add('bot-player-area');
            render_div.appendChild(playerArea);
        }

        let playerNameId = playerId + '-name-id';
        let playerNameSpan = document.getElementById(playerNameId);
        if(!playerNameSpan){
            playerNameSpan = document.createElement('span');
            playerNameSpan.setAttribute('id', playerNameId);
            playerNameSpan.textContent = playerName;
            playerArea.appendChild(playerNameSpan);
        }

        let cardContainer = document.createElement('div');
        let containerId = playerId + '-container';
        cardContainer.setAttribute('id', containerId);
        playerArea.appendChild(cardContainer);

        let hand = this.#model.getHand(position);
        let cards = hand.getCards(); 
        
        cards.forEach((card, index) => {
            let cardBackImage = document.createElement('img');
            cardBackImage.setAttribute("id", card.toString());
            cardBackImage.src = 'images/back.png';
            cardBackImage.alt = 'Card back';
            cardBackImage.classList.add('card-back');
            cardBackImage.style.left = `${index * 25}px`;
            cardContainer.appendChild(cardBackImage);
        });

        this.#model.addEventListener('trickplay', (e) => {
            if(e.detail.position == position){
                let cardsInContainer = cardContainer.querySelectorAll('.card-back');
                if(cardsInContainer.length > 0){
                    cardsInContainer[cardsInContainer.length - 1].remove();
                }
            }

        });
    }

    createPlayerArea(playerId, playerName, render_div, position) {
        let playerArea = document.getElementById(playerId);
        if (!playerArea) {
            playerArea = document.createElement('div');
            playerArea.setAttribute("id", playerId);
            render_div.appendChild(playerArea);
        }
        playerArea.classList.add('player-area');
        playerArea.style.marginBottom = '50px';

        let playerNameId = 'user-name-id';
        let playerNameSpan = document.getElementById(playerNameId);
        if(!playerNameSpan){
            playerNameSpan = document.createElement('span');
            playerNameSpan.setAttribute('id', playerNameId);
            playerNameSpan.textContent = playerName;
            playerArea.appendChild(playerNameSpan);
        }

        let cardContainer = document.getElementById('user-container');
        if(!cardContainer){
            cardContainer = document.createElement('div');
            let containerId = 'user-container';
            cardContainer.setAttribute('id', containerId);
            playerArea.appendChild(cardContainer);
        }
        
        cardContainer.style.position = 'relative';
        cardContainer.style.height = '140px'; 

        let hand = this.#model.getHand(position);
        let cards = hand.getCards(); 

        const suitOrder = { 'hearts': 0, 'spades': 1, 'diamonds': 2, 'clubs': 3 };
        const rankOrder = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'jack': 11, 'queen': 12, 'king': 13, 'ace': 14 };
        cards.sort((a, b) => {
            if (suitOrder[a.getSuit()] < suitOrder[b.getSuit()]) return -1;
            if (suitOrder[a.getSuit()] > suitOrder[b.getSuit()]) return 1;
            return rankOrder[a.getRankName()] - rankOrder[b.getRankName()];
        });

        cards.forEach((card, index) => {
            let cardButton = document.createElement('button');
            let cardName = card.toString();
            let buttonId = cardName.replace(/\s+/g, '-');
            cardButton.setAttribute("id", buttonId);
            
            cardButton.classList.add('card-button');
            cardButton.style.backgroundImage = `url('images/${buttonId}.png')`;
            cardButton.style.position = 'absolute';
            cardButton.style.left = `${index * 25}px`;
            cardButton.textContent = '';
            cardContainer.appendChild(cardButton);
            
            function updateCardPositions() {
                let remainingCards = cardContainer.querySelectorAll('.card-button');
                remainingCards.forEach((card, index) => {
                    card.style.left = `${index * 25}px`;
                });
            }

            cardButton.addEventListener('click', () => {
                if(this.#model.getState() == 'passing'){
                    if(this.selectedCards.includes(card)){
                        this.selectedCards = this.selectedCards.filter(c => !c.equals(card));
                        cardButton.classList.toggle('selected');
                    } else if(!this.selectedCards.includes(card) && this.selectedCards.length < 3){
                        this.selectedCards.push(card);
                        cardButton.classList.toggle('selected');
                    } else if(this.selectedCards.length == 3){
                        this.updateAlert('You can only pass 3 cards');
                    }
                } else if(this.#model.getState() == "playing"){
                    if(this.#model.getCurrentTrick().nextToPlay() != "south"){
                        this.updateAlert('Not your turn');
                    } else {
                        if(!this.#controller.isPlayable("south", card)){
                            this.updateAlert('Not playable');
                        } else {
                            setTimeout(() => this.#controller.playCard("south", card), 5);
                            setTimeout(cardButton.remove(), 20);
                            updateCardPositions();
                        }
                    }
                }
            });
        });
    }
    getGameWinners() {
        let scores = {
            south: this.#model.getScore('south'),
            east: this.#model.getScore('east'),
            north: this.#model.getScore('north'),
            west: this.#model.getScore('west'),
        };
        let minScore = Math.min(...Object.values(scores));
        let winners = Object.keys(scores).filter(position => scores[position] === minScore);
        let winnerNames = winners.map(winner => this.positionToName(winner));
        return winnerNames;
    }
    
}
