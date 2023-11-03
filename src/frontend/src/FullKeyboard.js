import React, { Component } from "react";
import { render } from "react-dom";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./index.css";
import { useEffect, useState, forwardRef } from 'react';

const FullKeyboard = React.forwardRef(({ props }, keyboard) => {
  const [layoutName, setLayoutName] = useState("");
  const [input, setInput] = useState("");
  
  const [settingKeybind, setSettingKeybind] = useState(false);

  const enabledKeyboardOptions = {
    onKeyReleased: (key) => onKeyReleased(key),
    theme: "simple-keyboard hg-theme-default hg-layout-default",
    disableButtonHold: true,
    disableCaretPositioning: true,
    physicalKeyboardHighlight: true,
    physicalKeyboardHighlightPressUsePointerEvents: true,
    physicalKeyboardHighlightPreventDefault: true,
    disableCaretPositioning: true,
    syncInstanceInputs: true,
    mergeDisplay: true,
    // debug: true
  };
  
  const disabledKeyboardOptions = {
    ...enabledKeyboardOptions,
    physicalKeyboardHighlight: false,
    physicalKeyboardHighlightPreventDefault: false,
    physicalKeyboardHighlightPressUsePointerEvents: false,
  }
  
  const commonKeyboardOptions = settingKeybind ? enabledKeyboardOptions : disabledKeyboardOptions;

  const keyboardOptions = {
    ...commonKeyboardOptions,
    /**
     * Layout by:
     * Sterling Butters (https://github.com/SterlingButters)
     */
    layout: {
      default: [
        "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
        "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
        "{tab} Q W E R T Y U I O P [ ] \\",
        "{capslock} A S D F G H J K L ; ' {enter}",
        "{shiftleft} Z X C V B N M , . / {shiftright}",
        "{ctrlleft} {metaleft} {altleft} {space} {altright} {metaright} {ctrlright}"
      ]
    },
    display: {
      "{escape}": "esc ⎋",
      "{tab}": "tab ⇥",
      "{backspace}": "backspace ⌫",
      "{enter}": "enter ↵",
      "{capslock}": "caps ⇪",
      "{shiftleft}": "shift ⇧",
      "{shiftright}": "shift ⇧",
      "{ctrlleft}": "ctrl ⌃",
      "{ctrlright}": "ctrl ⌃",
      "{altleft}": "alt ⌥",
      "{altright}": "alt ⌥",
      "{metaleft}": "meta ⌘",
      "{metaright}": "meta ⌘",
      "{f1}": "F1",
      "{f2}": "F2",
      "{f3}": "F3",
      "{f4}": "F4",
      "{f5}": "F5",
      "{f6}": "F6",
      "{f7}": "F7",
      "{f8}": "F8",
      "{f9}": "F9",
      "{f10}": "F10",
      "{f11}": "F11",
      "{f12}": "F12",
    }
  };

  const keyboardControlPadOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: [
        "{prtscr} {scrolllock} {pause}",
        "{insert} {home} {pageup}",
        "{delete} {end} {pagedown}"
      ]
    }
  };

  const keyboardArrowsOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: ["{arrowup}", "{arrowleft} {arrowdown} {arrowright}"]
    }
  };

  const keyboardNumPadOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: [
        "{numlock} {numpaddivide} {numpadmultiply}",
        "{numpad7} {numpad8} {numpad9}",
        "{numpad4} {numpad5} {numpad6}",
        "{numpad1} {numpad2} {numpad3}",
        "{numpad0} {numpaddecimal}"
      ]
    }
  };

  const keyboardNumPadEndOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: ["{numpadsubtract}", "{numpadadd}", "{numpadenter}"]
    }
  };
  
  const onKeyReleased = (key) => {
    console.log(key);
  }
  
  return (
    <div id="keyboard-wrapper">
      <div className={"keyboardContainer"}>
        <Keyboard
          ref={keyboard}
          baseClass={"simple-keyboard-main"}
          keyboardRef={r => {keyboard.current = r}}
          layoutName={layoutName}
          {...keyboardOptions}
        />

        <div className="controlArrows">
          <Keyboard
            baseClass={"simple-keyboard-control"}
            {...keyboardControlPadOptions}
          />
          <Keyboard
            baseClass={"simple-keyboard-arrows"}
            {...keyboardArrowsOptions}
          />
        </div>

        <div className="numPad">
          <Keyboard
            baseClass={"simple-keyboard-numpad"}
            {...keyboardNumPadOptions}
          />
          <Keyboard
            baseClass={"simple-keyboard-numpadEnd"}
            {...keyboardNumPadEndOptions}
          />
        </div>
      </div>
    </div>
  );
})
export default FullKeyboard;