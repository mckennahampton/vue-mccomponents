<script setup lang="ts">
import { ref } from 'vue'
import HeaderSorter from './HeaderSorter.vue'
import HeaderResizer from './HeaderResizer.vue'

export interface Header {
    caption: string,
    sort?: string,
    filter?: string,
    classes?: string | any[] | object
}

interface Props {
    resize: boolean,
    selectable: boolean,
    classes?: string | object | any[]
    scrollable: boolean,
    headers: Header[],
    sort: boolean,
}
const props = defineProps<Props>()

const ths = ref([])

const isNotSelectHeader = (index: number) => {
    return props.selectable ? true : (index + 1) < props.headers.length
}

</script>
<template>
    <th v-for="(header, index) in props.headers"
        :class="[
            header.classes,
            {'hover:cursor-pointer': props.sort && header.sort},
            {'resizeable relative': props.resize},
            {'bg-white': props.scrollable},
            {'pr-6': props.resize && isNotSelectHeader(index)}
        ]"
        ref="ths"
        class="whitespace-nowrap pl-2 py-1"
    >


        <!-- Sorting handler -->
        <HeaderSorter v-if="props.sort && header.sort" :header="header" />

        <!-- Non-sorting caption -->
        <span v-else class="select-none relative">
            {{ header.caption }}
        </span>

        <!-- Resizing -->
        <HeaderResizer v-if="props.resize && isNotSelectHeader(index)"
            :index="index"
            :ths="ths"
        />
        
    </th>
</template>
<style scoped>
.resizable:not(:last-child):after {
    @apply content-[''] absolute block w-[2px] h-full bg-neutral-300 right-0 top-0
}
</style>