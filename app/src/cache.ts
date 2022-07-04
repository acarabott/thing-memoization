import { defEquivMap } from "@thi.ng/associative";
import { LRUCache } from "@thi.ng/cache";
import { memoize } from "@thi.ng/memoize";
import {
    Model,
    ModelCache,
    ModelCacheKey,
    ModelCacheValue,
    ModelViewStateEntry,
    State,
    ViewModel,
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
    return memoize<Model[], ModelViewStateEntry[], ViewModel[]>(
        (models: State["models"], viewStates: ModelViewStateEntry[]) => {
            onCacheBusted();
            const result = getViewModels(models, viewStates);
            return result;
        },
        cache,
    );
};
