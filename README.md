# AoE2: DE Hotkey Editor
A Django site used for visually editing Age of Empires 2: Definitive Edition hotkeys.  Only works with files from update 83607 (May 15, 2023) onwards.

The reason that this project only supports modern hotkey files is due to the fact that update 83607 split the classic `.hki` file into two `.hkp` files.  I found it easier to make a new site with the features that I'd always wanted (namely a keyboard display) instead of trying to fork and update the original (I also have no experience with web2py).

## Credits
This project uses code from the site [Hotkey Editor for AoE II](
https://aokhotkeys.appspot.com/), using its [associated repository](https://github.com/crimsoncantab/aok-hotkeys).  The main pieces I've used are the code to parse the hotkey files, the file associating the hotkeys with the in-game strings, and the file that associates the input keycodes with the keycodes used in the hotkey files.

Invaluble Resources:
* https://gist.github.com/KSneijders/8be5b386100548cc4a24da5ff2c6b520
* https://gist.github.com/KSneijders/9231eeec1a66b314c3402729f0c455fa