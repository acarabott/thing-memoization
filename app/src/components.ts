import * as css from "@thi.ng/hiccup-css";
import { button, div, textArea } from "@thi.ng/hiccup-html";
import { fitClamped } from "@thi.ng/math";
import { map, reverse, str } from "@thi.ng/transducers";
import {
    addModel,
    grabModel,
    hoverModel,
    releaseModels,
    removeModel,
    unhoverModel,
    updateModel,
} from "./actions";
import { Ctx, InteractionState, Model, MODEL_MAX_VALUE, State } from "./api";
import { CACHE_MAX_LENGTH } from "./cache";

export const WORKSPACE_WIDTH_PX = 1000;

// can't put these properties into components themselves, because of type complaints
const modelClass = "model";
css.injectStyleSheet(
    css.css([
        [`.${modelClass}`, { "user-select": "none", "-webkit-user-select": "none" }],
    ]) as string,
);

// factory function to generate the onDrag function for models
const defOnModelDrag = (ctx: Ctx, target: HTMLElement, modelId: Model["id"]) => {
    const onDrag = (event: MouseEvent) => {
        const viewModel = ctx.getViewModels().find((vm) => vm.model.id === modelId);
        if (viewModel === undefined) {
            throw new Error("no view model for model");
        }
        const targetRect = target.getBoundingClientRect();
        const x = event.clientX - targetRect.x - viewModel.grabbedOffset_px;
        const value = Math.round(fitClamped(x, 0, WORKSPACE_WIDTH_PX, 0, MODEL_MAX_VALUE));

        updateModel(ctx, { ...viewModel.model, value });
    };

    return onDrag;
};

// component with all models on a background
export const modelsCmp = (ctx: Ctx) => {
    const viewModels = ctx.getViewModels();

    const colorLookup: Record<InteractionState, string> = {
        none: "white",
        hovered: "rgb(43, 156, 212)",
        grabbed: "rgb(43, 212, 156)",
    };

    const valueCmps = map(
        (vm) =>
            div(
                {
                    class: modelClass,
                    style: {
                        position: "absolute",
                        left: `${vm.rect.x}px`,
                        top: `${vm.rect.y}px`,
                        width: `${vm.rect.w}px`,
                        height: `${vm.rect.h}px`,
                        background: colorLookup[vm.state],
                    },
                    onmouseenter: () => {
                        if (vm.state !== "grabbed") {
                            hoverModel(ctx, vm.model.id);
                        }
                    },
                    onmouseleave: () => {
                        if (vm.state !== "grabbed") {
                            unhoverModel(ctx, vm.model.id);
                        }
                    },
                    onmousedown: (event) => {
                        // grab the model
                        grabModel(ctx, vm.model.id, event.offsetX);

                        // add temporary drag and release functions to the document body
                        const onDrag = defOnModelDrag(ctx, document.body, vm.model.id);
                        document.body.addEventListener("mousemove", onDrag);

                        const onUp = () => {
                            releaseModels(ctx);

                            // remove temporary functions on mouse release
                            document.body.removeEventListener("mouseup", onUp);
                            document.body.removeEventListener("mousemove", onDrag);
                        };

                        document.body.addEventListener("mouseup", onUp);
                    },
                },
                div({}, `id: ${vm.model.id}`),
                div({}, `value: ${vm.model.value}`),
                div({}, `rect: ${JSON.stringify(vm.rect)}`),
                button({ onclick: () => removeModel(ctx, vm.model.id) }, "Remove"),
            ),
        viewModels,
    );

    return div(
        {
            style: {
                position: "relative",
                width: `${WORKSPACE_WIDTH_PX}px`,
                height: "500px",
                background: "black",
                overflow: "scroll",
            },
        },
        valueCmps,
    );
};

// component to add a new model
export const addModelCmp = (ctx: Ctx) => {
    const addCmp = button({ onclick: () => addModel(ctx) }, "Add");

    return addCmp;
};

// dummy component to prove the caching is working
export const noopModelCmp = (ctx: Ctx) => {
    const noopCmp = button(
        {
            onclick: () =>
                // replace the current models with a *value* equivalent copy
                // should *not* trigger a cache invalidation
                ctx.state.swap((oldState) => {
                    const state: State = {
                        models: oldState.models.map((model) => ({ ...model })),
                    };
                    return state;
                }),
        },
        "Replace state with value copy (non references), should not bust cache",
    );

    return noopCmp;
};

// component to show our cache invalidation log
export const logCmp = (ctx: Ctx) => {
    const value: string = str("\n", reverse(ctx.log));

    return textArea({
        value,
        cols: 22,
        rows: 20,
    });
};

// component to inspect the current state
const stateCmp = (ctx: Ctx) => {
    const state = ctx.state.deref();
    const value = JSON.stringify(state, null, 2);

    return div(
        {},
        div({}, `State - num models: ${state.models.length}`),
        textArea({
            value,
            cols: 55,
            rows: 20,
        }),
    );
};

// component to inspect the current view state
const viewStateCmp = (ctx: Ctx) => {
    const viewState = ctx.viewState.deref();
    const value = JSON.stringify(viewState, null, 2);

    return div(
        {},
        div({}, `View State - num models; ${viewState.models.length}`),
        textArea({
            value,
            cols: 55,
            rows: 20,
        }),
    );
};

// component to inspect the cache state
export const cacheCmp = (ctx: Ctx) => {
    const value = JSON.stringify([...ctx.cache.values()], null, 2);
    return div(
        {},
        div({}, `Cache usage: ${ctx.cacheMap.size} / ${CACHE_MAX_LENGTH}`),
        textArea({ value, rows: 52, cols: 55 }),
    );
};

// main component
export const mainCmp = (ctx: Ctx) => {
    return div(
        { style: { display: "flex" } },
        div(
            {},
            addModelCmp(ctx),
            noopModelCmp(ctx),
            modelsCmp(ctx),
            div({ style: { display: "flex" } }, logCmp(ctx), stateCmp(ctx), viewStateCmp(ctx)),
        ),
        cacheCmp(ctx),
    );
};
