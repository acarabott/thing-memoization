import { defEquivMap } from "@thi.ng/associative";
import { Atom } from "@thi.ng/atom";
import { LRUCache } from "@thi.ng/cache";
import { fitClamped } from "@thi.ng/math";
import { memoize } from "@thi.ng/memoize";
import {
    Model,
    ModelCacheKey,
    ModelCacheValue,
    ModelViewState,
    MODEL_MAX_VALUE,
    State,
    ViewModel,
    ViewState,
} from "./api";
import { WORKSPACE_WIDTH_PX } from "./components";

export const CACHE_MAX_LENGTH = 3;

// implementation to get a View Model from an existing `Model` and `ModelViewState`
// this is the function we want to memoize so we can call it for rendering and interaction purposes and
// not worry about cost
const getViewModelsImpl = (models: State["models"], viewStates: ModelViewState[]): ViewModel[] => {
    const h = 80;
    const viewModels = models.map((model, i): ViewModel => {
        const viewState = viewStates.find((findViewState) => findViewState.modelId === model.id);
        if (viewState === undefined) {
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
            ...viewState,
        };
    });

    return viewModels;
};

// create the cache to use for view models
export const defCache = (
    state: Atom<State>,
    viewState: Atom<ViewState>,
    onCacheBusted: () => void,
) => {
    // a map to look up ViewModels, using arrays of Models and View states
    // importantly, this implementation has "value equality" (as opposed to ES6 Map's reference equality)
    const cacheMap = defEquivMap<ModelCacheKey, ModelCacheValue>();

    // Least Recently Used Cache. Determine the maximum number of items to cache, and use our EquivMap for storage
    const cache = new LRUCache<ModelCacheKey, ModelCacheValue>(null, {
        maxlen: CACHE_MAX_LENGTH,
        map: () => cacheMap,
    });

    // memoize getViewModelsImpl with our cache.
    // if we were not injecting the `onCacheBusted` function we could just do
    // const memoized = memoize<Model[], ModelViewState[], ViewModel[]>(getViewModelsImpl, cache);

    const memoized = memoize<Model[], ModelViewState[], ViewModel[]>(
        (models: State["models"], viewStates: ModelViewState[]) => {
            onCacheBusted();
            const result = getViewModelsImpl(models, viewStates);
            return result;
        },
        cache,
    );

    // wrawp into a convenience function that uses our state and viewState stores
    const getViewModels = () => {
        return memoized(state.deref().models, viewState.deref().models);
    };

    return { cache, cacheMap, getViewModels };
};
