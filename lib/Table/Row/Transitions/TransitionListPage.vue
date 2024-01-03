<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { type InternalColumn } from '../../Table.vue'
import { ref, inject, type ComputedRef, watch } from 'vue'
import TableRowSkeleton from '../../../Skeletons/Table/TableRowSkeleton.vue'
import { type LengthAwarePaginator } from '../../../Types/Laravel/LengthAwarePaginator'

const props = withDefaults(defineProps<{
    direction?: 'forwards' | 'backwards' | 'none',
    durationMs?: number,
    pageKey: string | number,
    itemsLength: number,
    css: boolean,
    loading: boolean,
    columns: InternalColumn[]
    scroll: boolean,
}>(), {
    direction: 'forwards',
    durationMs: 125
})

const tableConUid = inject('tableConUid') as string
const tableUid = inject('tableUid') as string
const updatePageStepDirection = inject('updatePageStepDirection') as Function
const externalPagination = inject('externalPagination') as false | LengthAwarePaginator
const rowsPerPage = inject('rowsPerPage') as ComputedRef<number>
const selectable = inject('selectable') as boolean
const tableRef = inject('tableRef') as ComputedRef<HTMLInputElement | null>
const updateIsTransitioning = inject('updateIsTransitioning') as Function

const originalOverflow = ref('')
const originalWidth = ref('')
const originalDisplay = ref('')
const originalTableColumnWidths = ref([] as string[])
const newTableColumnWidths = ref([] as string[])
const lastItemAction = ref('' as 'enter' | 'leave' | 'resized')
const cycleHasLeavingItems = ref(false)

const { height: tableHeight } = useElementSize(tableRef)

const resizeTimeout = ref(null)
const resizeTableCon = () => {

    let tableCon = document.querySelector(`#${tableConUid}`)

    //@ts-ignore
    if (tableCon) tableCon.style.height = getComputedStyle(tableCon).height

    let tfoot = tableRef.value?.querySelector('tfoot')
    let topBorder = tfoot ? parseInt(getComputedStyle(tfoot).getPropertyValue("border-top-width").replace('px','')) : 0
    let bottomBorder = tfoot ? parseInt(getComputedStyle(tfoot).getPropertyValue("border-bottom-width").replace('px','')) : 0

    if (props.css && tableCon) {
        requestAnimationFrame(() => {
            //@ts-ignore
            tableCon.style.transition = `all ${props.durationMs}ms ease-out`
            //@ts-ignore
            tableCon.style.height = (tableHeight.value + topBorder + bottomBorder) + 'px'
        })
    }
    else
    {
        //@ts-ignore
        if (tableCon) tableCon.style.height = (tableHeight.value + topBorder + bottomBorder) + 'px'
    }

    setTimeout(() => {
        //@ts-ignore
        if (tableCon) tableCon.style.transition = 'none'
    }, props.durationMs * 1.1)
}

watch(tableHeight, () => {
    if (resizeTimeout.value) clearTimeout(resizeTimeout.value)
    
    //@ts-ignore
    resizeTimeout.value = setTimeout(() => {
        resizeTableCon()
        lastItemAction.value = 'resized'
        cycleHasLeavingItems.value = false
    }, lastItemAction.value == 'enter' ? props.durationMs * 1.1 : 0)
})

const originalThCaptured = ref(false)
const resizeThTimeout = ref(null)
const resizeTh = () => {

    let tableCon = document.querySelector(`#${tableConUid}`)

    newTableColumnWidths.value.length = 0

    // Set the TH's width to auto so the TDs will resize themselves
    tableCon?.querySelectorAll('thead tr th:not([data-th-select])').forEach(th => {
        //@ts-ignore
        th.style.width = 'auto'
    })

    // Grab the new column widths
    tableCon?.querySelectorAll('table tbody tr:first-child td:not([data-td-select])').forEach(th => {
        newTableColumnWidths.value.push(getComputedStyle(th).width)
    })

    // Manually set the THs to their original width (so we can animate away from it)
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
            //@ts-ignore
            th.computedStyleMap.width = getComputedStyle(th).width
            requestAnimationFrame(() => {
                //@ts-ignore
                th.style.width = newWidth
            })
        }
    })

    // After the animation is over, set the TH widths back to auto
    setTimeout(() => {
        tableCon?.querySelectorAll('thead tr th:not([data-th-select])').forEach(th => {
            //@ts-ignore
            th.style.width = 'auto'

            //@ts-ignore
            th.style.transition = 'none'
        })
    }, props.durationMs * 1.1)
    originalThCaptured.value = false
}

