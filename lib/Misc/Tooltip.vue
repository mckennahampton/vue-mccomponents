<script setup lang="ts">
import WithFloatingPanel, { type Placement, type Trigger } from '../Traitables/WithFloatingPanel.vue'

interface Props {
    placement?: Placement,
    bodyIsImgSrc?: boolean,
    bodyProps?: object,
    tooltipClasses?: string,
    disable?: boolean,
    offset?: number,
    showArrow?: boolean,
    bodyClasses?: string,
    elementTag?: keyof HTMLElementTagNameMap,
    clickToClose?: boolean,
    trigger?: Trigger,
    closeOnScroll?: boolean,
    dark?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    elementTag: 'span',
    clickToClose: false,
    trigger: 'hover-parent-only',
    placement: 'top',
    offset: 7,
    closeOnScroll: true,
    dark: false,
})

const emit = defineEmits(['opened', 'closed'])
</script>
<template>
    <WithFloatingPanel
        :placement="props.placement"
        :panel-classes="[props.tooltipClasses, 'flex flex-col normal-case text-[15px] leading-5 text-center text-ellipsis py-3 px-4 shadow]']"
        :show-icon="false"
        :disable-panel="props.disable"
        :offset="props.offset"
        :no-min-width="true"
        :trigger="props.trigger"
        :teleport-target="'#tooltips'"
        :element-tag="props.elementTag"
        :close-on-scroll="props.closeOnScroll"
        :type="'tooltip'"
        :dark="props.dark"
        @opened="emit('opened')"
        @closed="emit('closed')"
        ref="panelRef"
    >
        <template #parent="slotProps">
            <slot :setRef="slotProps.setRef" />
        </template>

        <template #panel>
            
            <span v-if="$slots.header" class="text-lg text-left font-bold mb-2">
                <slot name="header" />
            </span>
            <div
                :class="[
                    {'whitespace-nowrap': !$slots.header},
                    {'whitespace-normal text-left text-pretty': $slots.header},
                    props.bodyClasses
                ]"
            >
                <slot name="tooltip" />
            </div>
        </template>

    </WithFloatingPanel>
</template>