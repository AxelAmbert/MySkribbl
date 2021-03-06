import React from "react";
import pixel from "./pixel";
import {PAINT, BUCKET, SEND_DATA_EVERY_X_MILISECONDS} from "./constants";
import "./index.css";
import Bucket from "./bucket";
import {hexToRgba, rgbaToHex} from 'hex-and-rgba';
import EndAction from "./endAction";

const clamp = (min, max, val) => Math.min(Math.max(min, val), max);

class MainCanvas extends React.Component {

    customHexToRGBA(hex) {
        let arr = hexToRgba(hex);

        arr[3] = Math.floor(arr[3] * 255);
        return (arr);
    }

    constructor(props) {
        super(props);
        this.bindEndAction = this.endActionWrapper.bind(this);
        this.selectedAction = PAINT;
        this.once = true;
        this.previousState = !this.props.blocked;
        this.choosenColor = this.customHexToRGBA("#000000");
        this.oldColor = this.choosenColor;
        this.t0 = performance.now();
        this.t1 = 0;
        this.stack = 0;
        this.offset = {x: 0, y: 0};
        this.pos = {x: 0, y: 0};
        this.drawWrapper = this.handlePlayerDrawing.bind(this);
        this.setPositionWrapper = this.setPosition.bind(this);
        this.width = 800;
        this.height = 600;
        this.saves = [];
        this.enableActionValidity = true;
        this.mouseUpEvent = null;
        this.mouseDownEvent = null;
        this.mouseEnterEvent = null;
        this.mouseMoveEvent = null;
        if (this.props.blocked !== true) {
            this.mouseUpEvent = document.addEventListener("mouseup", this.bindEndAction);
            console.log("EVENT ADDED ", this.mouseUpEvent, this.mouseDownEvent, this.mouseMoveEvent, this.mouseEnterEvent);

            this.mouseMoveEvent = document.addEventListener('mousemove', this.drawWrapper);
            this.mouseDownEvent = document.addEventListener('mousedown', this.setPositionWrapper);
            this.mouseEnterEvent = document.addEventListener('mouseenter', this.setPositionWrapper);
            console.log("EVENT ADDED ", this.mouseUpEvent, this.mouseDownEvent, this.mouseMoveEvent, this.mouseEnterEvent);

        }

        this.timeoutInterval = setInterval(() => {
            // Reset the timer if the user don't draw for a long time
            const tX = performance.now();

            if (tX - this.t0 >= SEND_DATA_EVERY_X_MILISECONDS / 5) {
                this.t0 = tX;
            }
        }, SEND_DATA_EVERY_X_MILISECONDS / 5);

    }

    end() {
        /*if (this.mouseDownEvent)
            this.mouseDownEvent.remove();
        if (this.mouseEnterEvent)
            this.mouseEnterEvent.remove();
        if (this.mouseMoveEvent)
            this.mouseMoveEvent.remove();
        if (this.timeoutInterval)
            clearInterval(this.timeoutInterval);*/
    }

    setPosition(mouse) {
        const rect = this.canvasRef.getBoundingClientRect();

        this.pos = {
            x: Math.floor((mouse.clientX - rect.left) / (rect.right - rect.left) * this.canvasRef.width),
            y: Math.floor((mouse.clientY - rect.top) / (rect.bottom - rect.top) * this.canvasRef.height)
        };

    }

    goBack() {
        if (this.saves.length < 2)
            return;
        this.saves.pop();
        const data = this.saves[this.saves.length - 1];
        this.clear();
        this.ctx.putImageData(data,0, 0);
    }

    triggerSave() {

        if (this.enableActionValidity !== true && this.props.blocked === false) {
            return false;
        }
        this.enableActionValidity = false;
        if (this.saves.length > 1000) {
            this.saves.shift();
        }

        this.saves.push(this.ctx.getImageData(0, 0, 800, 600));
        return (true);

    }

    endActionWrapper(mouse) {
        this.setPosition(mouse);

        if (this.triggerSave() === true) {
            this.props.instructionArray.array.push(new EndAction());
        }
    }

    isSameColor(arr, x, y, color) {
        return (arr[(y * this.width + x) * 4 + 3] !== 0);
    }


    bucketWrapper() {
        const pixel = this.props.instructionArray.array[this.props.instructionArray.index];

        this.bucket(pixel.x, pixel.y);
    }

