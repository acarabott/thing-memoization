import { Ctx, Model, ModelViewState } from "./api";

export const addModel = (ctx: Ctx, model: Model) => {
    ctx.state.swapIn(["models"], (models): Model[] => [...models, model]);
    ctx.viewState.swapIn(["models"], (models): ModelViewState[] => [
        ...models,
        { id: model.id, isHovered: false },
    ]);
};

export const getRandomModel = (getNextModelId: () => Model["id"]): Model => {
    const model: Model = {
        id: getNextModelId(),
        value: Math.floor(Math.random() * 1000),
    };

    return model;
};

export const hoverModel = (ctx: Ctx, modelId: Model["id"]) => {
    ctx.viewState.swapIn(["models"], (modelViewStates) =>
        modelViewStates.map((modelViewState) => {
            if (modelViewState.id === modelId) {
                return { ...modelViewState, isHovered: true };
            }

            return modelViewState;
        }),
    );
};

export const unhoverModel = (ctx: Ctx, modelId: Model["id"]) => {
    ctx.viewState.swapIn(["models"], (modelViewStates) =>
        modelViewStates.map((modelViewState) => {
            if (modelViewState.id === modelId) {
                return { ...modelViewState, isHovered: false };
            }

            return modelViewState;
        }),
    );
};
