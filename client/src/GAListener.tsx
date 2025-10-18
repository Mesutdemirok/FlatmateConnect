import { useEffect } from "react";
import { sendPageView } from "./ga";

export default function GAListener() {
  useEffect(() => {
    // fire once on first load
    sendPageView();

    // patch history methods so SPA navigations emit an event
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    const fire = () => window.dispatchEvent(new Event("locationchange"));

    history.pushState = function (...args) {
      const ret = origPush.apply(this, args as any);
      fire();
      return ret;
    } as any;

    history.replaceState = function (...args) {
      const ret = origReplace.apply(this, args as any);
      fire();
      return ret;
    } as any;

    window.addEventListener("popstate", fire);
    const onChange = () => sendPageView();
    window.addEventListener("locationchange", onChange);

    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      window.removeEventListener("popstate", fire);
      window.removeEventListener("locationchange", onChange);
    };
  }, []);

  return null;
}
