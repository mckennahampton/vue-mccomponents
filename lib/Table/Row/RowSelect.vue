<script setup lang="ts">
import { inject } from 'vue'
import FarCircleCheck from '../../Icons/FarCircleCheck.vue'
import FasCircleCheck from '../../Icons/FasCircleCheck.vue'
import PrimaryButton from '../../Buttons/PrimaryButton.vue'

interface Props {
    item: any
}
const props = defineProps<Props>()

const toggleSelectItem = inject('toggleSelectItem') as (payload: MouseEvent) => void
const itemIsSelected = inject('itemIsSelected') as Function

</script>
<template>

    <td
        @click="toggleSelectItem"
        class="selectButton hover:cursor-pointer text-black text-center !px-1 print:invisible"
        data-td-select
    >
        <PrimaryButton class="w-full hidden md:block" :class="[{'bg-neutral-500': itemIsSelected(props.item)}]">
            {{ itemIsSelected(props.item) ? 'Unselect' : 'Select' }}
        </PrimaryButton>
        <FasCircleCheck v-if="itemIsSelected(props.item)" class="mx-2 block md:hidden"/>
        <FarCircleCheck v-else class="mx-2 block md:hidden"/>

    </td>

</template>