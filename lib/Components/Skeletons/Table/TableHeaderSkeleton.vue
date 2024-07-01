<script setup lang="ts">

interface Props {
    cols: number
}
const props = defineProps<Props>()

</script>
<template>
    <thead>
        <th v-for="index in props.cols">
            <div v-if="index" class="bg-gray-300 px-3 py-3 my-2"></div>
        </th>
    </thead>
</template>