<script setup lang="ts">
import { ref, computed, inject, ComputedRef } from 'vue'
import DropdownItem from '../../Buttons/DropdownItem.vue'
import DropdownButton from '../../Buttons/DropdownButton.vue'
import { type LengthAwarePaginator } from '../../Types/Laravel/LengthAwarePaginator'

export interface RowsPerPageOption {
    caption: string,
    value: number,
    current: boolean,
}

interface Props {
    externalPagination: false | LengthAwarePaginator,
    dark: boolean,
}
const props = defineProps<Props>()
const emit = defineEmits([
    'update:rowsPerPage',
])

const updateRowsPerPage = inject('updateRowsPerPage') as Function
const totalItemsLength = inject('totalItemsLength') as ComputedRef
const navigateTo = inject('navigateTo') as Function

const rowsPerPageOptions = ref([
    { caption: '10', value: 10, current: true },
    { caption: '20', value: 20, current: false },
    { caption: '50', value: 50, current: false },
    ...(props.externalPagination == false ? [
        { caption: 'All', value: 0, current: false }
    ] : [])
] as RowsPerPageOption[])

const currentRowsPerPage = computed(() => {
    return rowsPerPageOptions.value.find(option => option.current == true)
})

const updated = (length: number) => {
    length == 0
    ? updateRowsPerPage(totalItemsLength.value)
    : updateRowsPerPage(length)
    rowsPerPageOptions.value.forEach((option) => {
        option.value == length
        ? option.current = true
        : option.current = false;
    })
    if (props.externalPagination) {
        navigateTo(1)
    }
}

</script>
<template>
    <DropdownButton
        :dark="props.dark"
        :placement="'bottom'"
        show-icon
        :button-classes="[`${props.dark ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100'} !px-2 whitespace-nowrap !font-normal !px-0`]"
        :dropdown-classes="'whitespace-nowrap w-full border-x-2 border-y-2 border-neutral-300'"
    >
        <template #button>
            {{ currentRowsPerPage?.caption }} Rows Per Page
        </template>
        <template #dropdown>
            <DropdownItem v-for="item in rowsPerPageOptions" @click="updated(item.value)" :class="{'font-bold': item.current}" :dark="props.dark">
                {{ item.caption }}
                {{ item.current ? ' (current)' : '' }}
            </DropdownItem>
        </template>
    </DropdownButton>
</template>