import { EquivMap } from "@thi.ng/associative";
import { Atom } from "@thi.ng/atom";
import { ICache } from "@thi.ng/cache";

export const MODEL_MAX_VALUE = 100;

// our models, no UI state
export interface Model {
    id: string;
    value: number;
}

// application state
export interface State {
    models: Model[];
}

// UI state for our Models
export type InteractionState = "none" | "hovered" | "grabbed";

export interface ModelViewState {
    modelId: Model["id"];
    state: InteractionState;
    grabbedOffset_px: number;
}

// application view state
export interface ViewState {
    models: ModelViewState[];
}

// it's a rectangle!
export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

// the view model for our models. This is derived from the Model *and* it's ModelViewState
export interface ViewModel extends ModelViewState {
    model: Model;
    rect: Rect;
}

// helper types for cache
export type ModelCacheKey = [Model[], ModelViewState[]];
export type ModelCacheValue = ViewModel[];
export type ModelCache = ICache<ModelCacheKey, ModelCacheValue>;

export interface Ctx {
    state: Atom<State>;
    viewState: Atom<ViewState>;
    getViewModels: () => ViewModel[];
    log: string[];
    cache: ModelCache;
    cacheMap: EquivMap<ModelCacheKey, ModelCacheValue>;
}
