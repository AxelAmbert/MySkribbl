import React, {useState} from 'react';
import {Card, CardContent} from '@material-ui/core';
import makeStyles from "@material-ui/core/styles/makeStyles";
import useTheme from "@material-ui/core/styles/useTheme";
import CardMedia from "@material-ui/core/CardMedia";
import orange from "./images/Sans titre.png";
import Grid from "@material-ui/core/Grid";
import greatBackground from "./images/fondplayers.png";
import winnerTop from "./images/tops/winnertop.gif";
import looserTop from "./images/tops/loosertop.gif";
import mehTop from "./images/tops/mehtop.gif";
import PlayerCard from "./playerCard";

const useStyles = makeStyles((theme) => ({
    child: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    nospace: {
        'vertical-align': 'top'
    },
    image: {
        position: "relative",
    },
    gridContainer: {
        display: "grid",
        "grid-auto-flow": "row",
        "grid-row-gap": "10px",
    },
}));


const ListOfPlayers = (props) => {

    const classes = useStyles();
    const theme = useTheme();
    let players = [];
    let worstScore = 10000000;
    let bestscore = -1;
    let mePlayer = null;
    let topImage = mehTop;
    let someoneHasScore = false;
    let someoneHasFound = false;
    let numberOfPlayerThatGuessed = 0;

    const [state, setState] = useState({
        oldNbOfPlayerThatGuessed: 0,
        triggerNewPlayerFoundSound: false,
        audio: new Audio("/sound/oui.mp3"),
    });

    if (state.triggerNewPlayerFoundSound) {
        console.log("play !");
        state.audio.currentTime = 0;
        state.audio.play();
        setState((prevState => {
            return ({
                ...prevState,
                triggerNewPlayerFoundSound: false,
            });
        }));
    }

    props.playersInfos.forEach((player) => {
        if (worstScore > player.score)
            worstScore = player.score;
        if (bestscore < player.score)
            bestscore = player.score;
        if (player.score != 0)
            someoneHasScore = true;
        if (player.hasFoundWord === true)
            numberOfPlayerThatGuessed++;
        if (player.name === props.me) {
            mePlayer = player;
        }
    });
    if (numberOfPlayerThatGuessed !== state.oldNbOfPlayerThatGuessed) {
        setState((prevState => {
            return ({
                ...prevState,
                oldNbOfPlayerThatGuessed: numberOfPlayerThatGuessed,
                triggerNewPlayerFoundSound: true,
            });
        }));
    }else {
    }
    props.playersInfos.forEach((player) => {
        players.push(<PlayerCard playerName={player.name} playerScore={player.score}
                                 hasFoundWord={player.hasFoundWord}/>);
    });
    if (props.music) {
        if (mePlayer)
        if (mePlayer && mePlayer.score === worstScore) {
            topImage = looserTop;
            if (someoneHasScore && numberOfPlayerThatGuessed === 0) {
                props.music.play();
            }
        } else if (mePlayer && mePlayer.score === bestscore) {
            topImage = winnerTop;
            props.music.stop();
        } else {
            props.music.stop();
        }
    }

    //if ()
    return (
        <div>
            <img src={topImage} alt="Logo" className={classes.nospace}/>
            <div className={classes.image}>
                <img src={greatBackground} alt="Logo"/>
                <Grid container direction={"column"} className={`${classes.gridContainer} ${classes.child}`}>
                    {players}
                </Grid>
            </div>
        </div>
    );

};

export default ListOfPlayers