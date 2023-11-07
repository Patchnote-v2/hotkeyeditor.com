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
        console.log(event);
        
        let dataset = event.target.dataset;
        dataset.id = event.target.id;
                
        if (!buffer) {
            console.log("Setting buffer");
            _updateSettingKeybind(true);
            setBuffer(dataset);
        }
        else if (buffer && buffer.keycode == event.target.dataset.keycode) {
            console.log("Clearing buffer");
            _updateSettingKeybind(false);
            setBuffer(null);
        }
    }
    
    const updateBuffer = (update, data) => {
        console.log("updateBuffer");
        // console.log(event);
    }
    
    /*
        Used to set the CSS class of the buttons that need to be highlighted.
        Used to highlight when hovering over a keybind, and when setting a keybind.
    */
    const toggleHighlightedKeys = (state, dataset) => {
        let buttons = dataset.ctrl.toLowerCase() === "true" ? "{controlleft} {controlright} " : "";
        buttons += dataset.shift.toLowerCase() === "true" ? "{shiftleft} {shiftright} " : "";
        buttons += dataset.alt.toLowerCase() === "true" ? "{altleft} {altright} " : "";
        buttons += simpleKeyboardKeyNames[dataset.keycode] ? simpleKeyboardKeyNames[dataset.keycode] : String.fromCharCode(dataset.keycode).toUpperCase();
        console.log(buttons);

        if (state) {
            keyboard.current.dispatch((instance) => {
                instance.addButtonTheme(buttons, "active-key");
            });
        }
        else {
            keyboard.current.dispatch((instance) => {
                instance.removeButtonTheme(buttons, "active-key");
            });
        }
    }
    
    /*
        Passed to Keybinds to be used as a callback for updating the keyboard highlighting
    */
    const updateCurrentHover = (event) => {
        if (!settingKeybind) {
            let dataset = event.target.dataset;
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
        <button onClick={_toggleSettingKeybind}>Toggle Setting</button>
        <form method="POST" onSubmit={_getDefaultFiles}>
            <label htmlFor="loadDefaults">Load Defaults</label>
            <button type="submit">Load Defaults</button>
        </form>
        <FullKeyboard ref={keyboard}
                      settingKeybind={settingKeybind}
                      updateBuffer={updateBuffer} />
        <Keybinds data={data}
                  buffer={buffer}
                  updateCurrentHoverCallback={updateCurrentHover}
                  handleSettingKeybind={handleSettingKeybind} />
        </>
    );
};

export default Upload;