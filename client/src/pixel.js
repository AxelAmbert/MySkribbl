import {DRAW_PIXEL} from "./constants";

class pixel {
    constructor(x, y, oldX, oldY, timeout) {
        this.ox = oldX;
        this.oy = oldY;
        this.x = x;
        this.y = y;
        this.tm = timeout;
        this.i = DRAW_PIXEL;//INSTRUCTION
    }
}

export default pixel;