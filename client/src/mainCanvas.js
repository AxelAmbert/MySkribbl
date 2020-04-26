import React from "react";

import pixel from "./pixel";
import {PAINT, BUCKET, SEND_DATA_EVERY_X_MILISECONDS} from "./constants";

const clamp = (min, max, val) => Math.min(Math.max(min, val), max);

class MainCanvas extends React.Component {

    constructor(props) {
        super(props);
        this.selectedAction = PAINT;
        this.once = true;
        this.bucketDoing = false;
        this.choosenColor = [0, 0, 0];
        this.t0 = performance.now();
        this.t1 = 0;
        this.stack = 0;
        this.offset = {x: 0, y: 0};
        this.pos = {x: 0, y: 0};
        this.drawWrapper = this.handlePlayerDrawing.bind(this);
        this.setPositionWrapper = this.setPosition.bind(this);
        this.width = 800;
        this.height = 600;
        this.clickOnCanvasAction = {1: this.bucket.bind(this)};
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

    isWhiteColor(arr, x, y)
    {
        return (arr[(y * this.width + x) * 4] === 255 &&
            arr[(y * this.width + x) * 4 + 1] === 255 &&
            arr[(y * this.width + x) * 4 + 2] === 255 &&
            arr[(y * this.width + x) * 4 + 3] === 255);
    }

    bucket(x, y) {

        if (this.bucketDoing)
            return;
        let nodeList = [];
        this.bucketDoing = true;
        let imgData = this.ctx.getImageData(0, 0, 800, 600);
        let pixels = imgData.data;


        nodeList.push({x: x, y: y});
        const tmpT0 = performance.now();
        let actions = 0;

        while (nodeList.length) {
            const posToTest = nodeList.pop();

            actions++;
            const xToTest = posToTest.x;
            const yToTest = posToTest.y;

            if (this.isWhiteColor(pixels, xToTest, yToTest) === false)
                continue;
            pixels[((yToTest * this.width + xToTest) * 4)] = 0;
            pixels[((yToTest * this.width + xToTest) * 4 + 1)] = 0;
            pixels[((yToTest * this.width + xToTest) * 4 + 2)] = 0;
            pixels[((yToTest * this.width + xToTest) * 4 + 3)] = 255;
            if (xToTest + 1 < 800)
                nodeList.push({x: xToTest + 1, y: yToTest});
            if (xToTest - 1 >= 0)
                nodeList.push({x: xToTest - 1, y: yToTest});
            if (yToTest + 1 < 600)
                nodeList.push({x: xToTest, y: yToTest + 1});
            if (yToTest - 1 >= 0)
                nodeList.push({x: xToTest, y: yToTest - 1});
        }
        console.log("ACTIONS ? ", actions);
        const tmpT1 = performance.now();
        // console.log(pixels);
        //this.fillIt(pixels, x, y);
        this.ctx.putImageData(imgData, 0, 0);
        const tmpT2 = performance.now();
        console.log(" FILL : ", tmpT1 - tmpT0, " SET IMAGE ", tmpT2 - tmpT1);
        setTimeout(() => {this.bucketDoing = false}, 1000);
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

        if (mouse.buttons !== 1  || this.selectedAction !== PAINT)
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

        calculateTimeout = clamp(0, SEND_DATA_EVERY_X_MILISECONDS, Math.floor(this.t1 - this.t0)); // Get the difference between previous click time and actual click time, floor it and then clamp it between 0 and SEND_DATA_EVERY_X_MILISECONDS
        this.props.instructionArray.array.push(new pixel(this.pos.x, this.pos.y, oldpos.x, oldpos.y, calculateTimeout));
        this.t0 = this.t1;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("UP ", this.props.blocked);
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
        this.ctx.lineWidth = 3;
        if (this.once) {
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(0, 0, this.canvasRef.width, this.canvasRef.height);
            this.once = false;
        }
        console.log("didmount");
    }

    componentWillUnmount() {
        if (this.mouseDownEvent)
            this.mouseDownEvent.remove();
        if (this.mouseEnterEvent)
            this.mouseEnterEvent.remove();
        if (this.mouseMoveEvent)
            this.mouseMoveEvent.remove();
        if (this.timeoutInterval)
            clearInterval(this.timeoutInterval);
        console.log("unmount");
    }

    handleClickOnCanvas(mouse)
    {
        this.setPosition(mouse);
        if (this.clickOnCanvasAction[this.selectedAction]) {
            this.clickOnCanvasAction[this.selectedAction](this.pos.x, this.pos.y);
        }
    }

    changeSelectedAction(selectedAction)
    {
        this.selectedAction = selectedAction;
    }

    getCanvas()
    {
        return (this.canvasRef);
    }

    render() {
        return (
            <canvas id="myCanvas" width="800" height="600" ref={ref => {this.canvasRef = ref;}} onClick={this.handleClickOnCanvas.bind(this)} >
                Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
            </canvas>
        );
    }
}

export default MainCanvas