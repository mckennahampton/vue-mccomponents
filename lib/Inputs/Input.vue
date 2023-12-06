<script setup lang="ts">
import uid from '../Utilities/uid'
import { ref, watch, computed } from 'vue'

const props = withDefaults(defineProps<{
    inputInitialValue?: string | number,
    modelValue?: string | number | object,
    label?: string,
    labelStyles?: any,
    dark?: boolean,
}>(), {
    dark: false
})


const emit = defineEmits(["update:modelValue"]);

const input = ref(null)
const inputValue = ref(props.modelValue ?? null)
const inputUid = uid()

const emptyClass = computed(() => {
    return inputValue.value ? 'not-empty' : 'empty'
})

watch(inputValue, () => {
    emit('update:modelValue', inputValue.value)
})


watch(props, () => {
    if(props.modelValue) {
        inputValue.value = props.modelValue
    }
    else {
        inputValue.value = null
    }
})

defineExpose({
    input
})

</script>
<template>
    <label v-if="props.label"
        class="absolute left-0 top-[50%] transition-all delay-100 transform -translate-y-[50%] z-[2] hover:cursor-text font-bold text-gray-600 text-sm"
        :for="inputUid"
    >
        {{ props.label }}
    </label>
    <input
        v-bind="$attrs"
        ref="input"
        style="box-shadow: none;"
        class="w-full h-10 border-b-2 bg-transparent focus:border-red-500"
        :class="[
            emptyClass,
            props.dark ? 'text-white !border-b-neutral-700' : 'text-black !border-b-neutral-400'
        ]"
        v-model="inputValue"
        :id="inputUid"
    />
</template>
<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Read-only */ input[readonly] { @apply pointer-events-none text-center !text-black }


/* Floating label styles */
label:has(~ input:focus),
label:has(~ input:placeholder-shown),
label:has(~ input.not-empty)
{
    @apply transform -translate-y-10 text-black left-0 delay-0 
}

</style>