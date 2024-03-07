<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useElementBounding } from '@vueuse/core'
import TransitionFade from './Transitions/TransitionFade.vue'
import { resolveXClip, resolveYClip } from './Utilities/clipping'
import { ref, computed, reactive, watch, type ComponentPublicInstance, useSlots, onMounted, onBeforeUnmount } from 'vue'

type Position = 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left' | 'right' | 'left' | 'center';
interface Props {
    position?: Position,
    tooltipClasses?: string,
    disable?: boolean,
    offset?: number,
    showArrow?: boolean,
    bodyClasses?: string,
    manualRef?: boolean,
    elementTag?: string,
    dark?: boolean,
    clickToClose?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    manualRef: false,
    elementTag: 'span',
    dark: false,
    clickToClose: false
})

const slots = useSlots()
const slotRef = ref<Element | ComponentPublicInstance | null>(null)
const setSlotRef = (el: Element | ComponentPublicInstance | null) => slotRef.value = el

const position = computed(() => props.position ?? 'top')

const isOpen = ref(false)
const disabled = computed(() => props.disable ?? false)

const arrowClasses = computed(() => {
    if (position.value.includes('top')) {
        // Bottom arrow
        return `border-solid border-t-black border-t-8 border-x-transparent border-x-8 border-b-0`;
    }
    else if (position.value.includes('bottom')) {
        // Top arrow
        return `border-solid border-b-black border-b-8 border-x-transparent border-x-8 border-t-0`;
    }
    else if (position.value == 'left') {
        // Right arrow
        return `border-solid border-l-black border-l-8 border-y-transparent border-y-8 border-r-0`;
    }
    else if (position.value == 'right') {
        // Left arrow
        return `border-solid border-r-black border-r-8 border-y-transparent border-y-8 border-l-0`;
    }
})

//#region Positioning logic
const tooltipEl = ref(null)
const tooltipArrowEl = ref(null)
const parentRect = reactive({
    rect: {} as any
})
const isSlotReady = computed(() => Boolean(slotRef.value))
watch(slotRef, () => {
    //@ts-ignore
    if (isSlotReady.value) parentRect.rect = useElementBounding(slotRef)
})

const state = reactive({
    left: 0,
    top: 0,
    arrowTop: 0,
    arrowLeft: 0,
    offset: props.offset ?? 15,
})

const { width: tooltipWidth, height: tooltipHeight } = useElementBounding(tooltipEl)
const { width: tooltipArrowWidth, height: tooltipArrowHeight } = useElementBounding(tooltipArrowEl)

const tooltipLeft = computed(() => {
    let temp = 0
    if (parentRect.rect) {
        if(position.value == 'top' || position.value == 'bottom' || position.value == 'center') {
            temp = parentRect.rect.left + ((parentRect.rect.right - parentRect.rect.left) / 2) - (tooltipWidth.value / 2)
        }
        else if (position.value == 'right') {
            temp = parentRect.rect.right + state.offset
        }
        else if (position.value == 'left') {
            temp = parentRect.rect.left - tooltipWidth.value - state.offset
        }
        else if (position.value == 'top-left') {
            temp = parentRect.rect.left
        }
        else if (position.value == 'top-right') {
            temp = parentRect.rect.right - tooltipWidth.value
        }
        else if (position.value == 'bottom-left') {
            temp = parentRect.rect.left
        }
        else if (position.value == 'bottom-right') {
            temp = parentRect.rect.right - tooltipWidth.value
        }
        return Math.round(resolveXClip(temp, tooltipWidth.value))
    }

    else return 0
})

