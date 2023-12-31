import { simpleKeyboardKeyNames } from './keyNames.js';

var Utils = {
    modifiers: {
      "{shiftleft}": "shift",
      "{shiftright}": "shift",
      "{controlleft}": "ctrl",
      "{controlright}": "ctrl",
      "{altleft}":  "alt",
      "{altright}": "alt"
    },
    
    // https://stackoverflow.com/a/28191966/2368714
    findKeyByValue(object, value, fn=null) {
        return Object.keys(object).filter(key => {
            if (fn && object[key]) {
                return (fn(object[key]) === fn(value))
            }
            return object[key] === value;
        });
    },
    
    findKeyByValueAttribute(object, value, attribute=null) {
        return Object.keys(object).filter(key => object[key]?.[attribute] === value);
    },
    
    objectFilter(object, func) {
        return Object.fromEntries(Object.entries(object).filter(func));
    },
    
    // Used to convert a data-like object (i.e. buffer) and converts it to
    // the structure used by [clear|set]HighlightedKeys
    bufferToHighlights(object, classes) {
        let output = JSON.parse(JSON.stringify(object));
        Object.keys(output).forEach((key) => {
            output[key] = classes;
        });
        return output;
    },
    
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
            id: event.target.id
        }
    },
    
    getDatasetFromElement(element) {
        return {
            ctrl: element.dataset.ctrl.toLowerCase() === "true" ? true : false,
            shift: element.dataset.shift.toLowerCase() === "true" ? true : false,
            alt: element.dataset.alt.toLowerCase() === "true" ? true : false,
            keycode: parseInt(element.dataset.keycode),
            id: element.id
        }
    },

    datasetToKeyString(dataset) {
        if (dataset) {
            let buttons = dataset.ctrl ? "{controlleft} {controlright} " : "";
            buttons += dataset.shift ? "{shiftleft} {shiftright} " : "";
            buttons += dataset.alt ? "{altleft} {altright} " : "";
            buttons += simpleKeyboardKeyNames[dataset.keycode] ? simpleKeyboardKeyNames[dataset.keycode] : String.fromCharCode(dataset.keycode).toUpperCase();
            return buttons;
        }
        return "";
    },
    
    getGroupRowsFromHeader(element, value="") {
        var rows = {}
        let row = element;
        // eslint-disable-next-line
        while (row = row.nextElementSibling) {
            rows[Utils.getDatasetFromElement(row).id] = value;
        }
        
        return rows;
    },
}

export default Utils;