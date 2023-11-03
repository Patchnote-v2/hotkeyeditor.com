export const keyNames = {
    //AoK uses 251-255 for mouse key codes
    // 1 : 'Lbutton', // Left mouse button
    // 2 : 'Rbutton', // Right mouse button
    // 3 : 'Cancel', // Control-break processing
    // 4 : 'Mbutton', // Middle mouse button (three-button mouse)
    // 5 : 'Xbutton1', // X1 mouse button
    // 6 : 'Xbutton2', // X2 mouse button
//'-'  : 0x07, // Undefined
    8 : 'Backspace', // BACKSPACE key
    9 : 'Tab', // TAB key
//'-'  : 0x0A-0B, // Reserved
    12 : 'Clear', // CLEAR key
    13 : 'Enter', // ENTER key
//'-'  : 0x0E-0F, // Undefined
    16 : 'Shift', // SHIFT key
    17 : 'Ctrl', // CTRL key
    18 : 'Alt', // ALT key
    19 : 'Pause', // PAUSE key
    20 : 'Caps Lock', // CAPS LOCK key
    // 21 : 'Kana', // IME Kana mode
    // 21 : 'Hanguel', // IME Hanguel mode (maintained for compatibility; use <strong>VK_HANGUL</strong>)
    21 : 'Hangul', // IME Hangul mode
//'-'  : 0x16, // Undefined
    23 : 'Junja', // IME Junja mode
    24 : 'Final', // IME final mode
    // 25 : 'Hanja', // IME Hanja mode
    25 : 'Kanji', // IME Kanji mode
//'-'  : 0x1A, // Undefined
    27 : 'Escape', // ESC key
    28 : 'Convert', // IME convert
    29 : 'Nonconvert', // IME nonconvert
    30 : 'Accept', // IME accept
    31 : 'Mode Change', // IME mode change request
    32 : 'Space', // SPACEBAR
    33 : 'Page Up', // PAGE UP key
    34 : 'Page Down', // PAGE DOWN key
    35 : 'End', // END key
    36 : 'Home', // HOME key
    37 : 'Left', // LEFT ARROW key
    38 : 'Up', // UP ARROW key
    39 : 'Right', // RIGHT ARROW key
    40 : 'Down', // DOWN ARROW key
    41 : 'Select', // SELECT key
    42 : 'Print', // PRINT key
    43 : 'Execute', // EXECUTE key
    44 : 'Print Screen', // PRINT SCREEN key
    45 : 'Insert', // INS key
    46 : 'Delete', // DEL key
    47 : 'Help', // HELP key
//''  : 0x30, // 0 key
//''  : 0x31, // 1 key
//''  : 0x32, // 2 key
//''  : 0x33, // 3 key
//''  : 0x34, // 4 key
//''  : 0x35, // 5 key
//''  : 0x36, // 6 key
//''  : 0x37, // 7 key
//''  : 0x38, // 8 key
//''  : 0x39, // 9 key
//'-'  : 0x3A-40, // Undefined
//''  : 0x41, // A key
//''  : 0x42, // B key
//''  : 0x43, // C key
//''  : 0x44, // D key
//''  : 0x45, // E key
//''  : 0x46, // F key
//''  : 0x47, // G key
//''  : 0x48, // H key
//''  : 0x49, // I key
//''  : 0x4A, // J key
//''  : 0x4B, // K key
//''  : 0x4C, // L key
//''  : 0x4D, // M key
//''  : 0x4E, // N key
//''  : 0x4F, // O key
//''  : 0x50, // P key
//''  : 0x51, // Q key
//''  : 0x52, // R key
//''  : 0x53, // S key
//''  : 0x54, // T key
//''  : 0x55, // U key
//''  : 0x56, // V key
//''  : 0x57, // W key
//''  : 0x58, // X key
//''  : 0x59, // Y key
//''  : 0x5A, // Z key
    91 : 'Left Win', // Left Windows key (Natural keyboard) 
    92 : 'Right Win', // Right Windows key (Natural keyboard)
    93 : 'Menu', // Applications key (Natural keyboard)
//'-'  : 0x5E, // Reserved
    95 : 'Sleep', // Computer Sleep key
    96 : 'Num0', // Numeric keypad 0 key
    97 : 'Num1', // Numeric keypad 1 key
    98 : 'Num2', // Numeric keypad 2 key
    99 : 'Num3', // Numeric keypad 3 key
    100 : 'Num4', // Numeric keypad 4 key
    101 : 'Num5', // Numeric keypad 5 key
    102 : 'Num6', // Numeric keypad 6 key
    103 : 'Num7', // Numeric keypad 7 key
    104 : 'Num8', // Numeric keypad 8 key
    105 : 'Num9', // Numeric keypad 9 key
    106 : 'Num*', // Multiply key
    107 : 'Num+', // Add key
    108 : 'Num,', // Separator key
    109 : 'Num-', // Subtract key
    110 : 'Num.', // Decimal key
    111 : 'Num/', // Divide key
    112 : 'F1', // F1 key
    113 : 'F2', // F2 key
    114 : 'F3', // F3 key
    115 : 'F4', // F4 key
    116 : 'F5', // F5 key
    117 : 'F6', // F6 key
    118 : 'F7', // F7 key
    119 : 'F8', // F8 key
    120 : 'F9', // F9 key
    121 : 'F10', // F10 key
    122 : 'F11', // F11 key
    123 : 'F12', // F12 key
    124 : 'F13', // F13 key
    125 : 'F14', // F14 key
    126 : 'F15', // F15 key
    127 : 'F16', // F16 key
    128 : 'F17', // F17 key
    129 : 'F18', // F18 key
    130 : 'F19', // F19 key
    131 : 'F20', // F20 key
    132 : 'F21', // F21 key
    133 : 'F22', // F22 key
    134 : 'F23', // F23 key
    135 : 'F24', // F24 key
//'-'  : 0x88-8F, // Unassigned
    144 : 'Num Lock', // NUM LOCK key
    145 : 'Scroll Lock', // SCROLL LOCK key
//''  : 0x92-96, // OEM specific
//'-'  : 0x97-9F, // Unassigned
    160 : 'Lshift', // Left SHIFT key
    161 : 'Rshift', // Right SHIFT key
    162 : 'Lcontrol', // Left CONTROL key
    163 : 'Rcontrol', // Right CONTROL key
    164 : 'Left Menu', // Left MENU key
    165 : 'Right Menu', // Right MENU key
    166 : 'Browser Back', // Browser Back key
    167 : 'Browser Forward', // Browser Forward key
    168 : 'Browser Refresh', // Browser Refresh key
    169 : 'Browser Stop', // Browser Stop key
    170 : 'Browser Search', // Browser Search key 
    171 : 'Browser Favorites', // Browser Favorites key
    172 : 'Browser Home', // Browser Start and Home key
    173 : 'Volume Mute', // Volume Mute key
    174 : 'Volume Down', // Volume Down key
    175 : 'Volume Up', // Volume Up key
    176 : 'Media Next Track', // Next Track key
    177 : 'Media Prev Track', // Previous Track key
    178 : 'Media Stop', // Stop Media key
    179 : 'Media Play Pause', // Play/Pause Media key
    180 : 'Launch Mail', // Start Mail key
    181 : 'Launch Select Media', // Select Media key
    182 : 'Launch App1', // Start Application 1 key
    183 : 'Launch App2', // Start Application 2 key
//'-'  : 0xB8-B9, // Reserved
    186 : ';', // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the ';:' key
    187 : '=', // For any country/region, the '+' key
    188 : ',', // For any country/region, the ',' key
    189 : '-', // For any country/region, the '-' key
    190 : '.', // For any country/region, the '.' key
    191 : '/', // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the '/?' key
    192 : '`', // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the '`~' key
//'-'  : 0xC1-D7, // Reserved
//'-'  : 0xD8-DA, // Unassigned
    219 : '[', // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the '[{' key
    220 : '\\', // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the '\|' key
    221 : ']', // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the ']}' key
    222 : '\'', // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the 'single-quote/double-quote' key
    223 : 'Misc', // Used for miscellaneous characters; it can vary by keyboard.
//'-'  : 0xE0, // Reserved
//''  : 0xE1, // OEM specific
    226 : 'Angle Bracket', // Either the angle bracket key or the backslash key on the RT 102-key keyboard
//''  : 0xE3-E4, // OEM specific
    229 : 'IME Process', // IME PROCESS key
//''  : 0xE6, // OEM specific
    231 : 'Packet', //  Used to pass Unicode characters as if they were keystrokes.
//'-'  : 0xE8, // Unassigned
//''  : 0xE9-F5, // OEM specific
    246 : 'Attn', // Attn key
    247 : 'CrSel', // CrSel key
    248 : 'ExSel', // ExSel key
    249 : 'Erase EOF', // Erase EOF key
    250 : 'Play', // Play key
    // 251 : 'Zoom', // Zoom key
    // 252 : 'Noname', // Reserved 
    // 253 : 'Pa1', // PA1 key
    // 254 : 'Oem Clear' // Clear key
    //These keys are remapped to AoK codes for various mouse buttons
    251 : 'Extra Button 2', // AoK uses this for Extra Button 2
    252 : 'Extra Button 1', // AoK uses this for Extra Button 1
    253 : 'Middle Button', // AoK uses this for Middle Button
    254 : 'Wheel Down', // AoK uses this for Wheel Down
    255 : 'Wheel Up' // AoK uses this for Wheel Up
}
// const translate_key_code = (code) => {
//     return KEY_MAP[code] || code;
// }
