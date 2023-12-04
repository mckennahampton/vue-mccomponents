<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import FarCircleCheck from '../../Icons/FarCircleCheck.vue'
import FasCircleCheck from '../../Icons/FasCircleCheck.vue'

interface Props {
    pageItems: any[],
}
const props = defineProps<Props>()

const dark = inject('dark') as boolean

const toggleSelectAll = inject('toggleSelectAll') as (payload: MouseEvent) => void
const allSelected = inject('allSelected') as ComputedRef

</script>
<template>
    <th
        @click.stop="toggleSelectAll"
        class="hover:cursor-pointer text-center !px-1 print:invisible w-[60px]"
        data-th-select
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