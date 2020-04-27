import React, {useState} from 'react';
import {Card, CardContent} from '@material-ui/core';
import makeStyles from "@material-ui/core/styles/makeStyles";
import useTheme from "@material-ui/core/styles/useTheme";
import CardMedia from "@material-ui/core/CardMedia";
import orange from "./images/Sans titre.png";
import Grid from "@material-ui/core/Grid";

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
        maxHeight: 100
    },
    media: {

        height: 0,
        paddingTop: '56.25%', // 16:9
    },
}));


const PlayerCard = (props) => {

    const classes = useStyles();
    const theme = useTheme();

    const [state, setState] = useState({
        numberOfPoint: 0
    });

    return (
        <Card className={classes.mainCard}>
            <div className={classes.container}>
                <CardMedia
                    className={classes.image}
                    src={orange} component="img"
                    title="Live from space album cover">
                </CardMedia>
                <Grid container direction={"column"}>
                    <CardContent className={classes.testC}>
                        {props.playerName}
                    </CardContent>
                    <CardContent className={classes.testC}>
                        {props.playerScore} points
                    </CardContent>
                </Grid>
            </div>
        </Card>
    );

};

export default PlayerCard