import { useState } from "react";
import axios from "axios";
axios.defaults.baseURL = 'http://localhost:8000';

const Upload = () => {
    const _handleSubmit = (event) => {
        // Prevent the browser from reloading the page
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        axios({
            method: 'post',
            url: '/upload/',
            data: formData,
        }).then((response) => {console.log(response.data);})
          .catch((error) => {console.log(error);});
    }
      
    return (
        <>
        <form method="POST" onSubmit={_handleSubmit}>
            <label htmlFor="files">Select Files</label>
            <input
                type="file"
                name="files"
                multiple
                // onChange={(e) => InsertFiles(e)}
            />
            <button type="submit">Upload All files</button>
        </form>
        </>
    );
};

export default Upload;