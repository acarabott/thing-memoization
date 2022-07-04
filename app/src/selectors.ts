import { Atom } from "@thi.ng/atom";
import { ModelViewStateEntry, MODEL_MAX_VALUE, State, ViewModel } from "./api";
import { fitClamped } from "@thi.ng/math";
import { WORKSPACE_WIDTH_PX } from "./components";

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
        const x = fitClamped(model.value, 0, MODEL_MAX_VALUE, 0, WORKSPACE_WIDTH_PX);
        
        return {
            model,
            rect: {
                x,
                y: 10 + i * (h + 10),
                w: 300,
                h,
            },
            ...item.state,
        };
    });

    return viewModels;
};
