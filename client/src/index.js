import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Route, Switch, Miss} from "react-router-dom";
import Game from "./game"
import NewMenu from "./newMenu";
import Menu from "./menu";
import ConnectionValidation from "./connectionValidation";
import socketIOClient from "socket.io-client";
import {AWS_URL} from "./constants";
import MainPage from "./mainPage";
import SocketOverhead from "./socketOverhead";

class App extends React.Component{

    constructor() {
        super();
        this.socket = new SocketOverhead();
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path={"/"} component={ConnectionValidation}/>
                    <Route path={"/connection"}  component={NewMenu}/>
                    <Route path={"/game"}  render={(props) => <Game socket={this.socket} {...props} />}/>
                    <Route path={"/mainPage"}  render={(props) => <MainPage socket={this.socket} {...props} />}/>
                </Switch>
            </Router>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById("root")
);

export default App;