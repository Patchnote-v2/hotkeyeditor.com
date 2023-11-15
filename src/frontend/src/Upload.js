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
    const [highlightedGroup, setHighlightedGroup] = useState(null);
    const [buffer, setBuffer] = useState(null);
    const [foundRows, setFoundRows] = useState([]);
    const [filterRows, setFilterRows] = useState(false);
    
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
            setHighlightedKeys({
                "keybind-row-setting-button": [dataset],
                "menu-group-select-button": highlighted?.["menu-group-select-button"] ? highlighted?.["menu-group-select-button"] : []
            });
            
            setBuffer(dataset);
        }
        else if (buffer && buffer.id === dataset.id) {
            console.log("Clearing buffer");
            // No longer setting keybind
            _updateSettingKeybind(false);
            
            // Add finalized buffer to changed
            updateHotkey(buffer);
            
            // Update highlighted keys to finalized buffer
            setHighlightedKeys({
                "keybind-row-hover-button": [buffer],
                "menu-group-select-button": highlighted?.["menu-group-select-button"] ? highlighted?.["menu-group-select-button"] : []    
            });
            
            setBuffer(null);
        }
    }
    
    const updateBuffer = (dataset) => {
        console.log("updateBuffer");
        setHighlightedKeys({
            "keybind-row-setting-button": [dataset],
            "menu-group-select-button": highlighted?.["menu-group-select-button"] ? highlighted?.["menu-group-select-button"] : []
        });
        setBuffer(dataset);
    }
    
    const clearHighlightedKeys = (data=null) => {
        console.log("clearHighlightedKeys");
        
        if (data) {
            let cssClasses = Object.keys(data);
            if (cssClasses.length) {
                cssClasses.forEach((test123) => {
                    let keys = "";
                    data[test123].forEach((element) => {
                        keys += Utils.datasetToKeyString(element) + " ";
                    })
                    
                    if (keys.trim() !== "") {
                        keyboard.current.dispatch((instance) => {
                            instance.removeButtonTheme(keys, test123);
                        });
                    }
                });
            }
        }
        
        if (highlighted) {
            let highlightedCSSClasses = Object.keys(highlighted);
            if (highlightedCSSClasses.length) {
                highlightedCSSClasses.forEach((test1) => {
                    let keys = "";
                    highlighted[test1].forEach((element) => {
                        keys += Utils.datasetToKeyString(element) + " ";
                    })
                    
                    if (keys.trim() !== "") {
                        keyboard.current.dispatch((instance) => {
                            instance.removeButtonTheme(keys, test1);
                        });
                    }
                });
            }
        }
        setHighlighted(null);
    }
    
    /*
        Used to set the CSS class of the keys that need to be highlighted.
        Used to highlight when hovering over a keybind, and when setting a keybind.
    */
    const setHighlightedKeys = (data) => {
        console.log("setHighlightedKeys");
        clearHighlightedKeys();
        
        
        let cssClasses = Object.keys(data);
        if (cssClasses.length) {
            cssClasses.forEach((key) => {
                let keys = "";
                data[key].forEach((element) => {
                    keys += Utils.datasetToKeyString(element) + " ";
                })
                
                if (keys) {
                    keyboard.current.dispatch((instance) => {
                        instance.addButtonTheme(keys, key);
                    });
                }
            });
        }
        // Need to deep-copy with JSON (why didn't Javascript have deep copy years ago?)
        // Good thing I don't have any complex objects.
        setHighlighted(JSON.parse(JSON.stringify(data)));
    }
    
    /*
        Passed to Keybinds to be used as a callback for updating the keyboard highlighting
    */
    const updateCurrentHover = (event) => {
        console.log("updateCurrentHover");
        let dataset = Utils.getDatasetFromEvent(event);
        if (event.type === "mouseover") {
            console.log("MOUESOVER");

            setHighlightedKeys({
                "keybind-row-setting-button": [buffer],
                "keybind-row-hover-button": [dataset],
                "menu-group-select-button": highlighted?.["menu-group-select-button"] ? highlighted?.["menu-group-select-button"] : []
            });
        }
        else if (event.type === "mouseout") {
            console.log("MOUESOUT");
            // We have to explicitly say to remove this key, otherwise
            // when the mouse moves across multiple elements in the same render
            // cycle the state isn't accurate to what highlights need to be removed
            // in clearHighlightedKeys()
            clearHighlightedKeys({
                "keybind-row-setting-button": [dataset],
                "keybind-row-hover-button": [dataset]
            });
            setHighlightedKeys({
                "keybind-row-setting-button": [buffer],
                "menu-group-select-button": highlighted?.["menu-group-select-button"] ? highlighted?.["menu-group-select-button"] : []
            });
        }
    }
    
    /*
        Given a keycode, returns an array of all UUIDs that have that keycode as their
        current key
    */
    const findRowsByKeycode = (keycode) => {
        if (dataLoadedRef.current && !settingKeybind) {
            let foundRows = keycode ? Object.entries(dataLoadedRef.current.hotkeys)
                               .filter(([k, v]) => dataLoadedRef.current.hotkeys[k].keycode === keycode)
                               .map(([k]) => k)
                               : []
            setFoundRows(foundRows);
        }
    }
    
    // todo: make group highlight on mouse hover
    // todo: FIX setting then confirming keybind overriding keybind row group highlight class
    // todo: make setting keybind color most important somehow so it's always visible, despite group selection colors.
    // This includes modifier keys, since there's no visible way to see them getting removed when group selected
    // todo: determine how filtering should work with group select.  Currently it overrides all row CSS class styling,
    // while keeping key highlights.  Should filtering after group selection only show filtered keys in the selected group??
    const selectMenu = (event) => {
        console.log("selectMenu");        
        if (!highlightedGroup) {
            let row = event.target;
            let rows = []
            while (row = row.nextElementSibling) {
                rows.push(Utils.getDatasetFromElement(row));
                row.classList.add("hotkey-row-group");
            }
            setHighlightedKeys({"menu-group-select-button": rows});
            setHighlightedGroup(event.target.textContent);
        }
        
        if (event.target.textContent === highlightedGroup) {
            let row = event.target;
            let rows = []
            while (row = row.nextElementSibling) {
                rows.push(Utils.getDatasetFromElement(row));
                row.classList.remove("hotkey-row-group");
            }
            clearHighlightedKeys({"menu-group-select-button": rows})
            setHighlightedGroup(null);
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
                      findRowsByKeycode={findRowsByKeycode}
                      setFilterRows={setFilterRows}
                      filterRows={filterRows} />
        <Keybinds data={data}
                  buffer={buffer}
                  updateCurrentHoverCallback={updateCurrentHover}
                  handleSettingKeybind={handleSettingKeybind}
                  foundRows={foundRows}
                  filterRows={filterRows}
                  selectMenu={selectMenu} />
        </>
    );
};

export default Upload;