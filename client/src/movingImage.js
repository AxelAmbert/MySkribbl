import React from "react";
import player from "./images/Sans titre.png";
import Image from "react-bootstrap/Image";
import "./css/movingImage.css";

class MovingImage extends React.Component {

    constructor() {
        super();
        this.ref = null;
    }

    componentDidMount() {
        if (!this.ref)
            return;
        var ctx = this.ref.getContext("2d");
        ctx.beginPath();
        ctx.rect(0, 0, 200, 200);
        ctx.fillStyle = "green";
        ctx.fill();
    }

    render() {
        return (
            <div>
                <canvas width={200} height={200} ref={(ref) => {this.ref = ref}} style={{borderRadius: "30px",}}/>
            </div>
        );
    }
};

export default MovingImage;