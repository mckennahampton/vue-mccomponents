<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
    inputInitialValue?: string | number
    modelValue: string | number | object | null
}
const props = defineProps<Props>()

const emit = defineEmits(["update:modelValue"]);

const input = ref(null)
const inputValue = ref(props.modelValue ?? null)

const emptyClass = computed(() => {
    return inputValue.value ? 'not-empty' : 'empty'
})
watch(inputValue, () => {
    emit('update:modelValue', inputValue.value)
})


watch(props, () => {
    props.modelValue
    ? inputValue.value = props.modelValue
    : inputValue.value = null
})

</script>

<template>
    <input
        ref="input"
        :class="emptyClass"
        class="w-full h-10 border-b-2 border-neutral-400 focus:outline-none focus:border-red-500  bg-transparent"
        v-model="inputValue"
    />
</template>