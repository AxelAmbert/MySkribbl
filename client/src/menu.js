import React, {useState, useEffect} from "react"
import ActionButton from "./actionButton";
import paintBrush from "./photorealistic-icons/paint-brush.png";
import {BUCKET, PAINT} from "./constants";
import paintBucket from "./photorealistic-icons/paint-bucket.png";
import eraser from "./photorealistic-icons/eraser.png";

/* COLORS */

import black from "./photorealistic-icons/000000.png";
import blue from "./photorealistic-icons/00FFFF.png";
import purple from "./photorealistic-icons/5500FF.png";
import softpink from "./photorealistic-icons/CC99FF.png";
import shinypink from "./photorealistic-icons/FF00FF.png";
import orange from "./photorealistic-icons/FF9900.png";


import Grid from '@material-ui/core/Grid';
import Container from "@material-ui/core/Container";
import PlayerCard from "./playerCard";
import ListOfPlayers from "./listOfPlayers";
import ChatTextField from "./chatTextField";
import Chat from "./chat";
import makeStyles from "@material-ui/core/styles/makeStyles";
import useTheme from "@material-ui/core/styles/useTheme";
import MainCanvas from "./mainCanvas";
import InstructionArray from "./instructionArray";
import "./index.css";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import WordsToChoose from "./wordsToChoose";
import ChangeColor from "./changeColor";
import { useHistory } from "react-router-dom";


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
        "color": "white",
        display: "flex",
        "justify-content": "center",
        "font-size": "24px",
        "margin": "0px",
        "padding": "0px",
    },
    mainMenu: {
        display: "flex",
        width: "100%",
        height: "100%",
        margin: "0 auto",
        "flex-direction": "column",
    },
    subGrid: {
        display: "flex",
        "flex-direction": "row dense",
        "margin-top" : "10px",
        "margin-bottom": "25px",
    },

}));

const AWS_URL = "http://appskr-env.eba-ufuzuuq8.us-east-1.elasticbeanstalk.com";

const Menu = (props) => {

    const history = useHistory();
    const classes = useStyles();
    const theme = useTheme();
    let canvasRef = null;
    const [state, setState] = useState({
        playerName: "",
        joinRoomText: "",
        newRoomText: "",
        playersList: [{name: "ok", score: 1003}],
        instructionArray: new InstructionArray(),
    });

    useEffect(() => {
        /* if (canvasRef) {
             const ctx = canvasRef.getContext("2d");

             ctx.beginPath();
             ctx.rect(0, 0, 800, 600);
             ctx.fillStyle = "blue";
             ctx.fill();
         }*/
    });

    const roomCallback = (result) => {
        if (result.success === true) {
            history.push( {
                pathname: '/game',
                //search: `?roomName=${result.roomName}`,
                state: { roomName: result.roomName,
                         playerName: state.playerName
                }
            });
        } else {
            alert(`Something went wrong : ${result.error}`)
        }
    };


    const newRoom = () => {
        console.log("jpp ", state);

        if (state.newRoomText.length === 0 || state.playerName.length < 6) {
            alert("Please enter a roomName and set a username (6 letters min)");
            return;
        }
       console.log("aft");
        fetch(`${AWS_URL}/newroom/${state.newRoomText}/`, {mode: 'no-cors'})
            .then(res => {
                console.log("res");
                console.log(res);
                return (res.json())})
            .then(res => roomCallback(res));
    };

    const joinRoom = () => {
        if (state.joinRoomText.length === 0 || state.playerName.length < 6) {
            alert("Please enter a roomName and set a username (6 letters min)");
            return;
        }

        fetch(`${AWS_URL}/joinroom/${state.joinRoomText}/${state.playerName}`, {mode: 'no-cors'})
            .then((res) => {
                console.log(res);
                return (res.json())
            })
            .then(res => roomCallback(res));
    };


    const elements = (
        <div className={classes.mainMenu}>

            <div className={classes.subGrid}>
                <input className="myButton" id="joinRoomaName" placeholder="Enter Player Name"
                       onChange={(value) => {
                           const playerName =  value.target.value;
                           setState(
                               (prev) => {
                                   return {...prev, playerName};
                               })
                       }}/>
            </div>

            <div className={classes.subGrid}>
                <input placeholder="Enter new room name name"
                       onChange={(value) => {
                           const newRoomText =  value.target.value;
                           setState(
                               (prev) => {
                                   return {...prev, newRoomText};
                               })
                       }}/>
                <input name="Submit" type="submit" onClick={() => newRoom()}/>
            </div>

            <div className={classes.subGrid}>
                <input id="joinRoomName" placeholder="Enter existing room name"
                       onChange={(value) => {
                           const joinRoomText =  value.target.value;
                           setState(
                               (prev) => {
                                   return {...prev, joinRoomText};
                               })
                       }}/>
                <input name="Submit" type="submit" onClick={() => joinRoom()}/>
            </div>
        </div>

    );

    return (
        [elements, /*
            <div className={classes.mainGrid}>
                <ListOfPlayers playersInfos={state.playersList}/>
                <div className={classes.canvasGrid}>
                    <div className={"canvasGuessWordContainer"}>
                        <WordsToChoose words={["mdr", "lol", "hihi"]} display={false} />
                        <MainCanvas ref={ref => canvasRef = ref} blocked={false}
                                    instructionArray={state.instructionArray} className={classes.mainCanvas}>
                        </MainCanvas>
                    </div>
                    <div className={classes.actionButtonsGrid}>
                        <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>} trigger={() => {
                            canvasRef.changeSelectedAction(PAINT);

                            console.log("go for paint ", PAINT);
                        }}/>
                        <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>} trigger={() => {
                            canvasRef.changeSelectedAction(BUCKET);
                            console.log("go for bucket");

                        }}/>
                        <ActionButton img={<img src={eraser} alt="Logo" width={75} height={75}/>} trigger={() => {
                            canvasRef.changeColor("#FFFFFF");
                            console.log("go for bucket");

                        }}/>

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
                </div>
                <div className={classes.chatGrid}>
                    <Chat chatMessages={[{text: "ax", color: "green"}]}/>
                </div>
            </div>*/
        ]
    );
};


export default Menu

/*
ReactDOM.render(
    <Menu/>,
    document.getElementById('root')
);

 */