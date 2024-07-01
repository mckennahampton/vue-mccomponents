<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(defineProps<{
    to: string,
    interval?: number,
    timeoutMs?: number,
    disabled?: boolean,
}>(), {
    interval: 100,
    disabled: false,
})

const targetExists = ref(false)
const realizedTarget = computed(() => targetExists.value ? props.to : 'body')

async function targetMounted(target: string): Promise<boolean>
{

    return new Promise(function(resolve, reject) {
        var startTime = new Date().getTime()
        var checker = setInterval(function () {
            if (document.querySelector(target)) {
                clearInterval(checker)
                resolve(true)
            }
            if (props.timeoutMs && new Date().getTime() - startTime > props.timeoutMs)
            {
                clearInterval(checker)
                reject(`Safe Teleport timeout reached; target with selector "${props.to}" not found. Content remaining teleported to <body>.`)
            }
        }, props.interval)
    })
}

onMounted(async () => {
    await targetMounted(props.to)
    .then(() => targetExists.value = true)
    .catch(err => console.log(err))
})

</script>
<template>
    <Teleport
        :to="realizedTarget"
        :disabled="props.disabled"
    >
        <slot />
    </Teleport>
</template>