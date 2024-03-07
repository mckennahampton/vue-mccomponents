<script setup lang="ts">
import { ref, watch} from 'vue'
import uid from '../Utilities/uid'

interface Props {
    modelValue: boolean,
    name?: string,
    label?: string,
    showValidated?: boolean,
    labelStyles?: any,
}
const props = withDefaults(defineProps<Props>(), {
    showValidated: false,
})
const emit = defineEmits(['update:modelValue'])

const inputUid = uid()

const checked = ref(props.modelValue)
watch(checked, () => {
    emit('update:modelValue', checked.value)
})

</script>
<template>
    <div class="flex items-center justify-start gap-4">
        <span class="flex items-center justify-center gap-1">
            <input
                type="checkbox"
                v-model="checked"
                :id="inputUid"
                class="cursor-pointer w-4 h-4  bg-gray-100 border-gray-300 focus:ring-2"
                :name="props.name"
            />
            <label checkbox-label :for="inputUid" class="!cursor-pointer select-none" :class="props.labelStyles">{{ props.label }}</label>
        </span>
    </div>
</template>