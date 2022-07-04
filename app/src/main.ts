import { defEquivMap } from "@thi.ng/associative";
import { Atom, defAtom } from "@thi.ng/atom";
import { LRUCache } from "@thi.ng/cache";
import { start } from "@thi.ng/hdom";
import { button, div, textArea } from "@thi.ng/hiccup-html";
import { memoize } from "@thi.ng/memoize";
import { map, reverse, str } from "@thi.ng/transducers";

interface Model {
    id: number;
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

interface ModelViewState {
    id: Model["id"];
    isHovered: boolean;
}

interface ViewState {
    models: ModelViewState[];
}

interface ViewModel extends ModelViewState {
    model: Model;
    rect: Rect;
}

interface Ctx {
    state: Atom<State>;
    viewState: Atom<ViewState>;
    getViewModels: () => ViewModel[];
    getNextModelId: () => number;
    log: string[];
}

const getModels = (state: Atom<State>) => {
    return state.deref().models;
};

const getViewModels = (models: State["models"], viewStates: ModelViewState[]): ViewModel[] => {
    const h = 50;
    const viewModels = models.map((model, i): ViewModel => {
        const viewState = viewStates.find((findViewState) => findViewState.id === model.id);
        if (viewState === undefined) {
            throw new Error("No view state found for model");
        }
        return {
            model,
            rect: {
                x: 10,
                y: 10 + i * (h + 10),
                w: 300,
                h,
            },
            ...viewState,
        };
    });

    return viewModels;
};

const addModel = (ctx: Ctx, model: Model) => {
    ctx.state.swapIn(["models"], (models): Model[] => [...models, model]);
    ctx.viewState.swapIn(["models"], (models): ModelViewState[] => [
        ...models,
        { id: model.id, isHovered: false },
    ]);
};

const getRandomModel = (getNextModelId: () => Model["id"]): Model => {
    const model: Model = {
        id: getNextModelId(),
        value: Math.floor(Math.random() * 1000),
    };

    return model;
};

const hoverModel = (ctx: Ctx, modelId: Model["id"]) => {
    ctx.viewState.swapIn(["models"], (modelViewStates) =>
        modelViewStates.map((modelViewState) => {
            if (modelViewState.id === modelId) {
                return { ...modelViewState, isHovered: true };
            }

            return modelViewState;
        }),
    );
};

const unhoverModel = (ctx: Ctx, modelId: Model["id"]) => {
    ctx.viewState.swapIn(["models"], (modelViewStates) =>
        modelViewStates.map((modelViewState) => {
            if (modelViewState.id === modelId) {
                return { ...modelViewState, isHovered: false };
            }

            return modelViewState;
        }),
    );
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
                        background: vm.isHovered ? "rgb(43, 156, 212)" : "white",
                    },
                    onmouseenter: () => hoverModel(ctx, vm.model.id),
                    onmouseleave: () => unhoverModel(ctx, vm.model.id),
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
                overflow: "scroll",
            },
        },
        valueCmps,
    );
};

const addModelCmp = (ctx: Ctx) => {
    const addCmp = button(
        { onclick: () => addModel(ctx, getRandomModel(ctx.getNextModelId)) },
        "Add",
    );

    return addCmp;
};

const noopModelCmp = (ctx: Ctx) => {
    const noopCmp = button(
        {
            onclick: () =>
                ctx.state.swap((oldState) => {
                    const state: State = {
                        models: oldState.models.map((model) => ({ ...model })),
                    };
                    return state;
                }),
        },
        "No-op",
    );

    return noopCmp;
};

const logCmp = (ctx: Ctx) => {
    const value: string = str("\n", reverse(ctx.log));

    return textArea({
        value,
        cols: 80,
        rows: 10,
    });
};

const cacheCmp = (size: number) => {
    return div({}, `Cache size: ${size}`);
};

const app = () => {
    const getNextModelId = (() => {
        let nextId = 0;
        return () => nextId++;
    })();

    const stateAtom = defAtom<State>({
        models: [getRandomModel(getNextModelId), getRandomModel(getNextModelId)],
    });

    const viewStateAtom = defAtom<ViewState>({
        models: getModels(stateAtom).map((model) => ({ id: model.id, isHovered: false })),
    });

    const log: string[] = [];

    const cache = new LRUCache(null, {
        maxlen: 1,
        map: () => defEquivMap<[Model[], ModelViewState[]], ViewModel[]>(),
    });
    const getViewModelsMemoized = memoize<Model[], ModelViewState[], ViewModel[]>(
        (models: State["models"], viewStates: ModelViewState[]) => {
            const now = new Date().toTimeString().split(" ")[0];
            log.push(`${now}: Cache busted!`);

            const result = getViewModels(models, viewStates);
            return result;
        },
        cache,
    );

    const ctx: Ctx = {
        state: stateAtom,
        viewState: viewStateAtom,
        getViewModels: () =>
            getViewModelsMemoized(getModels(stateAtom), viewStateAtom.deref().models),
        getNextModelId,
        log,
    };

    return () => {
        return div(
            {},
            addModelCmp(ctx),
            noopModelCmp(ctx),
            modelsCmp(ctx),
            logCmp(ctx),
            cacheCmp(cache.length),
        );
    };
};

start(app(), { root: document.body });
