import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useEffect, forwardRef, useRef } from 'react';

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

const FullKeyboard = forwardRef((props, keyboard) => {
  const filteringRowsRef = useRef();
  
  // I don't understand this.  In the parent, even if I'm updating the state that gets passed
  // to this component's props in a useEffect in the parent, this component never recieves
  // the updated prop.  For some reason, using a ref works though?
  useEffect(() => {
    filteringRowsRef.current = props.filteringRows;
  }, [props]);

  const commonKeyboardOptions = {
    onRender: (keyboard2) => {
        keyboard2.recurseButtons((button) => {
          button.addEventListener('mouseover', (event) => {
            // Determines keyboard key hover color
            button.classList.add(props.buffer ? "button-hover-setting-button" : "button-hover-passive-button");

            // Row highlighting based on what's currently being hovered over
            let currentButton = event.target.dataset.skbtn;
            if (!filteringRowsRef.current) {
              if (!(Object.keys(modifiers).includes(currentButton))) {
                let found = Utils.findKeyByValue(simpleKeyboardKeyNames, currentButton);
                // parseInt() always only returns the first element in an array
                props.findRowsByKeycode(parseInt(found));
              }
            }
        });
        button.addEventListener('mouseout', (event) => {
            // Determines keyboard key hover color
            button.classList.remove(props.buffer ? "button-hover-setting-button" : "button-hover-passive-button");

            if (!filteringRowsRef.current) {
              props.findRowsByKeycode(null);
            }
        });
      })
    },
    onKeyPress: (key, event) => onKeyPress(key, event),
    onKeyReleased: (key, event) => onKeyReleased(key, event),
    theme: "simple-keyboard hg-theme-default hg-layout-default",
    disableButtonHold: true,
    disableCaretPositioning: true,
    // physicalKeyboardHighlight: true,
    physicalKeyboardHighlightPress: true,
    physicalKeyboardHighlightPressUsePointerEvents: true,
    physicalKeyboardHighlightPreventDefault: true,
    physicalKeyboardHighlightPressUseClick: true,
    syncInstanceInputs: true,
    mergeDisplay: true,
    // debug: true
  };
  
  let keyboardLayoutDefault = [
    "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
    "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
    "{tab} Q W E R T Y U I O P [ ] \\",
    "{capslock} A S D F G H J K L ; ' {enter}",
    "{shiftleft} Z X C V B N M , . / {shiftright}",
    "{controlleft} {metaleft} {altleft} {space} {altright} {metaright} {controlright}"
  ];
  const keyboardOptions = {
    ...commonKeyboardOptions,
    buttonAttributes: [
      {
        attribute: "draggable",
        value: "true",
        buttons: keyboardLayoutDefault.reduce((previous, current) => previous.concat(" " + current)),
      },
    ],
    /**
     * Layout by:
     * Sterling Butters (https://github.com/SterlingButters)
     */
    layout: {
      default: keyboardLayoutDefault,
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

  let keyboardControlPadLayout = [
    "{prtscr} {scrolllock} {pause}",
    "{insert} {home} {pageup}",
    "{delete} {end} {pagedown}"
  ];
  const keyboardControlPadOptions = {
    ...commonKeyboardOptions,
    buttonAttributes: [
      {
        attribute: "draggable",
        value: "true",
        buttons: keyboardControlPadLayout.reduce((previous, current) => previous.concat(" " + current)),
      },
    ],
    layout: {
      default: keyboardControlPadLayout,
    }
  };

  let keyboardArrowsLayout = ["{arrowup}", "{arrowleft} {arrowdown} {arrowright}"]
  const keyboardArrowsOptions = {
    ...commonKeyboardOptions,
    buttonAttributes: [
      {
        attribute: "draggable",
        value: "true",
        buttons: keyboardArrowsLayout.reduce((previous, current) => previous.concat(" " + current)),
      },
    ],
    layout: {
      default: keyboardArrowsLayout,
    }
  };

  let keyboardNumPadLayout = [
    "{numlock} {numpaddivide} {numpadmultiply}",
    "{numpad7} {numpad8} {numpad9}",
    "{numpad4} {numpad5} {numpad6}",
    "{numpad1} {numpad2} {numpad3}",
    "{numpad0} {numpaddecimal}"
  ];
  const keyboardNumPadOptions = {
    ...commonKeyboardOptions,
    buttonAttributes: [
      {
        attribute: "draggable",
        value: "true",
        buttons: keyboardNumPadLayout.reduce((previous, current) => previous.concat(" " + current)),
      },
    ],
    layout: {
      default: keyboardNumPadLayout,
    }
  };

  let keyboardNumPadEndLayout = ["{numpadsubtract}", "{numpadadd}", "{numpadenter}"];
  const keyboardNumPadEndOptions = {
    ...commonKeyboardOptions,
    buttonAttributes: [
      {
        attribute: "draggable",
        value: "true",
        buttons: keyboardNumPadEndLayout.reduce((previous, current) => previous.concat(" " + current)),
      },
    ],
    layout: {
      default: keyboardNumPadEndLayout,
    }
  };

  let keyboardMouseExtraLayout = ["{mouseextra2}", "{mouseextra1}"];
  const keyboardMouseExtraOptions = {
    ...commonKeyboardOptions,
    buttonAttributes: [
      {
        attribute: "draggable",
        value: "true",
        buttons: keyboardMouseExtraLayout.reduce((previous, current) => previous.concat(" " + current)),
      },
    ],
    layout: {
      default: keyboardMouseExtraLayout,
    },
    display: {
      "{mouseextra2}": "Mouse Extra 2 ↑",
      "{mouseextra1}": "↓ Mouse Extra 1",
    }
  };
  
  let keyboardMousePrimaryLayout = ["{wheelup}", "{mouse1} {mousemiddle} {mouse2}", "{wheeldown}"];
  const keyboardMousePrimaryOptions = {
    ...commonKeyboardOptions,
    buttonAttributes: [
      {
        attribute: "draggable",
        value: "true",
        buttons: keyboardMousePrimaryLayout.reduce((previous, current) => previous.concat(" " + current)),
      },
    ],
    layout: {
      default: keyboardMousePrimaryLayout,
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
    // console.log("onKeyPress");
    // console.log(event)
    // console.log(key);
    // if (event.repeat) {
      // console.log("repeating");
      // event.preventDefault();
      // event.stopPropagation();
    // }
  }

  const onKeyReleased = (key, event) => {
    // console.log("onKeyReleased");
    // console.log(event)
    // console.log(key);
    
    // If actively setting keybind
    if (props.buffer) {
      let newBuffer = JSON.parse(JSON.stringify(props.buffer))
      // If a modifier was pressed
      if (Object.keys(modifiers).includes(key)) {
        newBuffer[modifiers[key]] = !(newBuffer[modifiers[key]]);
        props.updateBuffer(newBuffer);
      }
      else {
        let keycode = Utils.findKeyByValue(simpleKeyboardKeyNames, key);
        newBuffer.keycode = parseInt(keycode);
        props.updateBuffer(newBuffer);
      }
    }
    // If not setting a keybind, filter out all keybind rows other than key pressed
    else if (!props.buffer) {
      props.setFilteringRows(!props.filteringRows);
    }
  }
  
  return (
    <div id="keyboard-wrapper"
         className={props.buffer ? "" : "disable-keyboard"}>
      <div className={"keyboardContainer"}>
        <Keyboard
          ref={keyboard}
          baseClass={"simple-keyboard-main"}
          keyboardRef={r => {keyboard.current = r}}
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