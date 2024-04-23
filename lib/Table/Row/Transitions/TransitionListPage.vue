<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { type InternalColumn } from '../../Table.vue'
import { ref, inject, type ComputedRef, watch } from 'vue'
import { type LengthAwarePaginator } from '../../../Types/Laravel/LengthAwarePaginator'

const props = withDefaults(defineProps<{
    direction?: 'forwards' | 'backwards' | 'none' | 'initial',
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
const updateInnerColumnThSize = inject('updateInnerColumnThSize') as Function
const externalPagination = inject('externalPagination') as false | LengthAwarePaginator
const tableRef = inject('tableRef') as ComputedRef<HTMLInputElement | null>
const updateIsTransitioning = inject('updateIsTransitioning') as Function
const propsScroll = inject('propsScroll') as boolean

const originalOverflow = ref('')
const originalWidth = ref('')
const originalDisplay = ref('')
const originalTableColumnWidths = ref<ColumnWidth[]>([])

interface ColumnWidth {
    uid: string | null,
    width: number,
}
const newTableColumnWidths = ref<ColumnWidth[]>([])

const lastItemAction = ref<'enter' | 'leave' | 'resized'>()
const cycleHasLeavingItems = ref(false)

const { height: tableHeight } = useElementSize(tableRef)

const resizeTimeout = ref<NodeJS.Timeout>()
    const resizeTableCon = () => {
    if (!props.css || propsScroll || props.direction == 'initial') return

    let tableCon = document.querySelector<HTMLElement>(`#${tableConUid}`)

    if (tableCon) tableCon.style.height = getComputedStyle(tableCon).height

    let tfoot = tableRef.value?.querySelector('tfoot')
    let topBorder = tfoot ? parseInt(getComputedStyle(tfoot).getPropertyValue("border-top-width").replace('px','')) : 0
    let bottomBorder = tfoot ? parseInt(getComputedStyle(tfoot).getPropertyValue("border-bottom-width").replace('px','')) : 0

    if (props.css && tableCon) {
        requestAnimationFrame(() => {
            tableCon.style.transition = `all ${props.durationMs}ms ease-out`
            tableCon.style.height = (tableHeight.value + topBorder + bottomBorder) + 'px'
        })
    }
    else
    {
        if (tableCon) tableCon.style.height = (tableHeight.value + topBorder + bottomBorder) + 'px'
    }

    setTimeout(() => {
        if (tableCon) tableCon.style.transition = 'none'
    }, props.durationMs * 1.1)
}

watch(tableHeight, () => {
    if (resizeTimeout.value) clearTimeout(resizeTimeout.value)
    
    resizeTimeout.value = setTimeout(() => {
        resizeTableCon()
        lastItemAction.value = 'resized'
        cycleHasLeavingItems.value = false
    }, lastItemAction.value == 'enter' ? props.durationMs * 1.1 : 0)
})

const originalThCaptured = ref(false)
const resizeThTimeout = ref<NodeJS.Timeout>()
const resizeTh = (tempTable?: HTMLTableElement) => {

    let tableCon = document.querySelector(`#${tableConUid}`)

    newTableColumnWidths.value.length = 0

    if (tempTable)
    {
        // Set the TH's width to auto so the TDs will resize themselves
        tempTable.querySelectorAll<HTMLElement>('thead tr th:not([data-th-select]):not([data-ts-action-buttons])').forEach(th => {
            th.style.width = 'auto'
        })

        // Grab the new column widths
        tempTable.querySelectorAll<HTMLElement>('thead tr th:not([data-th-select]):not([data-ts-action-buttons])').forEach(th => {
            newTableColumnWidths.value.push({
                uid: th.getAttribute('data-th'),
                width: th.offsetWidth
            })
        })
    }
    
    else
    {
        // Set the TH's width to auto so the TDs will resize themselves
        tableCon?.querySelectorAll<HTMLElement>('thead tr th:not([data-th-select]):not([data-ts-action-buttons])').forEach(th => {
            th.style.width = 'auto'
        })

        // Grab the new column widths
        tableCon?.querySelectorAll<HTMLElement>('table tbody tr:first-child td:not([data-td-select])').forEach(th => {
            newTableColumnWidths.value.push({
                uid: th.getAttribute('data-th'),
                width: th.offsetWidth
            })
        })
    }

    // Manually set the THs to their original width (so we can animate away from it)
    // tableCon?.querySelectorAll<HTMLElement>('thead tr th:not([data-th-select]):not([data-ts-action-buttons])').forEach((th, index) => {
    //     th.style.width = `${originalTableColumnWidths.value[index]}px`
    // })
    
    // Loop through the saved TD widths and animate the TH width change
    newTableColumnWidths.value.forEach((newWidth) => {
        let th = tableCon?.querySelector<HTMLElement>(`thead tr th[data-th="${newWidth.uid}"]`)
        if (th) {
            getComputedStyle(th).width // Force a re-paint so the browser has the accurate width to animate from

            th.style.transition = `all ${props.durationMs}ms ease-out`

            //@ts-ignore
            // th.computedStyleMap.width = getComputedStyle(th).width

            let startTime = null as any
            let width = Math.round(th.offsetWidth)
            let targetWidth = Math.round(newWidth.width)
            let duration = props.durationMs / 2

            const updateWidth = (timestamp?: any) => {
                if (!startTime) startTime = timestamp
                const elapsedTime = timestamp - startTime
                
                // Calculate the new width based on the elapsed time
                width = Math.min(targetWidth, width + (targetWidth - 100) * (elapsedTime / duration))
                th.style.width = `${width}px`

                // If the animation is not complete, request another frame
                if (elapsedTime < duration) {
                    requestAnimationFrame(updateWidth)
                }
            }
            // Start the animation
            requestAnimationFrame(updateWidth)

            // requestAnimationFrame(() => {
            //     th.style.width = newWidth.width
            // })
        }
    })

    // After the animation is over, set the TH widths back to auto
    setTimeout(() => {
        tableCon?.querySelectorAll<HTMLElement>('thead tr th:not([data-th-select]):not([data-ts-action-buttons])').forEach((th) => {
            updateInnerColumnThSize(th.getAttribute('data-th'), parseInt(getComputedStyle(th).width), 10)
            // th.style.width = 'auto'
            // th.style.transition = 'none'
        })
    }, props.durationMs * 1.1)
    originalThCaptured.value = false
}

// Captures the original height/width of the table con as well as the widths of the th's
const storeOriginalThMeasurements = () => {
    let tableCon = document.querySelector(`#${tableConUid}`)

    if (/*!originalThCaptured.value*/ true) {
        originalTableColumnWidths.value.length = 0
        newTableColumnWidths.value.length = 0

        tableCon?.querySelectorAll<HTMLElement>('thead tr th:not([data-th-select]):not([data-ts-action-buttons])').forEach(th => {
            originalTableColumnWidths.value.push({
                uid: th.getAttribute('data-th'),
                width: th.offsetWidth
            })
            th.style.width = getComputedStyle(th).width
            th.style.transition = ''
        })

        // tableCon?.querySelectorAll<HTMLElement>('thead tr th:not([data-th-select]):not([data-ts-action-buttons])').forEach(th => {
        //     originalTableColumnWidths.value.push(th.offsetWidth)
        //     th.style.width = getComputedStyle(th).width
        //     th.style.transition = ''
        // })

        updateIsTransitioning(true)
    }
}

function onBeforeLeavePage(el: Element) {
    if (!props.css || propsScroll || props.direction == 'initial') return

    storeOriginalThMeasurements()

    if (props.direction == 'none') return // Exit here for non-page-change changes (i.e. row length changes)

    // Animate the incoming list items
    (el as HTMLElement).style.transition = `all ${props.durationMs}ms ease-out` // Need to set the root element transition to allow the child items time to animate
    el.querySelectorAll<HTMLElement>(':scope > *').forEach(_el => {
        _el.style.transition = `all ${props.durationMs}ms ease-out` 
        if (props.direction == 'forwards' && /*!externalPagination*/ true) _el.style.animation = `leaveForwards ${props.durationMs}ms`
        else if (props.direction == 'backwards' && /*!externalPagination*/ true) _el.style.animation = `leaveBackwards ${props.durationMs}ms`
        else _el.style.animation = `leave ${props.durationMs}ms`
        if (props.direction == 'forwards' || props.direction == 'backwards' || externalPagination) _el.style.opacity = '0' // Keeps the outgoing list from blipping back on the page for a moment
        
    })
}

function onBeforeEnterPage(el: Element)
{
    if (!props.css || propsScroll || props.direction == 'initial') return
    const tableCon = document.querySelector<HTMLElement>(`#${tableConUid}`)

    // Clone the incoming table and measure that, otherwise we get weird blips on the screen when the table 
    // gets absolutely positioned

    const tempTable = document.createElement('table')
    const tempThead = document.querySelector<HTMLElement>(`#${tableUid} thead`)?.cloneNode(true) // Add the thead for proper sizing of the columns
    const clone = el.cloneNode(true) as HTMLElement
    if (tempThead) tempTable.appendChild(tempThead)
    tempTable.appendChild(clone)

    document.body.appendChild(tempTable)
    // Animate parent container height change

    tempTable.style.position = 'absolute'
    let realTable = document.querySelector(`#${tableUid}`)
    if (realTable) tempTable.style.width = getComputedStyle(realTable).width

    clone.style.width = originalWidth.value
    clone.style.visibility = 'hidden'
    clone.style.height = 'auto'

    const newTableHeight = getComputedStyle(clone).height;

    (el as HTMLElement).style.width = '';
    (el as HTMLElement).style.position = '';
    (el as HTMLElement).style.visibility = '';
    (el as HTMLElement).style.height = newTableHeight


    // Force repaint to make sure the
    // animation is triggered correctly.
    getComputedStyle(el).height

    if (props.direction != 'none') (el as HTMLElement).style.transition = `all ${props.durationMs}ms ease-out`
    if (tableCon) tableCon.style.transition = `all ${props.durationMs}ms ease-out`

    if (!props.loading) resizeTh(tempTable)
    document.body.removeChild(tempTable)
}

function onEnterPage(el: Element, done: Function) {
    if (!props.css || propsScroll || props.direction == 'initial') return

    el.querySelectorAll(':scope > *').forEach(_el => {
        if (props.direction == 'forwards' && /*!externalPagination*/ true) (_el as HTMLElement).style.animation = `enterForwards ${props.durationMs}ms`
        else if (props.direction == 'backwards' && /*!externalPagination*/ true) (_el as HTMLElement).style.animation = `enterBackwards ${props.durationMs}ms`
        else (_el as HTMLElement).style.animation = `enter ${props.durationMs}ms`
    })

    setTimeout(() => {
        el.querySelectorAll<HTMLElement>(':scope > *').forEach(_el => {
            _el.style.animation = ''
        })

        if (el.parentElement)
        {
            el.parentElement.style.overflow = originalOverflow.value;
            (el as HTMLElement).style.display = originalDisplay.value;
            (el as HTMLElement).style.height = 'auto'
        }

        updatePageStepDirection('none')

        const tableCon = document.querySelector<HTMLElement>(`#${tableConUid}`)
        tableCon?.querySelectorAll<HTMLElement>(`thead tr th`).forEach(th => {
            th.style.transition = ''
        })

        resizeTableCon()

        updateIsTransitioning(false)
        done()

    }, props.durationMs)
}


//#region Transition Rows
function onBeforeLeaveItem() {
    if (!props.css || propsScroll || props.direction == 'initial') return

    storeOriginalThMeasurements()
}

function onLeaveItem(el: Element, done: Function) {
    if (!props.css || propsScroll || props.direction == 'initial') return
    lastItemAction.value = 'leave'
    cycleHasLeavingItems.value = true;

    // Animate the incoming list items
    (el as HTMLElement).style.transition = `all ${props.durationMs}ms ease-out`; // Need to set the root element transition to allow the child items time to animate
    (el as HTMLElement).style.animation = `itemLeave ${props.durationMs}ms`

    // Debounce resizeTh
    if (resizeThTimeout.value) clearTimeout(resizeThTimeout.value)
    resizeThTimeout.value = setTimeout(() => {
        resizeTh()
    }, props.durationMs * 1.1)

    setTimeout(() => {
        updateIsTransitioning(false)
        done()
    }, props.durationMs)
}

function onBeforeEnterItem() {
    updateIsTransitioning(true)
    if (!props.css || propsScroll || props.direction == 'initial') return

    storeOriginalThMeasurements()
}

function onEnterItem(el: Element, done: Function) {
    if (!props.css || propsScroll || props.direction == 'initial') return

        //@ts-ignore
        el.style.transition = `all ${props.durationMs}ms ease-out` // Need to set the root element transition to allow the child items time to animate

        //@ts-ignore
        el.style.animation = `itemEnter ${props.durationMs}ms`
        if (cycleHasLeavingItems.value) {
            //@ts-ignore
            el.style.transitionDelay = props.durationMs + 'ms'
        }

        // Debounce resizeTh
        if (resizeThTimeout.value) clearTimeout(resizeThTimeout.value)
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
        @before-enter="onBeforeEnterPage"
        @enter="onEnterPage"
    >
        <TransitionGroup
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