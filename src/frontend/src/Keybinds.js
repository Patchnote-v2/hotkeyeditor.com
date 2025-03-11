import { useState, useEffect } from "react";

import { keyNames } from "./keyNames.js";
import Utils from "./Utils.js";

const Keybinds = (data) => {
    const [keybinds, setKeybinds] = useState();
    
    useEffect(() => {
        if (data.data) {
            let mapping = Object.keys(data.data.groups).map((value, key) => {
                // Using data.groups, build an array of this menu's hotkeys with UUID keys
                var menuRows = {}
                data.data.groups[value].forEach((UUID) => {
                    menuRows[UUID] = data.data.hotkeys[UUID]
                });
                
                // Filter all menu rows so we can determine if a menu is empty or not
                // Only filter if filtering for insane performance improvements
                if (data.filteringRows) {
                    if (data.searchFilter && data.searchFilter.length !== 0) {
                        menuRows = Utils.objectFilter(menuRows, ([UUID,]) => {
                            return data.foundRows.includes(UUID) && data.searchFilter.includes(UUID);
                        });
                    }
                    // I _think_ this way doesn't work if duplicate string_id's are across
                    // different menus
                    else {
                        menuRows = Utils.objectFilter(menuRows, ([UUID,]) => {
                            return data.foundRows.includes(UUID);
                        });
                    }
                }
                else if (data.searchFilter) {
                    // If no results found, skip filtering by just setting as blank
                    if (data.searchFilter.length === 0) {
                        menuRows = {};
                    }
                    else {
                        menuRows = Utils.objectFilter(menuRows, ([UUID,]) => {
                            return data.searchFilter.includes(UUID);
                        });
                    }
                }
                
                if (menuRows && Object.keys(menuRows).length) {
                    menuRows = Object.keys(menuRows).map((UUID, index) => {
                        var hotkey = menuRows[UUID];
                        
                        let rowClassNames = "hotkey-row";
                        if (Object.keys(data.highlighted).includes(UUID)) {
                            rowClassNames += " " + data.highlighted[UUID].join(" ");
                        }
                        if (data.foundRows.includes(UUID)) {
                            rowClassNames += " hotkey-row-find";
                        }
                        
                        return (
                            <li key={UUID}
                                id={UUID}
                                data-keycode={hotkey.keycode}
                                data-ctrl={hotkey.ctrl}
                                data-shift={hotkey.shift}
                                data-alt={hotkey.alt}
                                onMouseOver={data.updateCurrentHover}
                                onMouseOut={data.updateCurrentHover}
                                onClick={(event) => data.handleSettingKeybind(event)}
                                className={rowClassNames}>
                            {/*<span key={`${UUID}-hotkey-uuid`} className="hotkey-uuid">{UUID}</span>*/}
                            <span key={`${UUID}-hotkey-text`} className="hotkey-text">{hotkey.string_text}</span>
                            <span key={`${UUID}-hotkey-code`} className="hotkey-code">
                                {hotkey.ctrl ? "Ctrl+" : ""}
                                {hotkey.shift ? "Shift+" : ""}
                                {hotkey.alt ? "Alt+" : ""}
                                {/*
                                Following ternary if monstrosity has the following logic:
                                if (hotkey.keycode) {
                                    if (keyNames[hotkey.keycode]) {
                                        String.fromCharCode(hotkey.keycode).toUpperCase()
                                    }
                                    else {
                                      keyNames[hotkey.keycode]  
                                    }
                                }
                                else {
                                    "null"
                                }*/}
                                {hotkey.keycode ? keyNames[hotkey.keycode] ? keyNames[hotkey.keycode] : String.fromCharCode(hotkey.keycode).toUpperCase() : "None"}
                            </span>
                            </li>
                        );
                    });
                    return (
                        <div key={value} className="menu">
                            <span>
                                <h3 onClick={(event) => data.selectMenu(event)}
                                    onMouseOver={(event) => data.hoverMenu(event)}
                                    onMouseOut={(event) => data.hoverMenu(event)}
                                    class="menu-header"
                                    value={value}>
                                    {value}
                                    <span class="hamburger hamburger--minus is-active" onClick={(event) => data.toggleMenu(event)} value={value}>
                                        <span class="hamburger-box">
                                            <span class="hamburger-inner"></span>
                                        </span>
                                    </span>
                                </h3>
                            </span>
                            <ul class="menuList">
                                {menuRows}
                            </ul>
                        </div>
                    );
                }
                else {
                    return null;
                }
            });
            setKeybinds(mapping);
        }
    }, [data])
    
    return (
        <div key="menus" id="menus">
        {keybinds ? keybinds : ""}
        </div>
    );
};

export default Keybinds;
