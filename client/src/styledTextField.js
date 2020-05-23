import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import React from "react";

const styles = {
    root: {
        "&$focusedLabel": {
            color: "cyan"
        },
        '& label.Mui-focused': {
            color: 'white',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: 'yellow',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'white',
            },
            '&:hover fieldset': {
                borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'white',
            },
        },
        '& .MuiInputLabel-root': {
            color: "white",
        },
    },
    input: {
        color: "white"
    }
};

function StyledTextField(props) {
    const { classes } = props;
    const {onChange} = props;

    const handleOnChange = (e) => {
        if (onChange) {
            console.log(" GO ! ", e.target.value);
            onChange(e.target.value);
        }
    };

    return (
        <TextField
            variant={"outlined"}
            label={"Room name"}
            onChange={handleOnChange}
            className={classes.root}
            InputProps={{
                className: classes.input
            }}
        />
    );
}

StyledTextField.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(StyledTextField);