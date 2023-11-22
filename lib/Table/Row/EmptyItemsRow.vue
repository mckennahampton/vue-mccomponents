<script setup lang="ts">
interface Props {
    colspan: number,
}
const props = defineProps<Props>()
</script>
<template>
    <tr>
        <td :colspan="props.colspan">
            <span class="italic opacity-50 block w-full text-center">No items</span>
        </td>
    </tr>
</template>