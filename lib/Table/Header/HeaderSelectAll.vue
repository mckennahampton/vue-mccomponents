<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { type InternalColumn } from '../Table.vue'
import FarCircleCheck from '../../Icons/FarCircleCheck.vue'
import FasCircleCheck from '../../Icons/FasCircleCheck.vue'
import { inject, type ComputedRef, ref, onMounted } from 'vue'


interface Props {
    pageItems: any[],
    dark: boolean,
    column: InternalColumn,
    scroll: boolean
}
const props = defineProps<Props>()

const toggleSelectAll = inject('toggleSelectAll') as (payload: MouseEvent) => void
const allSelected = inject('allSelected') as ComputedRef

const updateInnerColumnThSize = inject('updateInnerColumnThSize') as Function

const thRef = ref(null)
const { width } = useElementSize(thRef)

onMounted(() => updateInnerColumnThSize(props.column.uid, width.value))

</script>
<template>
    <th
        @click.stop="toggleSelectAll"
        class="hover:cursor-pointer text-center !px-1 print:invisible !w-[60px]"
        data-th-select
        ref="thRef"
    >
        <span class="flex items-center justify-center">
            <FasCircleCheck v-if="props.pageItems.length > 0 && allSelected"
                class="mx-2"
                :class="[dark ? 'fill-white' : 'fill-black']"
            />
            <FarCircleCheck v-else
                class="mx-2"
                :class="[dark ? 'fill-neutral-500' : 'fill-black']"
            />
        </span>

    </th>
</template>