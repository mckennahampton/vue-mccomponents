<script setup lang="ts">
import { ref, inject, type ComputedRef } from 'vue'
import { type Header } from '../../Header/HeaderElements.vue'
import TableRowSkeleton from '../../../Skeletons/Table/TableRowSkeleton.vue'
import { type LengthAwarePaginator } from '../../../Types/Laravel/LengthAwarePaginator'


const props = withDefaults(defineProps<{
    direction?: 'forwards' | 'backwards' | 'none',
    durationMs?: number,
    pageKey: string | number,
    itemsLength: number,
    loading: boolean,
    headers: Header[]
}>(), {
    direction: 'forwards',
    durationMs: 100
})

const tableUid = inject('tableUid') as string
const tableConUid = inject('tableConUid') as string
const updatePageStepDirection = inject('updatePageStepDirection') as Function
const externalPagination = inject('externalPagination') as false | LengthAwarePaginator
const rowsPerPage = inject('rowsPerPage') as ComputedRef<number>
    const selectable = inject('selectable') as boolean



const originalOverflow = ref('')
const originalHeight = ref('')
const originalWidth = ref('')
const originalDisplay = ref('')
const originalTableConHeight = ref('')
const originalTableColumnWidths = ref([] as string[])
const newTableColumnWidths = ref([] as string[])

function onBeforeLeave(el: Element) {
    let tableCon = document.querySelector(`#${tableConUid}`)
    originalTableConHeight.value = tableCon ? getComputedStyle(tableCon).height : ''

    originalTableColumnWidths.value.length = 0
    newTableColumnWidths.value.length = 0

    tableCon?.querySelectorAll('thead tr th:not([data-th-select])').forEach(th => {
        originalTableColumnWidths.value.push(getComputedStyle(th).width)
    })

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
    //@ts-ignore
    if (externalPagination) el.style.opacity = 0

    el.querySelectorAll(':scope > *').forEach(_el => {
        //@ts-ignore
        if (props.direction == 'forwards' && !externalPagination) _el.style.animation = `leaveForwards ${props.durationMs}ms`
        //@ts-ignore
        else if (props.direction == 'backwards' && !externalPagination) _el.style.animation = `leaveBackwards ${props.durationMs}ms`
        //@ts-ignore
        else _el.style.animation = `leave ${props.durationMs}ms`
        //@ts-ignore
        if (props.direction == 'forwards' || props.direction == 'backwards' || externalPagination) _el.style.opacity = 0 // Keeps the outgoing list from blipping back on the page for a moment
        
    })
}

function onEnter(el: Element, done: Function) {

    const tableCon = document.querySelector(`#${tableConUid}`)
    tableCon?.querySelectorAll('thead tr th:not([data-th-select])').forEach(th => {
        //@ts-ignore
        th.style.width = 'auto'
    })

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

    // Get the new TD widths
    el.querySelectorAll('tr:first-child td:not([data-td-select])').forEach(th => {
        newTableColumnWidths.value.push(getComputedStyle(th).width)
    })

    // Manually set the THs to their original width
    tableCon?.querySelectorAll('thead tr th:not([data-th-select])').forEach((th, index) => {
        //@ts-ignore
        th.style.width = originalTableColumnWidths.value[index]
    })

    // Loop through the saved TD widths and animate the TH width change
    newTableColumnWidths.value.forEach((newWidth, index) => {
        let th = tableCon?.querySelector(`thead tr th:nth-child(${index + 1})`)
        if (th) {

            getComputedStyle(th).width // Force a re-paint so the browser has the accurate width to animate from

            //@ts-ignore
            th.style.transition = `all ${props.durationMs}ms ease-out`
            requestAnimationFrame(() => {
                //@ts-ignore
                th.style.width = newWidth
            })
        }
    })

    el.querySelectorAll(':scope > *').forEach(_el => {
        //@ts-ignore
        if (props.direction == 'forwards' && !externalPagination) _el.style.animation = `enterForwards ${props.durationMs}ms`
        //@ts-ignore
        else if (props.direction == 'backwards' && !externalPagination) _el.style.animation = `enterBackwards ${props.durationMs}ms`
        //@ts-ignore
        else _el.style.animation = `enter ${props.durationMs}ms`
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
            //@ts-ignore
            tableCon.style.height = 'auto'
            //@ts-ignore
            el.style.height = 'auto'
        }

        updatePageStepDirection('none')

        tableCon?.querySelectorAll(`thead tr th`).forEach(th => {
            //@ts-ignore
            th.style.transition = ''
        })

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
        <TransitionGroup v-if="!props.loading"
            name="list"
            tag="tbody"
            :key="props.pageKey"
        >
            <slot />
        </TransitionGroup>

        <tbody v-else>
            <!-- @vue-ignore-->
            <TableRowSkeleton v-for="index in rowsPerPage"
                :cols="props.headers.length + (selectable ? 1 : 0)"
            />
        </tbody>

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

@keyframes enter {
    0% { opacity: 0; }
    50% { opacity: 1; }
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

@keyframes leave {
    0% { opacity: 1; }
    50% { opacity: 0; }
}

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
</style>