    changeStrokeSize(size) {
        this.ctx.lineWidth = size;

    }

    changeStrokeSizeWrapper() {
        this.changeStrokeSize(this.props.instructionArray.array[this.props.instructionArray.index].s);
    }

    changeColor(newColor) {
        const rgba = this.customHexToRGBA(newColor);

        this.oldColor = this.choosenColor;
        this.ctx.strokeStyle = newColor;
        this.choosenColor = rgba;
        this.ctx.fillStyle = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
    }

    changeColorWrapper() {

        this.changeColor(this.props.instructionArray.array[this.props.instructionArray.index].c);
    }

    diffTolerance(valueOne, valueTwo, tolerance) {
        // If true, tolerance is respected
        return (Math.abs(valueOne - valueTwo) <= tolerance);
    }

    isBaseColor(arr, x, y, baseColor) {

        return (this.diffTolerance(arr[(y * this.width + x) * 4], baseColor[0], 10) &&
            this.diffTolerance(arr[(y * this.width + x) * 4 + 1], baseColor[1], 10) &&
            this.diffTolerance(arr[(y * this.width + x) * 4 + 2], baseColor[2], 10) &&
            this.diffTolerance(arr[(y * this.width + x) * 4 + 3], baseColor[3], 10));
    }

    bucket(x, y) {

        let nodeList = [];
        this.bucketDoing = true;
        let imgData = this.ctx.getImageData(0, 0, 800, 600);
        let pixels = imgData.data;
        const baseColor = [pixels[((y * this.width + x) * 4)], pixels[((y * this.width + x) * 4 + 1)], pixels[((y * this.width + x) * 4 + 2)], pixels[((y * this.width + x) * 4 + 3)]];

        nodeList.push({x: x, y: y});
        const tmpT0 = performance.now();
        const maxOperations = 800 * 600 * 4; // width * height * (r/g/b/a) (4)
        let actions = 0;

        while (nodeList.length) {
            const posToTest = nodeList.pop();

            actions++;
            if (actions > maxOperations) {
                break;
            }
            const xToTest = posToTest.x;
            const yToTest = posToTest.y;

            if (this.isBaseColor(pixels, xToTest, yToTest, baseColor) === false)
                continue;
            pixels[((yToTest * this.width + xToTest) * 4)] = this.choosenColor[0];
            pixels[((yToTest * this.width + xToTest) * 4 + 1)] = this.choosenColor[1];
            pixels[((yToTest * this.width + xToTest) * 4 + 2)] = this.choosenColor[2];
            pixels[((yToTest * this.width + xToTest) * 4 + 3)] = this.choosenColor[3];
            if (xToTest + 1 < 800)
                nodeList.push({x: xToTest + 1, y: yToTest});
            if (xToTest - 1 >= 0)
                nodeList.push({x: xToTest - 1, y: yToTest});
            if (yToTest + 1 < 600)
                nodeList.push({x: xToTest, y: yToTest + 1});
            if (yToTest - 1 >= 0)
                nodeList.push({x: xToTest, y: yToTest - 1});
        }
        if (actions > 1) {
            this.enableActionValidity = true;
        }
        const tmpT1 = performance.now();
        // console.log(pixels);
        //this.fillIt(pixels, x, y);
        this.ctx.putImageData(imgData, 0, 0);
        const tmpT2 = performance.now();
    }

    drawPixel() {
        const pixel = this.props.instructionArray.array[this.props.instructionArray.index];
        const directionVectorX = pixel.x - pixel.ox,
            directionVectorY = pixel.y - pixel.oy;
        const perpendicularVectorAngle = Math.atan2(directionVectorY, directionVectorX) + Math.PI / 2;
        const path = new Path2D();

        path.arc(pixel.ox, pixel.oy, this.ctx.lineWidth, perpendicularVectorAngle, perpendicularVectorAngle + Math.PI);
        path.arc(pixel.x, pixel.y, this.ctx.lineWidth, perpendicularVectorAngle + Math.PI, perpendicularVectorAngle);
        path.closePath();
        this.ctx.fill(path);
    }

    posIsOnCanvas(pos) {
        return (pos.x >= 0 && pos.x <= 800 && pos.y >= 0 && pos.y <= 600);
    }

