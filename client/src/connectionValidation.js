import React, {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import {useHistory} from "react-router-dom";


const ConnectionValidation = () => {
    const cookies = new Cookies();
    const token = cookies.get("skr-auth-token");
    const history = useHistory();


    console.log(token);
    if (token === undefined || token === "undefined" || !token) {
        console.log("direct co");
        history.push("/connection");
        return (null);
    }

    console.log("the token ", token);
    console.log("whaaaaaaaaat ", typeof token, " ?? ? ", !token);
    fetch("/api/v1/user/verifyTokenValidity", {
        method: "POST", mode: 'cors', body: JSON.stringify({token: token}), headers: {
            "Content-Type": "application/json"
        },
    }).then(res => res.json()).then((res) => {
        console.log("res ? ", res);
        if (res.token && res.data && res.data.infos) {
            console.log("data ?")
            cookies.set("skr-auth-token", res.token);
            history.push({
                pathname: '/mainPage',
                customNameData: res.data.infos,
            });
        } else {
            history.push("/connection");
        }
    });
    return (null);
};

export default ConnectionValidation;