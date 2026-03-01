import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopOnRouteChange = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // التمرير إلى أعلى الصفحة عند تغيير المسار
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTopOnRouteChange;
