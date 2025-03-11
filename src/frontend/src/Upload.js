import { useState, useRef, useEffect } from "react";

import axios from "axios";

import fileDownload from 'js-file-download';
import * as ls from "local-storage";

import { simpleKeyboardKeyNames } from './keyNames.js';
import FullKeyboard from './FullKeyboard.js';
import Keybinds from './Keybinds.js';
import Utils from './Utils.js';

axios.defaults.baseURL = 'http://localhost:8000';

// todo: split this into smaller components?
// Sounds annoying since sharing data between child components always feels weird
const Upload = (props) => {
    const [changed, setChanged] = useState({});
    const [profileName, setProfileName] = useState(null);
    const [data, setData] = useState();
    const dataLoadedRef = useRef();
    const [highlighted, setHighlighted] = useState({});
    const [buffer, setBuffer] = useState({});
    const [settingKeybind, setSettingKeybind] = useState(false);
    const [favorites, setFavorites] = useState([]);

    const [filteringKey, setFilteringKey] = useState(null);
    const [foundRows, setFoundRows] = useState([]);
    const [filteringRows, setFilteringRows] = useState(false);
    const [searchFilter, setSearchFilter] = useState(null);

    const notifications = useRef(null);
    const clear = useRef(null); // Button
    const cancel = useRef(null); // Button
    const confirm = useRef(null); // Button
    const keyboard = useRef(null);
    const selectedGroupHeader = useRef(null); // Contains header element of currently highlighted groups (active, not currently hovered)
    const hoverGroupHeader = useRef(null); // Contains header of group currently being hovered over

    let baseUrl = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
                    ? "http://localhost:8000"
                    : "https://hotkeyeditor.com"
    useEffect(() => {
        window.addEventListener("beforeunload", (event) => {
            event.preventDefault();
            if (Object.keys(changed).length) {
                if (!window.confirm("You have changes made to the current hotkeys.  Loading from new files will erase all changes.")) {
                    return;
                }
            }
        });
        return () => {
            window.removeEventListener("beforeunload", ()=>{});
        }
    }, [changed]);

    useEffect(() => {
        // Initially set as disabled this way, otherwise if the buttons use an attribute
        // to be disabled then it just straight up doesn't work.
        if (clear.current && cancel.current && confirm.current) {
            disableButtons(true);
        }
    }, []);

    useEffect(() => {
        if (!notifications.current) {
            notifications.current = props.notifications.current;
        }
    }, [props])

    useEffect(() => {
        if (data) {
            // Dear God please someone put me out of my misery
            dataLoadedRef.current = data;
        }
    }, [data]);

    useEffect(() => {
        keyboard.current.dispatch((instance) => {
            instance.setOptions({physicalKeyboardHighlight: settingKeybind});
        });
    }, [settingKeybind]);

    const _handleSubmit = (event) => {
        // Prevent the browser from reloading the page
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        // Check for changes and ask if they want to be overriden
        if (Object.keys(changed).length) {
            if (!window.confirm("You have changes made to the current hotkeys.  Loading from new files will erase all changes.")) {
                return;
            }
        }

        axios({
            method: 'post',
            baseURL: baseUrl,
            url: '/api/upload/',
            data: formData,
        }).then((response) => {
            setChanged({});
            setData(response.data.data)
            setProfileName(response.data.name)
            setFilteringRows(false);
            setFoundRows([]);
            if (!data) {
                document.querySelector("#search input").value = "";
            }

            let localFavorites = ls.get("favorites");
            let rows = {};
            if (localFavorites) {
                response.data.data.groups["Favorites"] = [...localFavorites];
                setFavorites([...localFavorites]);
                localFavorites.forEach((UUID) => {
                    rows[UUID] = ["hotkey-favorite"];
                });
            }
            else {
                response.data.data.groups["Favorites"] = [];
            }
            setHighlightedKeys(rows, false, response.data);
        }).catch((error) => {
            notifications.current.addNotification(error.response.data.message);
        });
    }

    const _getDefaultFiles = (event) => {
        event.preventDefault();
        // Check for changes and ask if they want to be overriden
        if (Object.keys(changed).length) {
            if (!window.confirm("You have changes made to the current hotkeys.  Loading the default hotkeys will erase all changes.")) {
                return;
            }
        }
        axios({
            method: 'get',
            baseURL: baseUrl,
            url: '/api/upload/',
        }).then((response) => {
            setChanged({});
            setData(response.data);
            setProfileName(null);
            setFilteringRows(false);
            setFoundRows([]);
            if (!data) {
                document.querySelector("#search input").value = "";
            }

            let localFavorites = ls.get("favorites");
            let rows = {};
            if (localFavorites) {
                response.data.groups["Favorites"] = [...localFavorites];
                setFavorites([...localFavorites]);
                localFavorites.forEach((UUID) => {
                    rows[UUID] = ["hotkey-favorite"];
                });
            }
            else {
                response.data.groups["Favorites"] = [];
            }
            setHighlightedKeys(rows, false, response.data);
        }).catch((error) => {
            notifications.current.addNotification(error.response.data.message);
        });
    }

    const uploadChanged = (event) => {
        event.preventDefault();
        axios({
            method: 'post',
            baseURL: baseUrl,
            url: '/api/generate/',
            data: {changed: changed, profileName: profileName},
            responseType: 'blob',
        }).then((response) => {
            // todo: maybe make the filename generated by the server?
            fileDownload(response.data, "Hotkeys.zip");
        }).catch((error) => {
            notifications.current.addNotification(error.response.data.message);
        });
    }

    const confirmKeybinds = (newKeybinds, key) => {
        newKeybinds = JSON.parse(JSON.stringify(newKeybinds));
        clearHighlightedKeys(Utils.bufferToHighlights(newKeybinds, ["keybind-row-setting-button", "keybind-row-hover-button"]),
                             true);

        // Ensure group highlighting gets refreshed.  Kinda ugly having this here.
        if (selectedGroupHeader.current) {
            let rows = {};
            data.groups[selectedGroupHeader.current.getAttribute("value")].forEach((UUID) => {
                rows[UUID] = ["menu-group-select-button"];
            });
            clearHighlightedKeys(rows, true);
        }
        if (hoverGroupHeader.current) {
            let rows = {};
            data.groups[hoverGroupHeader.current.getAttribute("value")].forEach((UUID) => {
                rows[UUID] = ["menu-group-hover-button"];
            });
            clearHighlightedKeys(rows, true);
        }
        // Update data and changed state variables
        let newHotkeys = {...data.hotkeys};
        let newChanged = {...changed};
        for (let [uuid,] of Object.entries(newKeybinds)) {
            // If key is provided, also update all keycodes
            if (key) {
                let keycode = parseInt(Utils.findKeyByValue(simpleKeyboardKeyNames, key.toLowerCase()));
                newHotkeys[uuid].keycode = keycode;
                newKeybinds[uuid].keycode = keycode;
            }
            else if (key === 0) {
                newHotkeys[uuid].keycode = key;
                newKeybinds[uuid].keycode = key;
            }

            // Since datasets from rows don't include menu_id or string_id, we have to
            // make sure to copy them over "manually"
            newKeybinds[uuid]["menu_id"] = data.hotkeys[uuid]["menu_id"];
            newKeybinds[uuid]["string_id"] = data.hotkeys[uuid]["string_id"];

            newHotkeys[uuid].ctrl = newKeybinds[uuid].ctrl;
            newHotkeys[uuid].shift = newKeybinds[uuid].shift;
            newHotkeys[uuid].alt = newKeybinds[uuid].alt;

            newChanged[uuid] = newKeybinds[uuid];
        }
        setData({groups: data.groups, hotkeys: {...newHotkeys}});
        setChanged(newChanged);

        setSettingKeybind(false);
        disableButtons(true);

        // Ensure group highlighting gets refreshed.  Kinda ugly having this here.
        if (selectedGroupHeader.current) {
            let rows = {};
            data.groups[selectedGroupHeader.current.getAttribute("value")].forEach((UUID) => {
                rows[UUID] = ["menu-group-select-button"];
            });

            setHighlightedKeys(rows, false);
        }
        if (hoverGroupHeader.current) {
            let rows = {};
            data.groups[hoverGroupHeader.current.getAttribute("value")].forEach((UUID) => {
                rows[UUID] = ["menu-group-hover-button"];
            });

            setHighlightedKeys(rows, false);
        }

        return {};
    }

    const handleSettingKeybind = (event) => {
        let dataset = Utils.getDatasetFromEvent(event);

        setBuffer((currentBuffer) => {
            let oldBuffer = JSON.parse(JSON.stringify(currentBuffer));

            // If already setting keybind, then add/remove from buffer based on the row's state
            if (settingKeybind) {
                if (oldBuffer.hasOwnProperty(dataset.id)) {
                    clearHighlightedKeys({
                        [dataset.id]: ["keybind-row-setting-button", "keybind-row-hover-button"]
                    }, true);
                    delete oldBuffer[dataset.id];
                }
                else {
                    oldBuffer[dataset.id] = dataset;
                    // Format to highlightedKeys style
                    setHighlightedKeys(
                        Utils.bufferToHighlights(oldBuffer, ["keybind-row-setting-button"]),
                                                 false);
                }
            }
            // First keybind selection, entering keybind change mode
            else {
                // todo: update when keyboard events are fixed, also add inverse
                // where exiting setting keybind state happens
                oldBuffer[dataset.id] = dataset;
                setHighlightedKeys(
                    Utils.bufferToHighlights(oldBuffer, ["keybind-row-setting-button"]),
                                             false);
                setSettingKeybind(true);
                disableButtons(false);
            }

            // If there's nothing in the buffer anymore, that means that there's no
            // active rows setting a keybind, so leave setting keybind state
            if (Object.keys(oldBuffer).length === 0) {
                setSettingKeybind(false);
                disableButtons(true);
            }
            return oldBuffer;
        });
    }

    // key _can be_ 0, so we cannot use if (key)
    const updateBuffer = (key) => {
        setBuffer((currentBuffer) => {
            let oldBuffer = JSON.parse(JSON.stringify(currentBuffer));
            // Is modifier key
            if (Object.keys(Utils.modifiers).includes(key)) {
                clearHighlightedKeys(Utils.bufferToHighlights(oldBuffer, ["keybind-row-setting-button", "keybind-row-hover-button"]),
                                     true);
                // Check to see what the state of the pressed modifier key is
                // If it's visisble then we need to set all to set all keys
                // in the buffer to false, and vice versa
                // Wish it wasn't two for loops
                let visible = false;
                for (let [uuid,] of Object.entries(oldBuffer)) {
                    if (oldBuffer[uuid][Utils.modifiers[key]]) {
                        visible = true;
                        break;
                    }
                }
                // Update modifier based on visibility
                for (let [uuid,] of Object.entries(oldBuffer)) {
                    oldBuffer[uuid][Utils.modifiers[key]] = !visible;
                }

                setHighlightedKeys(Utils.bufferToHighlights(oldBuffer, ["keybind-row-setting-button"]),
                                   false,
                                   oldBuffer);
            }
            // Not modifier key
            else {
                oldBuffer = confirmKeybinds(oldBuffer, key);
            }
            return oldBuffer;
        });
    }

    // Unused possible future code for if I could get right-clicking a keyboard key to change all
    // eslint-disable-next-line
    const bulkChange = (key) => {
        let keycode = parseInt(Utils.findKeyByValue(simpleKeyboardKeyNames, key));

        let UUIDs = findRowsByKeycode(keycode);

        setBuffer((currentBuffer) => {
            let oldBuffer = JSON.parse(JSON.stringify(buffer));

            if (settingKeybind) {
                for (const UUID of UUIDs) {
                    if (oldBuffer.hasOwnProperty(UUID)) {
                        clearHighlightedKeys({
                            [UUID]: ["keybind-row-setting-button", "keybind-row-hover-button"]
                        }, true);
                        delete oldBuffer[UUID];
                    }
                    else {
                        // It doesn't matter that this includes attributes that a dataset
                        // doesn't have, like menu_id or string_id
                        oldBuffer[UUID] = data.hotkeys[UUID];
                        setHighlightedKeys(
                            Utils.bufferToHighlights(oldBuffer, ["keybind-row-setting-button"]),
                            false
                       );
                    }
                }
            }
            else {
                for (const UUID of UUIDs) {
                    // todo: update when keyboard events are fixed, also add inverse
                    // where exiting setting keybind state happens
                    oldBuffer[UUID] = data.hotkeys[UUID];
                    setHighlightedKeys(
                        Utils.bufferToHighlights(oldBuffer, ["keybind-row-setting-button"]),
                        false
                    );
                    setSettingKeybind(true);
                    disableButtons(false);
                }
            }

            // If there's nothing in the buffer anymore, that means that there's no
            // active rows setting a keybind, so leave setting keybind state
            if (Object.keys(oldBuffer).length === 0) {
                setSettingKeybind(false);
                disableButtons(true);
            }
            return oldBuffer;
        });
    }

    // Sets state of cancel/confirm buttons on keyboard
    const disableButtons = (state) => {
        clear.current.disabled = state;
        cancel.current.disabled = state;
        confirm.current.disabled = state;
    }

    // Handles the actions of the cancel/confirm buttons
    const handleButtons = (event) => {
        if (settingKeybind) {
            if (event.target.value === "clear") {
                clearHighlightedKeys(Utils.bufferToHighlights(buffer, ["keybind-row-setting-button", "keybind-row-hover-button"]),
                                     true);
                setBuffer(confirmKeybinds(buffer, 0));
            }
            else if (event.target.value === "cancel") {
                clearHighlightedKeys(Utils.bufferToHighlights(buffer, ["keybind-row-setting-button", "keybind-row-hover-button"]),
                                     true);
                setSettingKeybind(false);
                setBuffer({});
            }
            else if (event.target.value === "confirm") {
                setBuffer(confirmKeybinds(buffer));
            }
            disableButtons(true);
        }
    }

    // If inputData is null, all highlighted keys will be cleared.
    // If inputData is provided, only the provided classes from the specified keys
    // will be cleared.
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
                    Object.keys(buffer).forEach((key) => {
                        keysString += Utils.datasetToKeyString(buffer[key]) + " ";
                    });
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
                        // todo: avoid the triple spread
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
                if (dataset) {
                    Object.keys(dataset).forEach((key) => {
                        if (Object.keys(inputData).includes(key)) {
                             keysString += Utils.datasetToKeyString(dataset[key]) + " ";
                        }
                    });
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
        });
    }

    /*
        Passed to Keybinds to be used as a callback for updating the keyboard highlighting
    */
    const updateCurrentHover = (event) => {
        let dataset = Utils.getDatasetFromEvent(event);
        if (event.type === "mouseover") {
            let keys = {};
            if (dataset) {
                keys[dataset.id] = ["keybind-row-hover-button"]
            }
            setHighlightedKeys(keys, false);
        }
        else if (event.type === "mouseout") {
            // We have to explicitly say to remove this key, otherwise
            // when the mouse moves across multiple elements in the same render
            // cycle the state isn't accurate to what highlights need to be removed
            // in clearHighlightedKeys()
            clearHighlightedKeys({
                [dataset.id]: ["keybind-row-hover-button"]
            });
        }
    }

    /*
        Given a keycode, returns an array of all UUIDs that have that keycode as their
        current key
    */
    const findRowsByKeycode = (keycode) => {
        if (dataLoadedRef.current) {
            let foundRows = [];
            if (keycode) {
                foundRows = Object.entries(dataLoadedRef.current.hotkeys)
                    .filter(([k, v]) => dataLoadedRef.current.hotkeys[k].keycode === keycode)
                    .map(([k]) => k);
            }
            return foundRows;
        }
    }

    const hoverFilteringRows = (key) => {
        if (!key) {
            setFoundRows([]);
            return;
        }
        let foundRows = [];
        if (key) {
            let keycode = Utils.findKeyByValue(simpleKeyboardKeyNames, key);
            // parseInt() always only returns the first element in an array
            foundRows = findRowsByKeycode(parseInt(keycode));
        }
        setFoundRows(foundRows);
    }

    const toggleFilteringRows = (key) => {
        if (key === filteringKey) {
            setFilteringRows(false);
            setFilteringKey(null);
            // Doesn't use setHighlightedKeys because we haven't grabbed a dataset here
            keyboard.current.dispatch((instance) => {
                instance.removeButtonTheme(key, "button-hover-filtering-button");
            });
        }
        else {
            if (filteringKey) {
                keyboard.current.dispatch((instance) => {
                    instance.removeButtonTheme(filteringKey, "button-hover-filtering-button");
                });
            }
            setFilteringRows(true);
            setFilteringKey(key);
            keyboard.current.dispatch((instance) => {
                instance.addButtonTheme(key, "button-hover-filtering-button");
            });
        }
    }

    const selectMenu = (event) => {
        let group = event.target.getAttribute("value");
        let rows = {}
        if (!selectedGroupHeader.current) {
            data.groups[group].forEach((UUID) => {
                rows[UUID] = ["menu-group-select-button"];
            });
            setHighlightedKeys(rows, false);

            selectedGroupHeader.current = event.target;
            event.target.classList.toggle("menu-group-select-button");
        }
        else if (group === selectedGroupHeader?.current?.getAttribute("value")) {
            data.groups[group].forEach((UUID) => {
                rows[UUID] = ["menu-group-select-button"];
            });
            clearHighlightedKeys(rows);

            selectedGroupHeader.current = null;
            event.target.classList.toggle("menu-group-select-button");
        }
    }

    const hoverMenu = (event) => {
        let group = event.target.getAttribute("value");
        let rows = {}
        if (event.type === "mouseover") {
            data.groups[group].forEach((UUID) => {
                rows[UUID] = ["menu-group-hover-button"];
            });
            setHighlightedKeys(rows, false);
            hoverGroupHeader.current = event.target;
        }
        else if (event.type === "mouseout") {
            data.groups[group].forEach((UUID) => {
                rows[UUID] = ["menu-group-hover-button"];
            });
            clearHighlightedKeys(rows);
            hoverGroupHeader.current = null;
        }
        event.target.classList.toggle("menu-group-hover-button");
    }

    const toggleMenu = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.toggle("is-active");
        let menu = event.target.closest(".menu");
        menu.classList.toggle("collapsed");
    }

    const onSearchInput = (event) => {
        if (dataLoadedRef.current) {
            let searchText = event.target.value.toLowerCase();
            if (searchText === "") {
                setSearchFilter(null);
                return;
            }

            let foundUUIDs = Utils.objectFilter(data.hotkeys, ([, hotkey]) => {
                return hotkey["string_text"].toLowerCase().includes(searchText);
            });
            let foundMenus = Utils.objectFilter(data.groups, ([group, UUIDs]) => {
                return group.toLowerCase().includes(searchText)
            })

            for (let [, UUIDs] of Object.entries(foundMenus)) {
                UUIDs.filter((UUID) => {
                    return !foundUUIDs.hasOwnProperty(UUID);
                })
                UUIDs.forEach((UUID) => {
                    foundUUIDs[UUID] = data.hotkeys[UUID]
                })
            }

            setSearchFilter(Object.keys(foundUUIDs));
        }
    }

    const toggleFavorite = (event) => {
        event.preventDefault();
        event.stopPropagation();
        let id = event.target.getAttribute("id");
        setFavorites((oldFavorites) => {
            let rows = {};
            oldFavorites.forEach((UUID) => {
                rows[UUID] = ["hotkey-favorite"];
            });
            clearHighlightedKeys(rows);

            let indexFavorites = oldFavorites.indexOf(id);
            if (indexFavorites > -1) {
                oldFavorites.splice(indexFavorites, 1);
                delete rows[id]
            }
            else {
                oldFavorites.push(id);
                rows[id] = ["hotkey-favorite"];
            }

            setHighlightedKeys(rows, false);
            ls.set("favorites", oldFavorites);
            return oldFavorites;
        });

        let index = data.groups["Favorites"].indexOf(id);
        if (index > -1) {
            data.groups["Favorites"].splice(index, 1);
        }
        else {
            data.groups["Favorites"].push(id);
        }
    }

    return (
        <>
        <div id="controls">
            <div id="upload">
                <h4>Edit Custom Hotkeys</h4>
                <form method="POST" onSubmit={_handleSubmit}>
                    <input
                        type="file"
                        name="files"
                        multiple
                    />
                    <button type="submit" className="confirm">Load Custom Hotkeys</button>
                </form>
            </div>

            <div id="get-changes">
                <button onClick={uploadChanged} className="confirm">Download Changes</button>
            </div>

            <div id="load-defaults">
                <form method="POST" onSubmit={_getDefaultFiles}>
                    <button type="submit">Load Default Hotkeys</button>
                </form>
            </div>
        </div>

        <div id="keyboard-wrapper">
             {/*className={settingKeybind ? "" : "disable-keyboard"}>*/}
            <FullKeyboard ref={keyboard}
                          updateBuffer={updateBuffer}
                          settingKeybind={settingKeybind}
                          findRowsByKeycode={findRowsByKeycode}
                          toggleFilteringRows={toggleFilteringRows}
                          filteringRows={filteringRows}
                          hoverFilteringRows={hoverFilteringRows}
                          onSearchInput={onSearchInput} />
            <div id="confirmCancelWrapper">
                <button ref={clear}
                        id="clear"
                        className="clear"
                        value="clear"
                        onClick={(e) => handleButtons(e)}>
                    Unset Key
                </button>
                <button ref={cancel}
                        id="cancel"
                        className="cancel"
                        value="cancel"
                        onClick={(e) => handleButtons(e)}>
                    Cancel
                </button>
                <button ref={confirm}
                        id="confirm"
                        className="confirm"
                        value="confirm"
                        onClick={(e) => handleButtons(e)}>
                    Confirm
                </button>
            </div>
        </div>

        <Keybinds data={data}
                  buffer={buffer}
                  updateCurrentHover={updateCurrentHover}
                  handleSettingKeybind={handleSettingKeybind}
                  foundRows={foundRows}
                  filteringRows={filteringRows}
                  selectMenu={selectMenu}
                  hoverMenu={hoverMenu}
                  toggleMenu={toggleMenu}
                  highlighted={highlighted}
                  searchFilter={searchFilter}
                  toggleFavorite={toggleFavorite}/>
        </>
    );
};

export default Upload;
