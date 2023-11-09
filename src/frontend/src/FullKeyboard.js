import React, { Component } from "react";
import { render } from "react-dom";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./index.css";
import { useEffect, useState, forwardRef, useRef } from 'react';

import { simpleKeyboardKeyNames } from './keyNames.js';
import Utils from './Utils.js';

const modifiers = {
  "{shiftleft}": "shift",
  "{shiftright}": "shift",
  "{controlleft}": "ctrl",
  "{controlright}": "ctrl",
  "{altleft}":  "alt",
  "{altright}": "alt"
}

const FullKeyboard = React.forwardRef((props, keyboard) => {
  const [layoutName, setLayoutName] = useState("");
  const [input, setInput] = useState("");
  const settingKeybindRef = useRef();
  
  // I don't understand this.  In the parent, even if I'm updating the state that gets passed
  // to this component's props in a useEffect in the parent, this component never recieves
  // the updated prop.  For some reason, using a ref works though?
  useEffect(() => {
    settingKeybindRef.current = props.settingKeybind;
  }, [props]);

  const commonKeyboardOptions = {
    onRender: (keyboard2) => {
                keyboard2.recurseButtons((button) => {
                  button.addEventListener('mouseover', (event) => {
                    button.classList.add(settingKeybindRef.current ? "button-hover-setting-button" : "button-hover-passive-button");
                    
                    // Row highlighting based on what's currently being hovered over
                    let currentButton = event.target.dataset.skbtn;
                    if (!(Object.keys(modifiers).includes(currentButton))) {
                      let found = Utils.findKeyByValue(simpleKeyboardKeyNames, currentButton);
                      props.findRowsByKeyCode(found);
                    }
                })
                button.addEventListener('mouseout', (event) => {
                    button.classList.remove(settingKeybindRef.current ? "button-hover-setting-button" : "button-hover-passive-button");
                    props.findRowsByKeyCode(null);
                })
              })
            },
    onKeyPress: (key, event) => onKeyPress(key, event),
    onKeyReleased: (key, event) => onKeyReleased(key, event),
    theme: "simple-keyboard hg-theme-default hg-layout-default",
    disableButtonHold: true,
    disableCaretPositioning: true,
    physicalKeyboardHighlight: true,
    physicalKeyboardHighlightPress: true,
    physicalKeyboardHighlightPressUsePointerEvents: true,
    physicalKeyboardHighlightPreventDefault: true,
    physicalKeyboardHighlightPressUseClick: true,
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
        "{tab} Q W E R T Y U I O P [ ] \\",
        "{capslock} A S D F G H J K L ; ' {enter}",
        "{shiftleft} Z X C V B N M , . / {shiftright}",
        "{controlleft} {metaleft} {altleft} {space} {altright} {metaright} {controlright}"
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
      "{controlleft}": "ctrl ⌃",
      "{controlright}": "ctrl ⌃",
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

  const keyboardMouseExtraOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: ["{mouseextra2}", "{mouseextra1}"]
    },
    display: {
      "{mouseextra2}": "Mouse Extra 2 ↑",
      "{mouseextra1}": "↓ Mouse Extra 1",
    }
  };

  const keyboardMousePrimaryOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: ["{wheelup}", "{mouse1} {mousemiddle} {mouse2}", "{wheeldown}"]
    },
    display: {
      "{mouse1}": "Mouse 1",
      "{mouse2}": "Mouse 2",
      "{wheelup}": "Wheel Up",
      "{mousemiddle}": "Middle",
      "{wheeldown}": "Wheel Down",
    }
  };
  
  const onKeyPress = (key, event) => {
    console.log("onKeyPress");
    console.log(event)
    console.log(key);
    // if (event.repeat) {
      // console.log("repeating");
      // event.preventDefault();
      // event.stopPropagation();
    // }
  }

  const onKeyReleased = (key, event) => {
    console.log("onKeyReleased");
    console.log(event)
    console.log(key);
    
    // If actively setting keybind
    if (props.buffer) {
      // If a modifier was pressed
      if (Object.keys(modifiers).includes(key)) {
        props.buffer[modifiers[key]] = !(props.buffer[modifiers[key]]);
        props.updateBuffer(props.buffer);
      }
    }
  }
  
  return (
    <div id="keyboard-wrapper"
         className={props.settingKeybind ? "" : "disable-keyboard"}>
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
        <div className="mouse">
          <Keyboard
            baseClass={"simple-keyboard-mouse-extra"}
            {...keyboardMouseExtraOptions}
          />
          <Keyboard
            baseClass={"simple-keyboard-mouse-primary"}
            {...keyboardMousePrimaryOptions}
          />
        </div>
      </div>
    </div>
  );
})
export default FullKeyboard;