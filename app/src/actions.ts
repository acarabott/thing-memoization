import { uuid } from "@thi.ng/random";
import { Ctx, Model, ModelViewState, ModelViewStateEntry } from "./api";

export const addModel = (ctx: Ctx, model: Model) => {
    ctx.state.swapIn(["models"], (models): Model[] => [...models, model]);
    ctx.viewState.swapIn(["models"], (models): ModelViewStateEntry[] => [
        ...models,
        { modelId: model.id, state: { isHovered: false } },
    ]);
};

export const getRandomModel = (): Model => {
    const model: Model = {
        id: uuid(),
        value: Math.floor(Math.random() * 1000),
    };

    return model;
};

const updateViewStates = (ctx: Ctx, modelId: Model["id"], viewState: Partial<ModelViewState>) => {
    ctx.viewState.swapIn(["models"], (modelViewStates) =>
        modelViewStates.map((modelViewStateEntry): ModelViewStateEntry => {
            if (modelViewStateEntry.modelId === modelId) {
                return {
                    ...modelViewStateEntry,
                    state: { ...modelViewStateEntry.state, ...viewState },
                };
            }

            return modelViewStateEntry;
        }),
    );
};

export const hoverModel = (ctx: Ctx, modelId: Model["id"]) => {
    updateViewStates(ctx, modelId, { isHovered: true });
};

export const unhoverModel = (ctx: Ctx, modelId: Model["id"]) => {
    updateViewStates(ctx, modelId, { isHovered: false });
};