const tooltipTop = computed(() => {
    let temp = 0
    if (parentRect.rect) {
        if(position.value == 'right' || position.value == 'left' || position.value == 'center') {
            temp = parentRect.rect.top + ((parentRect.rect.bottom - parentRect.rect.top) / 2) - (tooltipHeight.value / 2)
        }
        else if (position.value == 'top') {
            temp = parentRect.rect.top - tooltipHeight.value - state.offset
        }
        else if (position.value == 'bottom') {
            temp = parentRect.rect.bottom + state.offset
        }
        else if (position.value == 'top-left') {
            temp = parentRect.rect.top - tooltipHeight.value - state.offset
        }
        else if (position.value == 'top-right') {
            temp = parentRect.rect.top - tooltipHeight.value - state.offset
        }
        else if (position.value == 'bottom-left') {
            temp = parentRect.rect.bottom + state.offset
        }
        else if (position.value == 'bottom-right') {
            temp = parentRect.rect.bottom + state.offset
        }
        return Math.round(resolveYClip(temp, tooltipHeight.value))
    }

    else return 0
})

const tooltipArrowLeft = computed(() => {
    let temp = 0
    if (parentRect.rect) {
        if (position.value == 'right') {
            temp = tooltipLeft.value - tooltipArrowWidth.value
        }
        else if (position.value == 'left') {
            temp = tooltipLeft.value + tooltipWidth.value
        }
        else if(position.value.includes('top') || position.value.includes('bottom')) {
            temp = parentRect.rect.left + ((parentRect.rect.right - parentRect.rect.left) / 2) - (tooltipArrowWidth.value / 2)
        }
        return Math.round(temp)
    }
    else {
        return 0
    }

})

const tooltipArrowTop = computed(() => {
    let temp = 0
    if (parentRect.rect) {
        if(position.value == 'right' || position.value == 'left') {
            temp = parentRect.rect.top + ((parentRect.rect.bottom - parentRect.rect.top) / 2) - (tooltipArrowHeight.value / 2)
        }
        else if (position.value.includes('top')) {
            temp = tooltipTop.value + tooltipHeight.value
        }
        else if (position.value.includes('bottom')) {
            temp = tooltipTop.value - tooltipArrowHeight.value
        }
        return Math.round(temp)
    }
    else {
        return 0
    }

})

//#endregion


const open = () => {
    parentRect.rect.update();
    isOpen.value = true
}

const close = () => isOpen.value = false

const closeOnScroll = () => {
    if (position.value != 'center') close()
}
//@ts-ignore
useEventListener(slotRef, 'mouseenter', () => open())
//@ts-ignore
useEventListener(slotRef, 'mouseleave', () => {
    if (!props.clickToClose) close()
})
//@ts-ignore
useEventListener(slotRef, 'mousedown', (e) => closeOnScroll())

const closeOnOutsideClick = (event: MouseEvent) => {
    //@ts-ignore
    if (!event.target.closest('#tooltips') && position.value != 'center') close()
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick))

watch(isOpen, () => {
    if (isOpen.value) document.addEventListener('scroll', closeOnScroll, true)
    else document.removeEventListener('scroll', closeOnScroll, true)
})




</script>
<template>

    <component v-if="!props.manualRef" :is="props.elementTag" v-bind="$attrs" ref="slotRef">
        <slot />
    </component>
    <template v-else>
        <slot :setRef="setSlotRef" v-bind="$attrs" />
    </template>

    <Teleport to="#tooltips">
        <TransitionFade>
            <span
                class="fixed z-[999999] max-w-[500px] flex flex-col normal-case text-[15px] leading-5 select-none pointer-events-none text-center text-ellipsis py-3 px-4 shadow border"
                :class="[
                    props.tooltipClasses,
                    {'text-white bg-black border-neutral-900': props.dark },
                    {'text-black bg-white border-neutral-200': !props.dark },
                    {'': !$slots.header},
                    {'max-w-[350px]': $slots.header}
                ]"
                :style="{top: tooltipTop + 'px', left: tooltipLeft + 'px'}"
                ref="tooltipEl"
                v-if="isOpen && !disabled"
            >
            
                <span v-if="slots.header" class="text-lg text-left font-bold mb-2">
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

                <div v-if="props.showArrow && position != 'center'" :class="arrowClasses" class="fixed" ref="tooltipArrowEl" :style="{top: tooltipArrowTop + 'px', left: tooltipArrowLeft + 'px'}"></div>
            </span>
        </TransitionFade>
    </Teleport>
</template>