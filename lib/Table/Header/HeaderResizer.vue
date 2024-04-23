<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { reactive, inject, type Ref } from 'vue'
import { type InternalColumn } from '../TableTypes'

interface Props {
    index: number,
    column: InternalColumn
}
const props = defineProps<Props>()

const tableUid = inject('tableUid') as string
const updateResizing = inject('updateResizing') as Function
const updateInnerColumnThSize = inject('updateInnerColumnThSize') as Function


const resizeState = reactive({
    pageXWidth: 0 as number,
    curTh: {} as Element,
    nextTh: {} as Element,
    curThWidth: 0 as number,
    nextThWidth: 0 as number,
})

const getStyleVal = (el: Element, css: string) => {
    return window.getComputedStyle(el, null).getPropertyValue(css)
}

const paddingDiff = (th: Element) => {
    if (getStyleVal(th, 'box-sizing') == 'border-box') {
        return 0;
    }
    let padLeft = getStyleVal(th, 'padding-left')
    let padRight = getStyleVal(th, 'padding-right')
    return parseInt(padLeft) + parseInt(padRight)
}

const resizeMouseDown = (e: MouseEvent) => {
    updateResizing(true)
    resizeState.curTh = document.querySelector(`#${tableUid} [data-th=${props.column.uid}]`) ?? {} as Element
    resizeState.nextTh = document.querySelector(`#${tableUid} [data-th=${props.column.uid}] + [data-th]`) ?? {} as Element
    resizeState.pageXWidth = e.pageX
    let padding = paddingDiff(resizeState.curTh)

    //@ts-ignore
    resizeState.curThWidth = resizeState.curTh.offsetWidth - padding
    if (resizeState.nextTh) {
        //@ts-ignore
        resizeState.nextThWidth = resizeState.nextTh.offsetWidth - padding
    }
    document.addEventListener('mousemove', resizeMouseMove, true)
    document.addEventListener('mouseup', resetResizeState, true)
}

const resizeMouseMove = (e: MouseEvent) => {
    if (resizeState.curTh) {
        let diff = e.pageX - resizeState.pageXWidth
        if (resizeState.nextTh) {
            //@ts-ignore
            resizeState.nextTh.style.width = (resizeState.nextThWidth - diff)+'px'
            updateInnerColumnThSize(resizeState.nextTh.getAttribute('data-th'), resizeState.nextThWidth - diff)
        }
        //@ts-ignore
        resizeState.curTh.style.width = (resizeState.curThWidth + diff)+'px'
        updateInnerColumnThSize(props.column.uid, resizeState.curThWidth + diff)
    }
}

const resetResizeState = () => {
    updateResizing(false)
    resizeState.curTh = {} as Element
    resizeState.curThWidth = 0
    resizeState.nextTh = {} as Element
    resizeState.nextThWidth = 0
    resizeState.pageXWidth = 0
    document.removeEventListener('mouseup', resetResizeState, true)
    document.removeEventListener('mousemove', resizeMouseMove, true)
    document.getSelection()?.removeAllRanges()
}

const tableConRef = inject('tableConRef') as Ref<HTMLElement>
const virtualScrollerHeight = inject('virtualScrollerHeight') as Ref<number>
const { height: tableHeight } = useElementSize(tableConRef)

</script>
<template>
    <span
        class="absolute top-0 -right-[6px] flex items-stretch hover:cursor-col-resize group px-1"
        :style="{ height: tableHeight + virtualScrollerHeight + 'px' }"
        @click.stop
        @mousedown="(e) => resizeMouseDown(e)"
    >
        <span class="w-[2px]"></span>
        <span class="w-[2px] group-hover:bg-neutral-300"></span>
        <span class="w-[2px]"></span>
    </span>
</template>