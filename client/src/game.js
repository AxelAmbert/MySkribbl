import React, {createRef} from 'react';
import GameSocket from "./gameSocket";
import MainCanvas from "./mainCanvas";
import InstructionArray from "./instructionArray";
import './index.css';
import {AWS_URL} from "./constants";

/*
class ActionButton extends React.Component {
    constructor(props) {
        super(props);

        const urlParams = new URLSearchParams(window.location.search);

        this.instructionArray = new InstructionArray();
        this.roomName = urlParams.get("roomName");
        this.socket = null;
        this.state = {
            playerTurn: true,
        };
    }

    componentDidMount() {
        this.gameServerInstruction = [this.canvasRef.drawPixel.bind(this.canvasRef)];
        this.messageServerInstruction = {"newPlayerTurn": this.handleNewPlayerTurn.bind(this)};
        if (!this.socket) {
            this.socket = new GameSocket(this, AWS_URL, this.instructionArray, this.gameServerInstruction, this.messageServerInstruction);
            this.socket.setupSocket();
        }
    }

    render() {
        return ([
                <button className="favorite styled"
                        type="button"
                        onClick={
                            () =>
                            {console.log("clicj");
                                this.setState({playerTurn: this.state.playerTurn === true ? false : true})}}>
                    Add to favorites
                </button>
            ]
        );
    }
}*/


class Game extends React.Component {
    constructor(props) {
        super(props);

        const urlParams = new URLSearchParams(window.location.search);

        this.instructionArray = new InstructionArray();
        this.roomName = urlParams.get("roomName");
        this.socket = null;
        this.state = {
            playerTurn: true,
        };
    }

    handleNewPlayerTurn() {
        this.setState({playerTurn: true});
    }

    handleNoAccessCanvas() {
        if (this.state.playerTurn === false)
            return;
        this.setState({
            playerTurn: false
        });
    }
    componentDidMount() {
        this.gameServerInstruction = [this.canvasRef.drawPixel.bind(this.canvasRef)];
        this.messageServerInstruction = {"newPlayerTurn": this.handleNewPlayerTurn.bind(this)};
        if (!this.socket) {
            this.socket = new GameSocket(this, AWS_URL, this.instructionArray, this.gameServerInstruction, this.messageServerInstruction);
            this.socket.setupSocket();
        }
    }

    render() {
        return ([

              <MainCanvas ref={ref => this.canvasRef = ref} blocked={this.state.playerTurn} instructionArray={this.instructionArray} />,
                <button className="favorite styled"
                        type="button"
                        onClick={
                            () =>
                            {console.log("clicj");
                                this.setState({playerTurn: this.state.playerTurn === true ? false : true})}}>
                    Add to favorites
                </button>
                ]
        );
    }
}


export default Game

/*
ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
 */