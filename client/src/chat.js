import * as React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import paintBucket from "./photorealistic-icons/paint-bucket.png";
import makeStyles from "@material-ui/core/styles/makeStyles";
import useTheme from "@material-ui/core/styles/useTheme";
import {useState} from "react";
import ChatTextField from "./chatTextField";
import { useRef, useEffect } from 'react';

const useStyles = makeStyles((theme) => ({
    main: {
        "max-height": "300px",
        overflow: 'auto',
        height: "100%",
        "overflow-x": "disabled",
        "word-wrap": "break-word",

    },
    abs: {
        "position": "absolute",
        "bottom": "0",
    },
    text: {
        dense: true
    },
    summary: {
        overflow: 'hidden',
    },

    blackText: {
        color: "black"
    },
    greenText: {
        color: "green"
    },
}));


const Chat = (props) => {
    const classes = useStyles();
    const theme = useTheme();
    const messages = [];

    const listRef = useRef(null);

    useEffect(() => {
        console.log("go use");
        listRef.current.scrollTo(0, 10000);
    });

    props.chatMessages.forEach((messageObj, index) => {

        let message = "";
        if (index === props.chatMessages.length - 1) {
            message =
                <ListItem autoFocus={true}>
                    <ListItemIcon>
                        <img src={paintBucket} alt="Logo" width={30} height={30}/>
                    </ListItemIcon>
                    <ListItemText className={classes[messageObj.color + "Text"]} primary={messageObj.text}/>
                </ListItem>;
        } else {

            message =
                <ListItem>
                    <ListItemIcon>
                        <img src={paintBucket} alt="Logo" width={30} height={30}/>
                    </ListItemIcon>
                    <ListItemText className={classes[messageObj.color + "Text"]} primary={messageObj.text}/>
                </ListItem>;
        }
        messages.push(message);
    });
    return (

        <div className={classes.abs}>
            <List className={classes.main} disablePadding={true}  ref={listRef}>
                {messages}
            </List>
            <ChatTextField  sendMessageTrigger={props.sendMessageTrigger}/>,
        </div>

    );
};

export default Chat;