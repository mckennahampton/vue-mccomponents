<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { reactive, inject, type Ref } from 'vue'

interface Props {
    index: number,
}
const props = defineProps<Props>()

const updateResizing = inject('updateResizing') as Function
const tableUid = inject('tableUid') as string

const resizeState = reactive({
    pageXWidth: 0,
    curTh: {} as HTMLElement,
    nextTh: {} as HTMLElement,
    curThWidth: 0,
    nextThWidth: 0,
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

const resizeMouseDown = (e: MouseEvent, index: number) => {
    updateResizing(true)
    resizeState.curTh = document.querySelector(`#${tableUid} thead th:nth-child(${index})`) ?? {} as HTMLElement
    resizeState.nextTh = document.querySelector(`#${tableUid} thead th:nth-child(${index + 1})`) ?? {} as HTMLElement
    resizeState.pageXWidth = e.pageX
    let padding = paddingDiff(resizeState.curTh)

    resizeState.curThWidth = resizeState.curTh.offsetWidth - padding
    if (resizeState.nextTh) {
        resizeState.nextThWidth = resizeState.nextTh.offsetWidth - padding
    }
    document.addEventListener('mousemove', resizeMouseMove, true)
    document.addEventListener('mouseup', resetResizeState, true)
}

const resizeMouseMove = (e: MouseEvent) => {
    if (resizeState.curTh) {
        let diff = e.pageX - resizeState.pageXWidth
        if (resizeState.nextTh) {
            resizeState.nextTh.style.width = (resizeState.nextThWidth - diff)+'px'
        }
        resizeState.curTh.style.width = (resizeState.curThWidth + diff)+'px'
    }
}

const resetResizeState = () => {
    updateResizing(false)
    resizeState.curTh = {} as HTMLElement
    resizeState.curThWidth = 0
    resizeState.nextTh = {} as HTMLElement
    resizeState.nextThWidth = 0
    resizeState.pageXWidth = 0
    document.removeEventListener('mouseup', resetResizeState, true)
    document.removeEventListener('mousemove', resizeMouseMove, true)
    document.getSelection()?.removeAllRanges()
}

const tableRef = inject('tableRef') as Ref<HTMLElement>
const { height: tableHeight } = useElementSize(tableRef)
</script>
<template>
    <span
        class="absolute top-0 -right-[6px] flex items-stretch hover:cursor-col-resize group px-1 z-[2]"
        :style="{ height: tableHeight + 'px' }"
        @click.stop
        @mousedown="(e) => resizeMouseDown(e, props.index + 1)"
    >
        <span class="w-[2px]"></span>
        <span class="w-[2px] group-hover:bg-neutral-300"></span>
        <span class="w-[2px]"></span>
    </span>
</template>