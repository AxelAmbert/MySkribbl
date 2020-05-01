class Game {
    constructor(parent) {
        this.parent = parent;
        this.playerTurn = null;
        this.wordToGuess = null;
        this.numberOfRoundBeforeEnd = 0;
    }
}

module.exports = Game;