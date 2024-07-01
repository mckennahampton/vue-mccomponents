<script setup lang="ts">
import uid from '../Utilities/uid'
import { useElementBounding } from '@vueuse/core'
import SafeTeleport from '../Misc/SafeTeleport.vue'
import FasCaretDown from '../Icons/FasCaretDown.vue'
import TransitionFade from '../Transitions/TransitionFade.vue'
import { resolveXClip, resolveYClip } from '../Utilities/clipping'
import { ref, computed, onMounted, watch, onBeforeUnmount, watchEffect } from 'vue'

export type Placement = 'bottom' | 'top' | 'left' | 'right' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'right-top' | 'right-bottom' | 'left-top' | 'left-bottom' | 'center'
export type Trigger = 'click' | 'hover' | 'hover-parent-only' | 'manual'

interface Props {
    panelClasses?: object | string | string[],
    openParentClasses?: object | string | string[],
    placement?: Placement,
    showIcon?: boolean,
    useIconForPlacement?: boolean,
    disabled?: boolean,
    functional?: boolean,
    disablePanel?: boolean,
    offset?: number,
    panelId?: string,
    noMinWidth?: boolean,
    trigger?: Trigger,
    manualTriggerIsOpen?: boolean,
    teleportTarget?: string,
    elementTag?: keyof HTMLElementTagNameMap,
    justify?: 'center' | 'start' | 'between' | 'around',
    allowClipping?: boolean,
    closeOnScroll?: boolean,
    instanceType?: string,
    dark?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    noMinWidth: false,
    disablePanel: false,
    functional: true,
    disabled: false,
    showIcon: false,
    useIconForPlacement: false,
    offset: 0,
    trigger: 'click',
    placement: 'bottom',
    teleportTarget: 'body',
    elementTag: 'div',
    justify: 'between',
    allowClipping: false,
    closeOnScroll: false,
    instanceType: 'generic',
    dark: false,
})

const emit = defineEmits(['opened', 'closed'])

//#region Parent
    const parentRef = ref<HTMLElement | null>(null)
    const slotRef = ref<HTMLElement | null>(null)
    const iconRef = ref<HTMLElement | null>(null)
    const setSlotRef = (el: HTMLElement) => slotRef.value = el

    const parentUid = uid()

    const parentLeft = ref(0)
    const parentRight = ref(0)
    const parentTop = ref(0)
    const parentBottom = ref(0)
    const parentWidth = ref(0)
    const parentHeight = ref(0)
    const parentFullWidth = ref(0)

    const updateParentRect = () => {
        if (slotRef.value || parentRef.value || (props.useIconForPlacement && iconRef.value))
        {
            let rect: DOMRect | undefined
            if (props.useIconForPlacement && iconRef.value)
            {
                rect = iconRef.value.getBoundingClientRect()
                parentWidth.value = iconRef.value.offsetWidth
            }
            else if (slotRef.value)
            {
                rect = slotRef.value.getBoundingClientRect()
                parentWidth.value = slotRef.value.offsetWidth
            }
            else if (parentRef.value)
            {
                rect = parentRef.value.getBoundingClientRect()
                parentWidth.value = parentRef.value.offsetWidth
            }
            else rect = undefined

            if (rect)
            {
                parentTop.value = rect.top
                parentBottom.value = rect.bottom
                parentLeft.value = rect.left
                parentRight.value = rect.right
                parentHeight.value = rect.height
            }
        }
    }

    const rotationClass = computed(() => {
        if (props.placement == 'right' || props.placement == 'right-top' || props.placement == 'right-bottom') {
            return 'rotate-90';
        }
        else if (props.placement == 'left' || props.placement == 'left-top' || props.placement == 'left-bottom') {
            return '-rotate-90';
        }
        else {
            return 'rotate-180'
        }
    })

//#endregion


