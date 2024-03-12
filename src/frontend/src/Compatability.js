import { useEffect, useRef } from "react";

const Compatability = (props) => {
    const notifications = useRef(null);
    
    useEffect(() => {
        if (!notifications.current) {
            notifications.current = props.notifications.current;
        }
    }, [props])
    
    useEffect(() => {
        let queryList = window.matchMedia("(max-width: 1200px)");
        queryList.addEventListener("change", monitorWidth);
        
        // First-time run for if window is already <1200px
        // This is possible due to MediaQueryList and the event both having match as a property"
        monitorWidth(queryList);
        
        // Prevents event from firing twice in StrictMode
        // https://stackoverflow.com/a/71103130/2368714
        return () => {
            queryList.removeEventListener("change", monitorWidth);
        }
    }, [])
    
    const monitorWidth = (event) => {
        if (event.matches) {
            notifications.current.addNotification("Your viewport width is narrower than 1200 pixels.  Narrow widths won't break the site, but will make using it difficult.");
        }
    }
}

export default Compatability;