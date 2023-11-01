


import React, { Component } from "react";
import { render } from "react-dom";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./index.css";
import { useEffect, useState, useRef } from 'react';

const FullKeyboard = () => {
  const [layoutName, setLayoutName] = useState("");
  const [input, setInput] = useState("");
  const keyboard = useRef();

  const commonKeyboardOptions = {
    onChange: (input) => onChange(input),
    onKeyPress: (button) => onKeyPress(button),
    theme: "simple-keyboard hg-theme-default hg-layout-default",
    disableButtonHold: true,
    physicalKeyboardHighlight: true,
    syncInstanceInputs: true,
    mergeDisplay: true,
    // debug: true
  };

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
        "{tab} q w e r t y u i o p [ ] \\",
        "{capslock} a s d f g h j k l ; ' {enter}",
        "{shiftleft} z x c v b n m , . / {shiftright}",
        "{controlleft} {altleft} {metaleft} {space} {metaright} {altright}"
      ]
    },
    display: {
      "{escape}": "esc ⎋",
      "{tab}": "tab ⇥",
      "{backspace}": "backspace ⌫",
      "{enter}": "enter ↵",
      "{capslock}": "caps lock ⇪",
      "{shiftleft}": "shift ⇧",
      "{shiftright}": "shift ⇧",
      "{controlleft}": "ctrl ⌃",
      "{controlright}": "ctrl ⌃",
      "{altleft}": "alt ⌥",
      "{altright}": "alt ⌥",
      "{metaleft}": "cmd ⌘",
      "{metaright}": "cmd ⌘"
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

  const onChange = (input) => {
    // setInput(input);
    // console.log("Input changed", input);
  }

  const onKeyPress = (button) => {
    console.log("Button pressed", button);
  }
  
  const onChangeInput = (event) => {
    let input = event.target.value;
    setInput(input);
  }
  
  useEffect(() => {
    keyboard.current.setInput(input);
  }, [input]);

  return (
    <div>
      <div className={"keyboardContainer"}>
        <Keyboard
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
}
export default FullKeyboard;