// Captures the original height/width of the table con as well as the widths of the th's
const storeOriginalThMeasurements = () => {
    let tableCon = document.querySelector(`#${tableConUid}`)

    if (!originalThCaptured.value) {
        originalTableColumnWidths.value.length = 0
        newTableColumnWidths.value.length = 0

        tableCon?.querySelectorAll('thead tr th:not([data-th-select])').forEach(th => {
            originalTableColumnWidths.value.push(getComputedStyle(th).width)
            //@ts-ignore
            th.style.width = getComputedStyle(th).width
            //@ts-ignore
            th.style.transition = ''
        })

        updateIsTransitioning(true)
    }
}

function onBeforeLeavePage(el: Element) {
    if (!props.css || props.scroll) return

    storeOriginalThMeasurements()

    if (props.direction == 'none') return // Exit here for non-page-change changes (i.e. row length changes)

    // Animate the incoming list items
    //@ts-ignore
    el.style.transition = `all ${props.durationMs}ms ease-out` // Need to set the root element transition to allow the child items time to animate
    //@ts-ignore
    if (externalPagination) el.style.opacity = 0
    el.querySelectorAll(':scope > *').forEach(_el => {
        //@ts-ignore
        _el.style.transition = `all ${props.durationMs}ms ease-out` 
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

function onEnterPage(el: Element, done: Function) {
    if (!props.css || props.scroll) return

    const tableCon = document.querySelector(`#${tableConUid}`)

    // Clone the incoming table and measure that, otherwise we get weird blips on the screen when the table 
    // gets absolutely positioned

    const tempTable = document.createElement('table')
    const clone = el.cloneNode(true)
    tempTable.appendChild(clone)

    document.body.appendChild(tempTable)
    // Animate parent container height change

    //@ts-ignore
    tempTable.style.position = 'absolute'
    //@ts-ignore
    tempTable.style.width = '100%'

    //@ts-ignore
    clone.style.width = originalWidth.value
    //@ts-ignore
    clone.style.visibility = 'hidden'
    //@ts-ignore
    clone.style.height = 'auto'

    //@ts-ignore
    const newTableHeight = getComputedStyle(clone).height

    document.body.removeChild(tempTable)

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
    if (props.direction != 'none') el.style.transition = `all ${props.durationMs}ms ease-out`
    //@ts-ignore
    tableCon.style.transition = `all ${props.durationMs}ms ease-out`
    //@ts-ignore
    // tableCon.style.height = originalTableConHeight.value
    // requestAnimationFrame(() => {
    //     //@ts-ignore
    //     tableCon.style.height = newConHeight+'px'
    // })

    if (!props.loading) resizeTh()

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
            // tableCon.style.height = 'auto'
            //@ts-ignore
            el.style.height = 'auto'
        }

        updatePageStepDirection('none')

        tableCon?.querySelectorAll(`thead tr th`).forEach(th => {
            //@ts-ignore
            th.style.transition = ''
        })

        resizeTableCon()

    }, props.durationMs)

    updateIsTransitioning(false)
    done()
}


//#region Transition Rows
//@ts-ignore
function onBeforeLeaveItem(el: Element) {
    if (!props.css || props.scroll) return

    storeOriginalThMeasurements()
}

