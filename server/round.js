class Round {

    constructor(/*Room*/Room) {
        this.pendingWords = [];
        this.choosenWord = "";
        this.slicedWord = "";
        this.parentRoom = Room;
        this.drawingPlayer = null;
        this.chooseWordTimeout = null;
        this.hintInterval = null;
    }

    getNextPlayerToDraw() {
        if (this.parentRoom.players.length === 0)
            return null;
        if (this.parentRoom.playerDrawing >= this.parentRoom.players) {
            this.parentRoom.playerDrawing = 0;
        }
        const nextPlayerToDraw = this.parentRoom.players[this.parentRoom.playerDrawing];

        this.parentRoom.playerDrawing += 1;
        return (nextPlayerToDraw);
    }
    ReplaceAt(input, index, replacement) {
        return input.substr(0, index) + replacement+ input.substr(index + replacement.length);
    }
    getAnHint() {
        console.log("BEFORE ", this.slicedWord);
        let gardeFou = 0;

        while (gardeFou < 30) {
            let random = Math.floor(Math.random() * (this.slicedWord.length));

            if (this.slicedWord.charAt(random) === "_") {
                this.slicedWord = this.ReplaceAt(this.slicedWord, random, this.choosenWord.charAt(random));
                break;
            }
            gardeFou++;
        }
        this.drawingPlayer.socket.to(this.parentRoom.roomName).emit("wordHint", this.slicedWord);
        console.log("AFTER ", this.slicedWord);
    }

    startToDraw() {
        for (let i = 0; i < this.choosenWord.length; i++) {
            if (this.choosenWord.charAt(i) === " ") {
                this.slicedWord = this.slicedWord + " ";
            } else {
                this.slicedWord = this.slicedWord + "_";
            }
        }
        this.drawingPlayer.socket.emit("startDrawing", this.choosenWord);
        this.drawingPlayer.socket.to(this.parentRoom.roomName).emit("wordHint", this.slicedWord);
        this.pendingWords = [];
        this.hintInterval = setInterval(() => {
            this.getAnHint();
        }, 10000);
    }

    startARound() {
        let timeout = null;

        this.drawingPlayer = this.getNextPlayerToDraw();
        if (this.drawingPlayer === null)
            return timeout;
        this.choosenWord = "";
        this.pendingWords = this.parentRoom.wordBank.getRandomWords(3);
        this.drawingPlayer.socket.emit("chooseAWord", {wordsToChoose: this.pendingWords});
        this.drawingPlayer.socket.to(this.parentRoom.roomName).emit("waitBeforeDraw");
        this.chooseWordTimeout = setTimeout(
            () => {
                this.choosenWord = this.pendingWords[Math.floor(Math.random() * (2))];
                this.startToDraw();
            }, 2000);
        return (timeout);
    }
}

module.exports = Round;