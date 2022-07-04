import { EquivMap } from "@thi.ng/associative";
import { Atom } from "@thi.ng/atom";
import { ICache } from "@thi.ng/cache";

export interface Model {
    id: number;
    value: number;
}

export interface State {
    models: Model[];
}

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface ModelViewState {
    id: Model["id"];
    isHovered: boolean;
}

export interface ViewState {
    models: ModelViewState[];
}

export interface ViewModel extends ModelViewState {
    model: Model;
    rect: Rect;
}

export type ModelCacheKey = [Model[], ModelViewState[]];
export type ModelCacheValue = ViewModel[];

export interface Ctx {
    state: Atom<State>;
    viewState: Atom<ViewState>;
    getViewModels: () => ViewModel[];
    getNextModelId: () => number;
    log: string[];
    cache: ICache<ModelCacheKey, ModelCacheValue>;
    cacheMap: EquivMap<ModelCacheKey, ModelCacheValue>;
}
