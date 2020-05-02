const Room = require("./room");
const Game = require("./game");
const Player = require("./player");
const WordBank = require("./wordBank");


class  ServerMainSocket {

    constructor(io, RoomList) {
        this.io = io;
        this.RoomList = RoomList;
        this.wordBank = new WordBank("./WordData/FrenchWords");
        this.initSocket();
    }

    onGameData(roomName, socket, data) {
        socket.to(roomName).emit("gameData", data);
    }

    onChatMessage(/*Player*/Player, /*Room*/Room, message) {
        console.log("JE RECOIS UN CHAT MESSAGE ", message);
        Room.playerChatMessage(Player, message);
    }


    initSocket() {
        this.io.on('connection', async (socket) => {
            console.log("middleware:", socket.request._query['roomName']);
            console.log('a user connected');
            const roomName = socket.request._query['roomName'];
            const playerName = socket.request._query["playerName"];
            const PlayerRoom = this.RoomList[roomName];
            const secretPlayerID =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


            if (!PlayerRoom) {
                console.log("Room not found");
                return;
            }
            const newPlayer = new Player(socket, playerName, secretPlayerID);
            PlayerRoom.wordBank = this.wordBank;
            await socket.join(roomName);
            PlayerRoom.players.push(newPlayer);

            socket.on("chatMessage", this.onChatMessage.bind(this, newPlayer, PlayerRoom));

            socket.on("gameData", this.onGameData.bind(this, roomName, socket));

            socket.on("startGame", PlayerRoom.startGame.bind(PlayerRoom));

            socket.on("chooseWord", PlayerRoom.chooseWord.bind(PlayerRoom));

            socket.emit("welcome", {
                leader: PlayerRoom.players.length === 1,
                playerSecret: secretPlayerID
            });

        });
    }
}

module.exports = ServerMainSocket;