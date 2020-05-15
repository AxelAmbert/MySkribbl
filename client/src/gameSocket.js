import socketIOClient from "socket.io-client";
import {NO_RUSH, RUSH, SEND_DATA_EVERY_X_MILISECONDS, AWS_URL} from "./constants";
import InstructionArray from "./instructionArray";

class GameSocket
{
    constructor(parentSetState, URL, instructionArray, networkInstructions, gameMessageInstructions)
    {
        this.gameMessageInstructions = gameMessageInstructions;
        this.instructionArray = instructionArray;
        this.networkInstruction = networkInstructions;
        this.interval = null;
        this.handleInstructionTimeout = null;
        this.parentSetState = parentSetState;
        this.URL = URL;
        this.socket = null;
        this.isSetup = false;
    }

    handleInstructionArray(rushMode)
    {
        const next = rushMode === RUSH ? null : this.handleInstructionArray.bind(this);

        if (this.instructionArray.index >= this.instructionArray.array.length) {
            this.instructionArray.index = 0;
            this.instructionArray.array = null;
            return;
        }
        this.networkInstruction[this.instructionArray.array[this.instructionArray.index].i](this.instructionArray);
        this.instructionArray.index += 1;
        if (next) {
            this.handleInstructionTimeout = setTimeout(next, this.instructionArray.array[this.instructionArray.index - 1].tm);
        }
    }


    // This function is called if the instruction array is not finished yet, it will rush it and ignore timeouts
    // (it will execute all the instructions directly, without considering how much time the user took to make it)
    // And then clean the array
    rush()
    {
        if (this.handleInstructionTimeout) {
            clearTimeout(this.handleInstructionTimeout);
        }

        for (; this.instructionArray.index < this.instructionArray.array.length; this.instructionArray.index++) {
            this.networkInstruction[this.instructionArray.array[this.instructionArray.index].i](this.instructionArray);
        }
        this.instructionArray.array =  [];
        this.instructionArray.index = 0;
    }

    componentWillUnmount() {
        if (this.handleInstructionTimeout)
            clearInterval(this.handleInstructionTimeout);
        if (this.interval)
            clearInterval(this.interval);
    }

    startGame()
    {
        this.socket.emit("startGame")
    }

    chooseWord(word) {
        this.socket.emit("chooseWord", word);
    }

    onWaitBeforeDraw() {
        if (this.gameMessageInstructions["waitBeforeDraw"]) {
            this.gameMessageInstructions["waitBeforeDraw"]();
        }
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.parentSetState(
            (_) => {
                return ({
                    chooseWordState: false,
                    playerTurn: false,
                    gameNotStartedYet: false,
                });
            });
    }

    onWelcome(data) {
        this.parentSetState(
            (_) => {
                return ({
                    playerSecret: data.playerSecret,
                    leader: data.leader
                });
            });
    }

    onGameData(data) {
        if (this.gameMessageInstructions["gameData"]) {
            this.gameMessageInstructions["gameData"]();
        }
        if (this.instructionArray.array != null) {
            this.rush(this.instructionArray);
        }

        this.instructionArray.array = data;
        this.instructionArray.index = 0;
        this.handleInstructionArray(NO_RUSH);
    }

    onWordHint(data) {
        this.parentSetState((_) => {
            return ({wordToGuess: data})
        });
    }

    onChooseAWord(data) {
        if (this.gameMessageInstructions["chooseAWord"]) {
            this.gameMessageInstructions["chooseAWord"]();
        }
        this.parentSetState(
            (_) => {
                return ({
                    chooseWordState: true,
                    wordsToChoose: data.wordsToChoose
                });
            }
        );
    }

    onStartDrawing(data) {
        this.parentSetState((_) => {
            this.instructionArray.array = [];
            this.instructionArray.index = 0;
            return ({
                playerTurn: true,
                gameNotStartedYet: false,
                wordToGuess: data,
                chooseWordState: false,
            });
        });
        this.interval = setInterval(() => {
            if (this.instructionArray.array.length > 2 || this.instructionArray.goFlag === true) {
                this.instructionArray.goFlag = false;
                this.socket.emit("gameData", this.instructionArray.array);
                this.instructionArray.array = [];
                this.instructionArray.index = 0;
            }
        }, SEND_DATA_EVERY_X_MILISECONDS);
    }

    onNewPlayerTurn() {
        if (this.gameMessageInstructions["newPlayerTurn"]) {
            this.gameMessageInstructions["newPlayerTurn"]();
        }
    }

    onChatMessage(messageObject) {
        this.parentSetState((prevState) => {
            prevState.chatMessages.push(messageObject);
            return ({
                chatMessages: prevState.chatMessages
            });
        });
    }

    onPlayersInfos(playersInfos) {
        this.parentSetState((prevState) => {
            return ({
                playersInfos: playersInfos
            })
        });
    }

    setupSocket(query) {

        this.socket = socketIOClient(AWS_URL, {reconnect: true, query /* `roomName=${urlParams.get("roomName")}`*/});

        this.socket.on("welcome", this.onWelcome.bind(this));
        this.socket.on("gameData", this.onGameData.bind(this));
        this.socket.on("wordHint", this.onWordHint.bind(this));
        this.socket.on("chatMessage", this.onChatMessage.bind(this));
        this.socket.on("chooseAWord", this.onChooseAWord.bind(this));
        this.socket.on("startDrawing", this.onStartDrawing.bind(this));
        this.socket.on("playersInfos", this.onPlayersInfos.bind(this));
        this.socket.on("newPlayerTurn", this.onNewPlayerTurn.bind(this));
        this.socket.on("waitBeforeDraw", this.onWaitBeforeDraw.bind(this));

        this.isSetup = true;
    }
    sendChatMessage(message) {
        this.socket.emit("chatMessage", message);
    }
}

export default GameSocket;
