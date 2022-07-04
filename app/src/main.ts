import { defEquivMap } from "@thi.ng/associative";
import { defAtom } from "@thi.ng/atom";
import { LRUCache } from "@thi.ng/cache";
import { start } from "@thi.ng/hdom";
import { memoize } from "@thi.ng/memoize";
import { getRandomModel } from "./actions";
import {
    Ctx,
    Model,
    ModelCacheKey,
    ModelCacheValue,
    ModelViewState,
    State,
    ViewModel,
    ViewState,
} from "./api";
import { mainCmp } from "./components";
import { getModels, getViewModels } from "./selectors";

export const CACHE_MAX_LENGTH = 3;

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

    const cacheMap = defEquivMap<ModelCacheKey, ModelCacheValue>();
    const cache = new LRUCache<ModelCacheKey, ModelCacheValue>(null, {
        maxlen: CACHE_MAX_LENGTH,
        map: () => cacheMap,
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
        cache,
        cacheMap,
    };

    return () => {
        return mainCmp(ctx);
    };
};

start(app(), { root: document.body });
