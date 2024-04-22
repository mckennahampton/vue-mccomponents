<script setup lang="ts">
import { ref, computed } from 'vue'
import Checkbox from '../../lib/Inputs/Checkbox.vue'

const props = defineProps<{
    dark: boolean,
}>()

const simpleModel = ref(false)
const tooltippedModel = ref(false)
const preCheckedModel = ref(true)
const requiredModel = ref(false)
const optionalModel = ref(false)

</script>
<template>
    <div class="w-full flex flex-col gap-4">
        <h2 class="text-2xl">Checkboxes</h2>
        <div class="w-full flex items-start gap-10">

            <!-- Simple -->
            <div class="flex flex-col gap-5">
                <Checkbox
                    v-model="simpleModel"
                    :dark="props.dark"
                >
                    <template #label>Simple Checkbox</template>
                </Checkbox>
                {{ simpleModel }}
            </div>

            <!-- Tooltipped Model -->
            <div class="flex flex-col gap-5">
                <Checkbox
                    v-model="tooltippedModel"
                    :dark="props.dark"
                >
                    <template #label>
                        Tooltipped
                    </template>
                    <template #tooltipHeader>
                        Hello there
                    </template>
                    <template #tooltip>
                        General Kenobi
                    </template>
                </Checkbox>
                {{ tooltippedModel }}
            </div>

            <!-- Pre Checked Model -->
            <div class="flex flex-col gap-5">
                <Checkbox
                    v-model="preCheckedModel"
                    :dark="props.dark"
                >
                    <template #label>
                        Pre-checked
                    </template>
                </Checkbox>
                {{ preCheckedModel }}
            </div>

            <!-- Required Model -->
            <div class="flex flex-col gap-5">
                <Checkbox
                    v-model="requiredModel"
                    label="Required"
                    :dark="props.dark"
                    :validation-state="{
                        errors: [
                            ... !Boolean(requiredModel) ? ['Required'] : []
                        ]
                    }"
                >
                    <template #label>
                        Required
                    </template>
                </Checkbox>
                {{ requiredModel }}
            </div>

            <!-- Optional -->
            <div class="flex flex-col gap-5">
                <Checkbox
                    v-model="optionalModel"
                    :dark="props.dark"
                    optional
                >
                    <template #label>
                        Optional
                    </template>
                </Checkbox>
                {{ optionalModel }}
            </div>

        </div>
    </div>
</template>