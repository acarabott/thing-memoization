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

const modelClass = "model";
css.injectStyleSheet(
    css.css([
        [`.${modelClass}`, { "user-select": "none", "-webkit-user-select": "none" }],
    ]) as string,
);

const colorLookup: Record<InteractionState, string> = {
    none: "white",
    hovered: "rgb(43, 156, 212)",
    grabbed: "rgb(43, 212, 156)",
};

export const WORKSPACE_WIDTH_PX = 1000;

const defOnDrag = (ctx: Ctx, target: HTMLElement, modelId: Model["id"]) => {
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

export const modelsCmp = (ctx: Ctx) => {
    const viewModels = ctx.getViewModels();

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
                        grabModel(ctx, vm.model.id, event.offsetX);

                        const target = document.body;

                        const onDrag = defOnDrag(ctx, target, vm.model.id);
                        target.addEventListener("mousemove", onDrag);

                        const onUp = () => {
                            releaseModels(ctx);
                            target.removeEventListener("mouseup", onUp);
                            target.removeEventListener("mousemove", onDrag);
                        };

                        target.addEventListener("mouseup", onUp);
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

export const addModelCmp = (ctx: Ctx) => {
    const addCmp = button({ onclick: () => addModel(ctx) }, "Add");

    return addCmp;
};

export const noopModelCmp = (ctx: Ctx) => {
    const noopCmp = button(
        {
            onclick: () =>
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

export const logCmp = (ctx: Ctx) => {
    const value: string = str("\n", reverse(ctx.log));

    return textArea({
        value,
        cols: 80,
        rows: 20,
    });
};

export const cacheCmp = (ctx: Ctx) => {
    return div(
        {},
        div({}, `Cache usage: ${ctx.cacheMap.size} / ${CACHE_MAX_LENGTH}`),
        textArea({ value: JSON.stringify([...ctx.cache.values()], null, 2), rows: 80, cols: 80 }),
    );
};

export const mainCmp = (ctx: Ctx) => {
    return div(
        { style: { display: "flex" } },
        div({}, addModelCmp(ctx), noopModelCmp(ctx), modelsCmp(ctx), logCmp(ctx)),
        cacheCmp(ctx),
    );
};
