import { uuid } from "@thi.ng/random";
import { Ctx, Model, ModelID, ModelViewState, MODEL_MAX_VALUE } from "./api";

export const defModelViewState = (): ModelViewState => {
    return { state: "none", grabbedOffset_px: 0 };
};

export const addModel = (ctx: Ctx) => {
    const model: Model = {
        id: uuid(),
        value: Math.floor(Math.random() * MODEL_MAX_VALUE),
    };
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

export const removeModel = (ctx: Ctx, modelId: ModelID) => {
    ctx.state.swapIn(["models"], (models) => models.filter((model) => model.id !== modelId));
};

const updateViewStates = (ctx: Ctx, modelId: ModelID, viewState: Partial<ModelViewState>) => {
    const existingState = ctx.viewState.get(modelId);
    if (existingState === undefined) {
        throw new Error(`No view state for id ${modelId}`);
    }
    ctx.viewState.set(modelId, { ...existingState, ...viewState });
};

export const hoverModel = (ctx: Ctx, modelId: ModelID) => {
    updateViewStates(ctx, modelId, { state: "hovered" });
};

export const unhoverModel = (ctx: Ctx, modelId: ModelID) => {
    updateViewStates(ctx, modelId, { state: "none" });
};

export const grabModel = (ctx: Ctx, modelId: ModelID, grabbedOffset_px: number) => {
    updateViewStates(ctx, modelId, { state: "grabbed", grabbedOffset_px });
};

export const releaseModels = (ctx: Ctx) => {
    for (const [key, value] of ctx.viewState) {
        ctx.viewState.set(key, { ...value, state: "none" });
    }
};
