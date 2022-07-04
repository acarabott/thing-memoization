import { defEquivMap } from "@thi.ng/associative";
import { defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { addModel, defModelViewState } from "./actions";
import { Ctx, ModelID, ModelViewState, State } from "./api";
import { defCache } from "./cache";
import { mainCmp } from "./components";

const app = () => {
    const stateAtom = defAtom<State>({ models: [] });
    const viewState = defEquivMap<ModelID, ModelViewState>();

    stateAtom.addWatch("modelsToViewStates", (_id, _oldState, state) => {
        const toAdd: Array<[ModelID, ModelViewState]> = [];
        for (const model of state.models) {
            let modelState = viewState.get(model.id);
            if (modelState === undefined) {
                modelState = defModelViewState();
            }
            toAdd.push([model.id, modelState]);
        }

        viewState.clear();
        for (const item of toAdd) {
            viewState.set(...item);
        }
    });

    const log: string[] = [];

    const onCacheBusted = () => {
        const now = new Date().toTimeString().split(" ")[0];
        log.push(`${now}: Cache busted!`);
    };

    const ctx: Ctx = {
        state: stateAtom,
        viewState,
        log,
        ...defCache(stateAtom, viewState, onCacheBusted),
    };

    addModel(ctx);
    addModel(ctx);

    return () => {
        return mainCmp(ctx);
    };
};

start(app(), { root: document.body });
