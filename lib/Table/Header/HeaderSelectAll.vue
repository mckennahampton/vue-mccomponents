<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import FarCircleCheck from '../../Icons/FarCircleCheck.vue'
import FasCircleCheck from '../../Icons/FasCircleCheck.vue'

interface Props {
    pageItems: any[],
    tableSelectUid: string,
}
const props = defineProps<Props>()

const toggleSelectAll = inject('toggleSelectAll') as (payload: MouseEvent) => void
const allSelected = inject('allSelected') as ComputedRef

</script>
<template>
    <th
        @click.stop="toggleSelectAll"
        class="hover:cursor-pointer text-center !px-1 print:invisible"
        data-th-select
    >
        <FasCircleCheck v-if="pageItems.length > 0 && allSelected" class="mx-2"/>
        <FarCircleCheck v-else class="mx-2"/>
    </th>
</template>