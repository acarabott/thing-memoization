import { uuid } from "@thi.ng/random";
import { Ctx, Model, ModelViewState, ModelViewStateEntry, MODEL_MAX_VALUE } from "./api";

export const defModelViewState = (model: Model): ModelViewStateEntry => {
    return { modelId: model.id, state: { state: "none", grabbedOffset_px: 0 } };
};

export const addModel = (ctx: Ctx, model: Model) => {
    ctx.state.swapIn(["models"], (models): Model[] => [...models, model]);
};

export const updateModel = (ctx: Ctx, update: Pick<Model, "id"> & Partial<Model>) => {
    ctx.state.swapIn(["models"], (models): Model[] =>
        models.map((model): Model => {
            if (model.id === update.id) {
                return { ...model, ...update };
            }
            return model;
        }),
    );
};

export const getRandomModel = (): Model => {
    const model: Model = {
        id: uuid(),
        value: Math.floor(Math.random() * MODEL_MAX_VALUE),
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
    updateViewStates(ctx, modelId, { state: "hovered" });
};

export const unhoverModel = (ctx: Ctx, modelId: Model["id"]) => {
    updateViewStates(ctx, modelId, { state: "none" });
};

export const grabModel = (ctx: Ctx, modelId: Model["id"], grabbedOffset_px: number) => {
    updateViewStates(ctx, modelId, { state: "grabbed", grabbedOffset_px });
};

export const releaseModels = (ctx: Ctx) => {
    ctx.viewState.swapIn(["models"], (modelViewStates) =>
        modelViewStates.map((modelViewStateEntry): ModelViewStateEntry => {
            return {
                ...modelViewStateEntry,
                state: { ...modelViewStateEntry.state, state: "none" },
            };
        }),
    );
};
