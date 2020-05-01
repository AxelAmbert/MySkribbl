import React from 'react';
import {Button} from '@material-ui/core';
import useTheme from "@material-ui/core/styles/useTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";




const ActionButton = (props) => {
    const useStyles = makeStyles((theme) => ({
        imageMaxSize: {
            "max-width": props.img.props.width,
            "max-height": props.img.props.height,
        }
    }));
    let classes = useStyles();
    const theme = useTheme();
    return (
        <Button onClick={props.trigger} disableElevation={false} className={classes.imageMaxSize}>
            {props.img}
        </Button>
    );
};

export default ActionButton;