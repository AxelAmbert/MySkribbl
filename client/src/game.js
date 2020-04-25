import React, {createRef} from 'react';
import GameSocket from "./gameSocket";
import MainCanvas from "./mainCanvas";
import InstructionArray from "./instructionArray";
import ActionButton from "./actionButton";
import paintBrush from "./photorealistic-icons/paint-brush.png";
import paintBucket from "./photorealistic-icons/paint-bucket.png";
import './index.css';
import {AWS_URL, BUCKET, PAINT} from "./constants";

class Game extends React.Component {
    constructor(props) {
        super(props);

        const urlParams = new URLSearchParams(window.location.search);
        this.instructionArray = new InstructionArray();
        this.roomName = urlParams.get("roomName");
        this.socket = null;
        this.changeSelectedActionCanvasWrapper = _ => {};
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
        this.changeSelectedActionCanvasWrapper = this.canvasRef.changeSelectedAction.bind(this.canvasRef);
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
                <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>} trigger={() => {this.changeSelectedActionCanvasWrapper(PAINT)}}/>,
                <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>} trigger={() => {this.changeSelectedActionCanvasWrapper(BUCKET)}}/>
                /*<button className="favorite styled"
                        type="button"
                        onClick={
                            () =>
                            {console.log("clicj");
                                this.setState({playerTurn: this.state.playerTurn === true ? false : true})}}>
                    Add to favorites
                </button>*/
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