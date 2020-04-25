import React, {createRef} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import socketIOClient from "socket.io-client";
const AWS_URL = "http://appskr-env.eba-ufuzuuq8.us-east-1.elasticbeanstalk.com";
const NO_RUSH = false;
const RUSH = true;
const SEND_DATA_EVERY_X_MILISECONDS = 1000;
const DRAW_PIXEL = 0;
const BUCKET = 1;
const EAST = 1;//x + 1
const WEST = 2; // x - 1
const SOUTH = 3; // y + 1
const NORTH = 4; // y - 1

const clamp = (min, max, val) => Math.min(Math.max(min, val), max);

const log = (...names) =>
{
    let d = new Date().toISOString().substring(0,19).replace("T"," ")

    console.log(d + " : " + names.join(""));
};

class pixel {
    constructor(x, y, oldX, oldY, timeout) {
        this.ox = oldX;
        this.oy = oldY;
        this.x = x;
        this.y = y;
        this.tm = timeout;
        this.i = DRAW_PIXEL;//INSTRUCTION
    }
}

class bucket {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.i = BUCKET;
    }
}


class MainCanvas extends React.Component {

    constructor(props) {
        super(props);
        this.once = false;
        this.bucketDoing = false;
        this.choosenColor = [0, 0, 0]
        this.t0 = performance.now();
        this.t1 = 0;
        this.stack = 0;
        this.offset = {x: 0, y: 0};
        this.pos = {x: 0, y: 0};
        this.drawWrapper = this.handlePlayerDrawing.bind(this);
        this.setPositionWrapper = this.setPosition.bind(this);
        this.width = 800;
        this.height = 600;
        this.timeoutInterval =  setInterval(() => {

            // Reset the timer if the user don't draw for a long time
            const tX = performance.now();

            if (tX - this.t0 >= SEND_DATA_EVERY_X_MILISECONDS / 5) {
                this.t0 = tX;
            }
        }, SEND_DATA_EVERY_X_MILISECONDS / 5);
    }

    setPosition(mouse) {
        this.pos.x = mouse.clientX - this.offset.x;
        this.pos.y = mouse.clientY - this.offset.y;
    }

    isSameColor(arr, x, y, color)
    {
        //console.log("color ", arr[x * y * 4 + 3] !== 0);
        return (arr[(y * this.width + x) * 4 + 3] !== 0);
    }

    fillIt(array, x, y)
    {


       /* this.stack += 1;
        if (this.stack >= 5000)
            return;*/
        /*if (this.once === false && this.stack >= 5000) {
            this.once = true;
            this.ctx.putImageData(imgData, 0, 0);
        }*/
        //console.log("ok : ", x, y, this.stack);
        if (this.isSameColor(array, x, y, this.choosenColor)) {
            this.stack -= 1;
            return;
        }
       /* array[x * y * 4] = this.choosenColor[0];
        array[x * y * 4 + 1] = this.choosenColor[1];
        array[x * y * 4 + 2] = this.choosenColor[2];*/
        array[ (y * this.width + x) * 4 + 3] = 255;
        if (x + 1 < 800)
            this.fillIt(array, x + 1, y);
        if (y + 1 < 600)
            this.fillIt(array, x, y + 1);
        if (x - 1 >= 0)
            this.fillIt(array, x - 1, y);
        if (y - 1 >= 0)
            this.fillIt(array, x, y - 1);
        this.stack -= 1;
    }

    getANodePos(where, x, y) {
        if (x >= 800 || x < 0 || y >= 600 || y < 0)
            return null;

        switch (where) {
            case EAST:
                return ((y * this.width + x + 1) * 4 + 3);
            case WEST :
                return ((y * this.width + x - 1) * 4 + 3);
            case NORTH:
                return ((y * this.width + y - 1) * 4 + 3);
            default: // SOUTH
                return;
        }
    }

