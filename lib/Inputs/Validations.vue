<script setup lang="ts">
import { computed } from 'vue'
import Tooltip from '../Tooltip.vue'
import FasXMark from '../Icons/FasXMark.vue'
import FasFaCheck from '../Icons/FasFaCheck.vue'
import FasCircleExclamation from '../Icons/FasCircleExclamation.vue'

export interface Validation {
    message: string,
    errored: boolean,
}

const props = withDefaults(defineProps<{
    validations: Validation[],
    dark?: boolean,
}>(),
{
    dark: false,
})

const activeErrors = computed(() => props.validations.filter(validation => validation.errored))
const resolvedErrors = computed(() => props.validations.filter(validation => !validation.errored))

</script>
<template>
    <Tooltip
        :dark="props.dark"
        class="flex items-center gap-1 rounded-full px-[6px] h-[22px] text-white hover:cursor-default"
        :class="[
            {'bg-red-500': activeErrors.length > 0},
            {'bg-green-500': activeErrors.length == 0}
        ]"
    >
        <template #tooltip>
            <div class="flex flex-col items-start gap-5">
                <div v-if="resolvedErrors.length > 0" class="flex flex-col items-start">
                    <div v-for="validation in resolvedErrors"
                        class="flex items-center gap-3" 
                    >
                        <FasFaCheck class="fill-green-500 w-[10px]" />
                        <span class="text-neutral-500 italic">
                            {{ validation.message }}
                        </span>
                    </div>
                </div>
                <div v-if="activeErrors.length > 0" class="flex flex-col items-start">
                    <div v-for="validation in activeErrors"
                        class="flex items-center gap-3" 
                    >
                        <FasXMark class="fill-red-500 w-[10px]" />
                        <span>{{ validation.message }}</span>
                    </div>
                </div>
            </div>
        </template>
        <template v-if="activeErrors.length > 0">
            <FasCircleExclamation class="fill-white w-[15px]"/>
            {{ activeErrors.length }}
        </template>
        <FasFaCheck v-else class="fill-white w-[10px]" />

    </Tooltip>

</template>