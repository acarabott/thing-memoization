import { defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { addModel, defModelViewState } from "./actions";
import { Ctx, State, ViewState } from "./api";
import { defCache } from "./cache";
import { mainCmp } from "./components";

const app = () => {
    // define state for our models
    const stateAtom = defAtom<State>({ models: [] });

    // define temp UI state for models.
    // this is state that cannot be derived from the model, e.g. is it hovered or not?
    const viewStateAtom = defAtom<ViewState>({ models: [] });

    // keep view states and models in sync
    stateAtom.addWatch("modelsToViewStates", (_id, _oldState, state) => {
        viewStateAtom.swapIn(["models"], (modelStateEntries) => {
            const newStateEntries = state.models.map((model) => {
                let modelState = modelStateEntries.find((mse) => mse.modelId === model.id);
                if (modelState === undefined) {
                    modelState = defModelViewState(model);
                }
                return modelState;
            });

            return newStateEntries;
        });
    });

    // a log of timestamped messages for whenever the cache is invalidated
    const log: string[] = [];

    // function to call whenever the cache is busted, so we can print to a log component
    const onCacheBusted = () => {
        const now = new Date().toTimeString().split(" ")[0];
        log.push(`${now}: Cache busted!`);
    };

    // create our cache and memoized view model function
    const cache = defCache(stateAtom, viewStateAtom, onCacheBusted);

    // create application context
    const ctx: Ctx = {
        state: stateAtom,
        viewState: viewStateAtom,
        log,
        // including all parts of the cache on the ctx for visualiztion purposes, 
        // normally would only include the memoized func
        ...cache,
    };

    // add some initial models
    addModel(ctx);
    addModel(ctx);

    return () => {
        return mainCmp(ctx);
    };
};

start(app(), { root: document.body });
