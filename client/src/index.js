import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Route, Switch, Miss} from "react-router-dom";
import Game from "./game"
import NewMenu from "./newMenu";
import Menu from "./menu";
import ConnectionValidation from "./connectionValidation";

const App = () => {

    return (
        <Router>
            <Switch>
                <Route exact path={"/"} component={ConnectionValidation}/>
                <Route path={"/connection"} component={NewMenu}/>
                <Route path={"/game"} component={Game} />
                <Route mainPage={"/mainPage"} component={Menu}/>
             </Switch>
        </Router>
    );
};

ReactDOM.render(
    <App/>,
    document.getElementById("root")
);

export default App;