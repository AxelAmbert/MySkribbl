import React, {useState, useRef} from 'react';
import GameSocket from "./gameSocket";
import MainCanvas from "./mainCanvas";
import InstructionArray from "./instructionArray";
import ActionButton from "./actionButton";
import paintBrush from "./photorealistic-icons/paint-brush.png";
import paintBucket from "./photorealistic-icons/paint-bucket.png";
import eraser from "./photorealistic-icons/eraser.png";
import trash from "./photorealistic-icons/trash.png";
import goBack from "./photorealistic-icons/aze.png"
/* COLORS */

import black from "./photorealistic-icons/000000.png";
import blue from "./photorealistic-icons/00FFFF.png";
import purple from "./photorealistic-icons/5500FF.png";
import softpink from "./photorealistic-icons/CC99FF.png";
import shinypink from "./photorealistic-icons/FF00FF.png";
import orange from "./photorealistic-icons/FF9900.png";

/* STROKES */
import stroke1 from "./photorealistic-icons/stroke1.png";
import stroke2 from "./photorealistic-icons/stroke2.png";
import stroke3 from "./photorealistic-icons/stroke3.png";
import stroke4 from "./photorealistic-icons/stroke4.png";



import './index.css';
import {AWS_URL, BUCKET, PAINT} from "./constants";
import imageCompression from 'browser-image-compression';
import Compressor from 'compressorjs';
import axios from 'axios';
import Chat from "./chat";
import ListOfPlayers from "./listOfPlayers";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import WordsToChoose from "./wordsToChoose";
import ChangeColor from "./changeColor";
import { useLocation, useHistory } from "react-router-dom";
import clearCanvas from "./clearCanvas";
import ChangeStrokeSize from "./changeStroke";
import GoBack from "./goBack";

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
        "letter-spacing": "3px",
        "background-color": "#363636",
        "color": "white",
        display: "flex",
        "justify-content": "center",
        "font-size": "24px",
        "margin": "0px",
        "padding": "0px",
    },
}));

function usePrevious(value) {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();

    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes

    // Return previous value (happens before update in useEffect above)
    return ref.current;
}


