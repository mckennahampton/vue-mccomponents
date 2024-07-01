<script setup lang="ts">
import { ref } from 'vue'
import WithFloatingPanel, { type Placement, type Trigger } from '../Traitables/WithFloatingPanel.vue'

interface Props {
    dropdownClasses?: object | string | string[],
    buttonClasses?: object | string | string[],
    openButtonClasses?: object | string | string[],
    placement?: Placement,
    showIcon?: boolean,
    useIconForPlacement?: boolean,
    disabled?: boolean,
    functional?: boolean,
    disableDropdown?: boolean,
    offset?: number,
    dropdownId?: string,
    noMinWidth?: boolean,
    trigger?: Trigger,
    closeOnScroll?: boolean,
    allowClipping?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    noMinWidth: false,
    disableDropdown: false,
    functional: true,
    trigger: 'click',
    showIcon: true,
    useIconForPlacement: false,
    placement: 'bottom',
    allowClipping: true
})

const emit = defineEmits(['opened', 'closed'])

const panelRef = ref<InstanceType<typeof WithFloatingPanel> | null>()
const closeDropdown = () => panelRef.value?.closePanel()
defineExpose({
    closeDropdown
})


</script>

<template>
    <WithFloatingPanel
        class="flex items-center gap-2 py-2 px-4 font-semibold cursor-default"
        :class="[
            props.buttonClasses,
            {'hover:cursor-pointer': !props.disableDropdown},
            {'hover:!cursor-default': props.disabled || props.disableDropdown}
        ]"
        :justify="'start'"
        :open-parent-classes="props.openButtonClasses"
        :element-tag="'button'"
        type="button"
        :placement="props.placement"
        :panel-classes="[props.dropdownClasses, '!max-w-min']"
        :show-icon="props.showIcon"
        :use-icon-for-placement="props.useIconForPlacement"
        :disabled="props.disabled"
        :functional="props.functional"
        :disable-panel="props.disableDropdown"
        :offset="props.offset"
        :panel-id="props.dropdownId"
        :no-min-width="props.noMinWidth"
        :trigger="props.trigger"
        :teleport-target="'#dropdowns'"
        :instance-type="'dropdown'"
        :allow-clipping="props.allowClipping"
        :close-on-scroll="props.closeOnScroll"
        @opened="emit('opened')"
        @closed="emit('closed')"
        ref="panelRef"
    >
        <template #parent="slotProps">
            <slot
                name="button"
                :open="slotProps.open"
                :toggleDropdown="slotProps.togglePanel"
                :rotation-class="slotProps.rotationClass"
                :openDropdown="slotProps.openPanel"
            />
        </template>
        <template #panel="slotProps">
            <slot
                name="dropdown"
                :toggleDropdown="slotProps.togglePanel"
            />
        </template>
    </WithFloatingPanel>
</template>