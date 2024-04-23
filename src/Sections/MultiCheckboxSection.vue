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

const validations = computed(() => ({
    errors: [
        ... errorsModel.value.length == 0 ? ['Required'] : [],
        ... errorsModel.value.length > 2 ? ['Cannot select more than 2'] : [],
        ... Boolean(errorsModel.value.find(item => item == 3) && errorsModel.value.find(item => item == 1))
            ? ['Cannot select 1 & 3 together'] : []
    ]
}))

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
                    :dark="props.dark"
                >
                    <template #label>
                        Simple Multi-Checkbox
                    </template>
                </MultiCheckbox>
                {{ simpleModel }}
            </div>

            <!-- Pre-selected -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="preSelectedModel"
                    :dark="props.dark"
                >
                    <template #label>Pre-selected</template>
                </MultiCheckbox>
                {{ preSelectedModel }}
            </div>

            <!-- Vertical -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="verticalModel"
                    :dark="props.dark"
                    vertical
                >
                    <template #label>Vertical</template>
                </MultiCheckbox>
                {{ verticalModel }}
            </div>

            <!-- Tooltipped -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="tooltippedModel"
                    :dark="props.dark"
                >
                    <template #label>Tooltipped</template>
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
                    :validation-state="{
                        errors: [
                            ... !Boolean(requiredModel.length) ? ['Required'] : []
                        ]
                    }"
                >
                    <template #label>Required</template>
                </MultiCheckbox>
                {{ requiredModel }}
            </div>

            <!-- Errors -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="errorsModel" 
                    :dark="props.dark"
                    :validation-state="validations"
                >
                    <template #label>With Errors</template>
                </MultiCheckbox>
                {{ errorsModel }}
            </div>

            <!-- Optional -->
            <div class="flex flex-col gap-5">
                <MultiCheckbox
                    :items="baseItems"
                    v-model="optionalModel" 
                    :dark="props.dark"
                    optional
                >
                    <template #label>Optional</template>
                </MultiCheckbox>
                {{ optionalModel }}
            </div>

        </div>
    </div>

</template>