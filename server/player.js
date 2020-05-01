class Player {
    constructor(socket, name, secretID) {
        this.socket = socket;
        this.name = name;
        this.isLeader = false;
        this.secretID = secretID;
        this.hasFoundWord = false;
    }
}

module.exports = Player;