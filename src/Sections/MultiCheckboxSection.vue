<script setup lang="ts">
import { ref, computed } from 'vue'
import MultiCheckbox from '../../lib/Inputs/MultiCheckbox.vue'

const props = defineProps<{
    dark: boolean,
}>()

const baseItems = [
    {
        value: 1,
        title: 'Item 1',
    },
    {
        value: 2,
        title: 'Item 2',
    },
    {
        value: 3
    }
]

const simpleModel = ref([])
const preSelectedModel = ref([2, 3])
const verticalModel = ref([])
const tooltippedModel = ref([])
const requiredModel = ref([])
const optionalModel = ref([])
const errorsModel = ref([])
const validations = computed(() => [
    {
        message: 'Required',
        errored: errorsModel.value.length == 0
    },
    {
        message: 'Cannot select more than 2',
        errored: errorsModel.value.length > 2,
    },
    {
        message: 'Cannot select 1 & 3 together',
        errored: Boolean(errorsModel.value.find(item => item == 3) && errorsModel.value.find(item => item == 1))
    },
])

</script>
<template>
    <div class="w-full flex flex-col gap-4">
        <h2 class="text-2xl">Multi-Checkboxes</h2>

        <div class="w-full flex items-start gap-10">

            <!-- Simple -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="simpleModel"
                    label="Simple Multi-Checkbox"
                    :dark="props.dark"
                />
                {{ simpleModel }}
            </div>

            <!-- Pre-selected -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="preSelectedModel"
                    label="Pre-selected"
                    :dark="props.dark"
                />
                {{ preSelectedModel }}
            </div>

            <!-- Vertical -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="verticalModel"
                    label="Vertical"
                    :dark="props.dark"
                    vertical
                />
                {{ verticalModel }}
            </div>

            <!-- Tooltipped -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="tooltippedModel"
                    label="Tooltipped"
                    :dark="props.dark"
                >
                    <template #tooltipHeader>
                        Hello There
                    </template>
                    <template #tooltip>
                        General Kenobi
                    </template>
                </MultiCheckbox>
                {{ tooltippedModel }}
            </div>

            <!-- Required -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="requiredModel"
                    label="Required"
                    :dark="props.dark"
                    :validations="[
                        {
                            message: 'Required',
                            errored: requiredModel.length == 0
                        }
                    ]"
                />
                {{ requiredModel }}
            </div>

            <!-- Errors -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="errorsModel" 
                    label="With Errors"
                    :dark="props.dark"
                    :validations="validations"
                />
                {{ errorsModel }}
            </div>

            <!-- Optional -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="optionalModel" 
                    label="Optional"
                    :dark="props.dark"
                    optional
                />
                {{ optionalModel }}
            </div>

        </div>
    </div>

</template>