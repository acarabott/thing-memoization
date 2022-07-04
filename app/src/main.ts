import { Atom, defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { div, li, ul } from "@thi.ng/hiccup-html";
import { map } from "@thi.ng/transducers";

interface State {
    values: number[];
}

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface ValueVM {
    value: number;
    rect: Rect;
}

interface Ctx {
    state: Atom<State>;
}

const getModels = (ctx: Ctx) => {
    ctx.state.deref().values;
};

const getViewModels = (values: State["values"]): ValueVM[] => {
    const h = 50;
    const viewModels = values.map((value, i) => ({
        value,
        rect: {
            x: 10,
            y: 10 + i * (h + 10),
            w: 300,
            h,
        },
    }));

    return viewModels;
};

const app = () => {
    const stateAtom = defAtom<State>({ values: [666, 333] });

    const ctx: Ctx = {
        state: stateAtom,
    };

    return () => {
        const state = ctx.state.deref();
        const viewModels = getViewModels(state.values);
        const valueCmps = map(
            (vm) =>
                div(
                    {
                        style: {
                            position: "absolute",
                            left: `${vm.rect.x}px`,
                            top: `${vm.rect.y}px`,
                            width: `${vm.rect.w}px`,
                            height: `${vm.rect.h}px`,
                            background: "white",
                        },
                    },
                    `value: ${vm.value} rect: ${JSON.stringify(vm.rect)}`,
                ),
            viewModels,
        );

        return div(
            {
                style: {
                    position: "relative",
                    width: "500px",
                    height: "500px",
                    background: "black",
                },
            },
            valueCmps,
        );
    };
};

start(app, { root: document.body });
