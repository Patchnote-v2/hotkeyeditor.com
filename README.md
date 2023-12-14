# HotkeyEditor.com, A Rich AoE2:DE Hotkey Editor
This is the code for [HotkeyEditor.com](https://hotkeyeditor.com), a site for viewing and editing Age of Empires 2: Definitive Edition hotkeys.  Only files from update 83607 (May 15, 2023) onwards are compatible.

## Features
- Edit any number of hotkeys at a time
- Finding all hotkeys by which key is used
- More logical hotkey grouping
- Visualising all keys used by a group
- Search for hotkeys!

## About
There's already a legacy editor out there, [Hotkey Editor for AoE II](
https://aokhotkeys.appspot.com/), that works for AoK, AoC, HD, CP, and older versions of DE.  However, DE's update 83607 split the classic `.hki` hotkey file into two `.hkp` files.  I looked into forking @crimsoncantab's work and updating it, but I found it easier to make a new site since I have no experience with web2py and wanted a project to learn React with.  The main feature I'd always wanted was a keyboard display for better visualization of hotkeys.

## Credits
This project uses code from the aforementioned site [Hotkey Editor for AoE II](
https://aokhotkeys.appspot.com/), using its [associated repository](https://github.com/crimsoncantab/aok-hotkeys).  The main pieces I've used are the code to unzip and parse the hotkey files, the file associating the hotkeys with the in-game strings, and the file that associates the input keycodes with the keycodes used in the hotkey files.

In addition, I also found these pages from @KSneijders to be invaluble:
* [HKP Hotkey Distribution](https://gist.github.com/KSneijders/8be5b386100548cc4a24da5ff2c6b520)
* [HKP File Format](https://gist.github.com/KSneijders/9231eeec1a66b314c3402729f0c455fa)

 
 ## Future Ideas
 - I would love to get the hotkeys of popular players and have them as starting presets.
 - Building on this, a data analysis of the hotkeys that people create would be neat.  Things like a heatmap for most common hotkeys would be neat, but would require me to start saving visitor's data (even if it's non-identifiable and completely anonymized).
 - Right-click a key to start editing all hotkeys that use that key.  Currently this isn't doable due to the way react-simple-keyboard rerenders, meaning I can't block the context menu from opening upon right-clicking a key if I also update key highlights in the same tick.
 - Drag-and-dropping menus to visually reorganize them would be nice, but I don't think it's worth the effort.
 - Session cookies so changes are persistent between sessions, allowing for easier continuation.  Right now I prefer to not deal with cookies since it's much simpler.

## Developing

### In one terminal window:

1. Clone repository:

        git clone https://github.com/Patchnote-v2/hotkeyeditor.com.git
2. Go into newly cloned directory
  
        cd hotkeyeditor.com

3. Create a Python virtual environment
  
       python3 -m venv .venv

4. Active the new virtual environment
  
       source .venv/bin/activate`

5. Install the Python requirements
  
       pip3 install -r requirements.txt

6. Go to the source directory
  
       cd src

7. Run the Django server
  
       python3 manage.py runserver

### In a separate terminal

1. Go to the frontend directory
  
       cd hotkeyeditor.com/src/frontend

2. Install NPM packages
  
       npm run install

3. Run server
  
       npm run start