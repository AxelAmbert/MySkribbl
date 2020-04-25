import ReactDOM from "react-dom";
import React from "react"
const AWS_URL = "http://appskr-env.eba-ufuzuuq8.us-east-1.elasticbeanstalk.com";

class Menu extends React.Component
{

    constructor(props)
    {
        super(props);
        this.state = {
            joinRoomText: "",
            newRoomText: "",
        };
    }


    newRoomCallback(result)
    {
        if (result.success === true) {
            this.props.history.push(`/game?roomName=${result.roomName}`);
        } else {
            alert(`Something went wrong : ${result.error}`)
        }
    }

    joinRoomCallback(result)
    {
        console.log("res ", result);
        if (result.success === true) {
            this.props.history.push(`/game?roomName=${result.roomName}`);
        } else {
            alert(`Something went wrong : ${result.error}`)
        }
    }

    newRoom ()
    {

        if (this.state.newRoomText.length === 0) {
            alert("Please enter a roomName");
            return;
        }

        fetch(`${AWS_URL}/newroom/${this.state.newRoomText}/`, {mode: 'no-cors'})
            .then(res => res.json())
            .then(this.newRoomCallback.bind(this));
    };

    joinRoom()
    {
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

    }

    render() {

        const elements = (

            <div>

            <input class="myButton" placeholder="Enter new room name name" onChange={(value) => this.setState({newRoomText: value.target.value})} />
            <input name="Submit"  type="submit" onClick={this.newRoom.bind(this)} />



        <input class="myButton" id="joinRoomName" placeholder="Enter existing room name" onChange={(value) => this.setState({joinRoomText: value.target.value})} />
            <input name="Submit"  type="submit" onClick={this.joinRoom.bind(this)} />
            </div>

    );
        return (
            elements
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