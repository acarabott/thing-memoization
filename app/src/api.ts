import { EquivMap } from "@thi.ng/associative";
import { Atom } from "@thi.ng/atom";
import { ICache } from "@thi.ng/cache";

export const MODEL_MAX_VALUE = 100;

export type ModelID = string;

export interface Model {
    id: ModelID;
    value: number;
}

export interface State {
    models: Model[];
}

export type InteractionState = "none" | "hovered" | "grabbed";

export interface ModelViewState {
    modelId: ModelID;
    state: InteractionState;
    grabbedOffset_px: number;
}

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface ViewModel extends ModelViewState {
    model: Model;
    rect: Rect;
}

export type ModelViewStates = EquivMap<ModelID, ModelViewState>;

export type ModelCacheKey = [Model[], ModelViewState[]];
export type ModelCacheValue = ViewModel[];
export type ModelCache = ICache<ModelCacheKey, ModelCacheValue>;

export interface Ctx {
    state: Atom<State>;
    viewState: Map<ModelID, ModelViewState>;
    getViewModels: () => ViewModel[];
    log: string[];
    cache: ModelCache;
    cacheMap: EquivMap<ModelCacheKey, ModelCacheValue>;
}
