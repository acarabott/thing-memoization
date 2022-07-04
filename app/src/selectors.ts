import { Atom } from "@thi.ng/atom";
import { ModelViewStateEntry, State, ViewModel } from "./api";

export const getModels = (state: Atom<State>) => {
    return state.deref().models;
};

export const getViewModels = (
    models: State["models"],
    viewStates: ModelViewStateEntry[],
): ViewModel[] => {
    const h = 60;
    const viewModels = models.map((model, i): ViewModel => {
        const item = viewStates.find((findViewState) => findViewState.modelId === model.id);
        if (item === undefined) {
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
            ...item.state,
        };
    });

    return viewModels;
};
