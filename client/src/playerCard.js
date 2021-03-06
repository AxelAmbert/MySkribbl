import React, {useState} from 'react';
import {Card, CardContent} from '@material-ui/core';
import makeStyles from "@material-ui/core/styles/makeStyles";
import useTheme from "@material-ui/core/styles/useTheme";
import CardMedia from "@material-ui/core/CardMedia";
import orange from "./images/Sans titre.png";
import Grid from "@material-ui/core/Grid";
import draw from "./photorealistic-icons/paint-brush.png";

const useStyles = makeStyles((theme) => ({

    mainCard: {
        maxWidth: 300

    },
    center: {
        "text-align": "center",
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        "text-align": "center",
    },
    testC: {
        //"align-items": "right",
        margin: "auto",
        "font-weight": "bold",
    },
    image: {
        "border-style": "solid",
        "border-width": "3px",
        maxWidth: 100,
        maxHeight: 100,
        margin: "0",
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    hasFoundWord: {
      background: "green",
    },
    textGrid: {
      display: "flex",
      "flex-direction": "column",
        margin: "0 auto",
        "overflow-wrap" : "break-word",
    },
}));


const PlayerCard = (props) => {

    const classes = useStyles();
    const theme = useTheme();
    const color = props.hasFoundWord ? ` ${classes.hasFoundWord}` : "";
    let playerName = props.playerName;

    const [state, setState] = useState({
        numberOfPoint: 0
    });

    if (props.playerName.length > 20) {
      playerName = props.playerName.substring(0, 20);
    }
    return (
        <Card className={classes.mainCard}>
            <div className={`${classes.container}${color}`}>
                <CardMedia
                    className={classes.image}
                    src={orange} component="img"
                    title="Live from space album cover">
                </CardMedia>
                <div className={classes.textGrid}>
                    <CardContent className={classes.testC}>
                        {playerName}
                    </CardContent>
                    <CardContent className={classes.testC}>
                        {props.playerScore} points
                    </CardContent>
                    {props.isDrawing ? <CardMedia src={draw}/> : ""}
                </div>
            </div>
        </Card>
    );

};

export default PlayerCard