const Game = (props) => {
    console.log(props);
    const history = useHistory();
    const location = useLocation();
    const classes = useStyles();
    let changeSelectedActionCanvasWrapper = _ => {
    };
    let gameServerInstruction = null;
    let messageServerInstruction = null;
    let canvasRef = null;
    let startGameButton = "";

    const [state, setState] = useState({
        playerSecretID: location.playerSecretID,
        playerTurn: false,
        gameNotStartedYet: true,
        chooseWordState: false,
        leader: false,
        playerSecret: "not-logged",
        wordsToChoose: [],
        chatMessages: [],
        playersInfos: [],
        socket: null,
        instructionArray: new InstructionArray(),
        wordToGuess: "",
        roomName: location.state.roomName,
        playerName: location.state.playerName,
        looserMusic: new Audio("/sound/ohshiet.mp3"),
        musicPlaying: false,
        inBetweenRound: false,
        locationKeys: [],
    });

    const prevState = usePrevious(state);

    const customSetState = (valuesToChange) => {
        setState(prevState => {
            return ({...prevState, ...valuesToChange});
        });
    };

    const playLooserMusic = () => {
        if (state.musicPlaying === false) {
            state.looserMusic.play();
            customSetState({musicPlaying: true});
        }
    };

    const stopLooserMusic = () => {
        if (state.musicPlaying) {
            state.looserMusic.pause();
            state.looserMusic.currentTime = 0;
        }
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
        setState((prev) => {
            prev.playerTurn = false;
            return (prev);
        });
    };

    const setHistoryListeners = () => {
        history.listen((location) => {
            if (history.action === 'PUSH') {
                console.log("PUSH");
                customSetState({locationKeys: [location.key]});
            }

            if (history.action === 'POP') {
                if (state.socket) {
                    state.socket.endConnection();
                    delete state.socket;
                    customSetState({socket: null});
                }
                if (canvasRef) {
                    canvasRef.end();
                }
                console.log("POP !");

            }
        });
    };

    useEffect(() => {
        setHistoryListeners();
        if (prevState && state && prevState.inBetweenRound === false && state.inBetweenRound === true && canvasRef !== null) {
            console.log("OUI LETS GO!");
            canvasRef.clear();
            canvasRef.clearSaves();
            customSetState({inBetweenRound: false});
            return;
        }
        changeSelectedActionCanvasWrapper = canvasRef.changeSelectedAction.bind(canvasRef);
        gameServerInstruction = [canvasRef.drawPixel.bind(canvasRef),
            canvasRef.bucketWrapper.bind(canvasRef),
            canvasRef.changeColorWrapper.bind(canvasRef),
            canvasRef.clear.bind(canvasRef),
            canvasRef.changeStrokeSizeWrapper.bind(canvasRef),
            canvasRef.triggerSave.bind(canvasRef),
            canvasRef.goBack.bind(canvasRef)];
        messageServerInstruction = {
            "newPlayerTurn": () => {
                handleNewPlayerTurn();
            },
            "chooseAWord": canvasRef.clear.bind(canvasRef),
            "waitBeforeDraw": canvasRef.clear.bind(canvasRef),
        };
        if (!state.socket) {
            customSetState({socket: new GameSocket(callbackCaller, props.socket, state.instructionArray, gameServerInstruction, messageServerInstruction)});

        } else if (!state.socket.isSetup) {
            state.socket.setupSocket(`roomName=${state.roomName}&playerSecretID=${state.playerSecretID}&mode=game`);
        }
        if (state.gameNotStartedYet && state.leader) {
            startGameButton =
                <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>}
                              trigger={() => {
                                  state.socket.startGame();
                              }}/>;
        }
        return (() => {
           console.log("CLEANUP !");
        });
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
            <ListOfPlayers playersInfos={state.playersInfos} me={state.playerName}  music={{play: () => playLooserMusic(), stop: () => stopLooserMusic()}}/>,
            <div className={classes.canvasGrid}>
                <p className={classes.wordToGuess}> {state.wordToGuess} </p>
                <div className={"canvasGuessWordContainer"}>
                    <WordsToChoose words={state.wordsToChoose} display={state.chooseWordState} trigger={(word) => {state.socket.chooseWord(word)}}/>
                    <MainCanvas ref={ref => canvasRef = ref} blocked={!state.playerTurn} instructionArray={state.instructionArray}/>
                </div>
                <div className={classes.actionButtonsGrid}>
                    <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>} trigger={() => {
                        changeSelectedActionCanvasWrapper(PAINT)
                    }}/>
                    <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>} trigger={() => {
                        changeSelectedActionCanvasWrapper(BUCKET)
                    }}/>
                    <ActionButton img={<img src={eraser} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeColor("#FFFFFF");
                        state.instructionArray.array.push(new ChangeColor("#FFFFFF"));
                    }}/>
                    <ActionButton img={<img src={trash} alt="Logo" width={75} height={75}/>} trigger={() => {
                        if (state.playerTurn === true) {
                            canvasRef.clear(true);
                            state.instructionArray.array.push(new clearCanvas());
                            state.instructionArray.goFlag = true;
                        }
                    }}/>
                    <ActionButton img={<img src={goBack} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.goBack();
                        state.instructionArray.array.push(new GoBack());
                        state.instructionArray.goFlag = true;
                    }}/>
                    {startGameButton}
                </div>
                <div className={classes.actionButtonsGrid}>
                    <ActionButton img={<img src={black} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeColor("#000000");
                        state.instructionArray.array.push(new ChangeColor("#000000"));
                    }}/>
                    <ActionButton img={<img src={blue} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeColor("#00FFFF");
                        state.instructionArray.array.push(new ChangeColor("#00FFFF"));
                    }}/>
                    <ActionButton img={<img src={purple} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeColor("#5500FF");
                        state.instructionArray.array.push(new ChangeColor("#5500FF"));
                    }}/>
                    <ActionButton img={<img src={softpink} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeColor("#CC99FF");
                        state.instructionArray.array.push(new ChangeColor("#CC99FF"));
                    }}/>
                    <ActionButton img={<img src={shinypink} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeColor("#FF00FF");
                        state.instructionArray.array.push(new ChangeColor("#FF00FF"));
                    }}/>
                    <ActionButton img={<img src={orange} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeColor("#FF9900");
                        state.instructionArray.array.push(new ChangeColor("#FF9900"));
                    }}/>

                </div>
                <div className={classes.actionButtonsGrid}>
                    <ActionButton img={<img src={stroke1} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeStrokeSize(1);
                        state.instructionArray.array.push(new ChangeStrokeSize(1));
                    }}/>
                    <ActionButton img={<img src={stroke2} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeStrokeSize(5);
                        state.instructionArray.array.push(new ChangeStrokeSize(5));
                    }}/>
                    <ActionButton img={<img src={stroke3} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeStrokeSize(10);
                        state.instructionArray.array.push(new ChangeStrokeSize(10));
                    }}/>
                    <ActionButton img={<img src={stroke4} alt="Logo" width={75} height={75}/>} trigger={() => {
                        canvasRef.changeStrokeSize(15);
                        state.instructionArray.array.push(new ChangeStrokeSize(15));
                    }}/>
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