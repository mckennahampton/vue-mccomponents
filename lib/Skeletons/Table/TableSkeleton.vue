<script setup lang="ts">
import TableRowSkeleton from './TableRowSkeleton.vue'
import TableHeaderSkeleton from './TableHeaderSkeleton.vue'

interface Props {
    cols?: number
}
const props = withDefaults(defineProps<Props>(), {
    cols: 8
})

</script>
<template>
    <table class="w-full animate-pulse">
        <TableHeaderSkeleton :cols="props.cols" />
        <tbody>
            <TableRowSkeleton v-for="index in 10" :cols="props.cols"/>
        </tbody>
    </table>
</template>