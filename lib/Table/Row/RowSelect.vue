<script setup lang="ts">
import { inject } from 'vue'
import { type SelectState } from '../Table.vue'
import FarCircleCheck from '../../Icons/FarCircleCheck.vue'
import FasCircleCheck from '../../Icons/FasCircleCheck.vue'
import PrimaryButton from '../../Buttons/PrimaryButton.vue'

interface Props {
    item: any,
    itemCount: number,
    dark: boolean,
}
const props = defineProps<Props>()

const toggleSelectItem = inject('toggleSelectItem') as (payload: MouseEvent) => void
const selectState = inject('selectState') as SelectState
const tableUid = inject('tableUid') as string

</script>
<template>

    <component :is="props.itemCount > 50 ? 'div' : 'td'"
        @click="toggleSelectItem(props.item)"
        class="selectButton hover:cursor-pointer text-black text-center !px-1 print:invisible"
        :class="[
            {'md:!block md:relative print:block w-[50px] text-sm': itemCount > 50},
            {'md:table-cell print:table-cell': itemCount <= 50},
        ]"
        data-select
    >
        <!-- Mobile -->
        <!-- @vue-ignore -->
        <PrimaryButton
            class="w-full block md:hidden"
            :class="[{'bg-neutral-500': selectState[item[tableUid + '_uid']]}]"
        >
            {{ //@ts-ignore
                selectState[item[tableUid + '_uid']] ? 'Unselect' : 'Select'
            }}
        </PrimaryButton>

        <!-- Desktop -->
        <div class="hidden md:flex items-center justify-center">
            <FasCircleCheck v-if="selectState[item[tableUid + '_uid']]"
                :class="[dark ? 'fill-white' : 'fill-black']"
            />
            <FarCircleCheck v-else
                :class="[dark ? 'fill-neutral-500' : 'fill-black']"
            />
        </div>

    </component>

</template>
<style scoped>
[data-select] {
    @apply

    /* Mobile */
    flex max-md:w-full text-sm p-0

    /* Desktop */
    md:py-1 md:pl-2 md:!w-[60px] md:max-w-[60px] md:min-w-[60px]
    print:w-auto print:py-1 print:pl-2

}
</style>