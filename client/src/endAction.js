import {END_ACTION} from "./constants";

class EndAction {
    constructor(minX, maxX, minY, maxY) {
        this.i = END_ACTION;
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }
}

export default EndAction;