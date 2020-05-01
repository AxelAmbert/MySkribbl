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

    playerChatMessage(/*Player*/Player, message) {
        let messageObject = {
            text: message
        };

        if (Player.hasFoundWord === false && message === this.currentRound.choosenWord) {
            Player.socket.emit("foundWord", this.currentRound.choosenWord);
            Player.hasFoundWord = true;
        }
        if (Player.hasFoundWord) {
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