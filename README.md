# AoE2: DE Hotkey Editor
A Django site used for inspecting and editing Age of Empires 2: Definitive Edition hotkeys.  Only files from update 83607 (May 15, 2023) onwards are compatible.

There's already a legacy editor out there, [Hotkey Editor for AoE II](
https://aokhotkeys.appspot.com/), that works for AoK, AoC, HD, CP, and DE.  However, DE's update 83607 split the classic `.hki` hotkey file into two `.hkp` files.  I found it easier to make a new site with the features that I'd always wanted (namely a keyboard display for visualizing) instead of trying to fork and update the original since I have no experience with web2py and wanted a project to learn React with.

## Credits
This project uses code from the site [Hotkey Editor for AoE II](
https://aokhotkeys.appspot.com/), using its [associated repository](https://github.com/crimsoncantab/aok-hotkeys).  The main pieces I've used are the code to unzip and parse the hotkey files, the file associating the hotkeys with the in-game strings, and the file that associates the input keycodes with the keycodes used in the hotkey files.

Invaluble Resources:
* [HKP Hotkey Distribution](https://gist.github.com/KSneijders/8be5b386100548cc4a24da5ff2c6b520)
* [HKP File Format](https://gist.github.com/KSneijders/9231eeec1a66b314c3402729f0c455fa)

## Features
 - Editing your hotkeys, even multiple at a time!
 - Hover over a key to highlight all keybinds that use it
 - Select a key to filter to hotkeys that _only_ use that key
 - Hover over a group to highlight all keys that group (e.g. Barracks) uses
 - Select a group to toggle highlighting of all keys that group uses
 - WIP: Change the grid layout by bulk-changing keybinds (i.e. all hotkeys that use Q can be changed simultaneously)
 
 ## Future Ideas
 - I would love to get the hotkeys of popular players and have them as starting presets
 - Drag-and-dropping menus to visually reorganize them would be nice, but I don't think it's worth the effort
 - Session cookies so changes are persistent between sessions, allowing for easier continuation.  Right now I prefer to not deal with cookies since it's much simpler