import { useState, useEffect } from "react";

import { keyNames } from "./keyNames.js";

const Keybinds = (data) => {
    const [keybinds, setKeybinds] = useState();
    
    useEffect(() => {
        if (data.data) {
            let mapping = Object.keys(data.data.groups).map((value, key) => {
                return (
                    <div class="menu">
                    <h3>{value}</h3>
                    {data.data.groups[value].map((value2, key2) => {
                        var hotkey = data.data.hotkeys[data.data.groups[value][key2]];
                        if (hotkey) {
                            let rowClassNames = "hotkey-row";
                            rowClassNames += data.buffer && value2 == data.buffer.id ? " keybind-row-setting" : "";
                            rowClassNames += !data.buffer && data.foundRows.includes(value2) ? " hotkey-row-find" : ""
                            return (
                                <li key={value2}
                                    id={value2}
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
                        }
                        else {
                            return;
                        }
                    })}
                    </div>
                );
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