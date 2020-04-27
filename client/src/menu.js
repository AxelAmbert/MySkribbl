import React from "react"
import ActionButton from "./actionButton";
import paintBrush from "./photorealistic-icons/paint-brush.png";
import {BUCKET, PAINT} from "./constants";
import paintBucket from "./photorealistic-icons/paint-bucket.png";
import Grid from '@material-ui/core/Grid';
import Container from "@material-ui/core/Container";
import PlayerCard from "./playerCard";
import ListOfPlayers from "./listOfPlayers";


const AWS_URL = "http://appskr-env.eba-ufuzuuq8.us-east-1.elasticbeanstalk.com";

class Menu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            joinRoomText: "",
            newRoomText: "",
            playersList: [{name: "ok", score: 1003}]
        };
    }


    newRoomCallback(result) {
        if (result.success === true) {
            this.props.history.push(`/game?roomName=${result.roomName}`);
        } else {
            alert(`Something went wrong : ${result.error}`)
        }
    }

    joinRoomCallback(result) {
        console.log("res ", result);
        if (result.success === true) {
            this.props.history.push(`/game?roomName=${result.roomName}`);
        } else {
            alert(`Something went wrong : ${result.error}`)
        }
    }

    newRoom() {

        if (this.state.newRoomText.length === 0) {
            alert("Please enter a roomName");
            return;
        }

        fetch(`${AWS_URL}/newroom/${this.state.newRoomText}/`, {mode: 'no-cors'})
            .then(res => res.json())
            .then(this.newRoomCallback.bind(this));
    };

    joinRoom() {
        console.log("lol");
        if (this.state.joinRoomText.length === 0) {
            alert("Please enter a roomName");
            return;
        }

        fetch(`${AWS_URL}/joinroom/${this.state.joinRoomText}/`, {mode: 'no-cors'})
            .then((res) => {
                console.log(res);
                return (res.json())
            })
            .then(this.joinRoomCallback.bind(this));
    };


    componentDidMount() {
        // 0var ctx = this.canvasRef.getContext("2d");
        //ctx.fillStyle = "#FF0000";
        //ctx.fillRect(0, 0, 800, 600);

    }

    render() {

        const elements = (

            <div>

                <input class="myButton" placeholder="Enter new room name name"
                       onChange={(value) => this.setState({newRoomText: value.target.value})}/>
                <input name="Submit" type="submit" onClick={this.newRoom.bind(this)}/>


                <input class="myButton" id="joinRoomName" placeholder="Enter existing room name"
                       onChange={(value) => this.setState({joinRoomText: value.target.value})}/>
                <input name="Submit" type="submit" onClick={this.joinRoom.bind(this)}/>
            </div>

        );
        return (
            [
                elements,
                <ListOfPlayers playersInfos={this.state.playersList}/>,
                <div style={{width: 800}}>
                    <Grid container wrap={"wrap"}>
                        <Grid item>
                            <canvas id="myCanvas" width="800" height="600" ref={ref => {
                                this.canvasRef = ref;
                            }}>
                                Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
                            </canvas>
                            ,
                        </Grid>
                        <Grid container alignItems="flex-start" justify="flex-end">
                            <Grid item>
                                <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>}/>,
                            </Grid>
                            <Grid item>
                                <ActionButton img={<img src={paintBucket} alt="Logo" width={75} height={75}/>}/>,
                                <ActionButton img={<img src={paintBrush} alt="Logo" width={75} height={75}/>}
                                              trigger={() => {
                                                  this.setState((prev) => {
                                                      return ({
                                                          playersList: [...prev.playersList, {name: "lol", score: 1250}]
                                                      })
                                                  });
                                              }}/>,
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            ]
        );
    }

}


export default Menu

/*
ReactDOM.render(
    <Menu/>,
    document.getElementById('root')
);

 */