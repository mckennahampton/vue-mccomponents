<script setup lang="ts">
import RowSelect from './RowSelect.vue'
import Tooltip from '../../Tooltip.vue'
import { type InternalColumn, type SelectState } from '../Table.vue'
import { inject, ref, type ComputedRef, onMounted } from 'vue'
import Cell from './Cell.vue'

interface Props {
    item: any,
    index: number,
    rowClasses?: string | object | any[],
    selectable: boolean,
    columns: InternalColumn[],
    itemCount: number,
    rowHeight?: number,
    dark: boolean,
}
const props = defineProps<Props>()

const selectable = inject('selectable') as boolean
const toggleSelectItem = inject('toggleSelectItem') as Function
const tableUid = inject('tableUid') as string
const selectState = inject('selectState') as SelectState
const updateRowHeight = inject('updateRowHeight') as Function

const tableRowRef = ref(null) as ComputedRef<HTMLElement | null>

onMounted(() => updateRowHeight(tableRowRef.value?.offsetHeight))
</script>
<template>
        <component :is="itemCount > 50 ? 'div' : 'tr'"
            class="max-sm:h-[10px] relative py-4 md:py-0 max-md:flex max-md:flex-wrap items-stretch justify-stretch w-full max-w-[500px] md:max-w-none !bg-opacity-50"
            :class="[
                {'!bg-cyan-300': selectable && selectState[item[tableUid + '_uid']] && index % 2 == 0 && !props.dark /* Even (Selected) */},
                {'!bg-cyan-800': selectable && selectState[item[tableUid + '_uid']] && index % 2 == 0 && props.dark /* Even (Selected, Dark) */},
                {'!bg-cyan-500': selectable && selectState[item[tableUid + '_uid']] && index % 2 != 0 && !props.dark /* Odd (Selected) */},
                {'!bg-cyan-600': selectable && selectState[item[tableUid + '_uid']] && index % 2 != 0 && props.dark /* Odd (Selected), Dark */},
                {'bg-neutral-300': index % 2 != 0 && !props.dark /* Odd */},
                {'bg-neutral-900': index % 2 != 0 && props.dark /* Odd, Dark */},
                {'[&>*]:disabled': item.disabled},
                {'w-full md:!flex md:items-center': itemCount > 50},
                {'md:!table-row print:!table-row': itemCount <= 50},
                props.rowClasses
            ]"
            @dblclick="item.disabled ? null : toggleSelectItem(item)"
            ref="tableRowRef"
            data-row
            :style="{
                ...(props.rowHeight) && {
                    height: props.rowHeight + 'px'
                }
            }"
        >
            <!-- Main row content -->
            <template v-for="column in props.columns">
                <template v-if="column.caption != 'table_select'">
                    <Cell :column="column" :item="item" :item-count="props.itemCount" :row-height="props.rowHeight">
                        <template #[column.slotName]="{item}" >
                            <slot
                                :name="column.slotName"
                                :item="item"
                            />
                        </template>
                    </Cell>
                </template>
            </template>

                
            <!-- Select button -->
            <RowSelect v-if="selectable" :item="item" :item-count="itemCount" :dark="props.dark" />

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

        </component>
    
</template>
<style scoped>
</style>