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
                        return (
                            <li key={value2}
                                data-keycode={hotkey.keycode}
                                data-ctrl={hotkey.ctrl}
                                data-shift={hotkey.shift}
                                data-alt={hotkey.alt}>
                            <span>{hotkey.string_text} -- </span>
                            <span style={{"backgroundColor": "#DADADA"}}>
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
            // console.log(data.data.groups[value]);
            // console.log(data.data.hotkeys[data.data.groups[value]]);
        });
    }
    
    console.log(keybinds);
    
    return (
        <>
        {keybinds ? keybinds : ""}
        </>
    );
};

export default Keybinds;