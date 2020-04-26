import React, {createRef} from 'react';
import GameSocket from "./gameSocket";
import MainCanvas from "./mainCanvas";
import InstructionArray from "./instructionArray";
import ActionButton from "./actionButton";
import paintBrush from "./photorealistic-icons/paint-brush.png";
import paintBucket from "./photorealistic-icons/paint-bucket.png";
import './index.css';
import {AWS_URL, BUCKET, PAINT} from "./constants";
import imageCompression from 'browser-image-compression';
import Compressor from 'compressorjs';
import axios from 'axios';



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
                <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>} trigger={() => {this.changeSelectedActionCanvasWrapper(BUCKET)}}/>,
            <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>} trigger={() => {

                //this.canvasRef.getCanvas().toDataURL('image/jpeg', 1.0);
                this.canvasRef.getCanvas().toBlob(
                        (TheFile) => {
                            console.log("FILE ?");
                            console.log(TheFile.name);
                            console.log(TheFile.size);

                            imageCompression(TheFile, {maxSizeMB: 1, maxWidthOrHeight: Math.ceil(800 / 3), fileType: "jpg"}).then(
                                (TheFile2) => {
                                    console.log("FILE2 ?");
                                    console.log(TheFile2.name);
                                    console.log(TheFile2.size);

                                    // The third parameter is required for server
                                    const reader = new FileReader();

                                    reader.onload = function(event){

                                        console.log("?");
                                        console.log(reader.result, ", ", reader.result.length);
                                        axios({
                                            method: "post",
                                            url: `${AWS_URL}/photo/`,
                                            data: {data: reader.result}
                                        }).then(() => {
                                            console.log('Upload success');
                                        }).catch(function (error) {
                                            console.log("error :", error);
                                        });
                                    };
                                    reader.readAsDataURL(TheFile2);
                                    console.log("FILE ? -> ", TheFile2);
                                    // Send the compressed image file to server with XMLHttpRequest.
                                }
                            )
                        }
                    )

            }}/>,
                <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>} trigger={() => {
                    this.canvasRef.getCanvas().toBlob(
                        (Blob) => {
                            if (!Blob) {
                                console.log("No blob...");
                                return;
                            }
                            console.log("BLOB ? -> ", Blob);
                            new Compressor(Blob, {
                                quality: 0.4,
                                maxHeight: 200,
                                maxWidth: Math.ceil(800 / 3),
                                success(result) {

                                    const reader = new FileReader();

                                    reader.onload = function(event){
                                        console.log("?");
                                        console.log("base ", reader.result);
                                        axios({
                                            method: "post",
                                            url: `${AWS_URL}/photo/`,
                                            data: {data: reader.result}
                                        }).then(() => {
                                            console.log('Upload success');
                                        }).catch(function (error) {
                                            console.log("error :", error);
                                        });
                                    };
                                    reader.readAsDataURL(result);
                                },
                                error(err) {
                                    console.log(err.message);
                                },
                            });
                        }
                    );

                    /*const link = document.createElement('a');
                    link.href = process.env.PUBLIC_URL + "/default_img.png";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);*/

                }}/>
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