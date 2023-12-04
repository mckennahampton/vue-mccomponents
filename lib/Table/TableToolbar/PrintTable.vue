<script setup lang="ts">
import { inject } from 'vue'
import FasPrint from '../../Icons/FasPrint.vue'
import MutedButton from '../../Buttons/MutedButton.vue'

const props = defineProps<{
    dark: boolean,
}>()

const printPage = () => {
    window.print()
}

</script>
<template>
    <MutedButton
        @click="printPage"
        :class="[props.dark ? 'hover:bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-black']"
        class="flex items-center justify-center"
    >
        <FasPrint class="fill-neutral-500 mr-2 text-xl" />
        Print
    </MutedButton>
</template>