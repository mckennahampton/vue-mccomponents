<script setup lang="ts">
import { ref, computed } from 'vue'
import Input from '../../lib/Inputs/Input.vue'

const props = defineProps<{
    dark: boolean,
}>()

const model = ref(null)
const placeholderModel = ref(null)
const tooltipModel = ref(null)
const requiredModel = ref(null)
const numberModel = ref(null)
const focusedModel = ref(null)
const searchModel = ref(null)

const withErrorsModel = ref('')

const validations = computed(() => ({
    errors: [
        ... !Boolean(requiredModel) ? ['Required'] : [],
        ... !withErrorsModel.value || withErrorsModel.value.length < 10 ? ['Must be at least ten characters'] : [],
        ... withErrorsModel.value?.length > 20 ? ['Cannot exceed twenty characters'] : [],
        ... withErrorsModel.value !== 'Only This Value' ? ['Must enter "Only This Value"'] : []
    ]
}))

</script>
<template>
    <div class="w-full flex flex-col gap-4">
        <h2 class="text-2xl">Inputs</h2>

        <div class="w-full flex items-start gap-10">

            <!-- Simple -->
            <div class="flex flex-col gap-5">
                <Input
                    v-model="model"
                    :dark="props.dark"
                >
                    <template #label>
                        Simple Input
                    </template>
                </Input>
                {{ model }}
            </div>

            <!-- Placeholder -->
            <div class="flex flex-col gap-5">
                <Input
                    v-model="placeholderModel"
                    :dark="props.dark"
                    placeholder="General Kenobi"
                >
                    <template #label>
                        With Placeholder
                    </template>
                </Input>
                {{ placeholderModel }}
            </div>

            <!-- With Tooltip -->
            <div class="flex flex-col gap-5">
                <Input
                    v-model="tooltipModel"
                    :dark="props.dark"
                >
                    <template #label>
                        With Tooltip
                    </template>
                    <template #tooltipHeader>
                        Hello there
                    </template>
                    <template #tooltip>
                        General Kenobi
                    </template>
                </Input>
                {{ tooltipModel }}
            </div>

            <!-- Required -->
            <div class="flex flex-col gap-5">
                <Input
                    v-model="requiredModel"
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
                </Input>
                {{ requiredModel }}
            </div>

            <!-- With Errors -->
            <div class="flex flex-col gap-5">
                <Input
                    v-model="withErrorsModel"
                    :dark="props.dark"
                    :validation-state="validations"
                >
                    <template #label>
                        With Errors
                    </template>
                </Input>
                {{ withErrorsModel }}

                <ul>
                    <li>Must be at least ten characters</li>
                    <li>Cannot exceed twenty characters</li>
                    <li>Must enter "Only This Value"</li>
                </ul>
            </div>

            <!-- Numbers -->
            <div class="flex flex-col gap-5">
                <Input
                    v-model="numberModel"
                    :dark="props.dark"
                    format="number"
                >
                    <template #label>
                        Number
                    </template>
                </Input>
                {{ numberModel }}
            </div>

            <!-- Initial Focus -->
            <div class="flex flex-col gap-5">
                <Input
                    v-model="focusedModel"
                    label="Initial Focus"
                    :dark="props.dark"
                    format="number"
                    focus
                >
                    <template #label>
                        Initial Focus
                    </template>
                </Input>
                {{ focusedModel }}
            </div>

            <!-- Search -->
            <div class="flex flex-col gap-5">
                <Input
                    v-model="searchModel"
                    :dark="props.dark"
                    :search="{
                        items: [
                            'Item 1',
                            'Item 2',
                            'Item 3',
                            'Item 4',
                            'Item 5'
                        ],
                        placement: 'bottom',
                    }"
                >
                    <template #label>
                        Searchable
                    </template>
                </Input>
                {{ searchModel }}
            </div>

        </div>
    </div>

</template>