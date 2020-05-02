const Round = require("./round");

class Room {
    constructor(roomName, roomSecret) {
        console.log("ROOM CONSTRUCTOR CALLED");
        this.roomName = roomName;
        this.roomSecret = roomSecret;
        this.players = [];
        this.playerDrawing = 0;
        this.timeouts = [];
        this.wordBank = null;
        console.log("before round");
        this.currentRound = new Round(this);
        console.log("Round is called ", this.currentRound);
    }

    chooseWord(word) {
        const timeout = this.timeouts["waitForPlayerToPickAWord"];

        if (timeout) {
            this.timeouts["waitForPlayerToPickAWord"] = null;
            if (this.currentRound.choosenWord === "") {
                clearTimeout(timeout);
                this.currentRound.startToDraw(word);
            }
        }
    }

    startGame() {
        this.timeouts["waitForPlayerToPickAWord"] = this.currentRound.startARound();
    }

    findTheLeader() {
        let leader = null;

        this.players.forEach((player) => {
            if (player.isLeader && leader === null)
                leader = player;
        });
        return (leader);
    }

    checkWinSituation() {
        let everyoneFound = true;

        this.players.forEach((roomPlayer) => {
            if (roomPlayer.hasFoundWord === false && this.currentRound.drawingPlayer.secretID !== roomPlayer.secretID)
                everyoneFound = false;
        });
        if (everyoneFound === false)
            return;
        this.currentRound.reset();
        this.timeouts["waitForPlayerToPickAWord"] = this.currentRound.startARound();
    }

    playerChatMessage(/*Player*/Player, message) {
        let messageObject = {
            text: message
        };

        if (Player.hasFoundWord === false) {
            //message === this.currentRound.choosenWord
            if (message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ===
            this.currentRound.choosenWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()) {
                Player.socket.emit("foundWord", this.currentRound.choosenWord);
                Player.hasFoundWord = true;
            }
        }
        if (Player.hasFoundWord || Player.secretID === this.currentRound.drawingPlayer.secretID) {
            messageObject.color = "green";
            this.players.forEach((roomPlayer) => {
                if (roomPlayer.hasFoundWord)
                    roomPlayer.socket.emit("chatMessage", messageObject);
            });
            this.checkWinSituation();
        } else {
            messageObject.color = "black";
            this.players.forEach((roomPlayer) => {
                roomPlayer.socket.emit("chatMessage", messageObject);
            });
        }
    }
}

module.exports = Room;