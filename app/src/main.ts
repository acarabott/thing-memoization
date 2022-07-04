import { ArraySet, defArraySet, defEquivMap, EquivMap } from "@thi.ng/associative";
import { Atom, defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { button, div, li, ul } from "@thi.ng/hiccup-html";
import { memoize } from "@thi.ng/memoize";
import { map } from "@thi.ng/transducers";

interface Model {
    value: number;
}

interface State {
    models: Model[];
}

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface ViewModel {
    model: Model;
    rect: Rect;
}

interface Ctx {
    state: Atom<State>;
    getViewModels: () => ViewModel[];
}

const getModels = (state: Atom<State>) => {
    return state.deref().models;
};

const getViewModels = (values: State["models"]): ViewModel[] => {
    console.log("this");
    const h = 50;
    const viewModels = values.map(
        (model, i): ViewModel => ({
            model,
            rect: {
                x: 10,
                y: 10 + i * (h + 10),
                w: 300,
                h,
            },
        }),
    );

    return viewModels;
};

const addModel = (ctx: Ctx, model: Model) => {
    ctx.state.swapIn(["models"], (models) => [...models, model]);
};

const getRandomModel = (): Model => {
    const model: Model = {
        value: Math.floor(Math.random() * 1000),
    };

    return model;
};

const modelsCmp = (ctx: Ctx) => {
    const viewModels = ctx.getViewModels();

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
                `value: ${vm.model.value} rect: ${JSON.stringify(vm.rect)}`,
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

const addModelCmp = (ctx: Ctx) => {
    const addCmp = button({ onclick: () => addModel(ctx, getRandomModel()) }, "Add");

    return addCmp;
};

const app = () => {
    const stateAtom = defAtom<State>({ models: [{ value: 666 }, { value: 333 }] });

    const cache = defEquivMap<Model[], ViewModel[]>();
    const getViewModelsMemoized = memoize(getViewModels, cache);
    const ctx: Ctx = {
        state: stateAtom,
        getViewModels: () => getViewModelsMemoized(getModels(stateAtom)),
    };

    return () => {
        return div({}, addModelCmp(ctx), modelsCmp(ctx));
    };
};

start(app(), { root: document.body });
