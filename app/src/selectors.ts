import { Atom } from "@thi.ng/atom";
import { State, ModelViewState, ViewModel } from "./api";

export const getModels = (state: Atom<State>) => {
    return state.deref().models;
};

export const getViewModels = (models: State["models"], viewStates: ModelViewState[]): ViewModel[] => {
    const h = 60;
    const viewModels = models.map((model, i): ViewModel => {
        const viewState = viewStates.find((findViewState) => findViewState.id === model.id);
        if (viewState === undefined) {
            throw new Error("No view state found for model");
        }
        return {
            model,
            rect: {
                x: 10,
                y: 10 + i * (h + 10),
                w: 300,
                h,
            },
            ...viewState,
        };
    });

    return viewModels;
};
