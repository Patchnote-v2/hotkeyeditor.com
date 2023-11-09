import { useState, useRef } from "react";

import axios from "axios";

import fileDownload from 'js-file-download';

import FullKeyboard from './FullKeyboard.js';
import Keybinds from './Keybinds.js';
import { keyNames, simpleKeyboardKeyNames } from './keyNames.js';


axios.defaults.baseURL = 'http://localhost:8000';

// todo: move to Utils
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
        }).then((response) => {
            console.log(response.data);
            setData(response.data);
        }).catch((error) => {console.log(error);});
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
            // Actively setting keybind
            _updateSettingKeybind(true);
            
            // Update highlights to go from keybind row hover to setting keybind colors
            updateBufferHighlights(dataset, "keybind-row-setting-button");
            
            setBuffer(dataset);
        }
        else if (buffer && buffer.keycode === parseInt(event.target.dataset.keycode)) {
            console.log("Clearing buffer");
            // No longer setting keybind
            _updateSettingKeybind(false);
            
            // Add finalized buffer to changed
            updateHotkey(buffer);
            
            // Update highlighted keys to finalized buffer
            updateBufferHighlights(buffer, "keybind-row-hover-button");
            
            setBuffer(null);
        }
    }
    
    const updateBuffer = (dataset) => {
        console.log("updateBuffer");
        updateBufferHighlights(dataset, "keybind-row-setting-button");
        setBuffer(dataset);
    }
    
    /*
        Removes -hover or -setting classes on current buttons and sets new ones on dataset
    */
    const updateBufferHighlights = (dataset, cssClass) => {
        // Remove both hover- and setting- classes since we have no way of know
        // whether or not this is the first time updating the buffer
        setHighlightedKeys(false, highlighted, "keybind-row-hover-button keybind-row-setting-button");
        setHighlightedKeys(true, dataset, cssClass);
    }
    
    // todo: move to Utils
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
    const setHighlightedKeys = (state, dataset, cssClasses) => {
        console.log("setHighlightedKeys");
        let keys = datasetToKeyString(dataset);
        if (state) {
            // Need to deep-copy with JSON (why didn't Javascript have deep copy years ago?)
            // Good thing I don't have any complex objects.
            setHighlighted(JSON.parse(JSON.stringify(dataset)));
            keyboard.current.dispatch((instance) => {
                instance.addButtonTheme(keys, cssClasses);
            });
        }
        else {
            setHighlighted(null);
            keyboard.current.dispatch((instance) => {
                instance.removeButtonTheme(keys, cssClasses);
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
                setHighlightedKeys(true, dataset, "keybind-row-hover-button");
            }
            else if (event.type === "mouseout") {
                setHighlightedKeys(false, dataset, "keybind-row-hover-button");
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