import { useState, useRef, useEffect } from "react";

import axios from "axios";

import fileDownload from 'js-file-download';

import FullKeyboard from './FullKeyboard.js';
import Keybinds from './Keybinds.js';
import Utils from './Utils.js';

// todo: if changes have been made, confirm that Load Defaults wants to happen
// todo: input box for profile file name

axios.defaults.baseURL = 'http://localhost:8000';

const Upload = () => {
    const [changed, setChanged] = useState();
    const [data, setData] = useState();
    const dataLoadedRef = useRef();
    const [highlighted, setHighlighted] = useState({});
    const [buffer, setBuffer] = useState(null);
    const [foundRows, setFoundRows] = useState([]);
    const [filteringRows, setFilteringRows] = useState(false);
    
    const keyboard = useRef(null);
    const highlightedGroup = useRef(null);
    
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
    
    /*
        Entry point for beginning to set a keybind.
    */
    const handleSettingKeybind = (event) => {
        console.log("beginSettingKeybind");
        let dataset = Utils.getDatasetFromEvent(event);
        
        if (!buffer) {
            console.log("Setting buffer");
            // Actively setting keybind
            keyboard.current.setOptions({
                physicalKeyboardHighlight: true
            });
            
            let keys = {};
            if (dataset) {
                keys[dataset.id] = ["keybind-row-setting-button"]
            }
            setHighlightedKeys(keys, false, dataset);
            
            setBuffer(dataset);
        }
        else if (buffer && buffer.id === dataset.id) {
            console.log("Clearing buffer");
            // No longer setting keybind
            keyboard.current.setOptions({
                physicalKeyboardHighlight: false
            });
            
            // Add finalized buffer to changed
            updateHotkey(buffer);
            
            let keysSet = {};
            let keysRemove = {}
            if (buffer) {
                keysSet[buffer.id] = ["keybind-row-hover-button"]
                keysRemove[buffer.id] = ["keybind-row-setting-button", "keybind-row-hover-button"]
            }
            clearHighlightedKeys(keysRemove, true);
            setHighlightedKeys(keysSet, false);
            setBuffer(null);
        }
    }
    
    const updateBuffer = (dataset) => {
        console.log("updateBuffer");
        let keysSet = {};
        let keysRemove = {}
        if (dataset) {
            keysSet[dataset.id] = ["keybind-row-setting-button"];
            keysRemove[dataset.id] = ["keybind-row-setting-button", "keybind-row-hover-button"];
        }
        clearHighlightedKeys(keysRemove, true);
        setHighlightedKeys(keysSet, false, dataset);
        setBuffer(dataset);
    }
    
    // If inputData is null, all highlighted keys will be cleared.
    // If inputData is provided, only the provided classes from the specified keys
    // will be cleared.
    // If useBuffer is true, then ONLY ONE KEY (UUID) must be provided.  This is
    // an unintuitive way of doing this but I'm just trying to get it to work.
    const clearHighlightedKeys = (inputData=null, useBuffer=false) => {
        setHighlighted((oldHighlighted) => {
            let current = JSON.parse(JSON.stringify(oldHighlighted))
            let transformed = {};
            let workingData = null;
            if (inputData) {
                workingData = inputData;
            }
            else {
                // No need to copy since workingData isn't mutated
                workingData = current
            }
            // Convert the data from: {uuid1: ["class1", "class2"], uuid2: ["class1", "class3"]}
            // to: {class1: ["uuid1", "uuid2"], class2: ["uuid1"], class3: ["uuid2"]}a
            // This makes it easier to pass the correct data to addButtonTheme/removeButtonTheme
            // on the keyboard instance
            for (let [uuid, classesArray] of Object.entries(workingData)) {
                classesArray.forEach((string) => {
                    // Create entry if it doesn't exist
                    if (!transformed[string]) {
                        transformed[string] = [];
                    }
                    transformed[string].push(uuid);
                });
                
                // Remove classes from UUID if it exists in the highlighted state
                if (Object.keys(current).includes(uuid)) {
                    current[uuid] = current[uuid].filter(x => !classesArray.includes(x));
                }
            }
            // Build the string to pass to the keyboard instance and call it
            for (let [cssClass, UUIDs] of Object.entries(transformed)) {
                let keysString = "";
                if (useBuffer) {
                    keysString = Utils.datasetToKeyString(buffer);
                }
                else {
                    UUIDs.forEach((UUID) => {
                        keysString += Utils.datasetToKeyString(data.hotkeys[UUID]) + " ";
                    });
                }
                
                keysString = keysString.trim()
                if (keysString !== "") {
                    keyboard.current.dispatch((instance) => {
                        instance.removeButtonTheme(keysString, cssClass);
                    });
                }
            }
            
            // Filter any UUIDs that no longer have classes applied
            current = Utils.objectFilter(current, ([,cssClasses]) => {
                return cssClasses.length;
            })
            // Finally update the currently highlighted
            return current;
        });
        
    }
    
    /*
        Used to set the CSS class of the keys that need to be highlighted.
        Used to highlight when hovering over a keybind, and when setting a keybind.
        data is an object with keys of UUID, and values of an array of CSS classes
    */
    const setHighlightedKeys = (inputData, clear=true, dataset=false) => {
        if (clear) {
            clearHighlightedKeys();
        }
        
        setHighlighted((oldHighlighted) => {
            let current = JSON.parse(JSON.stringify(oldHighlighted))
            let transformed = {};
            // Iterate over each entry in the input object
            for (let [uuid, classesArray] of Object.entries(inputData)) {
                classesArray.forEach((string) => {
                    // Initialize an array if the string key doesn't exist yet
                    if (!transformed[string]) {
                        transformed[string] = [];
                    }
                    // Add the UUID to the array corresponding to the string
                    transformed[string].push(uuid);
                });
                
                // Also update highlighted if we didn't clear so we only iterate once
                if (!clear) {
                    if (Object.keys(current).includes(uuid)) {
                        current[uuid] = [...new Set([...classesArray, ...current[uuid]])]
                    }
                    else {
                        current[uuid] = [...classesArray];
                    }
                }
            }
            
            // Normally the dataset used to determine which keys to to highlight comes
            // from the main hotkeys data.  However, when setting a new hotkey, that data
            // isn't updated until the hotkey is finalized.  As such, when setting a new hotkey
            // for the changing hotkey specifically, we need to create the key string from
            // the most up-to-date source: the buffer state
            for (let [cssClass, UUIDs] of Object.entries(transformed)) {
                let keysString = "";
                if (dataset && Object.keys(inputData).includes(dataset.id)) {
                     keysString = Utils.datasetToKeyString(dataset);
                }
                else {
                    UUIDs.forEach((UUID) => {
                        keysString += Utils.datasetToKeyString(data.hotkeys[UUID]) + " ";
                    });
                }
                
                keysString = keysString.trim()
                if (keysString !== "") {
                    keyboard.current.dispatch((instance) => {
                        instance.addButtonTheme(keysString, cssClass);
                    });
                }
            }
            if (clear) {
                return inputData;
            }
            else {
                return current;
            }
        })
    }

    /*
        Passed to Keybinds to be used as a callback for updating the keyboard highlighting
    */
    const updateCurrentHover = (event) => {
        console.log("updateCurrentHover");
        let dataset = Utils.getDatasetFromEvent(event);
        if (event.type === "mouseover") {
            let keys = {};
            if (dataset) {
                keys[dataset.id] = ["keybind-row-hover-button"]
            }
            if (buffer && dataset && buffer.id === dataset.id) {
                setHighlightedKeys(keys, false, buffer);
            }
            else {
                setHighlightedKeys(keys, false);
            }
        }
        else if (event.type === "mouseout") {
            // We have to explicitly say to remove this key, otherwise
            // when the mouse moves across multiple elements in the same render
            // cycle the state isn't accurate to what highlights need to be removed
            // in clearHighlightedKeys()
            clearHighlightedKeys({
                [dataset.id]: ["keybind-row-hover-button"]
            })
        }
    }
    
    /*
        Given a keycode, returns an array of all UUIDs that have that keycode as their
        current key
    */
    const findRowsByKeycode = (keycode) => {
        if (dataLoadedRef.current) {
            let foundRows = keycode ? Object.entries(dataLoadedRef.current.hotkeys)
                               .filter(([k, v]) => dataLoadedRef.current.hotkeys[k].keycode === keycode)
                               .map(([k]) => k)
                               : []
            setFoundRows(foundRows);
        }
    }
    
    // todo: make setting keybind color most important somehow so it's always visible, despite group selection colors.
    // This includes modifier keys, since there's no visible way to see them getting removed when group selected
    // todo: determine how filtering should work with group select.  Currently it overrides all row CSS class styling,
    // while keeping key highlights.  Should filtering after group selection only show filtered keys in the selected group??
    const selectMenu = (event) => {
        console.log("selectMenu");
        if (!highlightedGroup.current) {
            let rows = Utils.getGroupRowsFromHeader(event.target, ["menu-group-select-button"]);
            setHighlightedKeys(rows, false);
            
            highlightedGroup.current = event.target;
        }
        
        else if (event.target.textContent === highlightedGroup?.current?.textContent) {
            let rows = Utils.getGroupRowsFromHeader(event.target, ["menu-group-select-button"]);
            clearHighlightedKeys(rows);
            
            highlightedGroup.current = null;
        }
    }
    
    const hoverMenu = (event) => {
        console.log("updateCurrentHover");
        if (event.type === "mouseover") {
            let rows = Utils.getGroupRowsFromHeader(event.target, ["menu-group-hover-button"]);
            setHighlightedKeys(rows, false);
        }
        else if (event.type === "mouseout") {
            let rows = Utils.getGroupRowsFromHeader(event.target, ["menu-group-hover-button"]);
            clearHighlightedKeys(rows);
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
                      updateBuffer={updateBuffer}
                      buffer={buffer}
                      findRowsByKeycode={findRowsByKeycode}
                      setFilteringRows={setFilteringRows}
                      filteringRows={filteringRows} />
        <Keybinds data={data}
                  buffer={buffer}
                  updateCurrentHover={updateCurrentHover}
                  handleSettingKeybind={handleSettingKeybind}
                  foundRows={foundRows}
                  filteringRows={filteringRows}
                  selectMenu={selectMenu}
                  hoverMenu={hoverMenu}
                  highlighted={highlighted} />
        </>
    );
};

export default Upload;