    handlePlayerDrawing(mouse) {
        let calculateTimeout = 0;

        if (mouse.buttons !== 1 || this.selectedAction !== PAINT || this.props.blocked)
            return;
        //this.ctx.beginPath(); // begin
        let oldpos = {x: this.pos.x, y: this.pos.y};
        this.setPosition(mouse);
        const directionVectorX = this.pos.x - oldpos.x,
            directionVectorY = this.pos.y - oldpos.y;
        const perpendicularVectorAngle = Math.atan2(directionVectorY, directionVectorX) + Math.PI / 2;
        const path = new Path2D();
        path.arc(oldpos.x, oldpos.y, this.ctx.lineWidth, perpendicularVectorAngle, perpendicularVectorAngle + Math.PI);
        path.arc(this.pos.x, this.pos.y, this.ctx.lineWidth, perpendicularVectorAngle + Math.PI, perpendicularVectorAngle);
        path.closePath();
        this.ctx.fill(path);
        this.t1 = performance.now();
        if (this.posIsOnCanvas(oldpos) || this.posIsOnCanvas(this.pos)) {
            this.enableActionValidity = true;
        }

        calculateTimeout = clamp(0, SEND_DATA_EVERY_X_MILISECONDS, Math.floor(this.t1 - this.t0)); // Get the difference between previous click time and actual click time, floor it and then clamp it between 0 and SEND_DATA_EVERY_X_MILISECONDS
        this.props.instructionArray.array.push(new pixel(this.pos.x, this.pos.y, oldpos.x, oldpos.y, calculateTimeout));
        this.t0 = this.t1;
    }

    clearSaves() {
        this.saves = [];
        this.triggerSave();
    }

    clear(isAction) {
        if (isAction) {
            this.enableActionValidity = true;
        }
        const oldFIllStyle = this.ctx.fillStyle;

        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvasRef.width, this.canvasRef.height);
        this.ctx.fillStyle = oldFIllStyle;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (this.props.blocked !== true && !this.mouseMoveEvent) {
            console.log("EVENT ADDED 2", this.mouseUpEvent, this.mouseDownEvent, this.mouseMoveEvent, this.mouseEnterEvent);

            this.mouseUpEvent = document.addEventListener("mouseup", this.bindEndAction);
            this.mouseMoveEvent = document.addEventListener('mousemove', this.drawWrapper);
            this.mouseDownEvent = document.addEventListener('mousedown', this.setPositionWrapper);
            this.mouseEnterEvent = document.addEventListener('mouseenter', this.setPositionWrapper);

            console.log("EVENT ADDED 2", this.mouseUpEvent, this.mouseDownEvent, this.mouseMoveEvent, this.mouseEnterEvent);

        }
    }

    componentDidMount() {
        this.offset = {x: this.canvasRef.offsetLeft, y: this.canvasRef.offsetTop};
        this.ctx = this.canvasRef.getContext("2d");
        this.ctx.lineWidth = 3;
        this.triggerSave();
    }

    componentWillUnmount() {
        document.removeEventListener("mouseup", this.bindEndAction);
        document.removeEventListener('mousemove', this.drawWrapper);
        document.removeEventListener('mousedown', this.setPositionWrapper);
        document.removeEventListener('mouseenter', this.setPositionWrapper);
        if (this.timeoutInterval) {
            clearInterval(this.timeoutInterval);
        }
    }

    handleClickOnCanvas(mouse) {
        this.setPosition(mouse);

        if (this.props.blocked) {
            return;
        }
        switch (this.selectedAction) {
            case BUCKET:
                this.bucket(this.pos.x, this.pos.y);
                this.props.instructionArray.array.push(new Bucket(this.pos.x, this.pos.y));
                this.props.instructionArray.goFlag = true;
                break;
            default:
                return;
        }
    }

    changeSelectedAction(selectedAction) {
        if (selectedAction === PAINT && rgbaToHex(...this.choosenColor).startsWith("#FFFFFF"))
            this.choosenColor = this.oldColor;
        this.selectedAction = selectedAction;
    }

    getCanvas() {
        return (this.canvasRef);
    }

    render() {
        return (

            <canvas className={"mainCanvas"} width="800" height="600" ref={ref => {
                this.canvasRef = ref;
            }} onClick={this.handleClickOnCanvas.bind(this)}>
                Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
            </canvas>

        );
    }
}

export default MainCanvas