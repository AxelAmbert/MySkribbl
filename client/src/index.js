import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Route, Switch, Miss} from "react-router-dom";
import Game from "./game"

import Menu from "./menu";


const App = () => {
    return (
        <Router>
            <Switch>
                <Route exact path={"/"} component={Menu}/>
                <Route path={"/game"}><Game /></Route>
             </Switch>
        </Router>
    );
};

ReactDOM.render(
    <App/>,
    document.getElementById("root")
);

export default App;