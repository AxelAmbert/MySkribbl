import socketIOClient from "socket.io-client";
import {NO_RUSH, RUSH, SEND_DATA_EVERY_X_MILISECONDS} from "./constants";

class GameSocket
{
    constructor(parent, URL, instructionArray, networkInstructions, gameMessageInstructions)
    {
        this.gameMessageInstructions = gameMessageInstructions;
        this.instructionArray = instructionArray;
        this.networkInstruction = networkInstructions;
        this.interval = null;
        this.handleInstructionTimeout = null;
        this.parent = parent;
        this.URL = URL;
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

    setupSocket()
    {
        const urlParams = new URLSearchParams(window.location.search);

        this.socket = socketIOClient(this.URL, {reconnect: true, query: `roomName=${urlParams.get("roomName")}`});
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

        this.socket.on("newPlayerTurn", () =>  {
            if (this.gameMessageInstructions["newPlayerTurn"]) {
                this.gameMessageInstructions["newPlayerTurn"]();
            }
            console.log("LETS GO!");
            this.interval = setInterval(() => {
                console.log(" interval  data ", this.instructionArray);
                if (this.instructionArray.array.length > 2) {
                    this.socket.emit("gameData", this.instructionArray.array);
                    this.instructionArray.array = [];
                    this.instructionArray.index = 0;
                }
            }, SEND_DATA_EVERY_X_MILISECONDS);
        });
    }

}

export default GameSocket;