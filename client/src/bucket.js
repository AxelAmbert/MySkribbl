import "./constants";
import {BUCKET} from "./constants";

class Bucket {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.i = BUCKET;
    }
}

export default Bucket;