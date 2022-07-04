import { EquivMap } from "@thi.ng/associative";
import { Atom } from "@thi.ng/atom";
import { ICache } from "@thi.ng/cache";

export interface Model {
    id: string;
    value: number;
}

export interface State {
    models: Model[];
}

export type InteractionState = "none" | "hovered" | "grabbed";

export interface ModelViewState {
    state: InteractionState;
}

export interface ModelViewStateEntry {
    modelId: Model["id"];
    state: ModelViewState;
}

export interface ViewState {
    models: ModelViewStateEntry[];
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

export type ModelCacheKey = [Model[], ModelViewStateEntry[]];
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
