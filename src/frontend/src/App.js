// import logo from './logo.svg';
import './scss/App.scss';

import { useRef } from "react";

import Upload from './Upload.js'
import Notifications from './Notification.js'

 const App = () => {
    const notification = useRef();
    
    return (
        <>
        <Notifications ref={notification} />
        <Upload notifications={notification} />
        </>
    )
};

export default App;
