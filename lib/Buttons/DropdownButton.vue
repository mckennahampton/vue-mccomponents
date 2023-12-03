<script setup lang="ts">
    import uid from '../Utilities/uid'
    import { useElementSize } from '@vueuse/core'
    import FasCaretDown from '../Icons/FasCaretDown.vue'
    import TransitionFade from '../Transitions/TransitionFade.vue'
    import { resolveXClip, resolveYClip } from '../Utilities/clipping'
    import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'

    type Placement = 'bottom' | 'top' | 'left' | 'right' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'right-top' | 'right-bottom' | 'left-top' | 'left-bottom'
    interface Props {
        dropdownClasses?: object | string | string[],
        buttonClasses?: object | string | string[],
        openButtonClasses?: object | string | string[],
        placement?: Placement,
        showIcon?: boolean,
        disabled?: boolean,
        offset?: number,
        dropdownId?: string,
        noMinWidth?: boolean,
        dark?: boolean,
    }
    const props = withDefaults(defineProps<Props>(), {
        noMinWidth: false,
        dark: false,
    })

    const open = ref(false)
    const dropdown = ref<HTMLInputElement | null>(null)
    const dropdownButton = ref<HTMLInputElement | null>(null)
    const buttonUid = uid()
    const disabled = computed(() => {
        return props.disabled ?? false
    })

    const placement = computed(() => {
        return props.placement ?? 'bottom'
    })
    const offset = computed(() => {
        return props.offset ?? 0
    })

    const showIcon = ref(props.showIcon ?? false)

    const buttonLeft = ref(0)
    const buttonRight = ref(0)
    const buttonTop = ref(0)
    const buttonBottom = ref(0)
    const buttonWidth = ref(0)
    const buttonHeight = ref(0)
    const buttonFullWidth = ref(0)

    const dropdownBorderTop = ref(0)
    const dropdownBorderBottom = ref(0)
    const dropdownBorderLeft = ref(0)
    const dropdownBorderRight = ref(0)
    const dropdownScrollbarWidth = ref(0)
    const dropdownFullWidth = ref(0)

    const dropdownFullHeight = computed(() => {
        return dropdownHeight.value + dropdownBorderTop.value + dropdownBorderBottom.value
    })

    const updateParentRect = () => {
        let rect = dropdownButton.value ? dropdownButton.value.getBoundingClientRect() : {} as DOMRect
        buttonTop.value = rect.top
        buttonBottom.value = rect.bottom
        buttonLeft.value = rect.left
        buttonRight.value = rect.right
        buttonWidth.value = dropdownButton.value ? dropdownButton.value.offsetWidth : 0
        buttonHeight.value = rect.height
    }
    const {width: dropdownWidth, height: dropdownHeight} = useElementSize(dropdown)

    const windowScrollY = ref(0)
    const windowScrollX = ref(0)

    const dropdownLeft = computed(() => {
        let temp = 0
        if(placement.value == 'top' || placement.value == 'bottom') {
            // temp = buttonLeft.value + ((buttonRight.value - buttonLeft.value) / 2) - (dropdownFullWidth.value / 2)
            temp = buttonLeft.value + (buttonFullWidth.value / 2) - (dropdownFullWidth.value / 2)
        }
        else if (placement.value == 'right' || placement.value == 'right-bottom' || placement.value == 'right-top') {
            temp = buttonRight.value + offset.value
        }
        else if (placement.value == 'left' || placement.value == 'left-bottom' || placement.value == 'left-top') {
            temp = buttonLeft.value - dropdownFullWidth.value - offset.value
        }
        else if (placement.value == 'top-left') {
            temp = buttonLeft.value
        }
        else if (placement.value == 'top-right') {
            temp = buttonRight.value - dropdownFullWidth.value
        }
        else if (placement.value == 'bottom-left') {
            temp = buttonLeft.value
        }
        else if (placement.value == 'bottom-right') {
            temp = buttonRight.value - dropdownFullWidth.value
        }

        temp += windowScrollX.value
        // temp += ((dropdownBorderLeft.value + dropdownBorderRight.value) / 2)
        return Math.round(resolveXClip(temp, dropdownFullWidth.value, windowScrollX.value))
    })

    const dropdownTop = computed(() => {
        let temp = 0
        if(placement.value == 'right' || placement.value == 'left') {
            temp = buttonTop.value + ((buttonBottom.value - buttonTop.value) / 2) - (dropdownFullHeight.value / 2)
        }
        else if (placement.value == 'top') {
            temp = buttonTop.value - dropdownFullHeight.value - offset.value
        }
        else if (placement.value == 'bottom') {
            temp = buttonBottom.value  + offset.value
        }
        else if (placement.value == 'top-left') {
            temp = buttonTop.value - dropdownFullHeight.value - offset.value
        }
        else if (placement.value == 'top-right') {
            temp = buttonTop.value - dropdownFullHeight.value - offset.value
        }
        else if (placement.value == 'bottom-left') {
            temp = buttonBottom.value  + offset.value
        }
        else if (placement.value == 'bottom-right') {
            temp = buttonBottom.value  + offset.value
        }
        else if (placement.value == 'right-top' || placement.value == 'left-top') {
            temp = buttonTop.value
        }
        else if (placement.value == 'right-bottom' || placement.value == 'left-bottom') {
            temp = buttonBottom.value  - dropdownFullHeight.value
        }
        temp += windowScrollY.value
        // temp += ((dropdownBorderTop.value + dropdownBorderBottom.value) / 2)
        let result = Math.round(resolveYClip(temp, dropdownFullHeight.value, windowScrollY.value))
        return result
    })

    const rotationClass = computed(() => {

        if (placement.value == 'right' || placement.value == 'right-top' || placement.value == 'right-bottom') {
            return 'rotate-90';
        }
        else if (placement.value == 'left' || placement.value == 'left-top' || placement.value == 'left-bottom') {
            return '-rotate-90';
        }
        else {
            return 'rotate-180'
        }
    })

    const toggleDropdown = () => {
        setScroll()
        if(!disabled.value) {
            open.value = !open.value;
        }
        updateParentRect()
    }

    const closeDropdown = (e?: Event) => {
        if (e && e.target == dropdown.value) return
        open.value = false
        dropdown.value ? dropdown.value.scrollTop = 0 : null
    }

    const setScroll = () => {
        windowScrollY.value = window.scrollY
        windowScrollX.value = window.scrollX
    }

    const closeOnOutsideClick = (e: MouseEvent) => {
        let insideScrollbar = false
        if ((e.target as HTMLElement).closest('[data-dropdown-content="'+buttonUid+'"]'))
        {
            const dropdownScrollbarLeft = dropdown.value ? dropdown.value.clientWidth + dropdownLeft.value : 0
            const dropdownScrollbarRight = dropdown.value ? dropdown.value.offsetWidth + dropdownLeft.value : 0
            insideScrollbar = dropdownScrollbarLeft < e.clientX && e.clientX < dropdownScrollbarRight
        }

        if (
            !(e.target as HTMLElement).closest('[data-dropdown-button="'+buttonUid+'"]') // Make sure it's not the root button
            && (!(e.target as HTMLElement).closest('[data-dropdown-content="'+buttonUid+'"]') || !(e.target as HTMLElement).closest('[data-dropdown-button]:not([data-dropdown-button="'+buttonUid+'"])')) // Make sure it's not a nested dropdown button
            && !(e.target as HTMLElement).closest('[data-dropdown-content="'+buttonUid+'"] input') // Allow inputs in the dropdown
            && !insideScrollbar // Allow scrollbar dragging inside dropdown
        )
        {
            closeDropdown()
        }
    }

    onMounted(() => {
        if(dropdown.value) {
            dropdownBorderTop.value = parseInt(getComputedStyle(dropdown.value).getPropertyValue("border-top-width").replace('px',''))
            dropdownBorderBottom.value = parseInt(getComputedStyle(dropdown.value).getPropertyValue("border-bottom-width").replace('px',''))
            dropdownBorderLeft.value = parseInt(getComputedStyle(dropdown.value).getPropertyValue("border-left-width").replace('px',''))
            dropdownBorderRight.value = parseInt(getComputedStyle(dropdown.value).getPropertyValue("border-right-width").replace('px',''))
        }
        setScroll()
    })

    watch(dropdownWidth, () => {
        if(dropdown.value) {
            dropdownScrollbarWidth.value = dropdown.value.offsetWidth - dropdown.value.clientWidth
            dropdownFullWidth.value = dropdown.value.offsetWidth
            if (dropdownButton.value) buttonFullWidth.value = dropdownButton.value.offsetWidth
        }
    })

    watch(open, () => {
        if (open.value) {

            window.addEventListener('scroll', closeDropdown, true)
            window.addEventListener('resize', closeDropdown, true)
            window.addEventListener('click', closeOnOutsideClick, true)
        }
        else {
            window.removeEventListener('scroll', closeDropdown, true)
            window.removeEventListener('resize', closeDropdown, true)
            window.removeEventListener('click', closeOnOutsideClick, true)
        }
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', closeDropdown, true)
        window.removeEventListener('resize', closeDropdown, true)
        window.removeEventListener('click', closeOnOutsideClick, true)
    })

