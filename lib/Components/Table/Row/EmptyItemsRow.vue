<script setup lang="ts">
interface Props {
    colspan: number,
}
const props = defineProps<Props>()
</script>
<template>
    <tr>
        <td :colspan="props.colspan">
            <span class="italic opacity-50 w-full text-center min-h-[60px] flex items-center justify-center">No items</span>
        </td>
    </tr>
</template>