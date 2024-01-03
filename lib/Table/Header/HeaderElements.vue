<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useElementSize } from '@vueuse/core'
import HeaderSorter from './HeaderSorter.vue'
import HeaderResizer from './HeaderResizer.vue'
import { type InternalColumn } from '../Table.vue'

interface Props {
    resize: boolean,
    selectable: boolean,
    classes?: string | object | any[]
    scrollable: boolean,
    column: InternalColumn,
    sort: boolean,
    index: number,
    itemCount: number,
    rowsPerPage: number,
    dark: boolean,
    isLast: boolean
}
const props = defineProps<Props>()

const updateInnerColumnThSize = inject('updateInnerColumnThSize') as Function

const thRef = ref(null)
const { width } = useElementSize(thRef)

onMounted(() => updateInnerColumnThSize(props.column.uid, width.value))

</script>
<template>
    <th v-if="column.caption != 'table_select'"
        :class="[
            column.classes,
            {'hover:cursor-pointer': props.sort && column.key},
            {'resizeable relative': props.resize},
            {'bg-white': props.scrollable && !props.dark},
            {'pr-6': props.resize}
        ]"
        ref="thRef"
        class="whitespace-nowrap pl-2 py-1"
        :data-th="props.column.uid"
        :style="{
            ...(props.column.useExplicitWidth) && {
                width: props.column.width + 'px'
            }
        }"
    >
        <!-- Sorting handler -->
        <HeaderSorter v-if="props.sort && props.column.sort" :dark="props.dark" :column="column" />

        <!-- Non-sorting caption -->
        <span v-else class="select-none relative">
            {{ column.caption }}
        </span>

        <!-- Resizing -->
        <HeaderResizer v-if="props.resize && !props.isLast"
            :index="props.index"
            :column="props.column"
        />
        
    </th>
</template>
<style scoped>
.resizable:not(:last-child):after {
    @apply content-[''] absolute block w-[2px] h-full bg-neutral-300 right-0 top-0
}
</style>
