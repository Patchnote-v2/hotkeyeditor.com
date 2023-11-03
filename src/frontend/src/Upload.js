import { useState, useRef } from "react";
import axios from "axios";

import FullKeyboard from './FullKeyboard.js';
import Keybinds from './Keybinds.js';

axios.defaults.baseURL = 'http://localhost:8000';

const Upload = () => {
    const [changed, setChanged] = useState({});
    const [data, setData] = useState({});
    const [settingKeybind, setSettingKeybind] = useState(false);
    
    const currentHover = useRef();
    
    
    const _handleSubmit = (event) => {
        // Prevent the browser from reloading the page
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        axios({
            method: 'post',
            url: '/upload/',
            data: formData,
        }).then((response) => {console.log(response.data);setData(response.data)})
          .catch((error) => {console.log(error);});
    }
    
    const _getDefaultFiles = (event) => {
        event.preventDefault();
        
        axios({
            method: 'get',
            url: '/upload/',
        }).then((response) => {console.log(response.data);setData(response.data)})
          .catch((error) => {console.log(error);});
    }
    
    const _updateCurrentHover = (event) => {
        console.log(event);
    }

    return (
        <>
        <form method="POST" onSubmit={_handleSubmit}>
            <label htmlFor="files">Select Files</label>
            <input
                type="file"
                name="files"
                multiple
            />
            <button type="submit">Upload Files</button>
        </form>
        <form method="POST" onSubmit={_getDefaultFiles}>
            <label htmlFor="loadDefaults">Load Defaults</label>
            <button type="submit">Load Defaults</button>
        </form>
        <FullKeyboard settingKeybind={settingKeybind}/>
        <Keybinds data={data} updateCurrentHoverCallback={_updateCurrentHover} />
        </>
    );
};

export default Upload;