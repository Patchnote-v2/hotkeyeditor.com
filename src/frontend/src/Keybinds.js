import { useState } from "react";

import { keyNames } from "./keyNames.js";

const Keybinds = (data) => {
    var keybinds;
    if (Object.keys(data.data).length > 0) {
        keybinds = Object.keys(data.data.groups).map((value, key) => {
            return (
                <>
                <h3>{value}</h3>
                {data.data.groups[value].map((value2, key2) => {
                    var hotkey = data.data.hotkeys[data.data.groups[value][key2]];
                    // console.log(hotkey);
                    if (hotkey) {
                        let rowClassNames = "keycode";
                        rowClassNames += data.buffer && value2 == data.buffer.id ? " active-keybind" : "";
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
                            <span className="keycode-text">{hotkey.string_text} -- </span>
                            <span className="keycode-code">
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
                </>
            );
        });
    }
    
    return (
        <>
        {keybinds ? keybinds : ""}
        </>
    );
};

export default Keybinds;