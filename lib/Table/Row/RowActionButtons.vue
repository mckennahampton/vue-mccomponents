<script setup lang="ts" generic="T">
import { useSlots, ref } from 'vue'
import FasEllipsis from '../../Icons/FasEllipsis.vue'
import { deepValue } from '../../Utilities/objectHelpers'
import DropdownButton from '../../Buttons/DropdownButton.vue'
import { type RowActionButtonConfig, type ItemWithUid } from '../TableTypes'

interface Props<T> {
    item: ItemWithUid<T>,
    scroll: boolean,
    rowActionButtonConfig?: RowActionButtonConfig
}
const props = defineProps<Props<T>>()


const slots = useSlots()
const slotHasContent = ref(
    Boolean(!!slots['cell(row_action_buttons)'] &&
    slots['cell(row_action_buttons)']({item: props.item})[0].children?.length as number > 0)
)

</script>
<template>

    <component :is="props.scroll ? 'div' : 'td'"
        class="rowActionButton hover:cursor-pointer text-center text-black !px-1 print:invisible"
        :class="[
            {'md:!block md:relative print:block w-[50px] text-sm': props.scroll},
            {'md:table-cell print:table-cell': !props.scroll},
        ]"
        data-action-button
    >
        <DropdownButton
            :button-classes="[
                'transition-all !px-3 border border-transparent',
                {'hover:bg-neutral-200': slotHasContent},
            ]"
            open-button-classes="!border-neutral-400"
            :show-icon="false"
            :placement="deepValue('rowActionButtonConfig.placement', props) ?? 'left-top'"
            :allow-clipping="deepValue('rowActionButtonConfig.allowClipping', props) ?? false"
            :offset="deepValue('rowActionButtonConfig.offset', props) ?? 10"
            :disabled="!slotHasContent"
        >
            <template #button>
                <FasEllipsis />
            </template>
            <template #dropdown>
                <slot
                    name="cell(row_action_buttons)"
                    :item="item"
                />
            </template>
        </DropdownButton>
    </component>

</template>
<style scoped>
[data-action-button] {
    @apply

    /* Mobile */
    max-sm:flex max-md:w-full text-sm p-0

    /* Desktop */
    md:py-1 md:pl-2 md:!w-[50px] md:max-w-[50px] md:min-w-[50px]
    print:w-auto print:py-1 print:pl-2

}
</style>