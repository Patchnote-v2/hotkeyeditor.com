import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import Utils from "./Utils.js";

const Notifications = forwardRef((props, ref) => {
    const [notifications, setNotifications] = useState([]);
    
    const removeNotification = (index) => {
        let oldNotifications = [...notifications];
        oldNotifications.splice(index, 1);
        setNotifications(oldNotifications);
    }
    
    const addNotification = (message) => {
        setNotifications(oldNotifications => [message, ...oldNotifications]);
    }
    
    useImperativeHandle(ref, () => {
        return {
            addNotification,
        };
    });
    
    return (
        <div ref={ref}
             id="notifications-wrapper">
            {notifications.map((each, index) => {
                return (
                    <div className="notification">
                        <span className="message" dangerouslySetInnerHTML={{ __html: each }} />
                        <span className="close-notification" onClick={e => removeNotification(index)}>✕</span>
                    </div>
                );
            })}
        </div>
    );
});


export default Notifications;