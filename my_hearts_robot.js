export class MyEasiestRobot {
    #model;
    #controller;
    #position;

    constructor(model, controller, position) {
        this.#model = model;
        this.#controller = controller;
        this.#position = position;

        this.#model.addEventListener('stateupdate', () => {
            let state = this.#model.getState();
            if ((state == 'passing') && (this.#model.getPassing() != 'none')) {
                let hand = this.#model.getHand(this.#position);
                let cards_to_pass = this.#cardsToPass();
                this.#controller.passCards(this.#position, cards_to_pass);  
            } 
        });
        this.#model.addEventListener('trickstart', () => this.#playCard());
        this.#model.addEventListener('trickplay', () => this.#playCard());
    }

    // the easiest robot, try to get as many points as possible, help the user win the game!
    #playCard() {
        if (this.#model.getCurrentTrick().nextToPlay() == this.#position) {
            let playable_cards = this.#model.getHand(this.#position)
                                            .getCards()
                                            .filter(c => this.#controller.isPlayable(this.#position, c));
            if (playable_cards.length > 0) {
                let cardToPlay = null;
                // find all the cards with points
                let pointsCards = playable_cards.filter(c => c.getSuit() === 'hearts' || 
                                                            (c.getSuit() === 'spades' && c.getRankName() === 'queen'));

                if (pointsCards.length > 0) {
                    // play the highest points card
                    pointsCards.sort((a, b) => b.getRank() - a.getRank());
                    cardToPlay = pointsCards[0];
                } else {
                    // if no points card, play the highest card to get the points in this trick
                    playable_cards.sort((a, b) => b.getRank() - a.getRank());
                    cardToPlay = playable_cards[0];
                }
                setTimeout(() => this.#controller.playCard(this.#position, cardToPlay), 1000);
            } else {
                // This should never happen.
                console.log(`${this.#position} has no playable cards`);
            }
        }
    }

    #cardsToPass() {
        let hand = this.#model.getHand(this.#position);
        return hand.getCards().sort((a, b) => a.getRank() - b.getRank()).slice(0, 3);
    }
}