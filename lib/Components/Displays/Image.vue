<script setup lang="ts">
import Tooltip from '../Misc/Tooltip.vue'
import { onBeforeMount, ref } from 'vue'
import { loadImagePreview } from '../Utilities/imageHelpers'

interface Props {
    src?: string,
    preview?: Blob | File
    showTooltip?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    showTooltip: false
})

const src = ref()

onBeforeMount(async () => {
    if (props.src) src.value = props.src
    if (props.preview) src.value = await loadImagePreview(props.preview)
    return ''
})

</script>
<template>
    <Tooltip :disable="!props.showTooltip" :body="src" body-is-img-src :position="'bottom'">
        <img v-bind="$attrs" :src="src" class="w-full h-auto"/>
    </Tooltip>
</template>