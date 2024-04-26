<script setup lang="ts" generic="T">
import Cell from './Cell.vue'
import uid from '../../Utilities/uid'
import RowSelect from './RowSelect.vue'
import Tooltip from '../../Misc/Tooltip.vue'
import { useElementSize } from '@vueuse/core'
import RowActionButtons from './RowActionButtons.vue'
import { inject, ref, type ComputedRef, watch } from 'vue'
import { type InternalColumn, type ItemWithUid, RowActionButtonConfig, type SelectState } from '../TableTypes'

interface Props<T> {
    item: ItemWithUid<T>,
    index: number,
    rowClasses?: string | object | any[],
    selectable: boolean,
    columns: InternalColumn[],
    itemCount: number,
    rowHeight?: number,
    dark: boolean,
    scroll: boolean,
    rowActionButtonConfig?: RowActionButtonConfig
}
const props = defineProps<Props<T>>()

const selectable = inject('selectable') as boolean
const toggleSelectItem = inject('toggleSelectItem') as Function
const tableUid = inject('tableUid') as string
const selectState = inject('selectState') as SelectState
const updateRowHeight = inject('updateRowHeight') as Function

const tableRowRef = ref(null) as ComputedRef<HTMLElement | null>
const rowUid = uid()
const { height: rowHeight } = useElementSize(tableRowRef)
watch(rowHeight, ()=> {
    if (rowHeight.value) updateRowHeight(rowHeight.value + (window.screen.width >= 768 ? 0 : 10))
})

</script>
<template>
    <component :is="props.scroll ? 'div' : 'tr'"
        class="relative py-4 md:py-0 max-md:flex max-md:flex-wrap items-stretch justify-stretch w-full max-w-[500px] md:max-w-none !bg-opacity-50"
        :class="[
            {'!bg-cyan-300': selectable && selectState[props.item[`${tableUid}_uid`]] && index % 2 == 0 && !props.dark /* Even (Selected) */},
            {'!bg-cyan-800': selectable && selectState[props.item[tableUid + '_uid']] && index % 2 == 0 && props.dark /* Even (Selected, Dark) */},
            {'!bg-cyan-500': selectable && selectState[props.item[tableUid + '_uid']] && index % 2 != 0 && !props.dark /* Odd (Selected) */},
            {'!bg-cyan-600': selectable && selectState[props.item[tableUid + '_uid']] && index % 2 != 0 && props.dark /* Odd (Selected), Dark */},
            {'bg-neutral-300': index % 2 != 0 && !props.dark /* Odd */},
            {'bg-neutral-900': index % 2 != 0 && props.dark /* Odd, Dark */},
            {'[&>*]:disabled': props.item.disabled},
            {'w-full md:!flex md:items-center': props.scroll},
            {'md:!table-row print:!table-row': !props.scroll},
            props.rowClasses
        ]"
        @dblclick="props.item.disabled ? null : toggleSelectItem(item)"
        ref="tableRowRef"
        :data-row="rowUid"
        :style="{
            ...(props.rowHeight) && {
                height: props.rowHeight + 'px'
            }
        }"
    >
        <!-- Main row content -->
        <template v-for="column in props.columns">
            <Cell v-if="column.key != 'table_select' && column.key != 'table_row_action_buttons'"
                :column="column"
                :item="item"
                :item-count="props.itemCount"
                :row-height="props.rowHeight"
                :dark="props.dark"
                :index="props.index"
                :is-selected="selectable && selectState[props.item[tableUid + '_uid']]"
                :scroll="props.scroll"
            >
                <template #[column.cellSlotName]="{item}" >
                    <slot
                        :name="column.cellSlotName"
                        :item="item"
                    />
                </template>
            </Cell>
        </template>

            <!-- Action Dropdown -->
            <RowActionButtons v-if="props.columns.find(column => column.key == 'table_row_action_buttons')"
                :item="props.item"
                :scroll="props.scroll"
                :row-action-button-config="props.rowActionButtonConfig"
            >
                <template #cell(row_action_buttons)="{item}" >
                    <slot
                        name="cell(row_action_buttons)"
                        :item="item"
                    />
                </template>
            </RowActionButtons>
            
        <!-- Select button -->
        <RowSelect v-if="selectable"
            :item="props.item"
            :item-count="itemCount"
            :dark="props.dark"
            :scroll="props.scroll"
        />

        <!-- Overlay for disabled items -->
        <Tooltip v-if="props.item.disabled"
            class="!absolute w-full h-full left-0 top-0"
            position="center"
        >
            <template #tooltip>{{ props.item.tooltipBody ?? 'Item is disabled' }}</template>
        </Tooltip>

    </component>
    
</template>
<style scoped>
</style>