<script setup lang="ts">
import RowSelect from './RowSelect.vue'
import Tooltip from '../../Tooltip.vue'
import { type Header } from '../Header/HeaderElements.vue'
import { inject, ref, onMounted, onUpdated, ComputedRef } from 'vue'
import TransitionListPage from './Transitions/TransitionListPage.vue'
import EmptyItemsRow from './EmptyItemsRow.vue'

interface Props {
    items: any[],
    headers: Header[],
    rowClasses?: string | object | any[]
}
const props = defineProps<Props>()

const selectable = inject('selectable') as boolean
const currentPage = inject('currentPage') as ComputedRef
const toggleSelectItem = inject('toggleSelectItem') as Function
const itemIsSelected = inject('itemIsSelected') as Function
const dark = inject('dark') as boolean
const tableUid = inject('tableUid') as string
const pageStepDirection = inject('pageStepDirection') as ComputedRef<'forwards' | 'backwards'>
const rowsPerPage = inject('rowsPerPage') as ComputedRef<number>

//#region Mobile Styling

    // Adds header prefix to each td element for mobile use (used in the <style> tag below)
    const rowRefs = ref([] as HTMLElement[])
    const setMobileHeaderPrefixes = () => {
        rowRefs.value.forEach(row => {
            const tds = row.querySelectorAll('td')
            const loopLength = selectable ? (tds.length - 1) : tds.length
            for (var i = 0; i < loopLength; i++) {
                tds[i].setAttribute('header', props.headers[i].caption)
            }
        })
    }

    onMounted(() => {
        setMobileHeaderPrefixes()
    })
    onUpdated(() => {
        setMobileHeaderPrefixes()
    })
    
//#endregion

</script>
<template>
    <TransitionListPage :direction="pageStepDirection" :page-key="currentPage + (props.items.length > 0 ? 1 : 0) + rowsPerPage" :items-length="props.items.length">
        <tr v-if="props.items.length > 0" v-for="item in props.items"
            :class="[
                {'even:!bg-cyan-200 odd:!bg-cyan-300 !bg-opacity-100': selectable && itemIsSelected(item) && !dark},
                {'odd:!bg-cyan-800 even:!bg-cyan-900': selectable && itemIsSelected(item) && dark},
                {'[&>*]:disabled': item.disabled},
                dark ? 'odd:bg-white odd:bg-opacity-5' : 'odd:bg-black odd:bg-opacity-5',
                props.rowClasses
            ]"
            class="relative"
            @dblclick="item.disabled ? null : toggleSelectItem(item)"
            ref="rowRefs"
            :key="item[tableUid + '_uid']"
        >

            <!-- Main row content -->
            <slot name="rows" :item="item" />
                
            <!-- Select button -->
            <RowSelect v-if="selectable" :item="item" />

            <!-- Overlay for disabled items -->
            <Tooltip v-if="item.disabled"
                :body="item.tooltipBody ?? 'Item is disabled'"
                position="center"
                manual-ref
            >
                <template v-slot="{setRef}">
                    <span class="!absolute w-full h-full left-0 top-0" :ref="r=>setRef(r)"></span>
                </template>
            </Tooltip>
        </tr>
        <EmptyItemsRow v-else :colspan="(selectable) ? props.headers.length + 1 : props.headers.length" />
    </TransitionListPage>
</template>
<style scoped>
tr :deep(td), table :deep(.header-prefix) {
    @apply py-1 pl-2 text-sm
}

.disabled {
    @apply relative
}

.disabled:after {
    @apply absolute content-[''] top-0 left-0 h-full w-full transition-all bg-white opacity-50 hover:cursor-not-allowed
}
</style>