</script>

<template>
    <div class="relative" :class="{'disabled': props.disabled}">
        <button
            @click="toggleDropdown()"
            :data-dropdown-button="buttonUid"
            type="button"
            :class="[props.buttonClasses, open ? props.openButtonClasses : null]"
            class="h-full flex items-center gap-2 py-2 px-4 font-semibold cursor-default hover:cursor-pointer"
            ref="dropdownButton"
            tabindex="-1"
        >
            <slot name="button" :open="open" :toggleDropdown="toggleDropdown"></slot>
            <span v-if="showIcon" class="h-4 w-4 flex items-center justify-center transition ease-in-out duration-100" :class="[open ? rotationClass : '']">
                <FasCaretDown
                    :class="[
                        {'rotate-180': ( placement == 'top' || placement.includes('top-') )},
                        props.dark ? 'fill-white' : 'fill-black'
                    ]"
                />
            </span>
        </button>
        <Teleport to="#dropdowns">
            <TransitionFade>
                <div
                    v-show="open"
                    :id="props.dropdownId"
                    ref="dropdown"
                    :data-dropdown-content="buttonUid"
                    class="absolute z-30 flex flex-col items-stretch text-sm shadow-xl max-w-[90vw] xs:max-w-min"
                    :class="[
                        props.dropdownClasses,
                        props.dark ? 'bg-zinc-950' : 'bg-white'
                    ]"
                    :style="{
                        top: dropdownTop + 'px',
                        left: dropdownLeft + 'px',
                        minWidth: (props.noMinWidth ? '0' : buttonWidth) + 'px'
                    }"
                >
                    <slot name="dropdown" :toggleDropdown="toggleDropdown"></slot>
                </div>
            </TransitionFade>
        </Teleport>
    </div>
</template>