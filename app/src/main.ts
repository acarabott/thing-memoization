import { start } from "@thi.ng/hdom";
import { div } from "@thi.ng/hiccup-html";

const app = () => {
    return () => {
        return div({}, "hello");
    };
};

start(app, { root: document.body });
