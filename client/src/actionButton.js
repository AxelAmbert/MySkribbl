
import React from 'react';
import { Button } from '@material-ui/core';

const ActionButton = (props)  => {
        return (
            <Button onClick={props.trigger} disableElevation={false}>
                {props.img}
            </Button>
        );
};

export default ActionButton;