//#region Panel
    const panel = ref<HTMLElement | null>(null)
    const open = ref(false)

    const panelBorderTop = ref(0)
    const panelBorderBottom = ref(0)
    const panelBorderLeft = ref(0)
    const panelBorderRight = ref(0)
    const panelScrollbarWidth = ref(0)
    const panelFullWidth = ref(0)
    const {width: panelWidth, height: panelHeight} = useElementBounding(panel)
    const panelFullHeight = computed(() => {
        return panelHeight.value + panelBorderTop.value + panelBorderBottom.value
    })

    const panelLeft = computed(() => {
        let temp = 0
        if(props.placement == 'top' || props.placement == 'bottom' || props.placement == 'center') {
            temp = parentLeft.value + (parentFullWidth.value / 2) - (panelFullWidth.value / 2)
        }
        else if (props.placement == 'right' || props.placement == 'right-bottom' || props.placement == 'right-top') {
            temp = parentRight.value + props.offset
        }
        else if (props.placement == 'left' || props.placement == 'left-bottom' || props.placement == 'left-top') {
            temp = parentLeft.value - panelFullWidth.value - props.offset
        }
        else if (props.placement == 'top-left') {
            temp = parentLeft.value
        }
        else if (props.placement == 'top-right') {
            temp = parentRight.value - panelFullWidth.value
        }
        else if (props.placement == 'bottom-left') {
            temp = parentLeft.value
        }
        else if (props.placement == 'bottom-right') {
            temp = parentRight.value - panelFullWidth.value
        }

        temp += windowScrollX.value

        return props.allowClipping
        ? Math.round(temp)
        : Math.round(resolveXClip(temp, panelFullWidth.value, windowScrollX.value))
    })

    const panelTop = computed(() => {
        let temp = 0
        if(props.placement == 'right' || props.placement == 'left' || props.placement == 'center') {
            temp = parentTop.value + ((parentBottom.value - parentTop.value) / 2) - (panelFullHeight.value / 2)
        }
        else if (props.placement == 'top') {
            temp = parentTop.value - panelFullHeight.value - props.offset
        }
        else if (props.placement == 'bottom') {
            temp = parentBottom.value  + props.offset
        }
        else if (props.placement == 'top-left') {
            temp = parentTop.value - panelFullHeight.value - props.offset
        }
        else if (props.placement == 'top-right') {
            temp = parentTop.value - panelFullHeight.value - props.offset
        }
        else if (props.placement == 'bottom-left') {
            temp = parentBottom.value  + props.offset
        }
        else if (props.placement == 'bottom-right') {
            temp = parentBottom.value  + props.offset
        }
        else if (props.placement == 'right-top' || props.placement == 'left-top') {
            temp = parentTop.value
        }
        else if (props.placement == 'right-bottom' || props.placement == 'left-bottom') {
            temp = parentBottom.value  - panelFullHeight.value
        }
        temp += windowScrollY.value

        return props.allowClipping
        ? Math.round(temp)
        : Math.round(resolveYClip(temp, panelFullHeight.value, windowScrollY.value))
    })

    const togglePanel = () => {
        if (props.disablePanel) return
        setScroll()
        updateParentRect()
        if(!props.disabled) open.value = !open.value
    }

    const openPanel = () => {
        if (!props.functional) return
        setScroll()
        open.value = true
        updateParentRect()
    }

    const closePanel = (e?: Event) => {
        //@ts-ignore
        if (e && (e.target == panel.value) || e?.target && typeof e?.target.hasAttribute !== 'undefined' && e.target.hasAttribute('data-panel-content')) return
        if (e && !props.closeOnScroll) return
        open.value = false
        if (panel.value) setTimeout(() => {
            if (panel.value) panel.value.scrollTop = 0
        }, 200)
    }

    const parentClickHandler = (e: Event) => {
        if (props.trigger == 'click') togglePanel()
        else if (props.trigger == 'hover' || props.trigger == 'hover-parent-only')
        {
            closePanel(e)
            updateMouseOverParent(false)
        }
    }

    const closeOnOutsideClick = (e: MouseEvent) => {
        let insideScrollbar = false
        if ((e.target as HTMLElement)?.closest('[data-panel-content="'+parentUid+'"]')) {
            if (panel.value)
            {
                const panelScrollbarLeft = panel.value.clientWidth + panelLeft.value
                const panelScrollbarRight = panel.value.offsetWidth + panelLeft.value
                insideScrollbar = panelScrollbarLeft < e.clientX && e.clientX < panelScrollbarRight
            }
        }

        if (
            !(e.target as HTMLElement)?.closest(`[data-panel-parent="${parentUid}"][data-type="${props.instanceType}"]`) // Make sure it's not the root button
            && (props.instanceType && (!(e.target as HTMLElement)?.closest(`[data-panel-content-${props.instanceType}="${parentUid}"]`) || !(e.target as HTMLElement)?.closest(`[data-panel-parent][data-type="${props.instanceType}"]:not([data-panel-parent="${parentUid}"][data-type="${props.instanceType}"])`))) // Make sure it's not a nested dropdown button
            && !(e.target as HTMLElement)?.closest(`[data-panel-content="${parentUid}"] input`) // Allow inputs in the dropdown
            && !insideScrollbar // Allow scrollbar dragging inside dropdown
        ) {
            closePanel()
        }
    }
    
    const mouseOverParent = ref(false)
    const updateMouseOverParent = (val: boolean) => mouseOverParent.value = val
    const mouseOverPanel = ref(false)
    const updateMouseOverPanel = (val: boolean) => mouseOverPanel.value = val
    const hoverState = computed(() => {
        if (props.trigger == 'hover') return Boolean(mouseOverPanel.value || mouseOverParent.value)
        else return mouseOverParent.value
    })

    watchEffect(() => {
        if (props.trigger == 'hover' || props.trigger == 'hover-parent-only')
        {
            if (hoverState.value) openPanel()
            else closePanel()
        }
    })

    if (props.trigger == 'manual')
    {
        watch(() => props.manualTriggerIsOpen, (newVal) => {
            if (newVal) openPanel()
            else closePanel()
        })
    }

    onMounted(() => {
        if (panel.value)
        {
            panelBorderTop.value = parseInt(getComputedStyle(panel.value).getPropertyValue("border-top-width").replace('px',''))
            panelBorderBottom.value = parseInt(getComputedStyle(panel.value).getPropertyValue("border-bottom-width").replace('px',''))
            panelBorderLeft.value = parseInt(getComputedStyle(panel.value).getPropertyValue("border-left-width").replace('px',''))
            panelBorderRight.value = parseInt(getComputedStyle(panel.value).getPropertyValue("border-right-width").replace('px',''))
        }
        setScroll()
    })

    watch(panelWidth, () => {
        if (panel.value)
        {
            panelScrollbarWidth.value = panel.value.offsetWidth - panel.value.clientWidth
            panelFullWidth.value = panel.value.offsetWidth
            if (slotRef.value) parentFullWidth.value = slotRef.value.offsetWidth
            else if (parentRef.value) parentFullWidth.value = parentRef.value.offsetWidth
        }
    })

    watch(open, () => {
        if (open.value) {
            emit('opened')
            window.addEventListener('scroll', closePanel, true)
            window.addEventListener('resize', closePanel, true)
            window.addEventListener('click', closeOnOutsideClick)
        }
        else {
            emit('closed')
            window.removeEventListener('scroll', closePanel, true)
            window.removeEventListener('resize', closePanel, true)
            window.removeEventListener('click', closeOnOutsideClick)
        }
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', closePanel, true)
        window.removeEventListener('resize', closePanel, true)
        window.removeEventListener('click', closeOnOutsideClick)
    })

    defineExpose({
        closePanel
    })

