import React, {useEffect, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import "./css/menu.css";
import Button from "@material-ui/core/Button";
import {useAlert} from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'universal-cookie';
import {useHistory} from "react-router-dom";

const NewMenu = (props) => {

    const notify = (text, id) => {
        toast.error(text, {
            position: toast.POSITION.BOTTOM_CENTER,
            toastId: id,
        });
    };
    let elements = [];
    let textFields = [];
    const cookies = new Cookies();
    const history = useHistory();
    const [state, setState] = useState({
        actualCase: "Sign In",
    });


    const storeTokeAndGo = (token) => {
        let currentDate = new Date();

        currentDate.setDate(currentDate.getDate() + 3);
        console.log(currentDate, token);
        cookies.set("skr-auth-token", token, {path: "/", expires: currentDate});
        history.push({
            pathname: '/mainPage',
        });
    };

    const handleSignResponse = (URL) => {

        fetch(URL, {
            method: "POST", mode: 'cors', body: JSON.stringify(prepareBody()), headers: {
                "Content-Type": "application/json"
            },
        }).then(res => res.status === 429 ? res : res.json()).then((res) => {
            console.log(res);
            if (res.status === 429) {
                notify("WOW chill ! Too much requests, try again later ❤", "chill")
            } else if (res.success === true && res.token && res.token != undefined) {
                notify("Sign up successfull :)", "signsucess");
                storeTokeAndGo(res.token);
                console.log(res.data);
            } else {
                notify(res.error + " :(", "notcool");
                console.log(res.error);
            }
        });
    };


    const prepareBody = () => {
        let textFieldCopy = Object.assign({}, textFields);

        for (const i in textFieldCopy) {
            textFieldCopy[i.toLowerCase()] = textFieldCopy[i];
            delete textFieldCopy[i];
        }
        return (textFieldCopy);
    };

    const initTextField = () => {
        let internalError = false;

        cases[state.actualCase].field.forEach((value) => {
            const textField = document.querySelector(`#${value.text.replace(/\s/g, '')}`);

            if (textField) {
                textFields[value.text] = textField.value;
            } else if (!internalError) {
                notify(`INTERNAL ERROR - VALUE ${value.text.toUpperCase()} IS MISING !`, "missing");
                internalError = true;
            }
        });
        return (internalError);
    };

    const verifSignUp = () => {
        let internalError = initTextField();

        if (internalError)
            return;
        if (textFields["Username"].length < 6) {
            return (notify("Username should have a minimum length of 6", "usrlen"));
        } else if (textFields["Email"].indexOf("@") <= 0) {
            return (notify("Invalid email.", "invalidmail"));
        } else if (textFields["Password"].length < 6) {
            return (notify("Password is too short, should be 6 characters min.", "passlen"))
        } else if (textFields["Password"] !== textFields["Confirm Password"]) {
            return (notify("Passwords don't match.", "pwdmatch"))
        }
        console.log(prepareBody());
        console.log(JSON.stringify(prepareBody()));
        handleSignResponse("/api/v1/user");
    };

    const verifSignIn = () => {
        let internalError = initTextField();

        if (internalError)
            return;
        if (textFields["Username"].length === 0 || textFields["Password"].length === 0) {
            return (notify("Please fill the two fields.", "twofield"));
        }
        handleSignResponse("/api/v1/user/connect");
    };

    const cases = {
        "Sign Up": {
            field: [{text: "Username", sensitive: false}, {text: "Email", sensitive: false}, {
                text: "Password",
                sensitive: true
            }, {text: "Confirm Password", sensitive: true},],
            verifFunc: verifSignUp,
            changeCasesLink: "Already have an account ? Sign In",
            boxSize: [500, 600],
        },
        "Sign In": {
            field: [{text: "Username", sensitive: false}, {text: "Password", sensitive: true},],
            verifFunc: verifSignIn,
            changeCasesLink: "No account ? Sign Up",
            boxSize: [350, 450],
        }
    };


    const switchState = () => {
        cases[state.actualCase].field.forEach((value) => {
            if (value.text.replace(/\s/g, '').toLowerCase().includes("password") ||
                value.text.replace(/\s/g, '').toLowerCase().includes("email")) {
                const textField = document.querySelector(`#${value.text}`);

                if (textField) {
                    textField.value = "";
                }
            }
        });

        setState({
            actualCase: state.actualCase === "Sign In" ? "Sign Up" : "Sign In",
        });
    };


    cases[state.actualCase].field.forEach((value, index) => {
        elements.push(
            <div className={"name-and-textfield"} key={index}>
                <div className={"text"}>
                    {value.text}
                </div>
                <TextField id={value.text.replace(/\s/g, '')} type={value.sensitive ? "password" : ""}
                           variant={'outlined'} onChange={
                    (e) => {
                        textFields[value.text] = e.target.value;
                    }}/>
            </div>
        );
        console.log(value.text)
    });

    return (
        <div className={"main-div"}>
            <div className={`sign-${state.actualCase === "Sign In" ? "in" : "up"}-border`}>
                <div className={"sign-in-stack"}>
                    <div className={"sign-text"}>
                        {state.actualCase}
                    </div>
                    <div className={"form-menu"}>
                        {elements}
                    </div>

                    <Button style={{
                        backgroundColor: "#2980b9",
                    }} variant="contained" size="large" color="primary" className={"sign-button"}
                            onClick={() => cases[state.actualCase].verifFunc()}>
                        {state.actualCase}
                    </Button>
                    <a href="" className="link"
                       onClick={(e) => {
                           e.preventDefault();
                           switchState()
                       }}>{cases[state.actualCase].changeCasesLink}</a>
                </div>
            </div>
            <ToastContainer/>
        </div>
    );
};

export default NewMenu;