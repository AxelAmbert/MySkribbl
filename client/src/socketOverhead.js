import socketIOClient from "socket.io-client";
import {AWS_URL} from "./constants";

export default class SocketOverhead {
    constructor() {
        this.socket = socketIOClient(AWS_URL, {reconnect: true});
        this.mode = "IDLE";
    }
}