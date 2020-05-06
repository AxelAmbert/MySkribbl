const Round = require("./round");
const {performance} = require('perf_hooks');

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

    playerExist(playerName) {
        let exist = false;

        this.players.forEach((player) => {
            if (player.name === playerName)
                exist = true;
        });
        return (exist);
    }

    onNewPlayer() {
        this.updatePlayersInfos();
    }

    updatePlayersInfos() {
        let playersInfos = [];

        this.players.forEach((player) => {
           playersInfos.push({name: player.name, score: player.score, hasFoundWord: player.hasFoundWord});
        });
        this.players.forEach((roomPlayer) => {
            roomPlayer.socket.emit("playersInfos", playersInfos);
        })

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

    playerIsDrawing(player) {
        if (!this.playerDrawing)
            return (null);
        return (this.playerDrawing.secretID === player.secretID);
    }

    checkWinSituation() {
        let everyoneFound = true;

        this.players.forEach((roomPlayer) => {
            if (roomPlayer.hasFoundWord === false && this.currentRound.drawingPlayer.secretID !== roomPlayer.secretID)
                everyoneFound = false;
        });
        if (everyoneFound === false)
            return (false);
        this.currentRound.reset();
        this.timeouts["waitForPlayerToPickAWord"] = this.currentRound.startARound();
        this.updatePlayersInfos();
        return (everyoneFound);
    }

    playerChatMessage(/*Player*/Player, message) {
        let messageObject = {
            text: message
        };

        if (Player.hasFoundWord === false && this.playerIsDrawing(Player) === false) {
            //message === this.currentRound.choosenWord
            if (message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ===
            this.currentRound.choosenWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()) {
                const secsSinceStart = Math.min(80, Math.max(0, Math.floor((performance.now() - this.currentRound.startDrawTimer) / 1000)));


                Player.score += (this.currentRound.choosenWord.length * (80 - secsSinceStart));
                console.log("check win");

                Player.socket.emit("foundWord", this.currentRound.choosenWord);
                Player.hasFoundWord = true;
                if (this.checkWinSituation() === false) {
                    this.updatePlayersInfos();
                }

            }
        }
        if (Player.hasFoundWord ||
        (this.currentRound.drawingPlayer &&
        Player.secretID === this.currentRound.drawingPlayer.secretID)) {
            messageObject.color = "green";
            this.players.forEach((roomPlayer) => {
                if (roomPlayer.hasFoundWord)
                    roomPlayer.socket.emit("chatMessage", messageObject);
            });
        } else {
            messageObject.color = "black";
            this.players.forEach((roomPlayer) => {
                roomPlayer.socket.emit("chatMessage", messageObject);
            });
        }
    }
}

module.exports = Room;