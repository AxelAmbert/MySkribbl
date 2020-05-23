const jwt = require('jsonwebtoken');
const Room = require("./room");
const Game = require("./game");
const Player = require("./player");
const WordBank = require("./wordBank");


class ServerMainSocket {

    constructor(io, RoomList, PlayerList) {
        this.listeners = ["chatMessage", "gameData", "startGame", "chooseWord", "stopPlay"];
        this.io = io;
        this.RoomList = RoomList;
        this.PlayerList = PlayerList;
        this.wordBank = new WordBank("./WordData/FrenchWords");
        this.initSocket();
    }

    onGameData(roomName, socket, data) {
        socket.to(roomName).emit("gameData", data);
    }

    handleDisconnection(roomName, Player, definitiveDisconnect) {
        console.log("DISCO !");
        const Room = this.RoomList[roomName];

        if (!roomName)
            return;
        Room.players.forEach((player) => {
            if (player.secretID === Player.secretID) {
                Room.onPlayerQuit(player);
            }
        });
        if (Room.players.length === 0) {
            Room.end();
            delete this.RoomList[roomName];
        }
        if (definitiveDisconnect) {
            this.PlayerList.every((player, index) => {
                if (player.secretID === Player.secretID) {
                    this.PlayerList.splice(index, 1);
                    return (false);
                }
                return (true);
            })
        } else {
            ["chatMessage", "gameData", "startGame", "chooseWord", "stopPlay"].forEach((event) => {
                Player.socket.removeAllListeners (event);
            });
            Player.isInGame = false;
        }
    }

    onChatMessage(/*Player*/Player, /*Room*/Room, message) {
        console.log("JE RECOIS UN CHAT MESSAGE ", message);
        Room.playerChatMessage(Player, message);
    }

    initSocket() {
        this.io.on('connection', async (socket) => {
            const playerSecretID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const player = new Player(socket, playerSecretID);

            console.log("je créée ", typeof playerSecretID);
            this.PlayerList[player.secretID] = player;
            socket.on("changeMode", (data) => {
                const mode = {game: this.initRoomSocket.bind(this, player), mainPage: this.initMainPanelSocket.bind(this, player)};

                console.log("change mode ", data);
                if (data.mode && data.mode !== player.mode) {
                    this.resetListeners(player);
                    mode[data.mode](data.data);
                }
            });

            socket.on("disconnect", () => {
                if (player.onDisconnectCallback)
                    player.onDisconnectCallback();
                delete this.PlayerList[player.secretID];
            });
        });
    }

    resetListeners(player) {
        this.listeners.forEach((listener) => {
            player.socket.removeAllListeners(listener);
        });
    }

    async initMainPanelSocket(player, data) {
        let token = data["token"];

        if (!token) {
            console.log("lolwat ", data);
            return;
        }
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.log("catched ", token, error)
            return;
        }

        console.log("ok emiting", player.secretID);
        player.onDisconnectCallback = null;
        player.socket.emit("changeModeAnswer", {playerSecretID: player.secretID});
    }

    async initRoomSocket(player, data) {
        if (player.roomName === null) {
            console.log("No room nbame");
            return;
        }

        const PlayerRoom = this.RoomList[player.roomName];


        if (!PlayerRoom) {
            console.log("Room not found");
            return;
        }

        player.isInGame = true;
        if (!PlayerRoom.wordBank)
            PlayerRoom.wordBank = this.wordBank;
        await player.socket.join(player.roomName);
        PlayerRoom.players.push(player);
        player.socket.on("chatMessage", this.onChatMessage.bind(this, player, PlayerRoom));

        player.socket.on("gameData", this.onGameData.bind(this, player.roomName, player.socket));

        player.socket.on("startGame", PlayerRoom.startGame.bind(PlayerRoom));

        player.socket.on("chooseWord", PlayerRoom.chooseWord.bind(PlayerRoom));

        player.socket.removeAllListeners ("disconnect");
        player.socket.on("disconnect", this.handleDisconnection.bind(this, player.roomName, player, true));
        player.socket.on("stopPlay", this.handleDisconnection.bind(this, player.roomName, player, false));
        player.socket.emit("welcome", {
            leader: PlayerRoom.players.length === 1,
            playerSecretID: player.secretID,
        });
        PlayerRoom.onNewPlayer();
        console.log("welcomed ");

    }
}

module.exports = ServerMainSocket;