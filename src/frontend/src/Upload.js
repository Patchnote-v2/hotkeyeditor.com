import { useState, useRef } from "react";

import axios from "axios";

import fileDownload from 'js-file-download';

import FullKeyboard from './FullKeyboard.js';
import Keybinds from './Keybinds.js';
import { keyNames, simpleKeyboardKeyNames } from './keyNames.js';


axios.defaults.baseURL = 'http://localhost:8000';

/*
    Used to construct a consistent dataset from an event.
    HTMLElement.dataset is a DOMStringMap, meaning that all values are cast into strings.
    We have to convert these values so that when it's finally sent to the backend
    types don't need to be cast there.
    It also allows changes to the data state variable to remain consistent
    between chaned/unchanged entries.
*/
const getDatasetFromEvent = (event) => {
    let dataset = event.target.dataset;
    return {
        ctrl: dataset.ctrl.toLowerCase() === "true" ? true : false,
        shift: dataset.shift.toLowerCase() === "true" ? true : false,
        alt: dataset.alt.toLowerCase() === "true" ? true : false,
        keycode: parseInt(dataset.keycode),
        id: parseInt(event.target.id)
    };
}

const Upload = () => {
    const [changed, setChanged] = useState();
    const [data, setData] = useState();
    const [settingKeybind, setSettingKeybind] = useState(false);
    const [highlighted, setHighlighted] = useState(null);
    const [buffer, setBuffer] = useState(null);
    
    const keyboard = useRef(null);
    
    const _handleSubmit = (event) => {
        // Prevent the browser from reloading the page
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        axios({
            method: 'post',
            url: '/upload/',
            data: formData,
        }).then((response) => {console.log(response.data);setData(response.data)})
          .catch((error) => {console.log(error);});
    }
    
    const _getDefaultFiles = (event) => {
        event.preventDefault();
        
        axios({
            method: 'get',
            url: '/upload/',
        }).then((response) => {console.log(response.data);setData(response.data)})
          .catch((error) => {console.log(error);});
    }
    
    const uploadChanged = (event) => {
        event.preventDefault();
        console.log(changed);
        axios({
            method: 'post',
            url: '/generate/',
            data: changed,
            responseType: 'blob',
        }).then((response) => {fileDownload(response.data, "test.hkp");})
        .catch((error) => {console.log(error);});
    }
    
    const updateHotkey = (dataset) => {
        let hotkey = data.hotkeys[dataset.id];
        hotkey.ctrl = dataset.ctrl;
        hotkey.shift = dataset.shift;
        hotkey.alt = dataset.alt;
        hotkey.keycode = dataset.keycode;
        
        let newHotkeys = {...data.hotkeys}
        newHotkeys[dataset.id] = hotkey
        setData({groups: data.groups, hotkeys: {...newHotkeys}});
        
        let newChanged = {...changed};
        newChanged[dataset.id] = hotkey;
        setChanged(newChanged);
    }
    
    /*
        Probably temporary function used for debugging purposes (button that toggles state)
    */
    const _toggleSettingKeybind = () => {
        keyboard.current.setOptions({
            physicalKeyboardHighlight: !keyboard.current.options['physicalKeyboardHighlight']
        });
        setSettingKeybind(!settingKeybind);
    }
    
    const _updateSettingKeybind = (state) => {
        keyboard.current.setOptions({
            physicalKeyboardHighlight: state
        });
        setSettingKeybind(state);
    }
    
    /*
        Entry point for beginning to set a keybind.
    */
    const handleSettingKeybind = (event) => {
        console.log("beginSettingKeybind");
        let dataset = getDatasetFromEvent(event);
        
        if (!buffer) {
            console.log("Setting buffer");
            _updateSettingKeybind(true);
            setBuffer(dataset);
        }
        else if (buffer && buffer.keycode === parseInt(event.target.dataset.keycode)) {
            console.log("Clearing buffer");
            _updateSettingKeybind(false);
            updateHotkey(buffer);
            setBuffer(null);
        }
    }
    
    const updateBuffer = (dataset) => {
        console.log("updateBuffer");
        toggleHighlightedKeys(false, highlighted);
        toggleHighlightedKeys(true, dataset);
        
        setBuffer(dataset);
    }
    
    const datasetToKeyString = (dataset) => {
        console.log("datasetToKeyString");
        let buttons = dataset.ctrl ? "{controlleft} {controlright} " : "";
        buttons += dataset.shift ? "{shiftleft} {shiftright} " : "";
        buttons += dataset.alt ? "{altleft} {altright} " : "";
        buttons += simpleKeyboardKeyNames[dataset.keycode] ? simpleKeyboardKeyNames[dataset.keycode] : String.fromCharCode(dataset.keycode).toUpperCase();
        console.log(buttons);
        return buttons;
    }
    
    /*
        Used to set the CSS class of the keys that need to be highlighted.
        Used to highlight when hovering over a keybind, and when setting a keybind.
    */
    const toggleHighlightedKeys = (state, dataset) => {
        console.log("toggleHighlightedKeys");
        let keys = datasetToKeyString(dataset);
        if (state) {
            setHighlighted(JSON.parse(JSON.stringify(dataset)));
            keyboard.current.dispatch((instance) => {
                instance.addButtonTheme(keys, "active-key");
            });
        }
        else {
            setHighlighted(null);
            keyboard.current.dispatch((instance) => {
                instance.removeButtonTheme(keys, "active-key");
            });
        }
    }
    
    /*
        Passed to Keybinds to be used as a callback for updating the keyboard highlighting
    */
    const updateCurrentHover = (event) => {
        if (!settingKeybind) {
            console.log("updateCurrentHover");
            let dataset = getDatasetFromEvent(event);
            if (event.type === "mouseover") {
                toggleHighlightedKeys(true, dataset);
            }
            else if (event.type === "mouseout") {
                toggleHighlightedKeys(false, dataset);
            }
        }
    }
    
    
    return (
        <>
        <form method="POST" onSubmit={_handleSubmit}>
            <label htmlFor="files">Select Files</label>
            <input
                type="file"
                name="files"
                multiple
            />
            <button type="submit">Upload Files</button>
        </form>
        {/*<button onClick={_toggleSettingKeybind}>Toggle Setting</button>*/}
        <button onClick={uploadChanged}>Upload Changes</button>
        <form method="POST" onSubmit={_getDefaultFiles}>
            <label htmlFor="loadDefaults">Load Defaults</label>
            <button type="submit">Load Defaults</button>
        </form>
        <FullKeyboard ref={keyboard}
                      settingKeybind={settingKeybind}
                      updateBuffer={updateBuffer}
                      buffer={buffer} />
        <Keybinds data={data}
                  buffer={buffer}
                  updateCurrentHoverCallback={updateCurrentHover}
                  handleSettingKeybind={handleSettingKeybind} />
        </>
    );
};

export default Upload;