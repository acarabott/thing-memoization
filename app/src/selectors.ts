import { Atom } from "@thi.ng/atom";
import { State } from "./api";

export const getModels = (state: Atom<State>) => {
    return state.deref().models;
};