    bucket(x, y) {

        if (this.bucketDoing)
            return;
        let nodeList = [];
        this.bucketDoing = true;
        setTimeout(() => {this.bucketDoing = false}, 10000);
        console.log("BUCKET CALL!");
        let imgData = this.ctx.getImageData(0, 0, 800, 600);
        let pixels = imgData.data;


        nodeList.push(((y * this.width + x) * 4 + 3));
        while (nodeList.length) {
            const numberToTest = nodeList.pop();

            if (pixels[numberToTest] !== 0)
                continue;

            pixels[numberToTest] = 255;
            if (x + 1 < 800)
                nodeList.push(((y * this.width + x + 1) * 4 + 3));
            if (x - 1 >= 0)
                nodeList.push(((y * this.width + x - 1) * 4 + 3));
            if (y + 1 < 600)
                nodeList.push((((y + 1) * this.width + x) * 4 + 3));
            if (y - 1 >= 0)
                nodeList.push((((y - 1) * this.width + x) * 4 + 3));
        }

       // console.log(pixels);
        //this.fillIt(pixels, x, y);
        this.ctx.putImageData(imgData, 0, 0);
        console.log("endend...", this.stack);
    }


    drawPixel()
    {
        const pixel = this.props.instructionArray.array[this.props.instructionArray.index];

        this.ctx.beginPath(); // begin
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.moveTo(pixel.ox, pixel.oy); // from
        this.ctx.lineTo(pixel.x, pixel.y); // to
        this.ctx.stroke(); // draw it!
    }

    handlePlayerDrawing(mouse)
    {

        let calculateTimeout = 0;

        if (mouse.buttons !== 1)
            return;
        if (this.props.blocked !== true) {
            this.setPosition(mouse);
            return (this.bucket(this.pos.x, this.pos.y));
        }
        this.ctx.beginPath(); // begin
        const oldpos = {x: this.pos.x, y: this.pos.y};
        this.ctx.moveTo(this.pos.x, this.pos.y); // from
        this.setPosition(mouse);
        this.ctx.lineTo(this.pos.x, this.pos.y); // to


        this.ctx.stroke(); // draw it!
        this.t1 = performance.now();
        console.log(this.t1 - this.t0);

        calculateTimeout = clamp(0, SEND_DATA_EVERY_X_MILISECONDS, Math.floor(this.t1 - this.t0)); // Get the difference between previous click time and actual click time, floor it and then clamp it between 0 and SEND_DATA_EVERY_X_MILISECONDS
        this.props.instructionArray.array.push(new pixel(this.pos.x, this.pos.y, oldpos.x, oldpos.y, calculateTimeout));
        this.t0 = this.t1;
        const imgData = this.ctx.getImageData(0, 0, 800, 600);
        const pixels = imgData.data;
        console.log(pixels);


    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("UP ", this.props.blocked)
        //if (this.props.blocked !== true) {
            this.mouseMoveEvent = document.addEventListener('mousemove', this.drawWrapper);
            this.mouseDownEvent = document.addEventListener('mousedown', this.setPositionWrapper);
            this.mouseEnterEvent = document.addEventListener('mouseenter', this.setPositionWrapper);
        //}
    }

    componentDidMount() {
        this.offset = {x: this.canvasRef.offsetLeft , y: this.canvasRef.offsetTop};
        this.ctx = this.canvasRef.getContext("2d");
        this.ctx.strokeStyle = '#000000';
        console.log("didmount");
    }

    componentWillUnmount() {
        this.mouseDownEvent.remove();
        this.mouseEnterEvent.remove();
        this.mouseMoveEvent.remove();
        clearInterval(this.timeoutInterval);
        console.log("unmount");
    }

    render() {
        return (
        <canvas id="myCanvas" width="800" height="600" ref={ref => {
            console.log("REF BRO: ", ref);
            this.canvasRef = ref;
            console.log("af ", this.canvasRef);

        }}>
            Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
        </canvas>
        );
    }
}


class InstructionArray {
    constructor()
    {
        this.array = [];
        this.index = 0;
    }
}


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
        clearInterval(this.handleInstructionTimeout);
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
                log("LETS GO!");
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


// ========================================

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