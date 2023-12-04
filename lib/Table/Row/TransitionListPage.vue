<script setup lang="ts">
import { ref, inject } from 'vue'

const props = withDefaults(defineProps<{
    direction?: 'forwards' | 'backwards',
    durationMs?: number,
    pageKey: string | number,
}>(), {
    direction: 'forwards',
    durationMs: 100
})

const tableUid = inject('tableUid') as string
const tableConUid = inject('tableConUid') as string

const originalOverflow = ref('')
const originalHeight = ref('')
const originalWidth = ref('')
const originalDisplay = ref('')
const originalTableConHeight = ref('')

function onBeforeLeave(el: Element) {

    let tableCon = document.querySelector(`#${tableConUid}`)
    originalTableConHeight.value = tableCon ? getComputedStyle(tableCon).height : ''

    //@ts-ignore
    if (el.parentElement)
    {
        originalHeight.value = getComputedStyle(el).height
        originalWidth.value = getComputedStyle(el).width
        originalDisplay.value = getComputedStyle(el).display

        // Set parent element to clip overflow-x to avoid horizontal scrollbars
        originalOverflow.value = el.parentElement.style.overflow
        el.parentElement.style.overflow = 'clip'
    }

    // Animate the incoming list items
    //@ts-ignore
    el.style.transition = `all ${props.durationMs}ms ease-out` // Need to set the root element transition to allow the child items time to animate
    el.querySelectorAll(':scope > *').forEach(_el => {
        //@ts-ignore
        _el.style.animation = props.direction == 'forwards' ? `leaveForwards ${props.durationMs}ms` : `leaveBackwards ${props.durationMs}ms`
        //@ts-ignore
        _el.style.opacity = 0 // Keeps the outgoing list from blipping back on the page for a moment
        
    })
}

function onEnter(el: Element, done: Function) {

    // Animate parent container height change
    //@ts-ignore
    el.style.width = originalWidth.value
    //@ts-ignore
    el.style.position = 'absolute'
    //@ts-ignore
    el.style.visibility = 'hidden'
    //@ts-ignore
    el.style.height = 'auto'

    const newTableHeight = getComputedStyle(el).height

    const tableCon = document.querySelector(`#${tableConUid}`)
    const tableBorderTop = tableCon ? parseInt(getComputedStyle(tableCon).getPropertyValue("border-top-width")) : 0
    const tableBorderBottom = tableCon ? parseInt(getComputedStyle(tableCon).getPropertyValue("border-bottom-width")) : 0
    // ? parseInt(getComputedStyle(tableCon).height) + parseInt(getComputedStyle(tableCon).getPropertyValue("border-top-width").replace('px','')) + parseInt(getComputedStyle(tableCon).getPropertyValue("border-bottom-width").replace('px',''))
    // : 0

    const tableHeader = document.querySelector(`#${tableUid} thead`)
    const tableHeaderHeight = tableHeader ? getComputedStyle(tableHeader).height : 0

    const newConHeight = parseInt(newTableHeight) + parseInt(tableHeaderHeight.toString()) + tableBorderTop + tableBorderBottom
    // const newConHeight = tableConHeight - parseInt(newTableHeight)

    //@ts-ignore
    el.style.width = null
    //@ts-ignore
    el.style.position = null
    //@ts-ignore
    el.style.visibility = null
    //@ts-ignore
    el.style.height = newTableHeight

    // Force repaint to make sure the
    // animation is triggered correctly.
    getComputedStyle(el).height

    //@ts-ignore
    el.style.transition = `all ${props.durationMs}ms ease-out`
    //@ts-ignore
    tableCon.style.transition = `all ${props.durationMs}ms ease-out`
    //@ts-ignore
    tableCon.style.height = originalTableConHeight.value
    requestAnimationFrame(() => {
        //@ts-ignore
        tableCon.style.height = newConHeight+'px'
    })

    // if (el.parentElement) el.parentElement.style.height = 'auto'

    el.querySelectorAll(':scope > *').forEach(_el => {
        //@ts-ignore
        _el.style.animation = props.direction == 'forwards' ? `enterForwards ${props.durationMs}ms` : `enterBackwards ${props.durationMs}ms`
    })

    setTimeout(() => {
        el.querySelectorAll(':scope > *').forEach(_el => {
            //@ts-ignore
            _el.style.animation = ''
        })

        //@ts-ignore
        if (el.parentElement)
        {
            el.parentElement.style.overflow = originalOverflow.value
            //@ts-ignore
            el.style.display = originalDisplay.value
        }
    }, props.durationMs)

    done()
}


</script>
<template>
    <Transition
        name="page"
        mode="out-in"
        @before-leave="onBeforeLeave"
        @enter="onEnter"
    >
        <TransitionGroup
            name="list"
            tag="tbody"
            :key="props.pageKey"
        >
            <slot />
        </TransitionGroup>
    </Transition>
</template>
<style>
@keyframes enterForwards {
    0% {
        transform: translateX(10%);
        opacity: 0;
    }
    50% { opacity: 1; }
    100% {
        transform: translateX('0px');
        opacity: 1;
    }
}

@keyframes enterBackwards {
    0% {
        transform: translateX(-10%);
        opacity: 0;
    }
    50% { opacity: 1; }
    100% {
        transform: translateX('0px');
        opacity: 1;
    }
}

@keyframes leaveBackwards {
    0% {
        transform: translateX('0px');
        opacity: 1;

    }
    50% { opacity: 1; }
    100% {
        transform: translateX(10%);
        opacity: 0;
    }
}

@keyframes leaveForwards {
    0% {
        transform: translateX('0px');
        opacity: 1;
    }
    50% { opacity: 1; }
    100% {
        transform: translateX(-10%);
        opacity: 0;
    }
}

/* #region List add/remove/move transition */
.list-move, 
.list-enter-active,
.list-leave-active
{
  transition: all 100ms ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* #endregion */
</style>