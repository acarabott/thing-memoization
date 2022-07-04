import { defEquivMap } from "@thi.ng/associative";
import { LRUCache } from "@thi.ng/cache";
import { memoize } from "@thi.ng/memoize";
import {
    ModelCache,
    Model,
    ModelViewState,
    ViewModel,
    State,
    ModelCacheKey,
    ModelCacheValue,
} from "./api";
import { getViewModels } from "./selectors";

export const CACHE_MAX_LENGTH = 3;

export const defCache = () => {
    const cacheMap = defEquivMap<ModelCacheKey, ModelCacheValue>();
    const cache = new LRUCache<ModelCacheKey, ModelCacheValue>(null, {
        maxlen: CACHE_MAX_LENGTH,
        map: () => cacheMap,
    });

    return { cache, cacheMap };
};

export const defGetViewModelsMemoized = (cache: ModelCache, onCacheBusted: () => void) => {
    return memoize<Model[], ModelViewState[], ViewModel[]>(
        (models: State["models"], viewStates: ModelViewState[]) => {
            onCacheBusted();
            const result = getViewModels(models, viewStates);
            return result;
        },
        cache,
    );
};
