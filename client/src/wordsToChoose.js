import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import React from "react";
import "./index.css";

const WordsToChoose = (props) => {

    const wordone = props.words[0] || "";
    const wordtwo = props.words[1] || "";
    const wordthree = props.words[2] || "";

    const elements = [ <div className={"papersdiv"}>
        <Box mr={3}>
            <Button onClick={() => props.trigger(wordone)}>
                <Paper className={"papers"}>
                    {wordone}
                </Paper>
            </Button>
        </Box>
        <Box mr={3}>
            <Button onClick={() => props.trigger(wordtwo)}>
                <Paper className={"papers"}>
                    {wordtwo}
                </Paper>
            </Button>
        </Box>
        <Box mr={3}>
            <Button onClick={() => props.trigger(wordthree)}>
                <Paper className={"papers"}>
                    {wordthree}
                </Paper>
            </Button>
        </Box>
    </div>,
        <div className={"chooseWord"}>

        </div>,
    ];

    return (
        props.display ? elements : null
    );

};

export default WordsToChoose;