function onLeaveItem(el: Element, done: Function) {
    if (!props.css || props.scroll) return
    lastItemAction.value = 'leave'
    cycleHasLeavingItems.value = true

    // Animate the incoming list items
    //@ts-ignore
    el.style.transition = `all ${props.durationMs}ms ease-out` // Need to set the root element transition to allow the child items time to animate
    //@ts-ignore
    // if (externalPagination) el.style.opacity = 0
    // //@ts-ignore
    // if (props.direction == 'forwards' && !externalPagination) el.style.animation = `leaveForwards ${props.durationMs}ms`
    // //@ts-ignore
    // else if (props.direction == 'backwards' && !externalPagination) el.style.animation = `leaveBackwards ${props.durationMs}ms`
    // //@ts-ignore
    // else el.style.animation = `itemLeave ${props.durationMs}ms`
    // //@ts-ignore
    // if (props.direction == 'forwards' || props.direction == 'backwards' || externalPagination) el.style.opacity = 0 // Keeps the outgoing list from blipping back on the page for a moment

    //@ts-ignore
    el.style.animation = `itemLeave ${props.durationMs}ms`
    //@ts-ignore
    // el.style.opacity = 0


    // Debounce resizeTh
    if (resizeThTimeout.value) clearTimeout(resizeThTimeout.value)
    //@ts-ignore
    resizeThTimeout.value = setTimeout(() => {
        resizeTh()
    }, props.durationMs * 1.1)

    setTimeout(() => {
        updateIsTransitioning(false)
        done()
    }, props.durationMs)
}

//@ts-ignore
function onBeforeEnterItem(el:Element) {
    updateIsTransitioning(true)
    if (!props.css || props.scroll) return

    storeOriginalThMeasurements()
}

function onEnterItem(el: Element, done: Function) {
    if (!props.css || props.scroll) return

        //@ts-ignore
        el.style.transition = `all ${props.durationMs}ms ease-out` // Need to set the root element transition to allow the child items time to animate

        // //@ts-ignore
        // if (props.direction == 'forwards' && !externalPagination) el.style.animation = `enterForwards ${props.durationMs}ms`
        // //@ts-ignore
        // else if (props.direction == 'backwards' && !externalPagination) el.style.animation = `enterBackwards ${props.durationMs}ms`
        // //@ts-ignore
        // else el.style.animation = `itemEnter ${props.durationMs}ms`
        // //@ts-ignore
        // if (props.direction == 'forwards' || props.direction == 'backwards' || externalPagination)
        // {
        //     //@ts-ignore
        //     el.style.opacity = 0 // Keeps the outgoing list from blipping back on the page for a moment
        //     setTimeout(() => {
        //         //@ts-ignore
        //         el.style.opacity = 1
        //     }, props.durationMs * 1.1)   
            
        // }

        //@ts-ignore
        el.style.animation = `itemEnter ${props.durationMs}ms`
        if (cycleHasLeavingItems.value) {
            //@ts-ignore
            el.style.transitionDelay = props.durationMs + 'ms'
        }

        // Debounce resizeTh
        if (resizeThTimeout.value) clearTimeout(resizeThTimeout.value)
        //@ts-ignore
        resizeThTimeout.value = setTimeout(() => {
            resizeTh()
        }, props.durationMs * 1.1)

        lastItemAction.value = 'enter'

        setTimeout(() => {
            el.removeAttribute('style') // Removes any lingering inline styles that might interfrere with sorting
            updateIsTransitioning(false)
            done()
        }, props.durationMs * 1.1)

}
//#endregion
</script>
<template>
    <Transition
        name="page"
        mode="out-in"
        @before-leave="onBeforeLeavePage"
        @enter="onEnterPage"
    >
        <TransitionGroup v-if="!props.loading"
            :name="props.css ? 'list' : 'no_transitions'"
            tag="tbody"
            @before-leave="onBeforeLeaveItem"
            @leave="onLeaveItem"
            @before-enter="onBeforeEnterItem"
            @enter="onEnterItem"
            :key="props.pageKey"
            :css="props.css"
            :id="tableUid+'_tbody'"
        >
            <slot />
        </TransitionGroup>
        <tbody v-else>
        <!-- @vue-ignore -->
            <TableRowSkeleton v-for="index in rowsPerPage"
                :cols="props.columns.length + (selectable ? 1 : 0)"
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
    100% { opacity: 1; }
}

@keyframes itemEnter {
    /* 0% { opacity: 0; }
    100% { opacity: 1; } */
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
    100% { opacity: 0; }
}

@keyframes itemLeave {
    /* 0% { opacity: 1; }
    100% { opacity: 0; } */
}

.list-move { transition: all 100ms ease-in-out; }

/* .list-move, 
.list-enter-active,
.list-leave-active
{
  transition: all 100ms ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
} */
</style>