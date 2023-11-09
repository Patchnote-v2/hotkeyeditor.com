import { useState, useRef, useEffect } from "react";

import axios from "axios";

import fileDownload from 'js-file-download';

import FullKeyboard from './FullKeyboard.js';
import Keybinds from './Keybinds.js';
import Utils from './Utils.js';


axios.defaults.baseURL = 'http://localhost:8000';

const Upload = () => {
    const [changed, setChanged] = useState();
    const [data, setData] = useState();
    const dataLoadedRef = useRef();
    const [settingKeybind, setSettingKeybind] = useState(false);
    const [highlighted, setHighlighted] = useState(null);
    const [buffer, setBuffer] = useState(null);
    const [foundRows, setFoundRows] = useState([]);
    
    const keyboard = useRef(null);
    
    useEffect(() => {
        if (data) {
            // Dear God please someone put me out of my misery
            dataLoadedRef.current = data;
        }
    }, [data]);
    
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
        let dataset = Utils.getDatasetFromEvent(event);
        
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
    
    /*
        Used to set the CSS class of the keys that need to be highlighted.
        Used to highlight when hovering over a keybind, and when setting a keybind.
    */
    const setHighlightedKeys = (state, dataset, cssClasses) => {
        console.log("setHighlightedKeys");
        let keys = Utils.datasetToKeyString(dataset);
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
            let dataset = Utils.getDatasetFromEvent(event);
            if (event.type === "mouseover") {
                setHighlightedKeys(true, dataset, "keybind-row-hover-button");
            }
            else if (event.type === "mouseout") {
                setHighlightedKeys(false, dataset, "keybind-row-hover-button");
            }
        }
    }
    
    const findRowsByKeycode = (keycode) => {
        if (dataLoadedRef.current) {
            setFoundRows(keycode ? Object.entries(dataLoadedRef.current.hotkeys)
                               .filter(([, v]) => v.keycode === parseInt(keycode))
                               .map(([k]) => parseInt(k))
                               : []);
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
                      buffer={buffer}
                      findRowsByKeyCode={findRowsByKeycode} />
        <Keybinds data={data}
                  buffer={buffer}
                  updateCurrentHoverCallback={updateCurrentHover}
                  handleSettingKeybind={handleSettingKeybind}
                  foundRows={foundRows} />
        </>
    );
};

export default Upload;