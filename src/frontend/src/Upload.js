import { useState, useRef } from "react";
import axios from "axios";

import FullKeyboard from './FullKeyboard.js';
import Keybinds from './Keybinds.js';
import { keyNames, simpleKeyboardKeyNames } from './keyNames.js';

axios.defaults.baseURL = 'http://localhost:8000';

const Upload = () => {
    const [changed, setChanged] = useState({});
    const [data, setData] = useState({});
    const [settingKeybind, setSettingKeybind] = useState(false);
    
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
    
    const _toggleSettingKeybind = () => {
        keyboard.current.setOptions({
            physicalKeyboardHighlight: !keyboard.current.options['physicalKeyboardHighlight']
        });
    }
    
    const updateCurrentHover = (event) => {
        let dataset = event.target.dataset;
        let buttons = dataset.ctrl.toLowerCase() === "true" ? "{ctrlleft} {ctrlright} " : "";
        buttons += dataset.shift.toLowerCase() === "true" ? "{shiftleft} {shiftright} " : "";
        buttons += dataset.alt.toLowerCase() === "true" ? "{altleft} {altright} " : "";
        buttons += simpleKeyboardKeyNames[dataset.keycode] ? simpleKeyboardKeyNames[dataset.keycode] : String.fromCharCode(dataset.keycode).toUpperCase();
        console.log(buttons);
        if (event.type === "mouseover") {
            keyboard.current.addButtonTheme(buttons, "active-key");
        }
        else if (event.type === "mouseout") {
            keyboard.current.removeButtonTheme(buttons, "active-key");
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
        <button onClick={_toggleSettingKeybind}>Toggle Setting</button>
        <form method="POST" onSubmit={_getDefaultFiles}>
            <label htmlFor="loadDefaults">Load Defaults</label>
            <button type="submit">Load Defaults</button>
        </form>
        <FullKeyboard ref={keyboard} />
        <Keybinds data={data} updateCurrentHoverCallback={updateCurrentHover} />
        </>
    );
};

export default Upload;