import { useState, useEffect } from "react";

import { keyNames } from "./keyNames.js";
import Utils from "./Utils.js";

const Keybinds = (data) => {
    const [keybinds, setKeybinds] = useState();
    
    useEffect(() => {
        if (data.data) {
            let mapping = Object.keys(data.data.groups).map((value, key) => {
                // Filter all menu rows so we can determine if a menu is empty or not
                
                // Using groups, build an array of this menu's hotkeys with UUID keys
                var menuRows = {}
                data.data.groups[value].forEach((value) => {
                    let hotkeyIndex = Utils.findKeyByValueAttribute(data.data.hotkeys, value, "string_id");
                    if (hotkeyIndex.length == 2) {
                    }
                    if (hotkeyIndex.length) {
                        hotkeyIndex.forEach((UUID) => {
                            menuRows[UUID] = data.data.hotkeys[UUID];
                        })
                    }
                })
                
                // Only filter if filtering for insane performance improvements
                if (data.filterRows) {
                    // I _think_ this way doesn't work if duplicate string_id's are across
                    // different menus
                    menuRows = Utils.objectFilter(menuRows, ([UUID, hotkey]) => {
                        return data.foundRows.includes(UUID)
                    });
                }
                
                if (menuRows && Object.keys(menuRows).length) {
                    menuRows = Object.keys(menuRows).map((UUID, index) => {
                        // I don't like this duplicate call
                        // todo: make it so that menuRows is an array of hotkeys
                        var hotkey = menuRows[UUID];
                        
                        let rowClassNames = "hotkey-row";
                        rowClassNames += data.buffer && UUID === data.buffer.id ? " keybind-row-setting" : "";
                        rowClassNames += !data.buffer && data.foundRows.includes(UUID) ? " hotkey-row-find" : ""
                        
                        return (
                            <li key={UUID}
                                id={UUID}
                                data-keycode={hotkey.keycode}
                                data-ctrl={hotkey.ctrl}
                                data-shift={hotkey.shift}
                                data-alt={hotkey.alt}
                                onMouseOver={data.updateCurrentHoverCallback}
                                onMouseOut={data.updateCurrentHoverCallback}
                                onClick={(event) => data.handleSettingKeybind(event)}
                                className={rowClassNames}>
                            <span className="hotkey-text">{hotkey.string_text} -- </span>
                            <span className="hotkey-code">
                                {hotkey.ctrl ? "Ctrl+" : ""}
                                {hotkey.shift ? "Shift+" : ""}
                                {hotkey.alt ? "Alt+" : ""}
                                {keyNames[hotkey.keycode] ? keyNames[hotkey.keycode] : String.fromCharCode(hotkey.keycode).toUpperCase()}
                            </span>
                            </li>
                        );
                    });
                    return (
                        <div className="menu">
                        <h3>{value}</h3>
                        {menuRows}
                        </div>
                    );
                }
                else {
                    return null;
                }
            })
            setKeybinds(mapping);
        }
    }, [data])
    
    return (
        <div id="menus">
        {keybinds ? keybinds : ""}
        </div>
    );
};

export default Keybinds;