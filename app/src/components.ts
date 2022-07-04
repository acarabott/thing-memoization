import { button, div, textArea } from "@thi.ng/hiccup-html";
import { map, reverse, str } from "@thi.ng/transducers";
import { addModel, getRandomModel, hoverModel, unhoverModel } from "./actions";
import { Ctx, State } from "./api";
import { CACHE_MAX_LENGTH } from "./cache";

export const modelsCmp = (ctx: Ctx) => {
    const viewModels = ctx.getViewModels();

    const valueCmps = map(
        (vm) =>
            div(
                {
                    style: {
                        position: "absolute",
                        left: `${vm.rect.x}px`,
                        top: `${vm.rect.y}px`,
                        width: `${vm.rect.w}px`,
                        height: `${vm.rect.h}px`,
                        background: vm.isHovered ? "rgb(43, 156, 212)" : "white",
                    },
                    onmouseenter: () => hoverModel(ctx, vm.model.id),
                    onmouseleave: () => unhoverModel(ctx, vm.model.id),
                },
                div({}, `id: ${vm.model.id}`),
                div({}, `value: ${vm.model.value}`),
                div({}, `rect: ${JSON.stringify(vm.rect)}`),
            ),
        viewModels,
    );

    return div(
        {
            style: {
                position: "relative",
                width: "500px",
                height: "500px",
                background: "black",
                overflow: "scroll",
            },
        },
        valueCmps,
    );
};

export const addModelCmp = (ctx: Ctx) => {
    const addCmp = button({ onclick: () => addModel(ctx, getRandomModel()) }, "Add");

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
        div({}, `Size: ${ctx.cacheMap.size} / ${CACHE_MAX_LENGTH}`),
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
