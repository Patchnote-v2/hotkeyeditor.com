// import logo from './logo.svg';
import './scss/App.scss';

import { useRef } from "react";

import Compatability from './Compatability.js';
import Upload from './Upload.js';
import Notifications from './Notification.js';
import Info from './Info.js';

 const App = () => {
    const notification = useRef();
    
    return (
        <>
        <Info />
        <Notifications ref={notification} />
        <Upload notifications={notification} />
        <Compatability notifications={notification}/>
        </>
    )
};

export default App;
