<script setup lang="ts">
import FasPrint from '../../Icons/FasPrint.vue'
import MutedButton from '../../Buttons/MutedButton.vue'

const printPage = () => {
    window.print()
}

</script>
<template>
    <MutedButton @click="printPage" class="flex items-center justify-center hover:bg-neutral-100">
        <FasPrint class="text-neutral-500 mr-2 text-xl" />
        Print
    </MutedButton>
</template>