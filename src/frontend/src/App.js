import { useRef } from "react";

import Compatability from './Compatability.js';
import Upload from './Upload.js';
import Notifications from './Notification.js';
import Info from './Info.js';

 const App = () => {
    const notification = useRef(null);
    
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
