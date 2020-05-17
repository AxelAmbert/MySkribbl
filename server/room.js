const Round = require("./round");
const {performance} = require('perf_hooks');

class Room {
    constructor(roomName, roomSecret) {
        this.roomName = roomName;
        this.roomSecret = roomSecret;
        this.players = [];
        this.playerDrawing = 0;
        this.timeouts = [];
        this.wordBank = null;
        this.currentRound = new Round(this);
    }

    end() {
        if (this.currentRound) {
            this.currentRound.reset();
            delete this.currentRound;
        }
        if (this.wordBank) {
            delete this.wordBank;
        }
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

    removePlayer(id) {
        this.players.forEach((player, index) => {
            if (player.secretID === id) {
                this.players.splice(index, 1);
            }
        });
    }

    onPlayerQuit(leavingPlayer) {
        if (this.currentRound && this.currentRound.drawingPlayer &&
        leavingPlayer.secretID === this.currentRound.drawingPlayer.secretID && this.players.length > 1) {
            this.removePlayer(leavingPlayer.secretID);
            this.currentRound.reset();
            this.currentRound.startARound();
            this.updatePlayersInfos();
        } else if (this.players.length > 1) {
            this.removePlayer(leavingPlayer.secretID);
            this.updatePlayersInfos();
        } else {
            this.removePlayer(leavingPlayer.secretID);
        }
    }

    updatePlayersInfos() {
        let playersInfos = [];

        this.players.forEach((player) => {
            let playerIsDrawing = false;
            if (this.currentRound && this.currentRound.drawingPlayer &&
            this.currentRound.drawingPlayer.secretID === player.secretID) {
                playerIsDrawing = true;
            }

           playersInfos.push({name: player.name, score: player.score, hasFoundWord: player.hasFoundWord, drawing: playerIsDrawing});
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
        if (!this.currentRound.drawingPlayer)
            return (null);
        return (this.currentRound.drawingPlayer.secretID === player.secretID);
    }

    checkWinSituation() {
        let everyoneFound = true;
        let sum = 0;

        this.players.forEach((roomPlayer) => {
            if (roomPlayer.hasFoundWord === false && this.currentRound.drawingPlayer.secretID !== roomPlayer.secretID)
                everyoneFound = false;
            sum += roomPlayer.lastScore;
        });

        if (everyoneFound === false)
            return (false);
        this.currentRound.drawingPlayer.score += Math.floor((sum / this.players.length) + (sum / this.players.length * 0.10));
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

                Player.lastScore = (this.currentRound.choosenWord.length * (80 - secsSinceStart));
                Player.score += Player.lastScore;

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