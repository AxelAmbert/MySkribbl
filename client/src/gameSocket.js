import socketIOClient from "socket.io-client";
import {NO_RUSH, RUSH, SEND_DATA_EVERY_X_MILISECONDS} from "./constants";
import InstructionArray from "./instructionArray";

class GameSocket
{
    constructor(parentSetState, URL, instructionArray, networkInstructions, gameMessageInstructions)
    {
        console.log("im build");
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

    setupSocket(query)
    {
        const urlParams = new URLSearchParams(window.location.search);

        this.socket = socketIOClient(this.URL, {reconnect: true, query /* `roomName=${urlParams.get("roomName")}`*/});

        this.socket.on("waitBeforeDraw", () => {
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
        });
        this.socket.on("welcome", (data) => {
            console.log("bjr ^^ ", data);
            this.parentSetState(
                (_) => {
                    return ({
                        playerSecret: data.playerSecret,
                        leader: data.leader
                    });
                });
        });
        this.socket.on("gameData", (data) => {

            if (this.gameMessageInstructions["gameData"]) {
                this.gameMessageInstructions["gameData"]();
            }
            if (this.instructionArray.array != null) {
                this.rush(this.instructionArray);
            }

            console.log("Je recois -> ", data);
            this.instructionArray.array = data;
            this.instructionArray.index = 0;
            this.handleInstructionArray(NO_RUSH);
        });

        this.socket.on("wordHint", (data) => {
           console.log("NEW HINT !", data);
           this.parentSetState((_) => {return ({wordToGuess: data})});
        });

        this.socket.on("chooseAWord", (data) => {
            if (this.gameMessageInstructions["chooseAWord"]) {
                this.gameMessageInstructions["chooseAWord"]();
            }
            console.log("Je dois choisir un mot zeubi !", data);
           this.parentSetState(
               (_) => {
                   return ({
                       chooseWordState: true,
                       wordsToChoose: data.wordsToChoose
                   });
               }
               );
        });

        this.socket.on("startDrawing", (data) => {

            console.log("draw looser");
            //data.wordToDraw;
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
                    console.log("J'envoie ", this.instructionArray.array.length);
                    this.socket.emit("gameData", this.instructionArray.array);
                    this.instructionArray.array = [];
                    this.instructionArray.index = 0;
                }
            }, SEND_DATA_EVERY_X_MILISECONDS);
        });

        this.socket.on("newPlayerTurn", () =>  {
            if (this.gameMessageInstructions["newPlayerTurn"]) {
                this.gameMessageInstructions["newPlayerTurn"]();
            }
            console.log("LETS GO!");

        });

        this.socket.on("chatMessage", (messageObject) => {
            console.log("je recois ", messageObject);
           this.parentSetState((prevState) => {
               prevState.chatMessages.push(messageObject);
               return ({
                   chatMessages: prevState.chatMessages
               });
           });
        });
        this.isSetup = true;
    }
    sendChatMessage(message) {
        console.log("j'envoie chatmessage : ", message);
        this.socket.emit("chatMessage", message);
    }
}

export default GameSocket;