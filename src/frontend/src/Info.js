const Info = () => {
    return (
        <div id="info">
            <div>
                <section>
                    <h3>Requirements</h3>
                    <ul style={{fontSize: "12.5pt"}}>
                        <li><b>83607</b> (May 15, 2023) is the oldest supported version.</li>
                        <li><b>107882</b> is the latest supported version.</li>
                        <li>A minimum window width of <b>1200 pixels</b>.</li>
                    </ul>
                </section>
                <section>
                    <h3>Features</h3>
                    <ul>
                        <li>Edit any number of hotkeys at a time</li>
                        <li>Search for hotkeys</li>
                        <li>Finding all hotkeys that use a specific key</li>
                        <li>More logical hotkey grouping</li>
                        <li>Visualising all keys used by a group</li>
                    </ul>
                </section>

                <section>
                    <h3>About</h3>
                    <p>I've always wanted a better way to visualize how hotkeys all tie in and overlap and find under- or over-utilized keys, and I needed a project to learn React with.  Thanks to the work put in by crimsoncantab for <a href="https://aokhotkeys.appspot.com/">Hotkey Editor for AoE II</a>, I was able to update <a href="https://github.com/crimsoncantab/aok-hotkeys">his code</a> that deserializes the .hkp files to accomodate the new two-file system.  If you want support for earlier versions of DE, or any version of the game pre-DE, go there!</p>
                </section>
                
                <section>
                    <h3>Contact</h3>
                    <p>The best way to contact me is through a <a href="https://github.com/Patchnote-v2/aoe2de-hotkeys/issues">GitHub ticket.</a></p>
                </section>
            </div>
            
            
            <div>
                <section>
                    <h3>How?</h3>
                    <div>
                        <h4 style={{marginTop: "5px"}}>Starting from scratch:</h4>
                        <ul>
                            <li>Click <pre>Load Default Hotkeys</pre> to start with the default hotkeys.</li>
                            <li>Edit your hotkeys as you see fit.</li>
                            <li>When you're done, click <pre>Download Changes</pre>.</li>
                        </ul>
                    </div>
                    <div>
                        <h4>Starting with existing hotkeys:</h4>
                        <ul>
                            <li>Note the name of the hotkey profile you want to edit.</li>
                            <li>Go to the following directory ([your Steam ID] is a random 17-digit number):
                                <ul>
                                    <li className="pre-container"><pre>{"C:\\Users\\[Windows username]\\Games\\Age of Empires 2 DE\\[your Steam ID]\\profile\\"}</pre></li>
                                </ul>
                            </li>
                            <li>There are two files you need.  They are both <b>.hkp</b> files.
                                <ul>
                                    <li>The first one is the name of your profile.</li>
                                    <li>The second is <pre>Base.hkp</pre> in a folder with the same name as your profile.</li>
                                </ul>
                            </li>
                            <li>Copy these two files to another directory.</li>
                            <li>Click <pre>Browse</pre>, select your two .hkp files, then click <pre style={{color: "lightgreen"}}>Load Custom Hotkeys</pre>.</li>
                            <li>Edit your hotkeys as you see fit.</li>
                            <li>When you're done, click <pre>Download Changes</pre>.</li>
                        </ul>
                    </div>
                    <div>
                        <h4>Saving to your computer</h4>
                        Extract the downloaded <i>Hotkeys.zip</i> into the approriate directory.  [your Steam ID] is a random 17-digit number.
                        <ul>
                            <li className="pre-container"><pre>{"C:\\Users\\[Windows username]\\Games\\Age of Empires 2 DE\\[your Steam ID]\\profile\\"}</pre></li>
                        </ul>
                    </div>
                    <div>
                        If you want to override a hotkey profile, then you <i>also</i> need to override the cloud version:
                        <ul>
                            <li className="pre-container"><pre>{"C:\\Program Files (x86)\\Steam\\userdata\\[random number]\\813780\\remote\\"}</pre></li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    )
};

export default Info;