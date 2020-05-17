import {CHANGE_COLOR, CHANGE_STROKE_SIZE, CLEAR} from "./constants";


class BinaryProtocol {
    constructor() {

    }

    UselessActionsEpuration(arrayToEpurate) {
        let lastColorChange = -1;
        let lastStrokeChange = -1;
        let lastClear = 0;


        arrayToEpurate.forEach((instruction, index) => {
            if (instruction.i === CLEAR) {
                lastClear = index;
            } else if (instruction.i === CHANGE_STROKE_SIZE) {
                lastStrokeChange = index;
            } else if (instruction.i === CHANGE_COLOR) {
                lastColorChange = index;
            }
        });
        if (lastClear === 0)
            return;
        let lastColorObj = lastColorChange === -1 ? null : arrayToEpurate[lastColorChange];
        let lastStrokeObj = lastStrokeChange === -1 ? null : arrayToEpurate[lastStrokeChange];


    }

    NetworkProtocolToBinary(listOfActions) {
        let startIndex = 0;
        listOfActions = [].concat.apply([], listOfActions);


    }

    BinaryToNetworkProtocol() {

    }
}

export default BinaryProtocol;