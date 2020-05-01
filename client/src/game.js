import React, {createRef, useState} from 'react';
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
import Chat from "./chat";
import ListOfPlayers from "./listOfPlayers";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
const {useEffect} = require("react");


const useStyles = makeStyles((theme) => ({

    body: {
        margin: "0px",
    },

    mainGrid: {
        padding: "0px",
        display: "flex",

    },
    canvasGrid: {
        display: "flex",
        "flex-direction": "column",

    },
    actionButtonsGrid: {
        display: "flex",
        "justify-content": "center",

    },
    canvas: {
        "max-width": "100%",
        "max-height": "100%",
        resize: "both"

    },
    chatGrid: {
        "position": "relative",
        "flex-grow": "1",
        "max-height": "600px",
    },
    wordToGuess: {
        "background-color": "#363636",
        "color" : "white",
        display: "flex",
        "justify-content": "center",
        "font-size": "24px",
        "margin" : "0px",
        "padding": "0px",
    },
}));

const Game = () => {
    console.log("LOL");
    const classes = useStyles();
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get("roomName");
    let changeSelectedActionCanvasWrapper = _ => {};
    let gameServerInstruction = null;
    let messageServerInstruction = null;
    let canvasRef = null;
    let startGameButton = "";

    const [state, setState] = useState({
        playerTurn: false,
        gameNotStartedYet: true,
        chooseWordState: false,
        leader: false,
        playerSecret: "not-logged",
        wordsToChoose: [],
        chatMessages: [],
        playersList: [{name: "ok", score: 1003}],
        socket: null,
        instructionArray: new InstructionArray(),
        wordToGuess: "",
    });




    const customSetState = (valuesToChange) => {
        setState(prevState => {
            for (const key in valuesToChange) {
                if (valuesToChange.hasOwnProperty(key)) {
                    console.log("je change ", prevState[key], "en", valuesToChange[key]);
                }
            }
            const newv = {...prevState, ...valuesToChange};

            console.log("GO -> ", newv);
            return ({...prevState, ...valuesToChange});
        });
    };

    const callbackCaller = (callback) => {
        const newValues = callback(state);

        customSetState(newValues);
    };

    const handleNewPlayerTurn = () => {
        customSetState({playerTurn: true});

    };

    const handleNoAccessCanvas = () => {
        if (state.playerTurn === false)
            return;
        setState((prev) =>
        {
            prev.playerTurn = false;
            return (prev);
        });
    };


    useEffect(() => {
        changeSelectedActionCanvasWrapper = canvasRef.changeSelectedAction.bind(canvasRef);
        gameServerInstruction = [canvasRef.drawPixel.bind(canvasRef)];
        messageServerInstruction = {"newPlayerTurn": () => {handleNewPlayerTurn();}};
        if (!state.socket) {
            customSetState({socket: new GameSocket(callbackCaller, AWS_URL, state.instructionArray, gameServerInstruction, messageServerInstruction)});
        } else if (!state.socket.isSetup) {
            state.socket.setupSocket();

        }
        console.log("new state ? ", state);
        if (state.gameNotStartedYet && state.leader) {
            startGameButton =
                <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>}
                              trigger={() => {
                                  state.socket.startGame();
                              }}/>;
        }
    });



    if (state.gameNotStartedYet && state.leader) {
        startGameButton =
            <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>}
                          trigger={() => {
                              state.socket.startGame();
                          }}/>;
    }

    return (
        <div className={classes.mainGrid}>
            <ListOfPlayers playersInfos={state.playersList}/>,
            <div className={classes.canvasGrid}>
                <p className={classes.wordToGuess}> {state.wordToGuess} </p>
                <MainCanvas ref={ref => canvasRef = ref} blocked={!state.playerTurn}
                            instructionArray={state.instructionArray}/>
                <div className={classes.actionButtonsGrid}>
                    <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>} trigger={() => {
                        console.log("go for paint ", PAINT);
                        changeSelectedActionCanvasWrapper(PAINT)
                    }}/>
                    <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>} trigger={() => {
                        console.log("go for bucket");
                        changeSelectedActionCanvasWrapper(BUCKET)
                    }}/>
                    {startGameButton}
                </div>
            </div>
            <div className={classes.chatGrid}>
                <Chat chatMessages={state.chatMessages} sendMessageTrigger={(message) => {
                    state.socket.sendChatMessage(message);
                }}/>
            </div>
        </div>
            /*
                <Chat chatMessages={state.chatMessages} sendMessageTrigger={(message) => {
                    socket.sendChatMessage(message);
                }}/>,
                <MainCanvas ref={ref => canvasRef = ref} blocked={!state.playerTurn}
                            instructionArray={instructionArray}/>,
                <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>} trigger={() => {
                    console.log("go for paint ", PAINT);
                    changeSelectedActionCanvasWrapper(PAINT)
                }}/>,
                <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>} trigger={() => {
                    console.log("go for bucket");
                    changeSelectedActionCanvasWrapper(BUCKET)
                }}/>,
                startGameButton,
                <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>} trigger={() => {

                    //canvasRef.getCanvas().toDataURL('image/jpeg', 1.0);
                    canvasRef.getCanvas().toBlob(
                        (TheFile) => {
                            console.log("FILE ?");
                            console.log(TheFile.name);
                            console.log(TheFile.size);

                            imageCompression(TheFile, {
                                maxSizeMB: 1,
                                maxWidthOrHeight: Math.ceil(800 / 3),
                                fileType: "jpg"
                            }).then(
                                (TheFile2) => {
                                    console.log("FILE2 ?");
                                    console.log(TheFile2.name);
                                    console.log(TheFile2.size);

                                    // The third parameter is required for server
                                    const reader = new FileReader();

                                    reader.onload = function (event) {

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
                    canvasRef.getCanvas().toBlob(
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

                                    reader.onload = function (event) {
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



                }}/>*/
            /*<button className="favorite styled"
                    type="button"
                    onClick={
                        () =>
                        {console.log("clicj");
                            setState({playerTurn: state.playerTurn === true ? false : true})}}>
                Add to favorites
            </button>*/
    );
};


export default Game

/*
ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
 */