class Player {
    constructor(socket, secretID) {
        this.socket = socket;
        this.name = "";
        this.isLeader = false;
        this.secretID = secretID;
        this.hasFoundWord = false;
        this.score = 0;
        this.lastScore = 0;
        this.isInGame = false;
        this.onDisconnectCallback = null;
        this.roomName = null;
    }
}

module.exports = Player;