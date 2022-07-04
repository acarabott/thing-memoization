import { defEquivMap } from "@thi.ng/associative";
import { Atom } from "@thi.ng/atom";
import { LRUCache } from "@thi.ng/cache";
import { fitClamped } from "@thi.ng/math";
import { memoize } from "@thi.ng/memoize";
import {
    Model,
    ModelCacheKey,
    ModelCacheValue,
    ModelViewStateEntry,
    MODEL_MAX_VALUE,
    State,
    ViewModel,
    ViewState,
} from "./api";
import { WORKSPACE_WIDTH_PX } from "./components";

export const CACHE_MAX_LENGTH = 3;

const getViewModelsImpl = (
    models: State["models"],
    viewStates: ModelViewStateEntry[],
): ViewModel[] => {
    const h = 80;
    const viewModels = models.map((model, i): ViewModel => {
        const item = viewStates.find((findViewState) => findViewState.modelId === model.id);
        if (item === undefined) {
            throw new Error("No view state found for model");
        }
        const x = fitClamped(model.value, 0, MODEL_MAX_VALUE, 0, WORKSPACE_WIDTH_PX);

        return {
            model,
            rect: {
                x,
                y: 10 + i * (h + 10),
                w: 300,
                h,
            },
            ...item.state,
        };
    });

    return viewModels;
};

export const defCache = (
    state: Atom<State>,
    viewState: Atom<ViewState>,
    onCacheBusted: () => void,
) => {
    const cacheMap = defEquivMap<ModelCacheKey, ModelCacheValue>();
    const cache = new LRUCache<ModelCacheKey, ModelCacheValue>(null, {
        maxlen: CACHE_MAX_LENGTH,
        map: () => cacheMap,
    });

    const memoized = memoize<Model[], ModelViewStateEntry[], ViewModel[]>(
        (models: State["models"], viewStates: ModelViewStateEntry[]) => {
            onCacheBusted();
            const result = getViewModelsImpl(models, viewStates);
            return result;
        },
        cache,
    );

    const getViewModels = () => {
        return memoized(state.deref().models, viewState.deref().models);
    };

    return { cache, cacheMap, getViewModels };
};
