<script setup lang="ts">
import Icon from '../Misc/Icon.vue'
import Tooltip from '../Misc/Tooltip.vue'
import Spinner from '../Spinners/Spinner.vue'
import { ref, watch, onMounted, provide } from 'vue'

export interface StepHeader {
    name: string,
    state: {
        complete?: boolean,
        errored?: boolean,
        dirty?: boolean,
    },
    locked?: boolean,
    errors?: string[],
    disabled?: boolean,
    iconClass?: string,
    iconStyle?: string,
    errored?: boolean,
    complete?: boolean,
    dirty?: boolean,
}

// Create a union type from the 'name' properties of 'StepHeader' objects
type StepHeaderName = StepHeader['name']

const props = withDefaults(defineProps<{
    steps: StepHeader[],
    keepalive?: boolean,
    initialActive?: StepHeaderName,
    trackPending?: boolean
}>(), {
    keepalive: true
})

const deltas = ref(props.steps)
watch(() => props.steps, steps => deltas.value = steps)

const active = ref<StepHeaderName>()
const pendingSteps = ref<StepHeaderName[]>(deltas.value.map(d => d.name))

const isActive = (name: string) => active.value == name
const stepCanBeActive = (name: string) => {
    let targetStep = deltas.value.find(d => d.name == name)

    return targetStep && // Ensure step exists
    !targetStep.disabled && // Ensure step is not disabled
    !targetStep.locked // Ensure step is satisfied & not locked
}
const stepIsPending = (name: string) => props.trackPending && pendingSteps.value.includes(name)
const toggleActive = (name: string) => {
    if (stepCanBeActive(name))
    {
        active.value = name
        pendingSteps.value = pendingSteps.value.filter(s => s != name)
    }
}
const stepIcon = (step: StepHeader) => {
    if (stepIsPending(step.name)) return 'far fa-circle'
    else if (step.state.errored) return 'fas fa-circle-xmark'
    else if (step.state.complete) return 'fas fa-check-circle'
}

provide('active', active)

onMounted(() => {
    let filtered = deltas.value.filter(d => !d.disabled)
    toggleActive(filtered[0].name)
})

const proceed = () => {
    // Without this timeout, I was hitting a race condition that tried to proceed before picking up any
    // step updates from the props (i.e. the next step was still locked)
    setTimeout(() => {
        let filtered = deltas.value.filter(d => !d.disabled)
        let index = filtered.findIndex(d => d.name == active.value)
        if (index < (filtered.length - 1)) {
            toggleActive(filtered[index + 1].name)
        }
    }, 50)
}

defineExpose({
    proceed
})

</script>
<template>

    <div class="w-full flex flex-col">

        <!-- Step Headers -->
        <div class="w-full flex justify-evenly border-b pb-5 mb-5">
            <Tooltip v-for="(header, index) in deltas"
                class="!w-full flex flex-grow relative step-and-separator p-3 hover:cursor-pointer"
                :class="[
                    {'disabled !opactiy-100': !stepCanBeActive(header.name)},
                    {'before:bg-blue-50': isActive(header.name)},
                ]"
                @click="toggleActive(header.name)"
                :disable="!Boolean($slots[`header-tooltip(${header.name})`])"
            >
                <template v-if="$slots[`header-tooltip-header(${header.name})`]" #header>
                    <slot :name="`header-tooltip-header(${header.name})`" />
                </template>

                <template v-if="$slots[`header-tooltip(${header.name})`]" #tooltip>
                    <slot :name="`header-tooltip(${header.name})`" />
                </template>

                <div class="w-full relative flex flex-col flex-grow items-center justify-end gap-[5px]">

                    <div
                        class="w-full flex items-center justify-center gap-2 whitespace-nowrap -ml-[17px]"
                        :class="[
                            {'underline': isActive(header.name)},
                            {'text-neutral-600': !isActive(header.name)},
                            {'text-blue-500': isActive(header.name)},
                        ]"
                    >
                        <Icon v-if="header.iconClass"
                            :icon-class="header.iconClass"
                            :class="header.iconStyle"
                            class="pointer-events-none w-[15px] h-[15px]"
                        />

                        <slot
                            :name="`header(${header.name})`"
                            :active="isActive(header.name)"
                        />

                    </div>
                    
                    <Spinner v-if="header.state.dirty" stubby class="animate-spin-fast w-[15px] h-[15px] bg-white" />
                    <Icon v-else-if="stepIcon(header)"
                        :icon-class="stepIcon(header)"
                        class="rounded-full w-[15px] h-[15px] bg-white"
                        :class="[
                            {'text-green-500': !stepIsPending(header.name) && header.state.complete && !header.state.dirty},
                            {'text-neutral-300': stepIsPending(header.name) || !header.state.complete && !isActive(header.name) || header.state.dirty},
                            // {'text-blue-500': header.state == 'pending' && isActive(header.name)},
                            {'text-red-500': header.state.errored && !header.state.dirty && !stepIsPending(header.name)},
                            {'animate-spin-quick': header.state.dirty},
                        ]"
                    />
                </div>

                
                <div v-if="index !== deltas.length - 1"
                    class="separator h-[2px] mt-[14px] bg-neutral-300 absolute top-[50%] pointer-events-none z-0"
                >
                </div>

            </Tooltip>
        </div>

        <!-- Steps Content -->
        <template v-for="step in deltas">
            <KeepAlive v-if="props.keepalive">
                <template v-if="isActive(step.name)">
                    <slot :name="`body(${step.name})`" />
                </template>
            </KeepAlive>
            <template v-else>
                <template v-show="isActive(step.name)">
                    <slot :name="`body(${step.name})`" />
                </template>
            </template>
        </template>

        <slot name="footer"></slot>
        
    </div>

</template>
<style scoped>
.step-and-separator:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all 0.2s ease;
    opacity: 0.5;
    z-index: 0;
}

.step-and-separator:hover:before {
    @apply bg-blue-100
}

.separator {
    width: calc(100% - 10px);
    left: calc(50% + 8px)
}

</style>