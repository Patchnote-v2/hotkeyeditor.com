import { simpleKeyboardKeyNames } from './keyNames.js';

var Utils = {
/*
    Used to construct a consistent dataset from an event.
    HTMLElement.dataset is a DOMStringMap, meaning that all values are cast into strings.
    We have to convert these values so that when it's finally sent to the backend
    types don't need to be cast there.
    It also allows changes to the data state variable to remain consistent
    between chaned/unchanged entries.
*/
    getDatasetFromEvent(event) {
        let dataset = event.target.dataset;
        return {
            ctrl: dataset.ctrl.toLowerCase() === "true" ? true : false,
            shift: dataset.shift.toLowerCase() === "true" ? true : false,
            alt: dataset.alt.toLowerCase() === "true" ? true : false,
            keycode: parseInt(dataset.keycode),
            id: parseInt(event.target.id)
        }
    },

    datasetToKeyString(dataset) {
        console.log("datasetToKeyString");
        let buttons = dataset.ctrl ? "{controlleft} {controlright} " : "";
        buttons += dataset.shift ? "{shiftleft} {shiftright} " : "";
        buttons += dataset.alt ? "{altleft} {altright} " : "";
        buttons += simpleKeyboardKeyNames[dataset.keycode] ? simpleKeyboardKeyNames[dataset.keycode] : String.fromCharCode(dataset.keycode).toUpperCase();
        console.log(buttons);
        return buttons;
    }
}

export default Utils;