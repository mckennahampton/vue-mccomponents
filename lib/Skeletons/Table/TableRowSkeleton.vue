<script setup lang="ts">

interface Props {
    cols: number,
}
const props = defineProps<Props>()

</script>
<template>
    <tr class="animate-pulse">
        <td v-for="index in props.cols">
            <div class="bg-gray-300 px-3 py-2 my-2"></div>
        </td>
    </tr>
</template>