import { uuid } from "@thi.ng/random";
import { Ctx, Model, ModelViewState, MODEL_MAX_VALUE } from "./api";

// Create new view state from a model
export const defModelViewState = (model: Model): ModelViewState => {
    return { modelId: model.id, state: "none", grabbedOffset_px: 0 };
};

// add a model to the application state
export const addModel = (ctx: Ctx) => {
    const model: Model = {
        id: uuid(),
        value: Math.floor(Math.random() * MODEL_MAX_VALUE),
    };
    ctx.state.swapIn(["models"], (models): Model[] => [...models, model]);
};

// update a model in the application state
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

// remove a model from the application state
export const removeModel = (ctx: Ctx, modelId: Model["id"]) => {
    ctx.state.swapIn(["models"], (models) => models.filter((model) => model.id !== modelId));
};

// update a model's view state, e.g. did it become hovered, or grabbed
const updateViewState = (ctx: Ctx, modelId: Model["id"], stateUpdate: Partial<ModelViewState>) => {
    ctx.viewState.swapIn(["models"], (modelViewStates) =>
        modelViewStates.map((modelViewState): ModelViewState => {
            if (modelViewState.modelId === modelId) {
                return { ...modelViewState, ...stateUpdate };
            }

            return modelViewState;
        }),
    );
};

// update a model's view state as currently hovered
export const hoverModel = (ctx: Ctx, modelId: Model["id"]) => {
    updateViewState(ctx, modelId, { state: "hovered" });
};

// reset a model's view state as no longer hovered
export const unhoverModel = (ctx: Ctx, modelId: Model["id"]) => {
    updateViewState(ctx, modelId, { state: "none" });
};

// update a model's view state as grabbed
export const grabModel = (ctx: Ctx, modelId: Model["id"], grabbedOffset_px: number) => {
    updateViewState(ctx, modelId, { state: "grabbed", grabbedOffset_px });
};

// ungrab all view models
export const releaseModels = (ctx: Ctx) => {
    ctx.viewState.swapIn(["models"], (modelViewStates) =>
        modelViewStates.map((modelViewState): ModelViewState => {
            return { ...modelViewState, state: "none" };
        }),
    );
};
