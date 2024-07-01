<script setup lang="ts">
import { useSlots } from 'vue'
import Spinner from '../Spinners/Spinner.vue'

interface Props {
    progression: number,
    task?: string,
    showPercent?: boolean
    showSpinner?: boolean
}
const props = defineProps<Props>()

const slots = useSlots()

</script>
<template>
    <div class="relative w-full">

        <!-- Task info-->
        <div v-if="props.task || props.showPercent || props.showSpinner" class="flex mb-2 items-center justify-between">
            <div class="flex items-center justify-start w-[90%]">
                <span v-if="props.task" class="text-xs font-semibold inline-block uppercase">
                    {{ props.task }}
                </span>
                <Spinner v-if="props.showSpinner" class="w-[15px] h-[15px] animate-spin-fast" />
            </div>
        </div>

        <div class="flex gap-1 items-start justify-center">
            <!-- Progress Bar -->
            <div class="w-full flex flex-col">
                <div class="relative overflow-hidden h-2 text-xs flex bg-red-200 w-full">
                    <div
                        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 transition-all"
                        :style="{ width: props.progression + '%' }"
                    ></div>
                </div>
                <div v-if="slots.progressionLabel"
                    class="w-full relative flex items-center justify-between"
                >
                    <span class="text-neutral-500 pr-3">
                        {{ props.progression }}%
                    </span>
                    <span>
                        <slot name="progressionLabel" />
                    </span>
                </div>
            </div>

            <div v-if="props.showPercent && !props.task && !slots.progressionLabel" class="text-xs font-semibold -mt-[5px]">
                {{ props.progression }}%
            </div>
        </div>

    </div>
</template>