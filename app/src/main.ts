import { Atom, defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { div, li, ul } from "@thi.ng/hiccup-html";
import { map } from "@thi.ng/transducers";

interface State {
    values: number[];
}

interface Ctx {
    state: Atom<State>;
}

const getModels = (ctx: Ctx) => {
    ctx.state.deref().values;
};

const app = () => {
    const stateAtom = defAtom<State>({ values: [666, 333] });

    const ctx: Ctx = {
        state: stateAtom,
    };

    return () => {
        const state = ctx.state.deref();
        const valueCmps = map((value) => li({}, value), state.values);
        return div({}, ul({}, valueCmps));
    };
};

start(app, { root: document.body });
