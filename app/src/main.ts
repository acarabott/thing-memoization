import { defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { addModel, getRandomModel } from "./actions";
import { Ctx, State, ViewState } from "./api";
import { defCache } from "./cache";
import { mainCmp } from "./components";

const app = () => {
    const stateAtom = defAtom<State>({ models: [] });
    const viewStateAtom = defAtom<ViewState>({ models: [] });

    const log: string[] = [];

    const onCacheBusted = () => {
        const now = new Date().toTimeString().split(" ")[0];
        log.push(`${now}: Cache busted!`);
    };

    const ctx: Ctx = {
        state: stateAtom,
        viewState: viewStateAtom,
        log,
        ...defCache(stateAtom, viewStateAtom, onCacheBusted),
    };

    for (let i = 0; i < 2; i++) {
        addModel(ctx, getRandomModel());
    }

    return () => {
        return mainCmp(ctx);
    };
};

start(app(), { root: document.body });
