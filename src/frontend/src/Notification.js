import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import Utils from "./Utils.js";

const Notifications = forwardRef((props, ref) => {
    const [notifications, setNotifications] = useState([]);
    
    const addNotification = (message) => {
        setNotifications(oldNotifications => [message, ...oldNotifications]);
    }
    
    useImperativeHandle(ref, () => {
        return {
            addNotification,
        };
    });
    
    const listNotifications = notifications.map((each) => {
        return (
            <div className="notification">
                <span className="messaeg" dangerouslySetInnerHTML={{ __html: each }} />
                <span className="close-notification">✕</span>
            </div>
        );
    })
    
    return (
        <div ref={ref}
             id="notifications-wrapper">
                {listNotifications}
        </div>
    );
});


export default Notifications;