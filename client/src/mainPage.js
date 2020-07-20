import React, {Fragment, useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/mainPage.css";
import player from "./images/Sans titre.png";
import logout from "./images/logout.png";
import Image from 'react-bootstrap/Image'
import Button from "@material-ui/core/Button";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import MovingImage from "./movingImage";
import MenuItem from "@material-ui/core/MenuItem";
import StyledTextField from "./styledTextField";
import StyledSelect from "./styledSelect";
import Cookies from 'universal-cookie';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useHistory} from "react-router-dom";


const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: 0,
    slidesPerRow: 3,
    arrows: false,
};




const MainPage = (props) => {
    console.log(props);
    const infos = props.location.customNameData;
    const cookies = new Cookies();
    const history = useHistory();
    const [state, setState] = useState({
        roomName: "",
        playerSecretID: "",
    });

    const customSetState = (toChange) => {
        setState((prevState) => {return ({...prevState, ...toChange})});
    };

    const handleChangeModeAnswer = (data) => {
        console.log("oui ", data.playerSecretID);
        props.socket.mode = "mainPage";
        customSetState({playerSecretID: data.playerSecretID});
    }


    if (props.socket.mode !== "mainPage") {
        console.log(props);
        props.socket.socket.removeAllListeners("changeModeAnswer");
        props.socket.socket.on("changeModeAnswer", handleChangeModeAnswer);
        props.socket.socket.emit("changeMode", {mode: "mainPage", data: {token: cookies.get("skr-auth-token")}});
    }

    const notify = (text, id) => {
        toast.error(text, {
            position: toast.POSITION.BOTTOM_CENTER,
            toastId: id,
        });
    };

    const roomCallback = (result) => {
        if (result.success === true) {
            history.push( {
                pathname: '/game',
                //search: `?roomName=${result.roomName}`,
                state: { roomName: result.roomName,
                    playerName: String(Math. round((new Date()). getTime() / 1000)),
                    playerSecretID: state.playerSecretID,
                }
            });
        } else {
            notify(`Something went wrong : ${result.error}`, "wentWrong");
        }
    };

    const newRoom = () => {
        console.log("state", state);
        if (state.roomName.length === 0 || state.roomName.length < 3)
            return (notify("Please enter a roomName (3 letters min)", "roomName"))
        else if (!state.playerSecretID)
            return (notify("No secret ID found"));
        console.log("ici");
        const token = cookies.get("skr-auth-token");

        fetch(`/api/v1/room/new/${state.roomName}/${state.playerSecretID}`, {method: "POST", mode: 'no-cors', headers: {
                'Authorization': "Bearer " + token
            }})
            .then(res => {
                console.log("la reponse", res);
                return (res.json())})
            .then(res => roomCallback(res));
    };

    const joinRoom = () => {
        if (state.roomName.length === 0 || state.roomName.length < 3)
            return (notify("Please enter a roomName (3 letters min)", "roomName"))
        else if (!state.playerSecretID)
            return (notify("No secret ID found"));

        const token = cookies.get("skr-auth-token");

        fetch(`/api/v1/room/join/${state.roomName}/${state.playerSecretID}`, {method: "POST", mode: 'no-cors', headers: {
                'Authorization': "Bearer " + token
            }})
            .then((res) => {
                return (res.json())
            })
            .then(res => roomCallback(res));
    };




    return (
        <div className={"mainDiv"}>
            <elements>
                <mainPanel>
                    <div className={"topPanel"}>
                        <topPanelElements>
                            <Button style={{padding: "0 0 0 0",
                                margin: "0 0 0 0",
                                "justifyContent": "left",
                                "maxWidth": "25",
                                "maxHeight": "25px",
                                "minWidth": "0",
                            }}>
                                <Image src={logout} style={{"maxWidth": "25px", "maxHeight": "25px"}}/>
                            </Button>
                        </topPanelElements>
                    </div>
                    <div className={"bottomPanel"}>
                        <div className={"gamePanel"}>
                            <text> Game Center </text>
                            <div className={"textField"}>
                                <StyledTextField onChange={(value) => {customSetState({roomName: value})}}/>
                            </div>
                            <StyledSelect labelId="demo-simple-select-label" id="demo-simple-select" value={"Public"} onChange={() => {}} style={{width: "30%", "margin-left": "50%", transform: "translateX(-50%)", "margin-top": "5%"}}>
                                <MenuItem value={"Public"}>Public</MenuItem>
                                <MenuItem value={"On invitation"}>On invitation</MenuItem>
                                <MenuItem value={"Friends only"}>Friends only</MenuItem>
                            </StyledSelect>
                            <div className={"buttonDiv"}>
                                <Button variant={"contained"} onClick={newRoom} color={"primary"}>Create</Button>
                                <Button variant={"contained"}  onClick={joinRoom} color={"primary"}>Join</Button>
                            </div>
                        </div>

                        <div className={"slider-div"}>

                            <Slider {...settings}>
                                <div>
                                    <div className={"slider__item"}>
                                        <MovingImage/>
                                    </div>
                                </div>
                                <div>
                                    <div className={"slider__item"}>
                                        <MovingImage/>
                                    </div>
                                </div>
                                <div>
                                    <div className={"slider__item"}>
                                        <MovingImage/>
                                    </div>
                                </div>
                                <div>
                                    <div className={"slider__item"}>
                                        <MovingImage/>
                                    </div>
                                </div>
                                <div>
                                    <div className={"slider__item"}>
                                        <MovingImage/>
                                    </div>
                                </div>
                            </Slider>
                        </div>
                    </div>
                </mainPanel>
                <div className={"rightInfos"}>
                    <div className={"userInfos"}>
                        <Image src={player} roundedCircle className={"dot"}/>
                        <div className={"username"}>
                            {infos.username ? infos.username : "Error"}
                        </div>
                    </div>
                    <div className={"friendDiv"}>
                    </div>
                </div>
            </elements>
            <ToastContainer/>
        </div>
    );
};

export default MainPage;