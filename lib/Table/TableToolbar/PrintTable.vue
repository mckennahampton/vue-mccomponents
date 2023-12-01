<script setup lang="ts">
import { inject } from 'vue'
import FasPrint from '../../Icons/FasPrint.vue'
import MutedButton from '../../Buttons/MutedButton.vue'

const printPage = () => {
    window.print()
}

const dark = inject('dark') as boolean

</script>
<template>
    <MutedButton
        @click="printPage"
        :class="[dark ? 'hover:bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-black']"
        class="flex items-center justify-center"
    >
        <FasPrint class="fill-neutral-500 mr-2 text-xl" />
        Print
    </MutedButton>
</template>