//#endregion


//#region Window

    const windowScrollY = ref(0)
    const windowScrollX = ref(0)

    const setScroll = () => {
        windowScrollY.value = window.scrollY
        windowScrollX.value = window.scrollX
    }

//#endregion
</script>
<template>
    <component :is="props.elementTag"
        v-bind="$attrs"
        @click="parentClickHandler"
        @mouseenter="updateMouseOverParent(true)"
        @mouseleave="updateMouseOverParent(false)"
        :data-panel-parent="`${parentUid}`"
        :data-type="props.instanceType"
        class="w-min"
        :class="[
            {'hover:cursor-pointer': props.trigger == 'click'},
            open ? props.openParentClasses : null,
            {'flex items-center gap-3': props.showIcon },
            {'justify-between': props.showIcon && props.justify == 'between'},
            {'justify-center': props.showIcon && props.justify == 'center'},
            {'justify-start': props.showIcon && props.justify == 'start'},
            {'justify-around': props.showIcon && props.justify == 'around'},
            {'disabled': props.disabled}
        ]"
        ref="parentRef"
    >
        <slot
            name="parent"
            :open="open"
            :toggle-panel="togglePanel"
            :close-panel="closePanel"
            :open-panel="openPanel"
            :rotation-class="rotationClass"
            :setRef="setSlotRef"
        />
        <span v-if="showIcon && !props.disablePanel"
            class="h-4 w-4 flex items-center justify-center transition ease-in-out duration-100"
            :class="[
                open ? rotationClass : ''
            ]"
            ref="iconRef"
        >
            <FasCaretDown
                :class="[
                    {'fill-white': props.dark},
                    {'fill-black': !props.dark},
                    {'rotate-180': (props.placement == 'top' || props.placement.includes('top-'))}
                ]"
            />
        </span>
        <template v-if="props.functional && !props.disablePanel">
            <SafeTeleport :to="props.teleportTarget" :timeout-ms="3000">
                <TransitionFade>
                    <div
                        v-show="open"
                        :id="props.panelId"
                        ref="panel"
                        :data-panel-content="`${parentUid}_${props.instanceType}`"
                        class="absolute z-[1000] flex flex-col items-stretch text-sm shadow-xl scroll-y border"
                        :class="[
                            props.panelClasses,
                            {'bg-black text-white border-neutral-800': props.dark},
                            {'bg-white text-black border-neutral-300': !props.dark}
                        ]"
                        :style="{
                            top: panelTop + 'px',
                            left: panelLeft + 'px',
                            minWidth: (props.noMinWidth ? '0' : parentWidth) + 'px'
                        }"
                        @mouseenter="updateMouseOverPanel(true)"
                        @mouseleave="updateMouseOverPanel(false)"
                    >
                        <slot
                            name="panel"
                            :open="open"
                            :toggle-panel="togglePanel"
                            :close-panel="closePanel"
                            :open-panel="openPanel"
                            :rotation-class="rotationClass"
                        />
                    </div>
                </TransitionFade>
            </SafeTeleport>
        </template>
    </component>
</template>