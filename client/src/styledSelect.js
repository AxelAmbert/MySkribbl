import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import React, {useState} from "react";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";

const styles = theme => ({
    select: {
        color: "white",
        '&:before': {
            color: "white",
            borderColor: "white",
        },
        '&:after': {
            color: "white",
            borderColor: "white",
        },
    },
    icon: {
        fill: "white",
    },

});


function StyledSelect(props) {

    const {classes} = props;
    const {children} = props;
    const {onChange} = props;

    const [state, setState] = useState({
        choosenValue: "Public",
    });

    const handleChangeValue = (event) => {
        setState({
           choosenValue: event.target.value,
        });
        if (onChange) {
            onChange(event.target.value);
        }
    };

    return (
        <Select   className={classes.select}  inputProps={{classes:{icon: classes.icon,},}} labelId="demo-simple-select-label" id="demo-simple-select" value={state.choosenValue} onChange={handleChangeValue} style={{width: "30%", "margin-left": "50%", transform: "translateX(-50%)", "margin-top": "5%"}}>
            {children}
        </Select>
    );
}

StyledSelect.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(StyledSelect);