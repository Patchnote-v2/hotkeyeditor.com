const Info = () => {
    return (
        <div id="info">
        <div>
            <h3>How?</h3>
            <div>
                <h4>Starting from scratch:</h4>
                <ul>
                    <li>Click <pre style={{display: "inline"}}>Load Default Hotkeys</pre> to start with the default hotkeys.</li>
                    <li>Edit your hotkeys as you see fit.</li>
                    <li>When you're done, click <pre style={{display: "inline"}}>Download Changes</pre>.</li>
                </ul>
            </div>
            <div>
                <h4>Staring with existing hotkeys:</h4>
                <ul>
                    <li>Note the name of the hotkey profile you want to edit.</li>
                    <li>Then go to the following directory ([your Steam ID] is a random 17-digit number):
                        <ul>
                            <li><pre>{"C:\\Users\\[Windows username]\\Games\\Age of Empires 2 DE\\[your Steam ID]\\profile\\"}</pre></li>
                        </ul>
                    </li>
                    <li>There are two files you need.  They are both .hkp files.
                        <ul>
                            <li>The first one is the name of your profile.</li>
                            <li>The second is <pre style={{display: "inline"}}>Base.hkp</pre> in the folder with the same name as your profile.</li>
                        </ul>
                    </li>
                    <li>Copy these two files to another directory.</li>
                    <li>Click <pre style={{display: "inline"}}>Browse</pre>, select your two .hkp files, then click <pre style={{display: "inline", color: "lightgreen"}}>Upload</pre></li>
                    <li>Edit your hotkeys as you see fit.</li>
                    <li>When you're done, click <pre style={{display: "inline"}}>Download Changes</pre>.</li>
                </ul>
            </div>
            <div>
                <h4>Saving to your computer</h4>
                Extract the downloaded <i>Hotkeys.zip</i> into the approriate directory.  [your Steam ID] is a random 17-digit number.
                <ul>
                    <li><pre>{"C:\\Users\\[Windows username]\\Games\\Age of Empires 2 DE\\[your Steam ID]\\profile\\"}</pre></li>
                </ul>
            </div>
            <div>
                If you want to override a hotkey profile, then you <i>also</i> need to override the cloud version:
                <ul>
                    <li><pre>{"C:\\Program Files (x86)\\Steam\\userdata\\[random number]\\813780\\remote\\"}</pre></li>
                </ul>
            </div>
        </div>
        
        <div>
            <h3>Features</h3>
            <ul>
                <li>Select any number of hotkeys to edit.</li>
                <li>Hover over a key to highlight all keybinds that use it.</li>
                <li>Select a key to show hotkeys that only use that key.</li>
                <li>Hover over a group name to highlight all keys that group (e.g. Stable) uses.</li>
                <li>Select a group to toggle highlighting of all keys that group uses.</li>
                <li>Change the grid layout by bulk-changing keybinds (i.g. all hotkeys that use Q can be changed simultaneously).</li>
            </ul>
        </div>

        <div>
            <h3>Contact</h3>
            <p>The best way to contact me is through a <a href="https://github.com/Patchnote-v2/aoe2de-hotkeys/issues">GitHub ticket.</a></p>
        </div>

        <div>
            <h3>About</h3>
            <p>I've always wanted a better way to visualize how hotkeys all tie in and overlap, and I needed a project to learn React with.  Thanks to the work put in by crimsoncantab for <a href="https://aokhotkeys.appspot.com/">Hotkey Editor for AoE II</a>, I was able to update <a href="https://github.com/crimsoncantab/aok-hotkeys">his code</a> that deserializes the .hkp files to accomodate the new two-file system.  If you want support for earlier version of DE, or any version of the game pre-DE, go there!</p>
        </div>
        </div>
    )
};

export default Info;