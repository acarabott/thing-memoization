import { defAtom } from "@thi.ng/atom";
import { start } from "@thi.ng/hdom";
import { getRandomModel } from "./actions";
import { Ctx, State, ViewState } from "./api";
import { defCache, defGetViewModelsMemoized } from "./cache";
import { mainCmp } from "./components";
import { getModels } from "./selectors";

const app = () => {
    const stateAtom = defAtom<State>({
        models: [getRandomModel(), getRandomModel()],
    });

    const viewStateAtom = defAtom<ViewState>({
        models: getModels(stateAtom).map((model) => ({ id: model.id, isHovered: false })),
    });

    const log: string[] = [];

    const viewModelCache = defCache();

    const getViewModelsMemoized = defGetViewModelsMemoized(viewModelCache.cache, () => {
        const now = new Date().toTimeString().split(" ")[0];
        log.push(`${now}: Cache busted!`);
    });

    const ctx: Ctx = {
        state: stateAtom,
        viewState: viewStateAtom,
        getViewModels: () =>
            getViewModelsMemoized(getModels(stateAtom), viewStateAtom.deref().models),
        log,
        ...viewModelCache,
    };

    return () => {
        return mainCmp(ctx);
    };
};

start(app(), { root: document.body });
