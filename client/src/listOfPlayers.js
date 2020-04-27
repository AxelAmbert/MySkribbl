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
    nospace :{
        'vertical-align' : 'top'
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

    const [state, setState] = useState({
        numberOfPlayers: 0,
        playersInfos: props.playersInfos,
    });

    props.playersInfos.forEach((player) => {
        players.push(<PlayerCard playerName={player.name} playerScore={player.score}/>);
    });


    //if ()
    return (
        <div >
            <img src={looserTop} alt="Logo" className={classes.nospace}/>
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