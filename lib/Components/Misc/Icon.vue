<script setup lang="ts">
import { camelCase } from '../Utilities/stringHelpers'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import * as solidIcons from '@fortawesome/free-solid-svg-icons'
import * as brandIcons from '@fortawesome/free-brands-svg-icons'
import * as regularIcons from '@fortawesome/free-regular-svg-icons'
import { computed, onBeforeMount, onUpdated, ref, watch } from 'vue'
import { type IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface Props {
    iconClass: string,
}
const props = defineProps<Props>()


const iconClass = ref(props.iconClass)
watch([() => props.iconClass], () => {
    iconClass.value = props.iconClass
})

const icon = computed(() => iconClass.value)

const splitString = computed(() => icon.value?.split(" "))
const iconStyle = computed(() => splitString.value ? splitString.value[0] : null)

const iconRotator = ref('')

const faFlip = computed(() => {
    let flipIndex = iconRotator.value.includes('flip-') ? iconRotator.value.lastIndexOf('flip-') : null
    if (flipIndex != null) return iconRotator.value.substring(flipIndex + 1)
    else return null
})
const faRotate = computed(() => {
    let rotateIndex = iconRotator.value.includes('rotate-') ? iconRotator.value.lastIndexOf('rotate-') : null
    if (rotateIndex != null) 
    {
        let temp = Number(iconRotator.value.substring(rotateIndex + 1))
        let allowed = [90, 180, 270]
        if (allowed.includes(temp)) return temp
        else return null
    }
    else return null
})

const iconName = computed(() => {
    // console.log(splitString.value)
    return splitString.value.find(x => {
        if (!x.includes(' flip-') && !x.includes(' rotate-') && x.length > 3) return true
    })?.substring(3)

    let temp = splitString.value[splitString.value.length - 1].substring(3)
    if (temp.includes('flip-') || temp.includes('rotate-'))
    {
        let tempParts = temp.split(' ')
        let tempName = ''
        let tempRotator = ''
        tempParts.forEach(x => {
            if (x.includes('flip-') || x.includes('rotate-')) iconRotator.value = x
            else tempName = x
        })
        return tempName
    }
    return temp
})

const arbitraries = [
    'flip-',
    'rotate-',
]

const iconDef = ref<IconDefinition>()

const addIconToLibrary = () => {
    if (iconClass.value.includes (' rotate-') || iconClass.value.includes (' flip-')) return

    else if (iconStyle.value == 'fas' || iconStyle.value == 'fa-solid')
    {
        try {
            //@ts-ignore
            library.add(solidIcons[camelCase(`fa-${iconName.value}`)])
            //@ts-ignore
            iconDef.value = solidIcons[camelCase(`fa-${iconName.value}`)]
        }
        catch (error)
        {
            let t = null
            let temp = splitString.value[splitString.value.length - 1].substring(3)
            console.log({
                error: error,
                iconName: iconName.value,
                iconStyle: iconStyle.value,
                camel: camelCase(`fa-${iconName.value}`),
                here: arbitraries.some(x => iconName.value?.startsWith(x)),
                there: temp.split(' '),
                props: props,
                //@ts-ignore
                icon: solidIcons[camelCase(`fa-${iconName.value}`)]
            })
            
        }
    }

    else if (iconStyle.value == 'fab' || iconStyle.value == 'fa-brand')
    {
        try {
            //@ts-ignore
            library.add(brandIcons[camelCase(`fa-${iconName.value}`)])
            //@ts-ignore
            iconDef.value = brandIcons[camelCase(`fa-${iconName.value}`)]
        }
        catch (error)
        {
            let t = null
            let temp = splitString.value[splitString.value.length - 1].substring(3)
            console.log({
                error: error,
                iconName: iconName.value,
                iconStyle: iconStyle.value,
                camel: camelCase(`fa-${iconName.value}`),
                here: arbitraries.some(x => iconName.value?.startsWith(x)),
                there: temp.split(' '),
                props: props,
            })
            
        }
    }

    else if (iconStyle.value == 'far' || iconStyle.value == 'fa-regular')
    {
        try {
            //@ts-ignore
            library.add(regularIcons[camelCase(`fa-${iconName.value}`)])
            //@ts-ignore
            iconDef.value = regularIcons[camelCase(`fa-${iconName.value}`)]
        }
        catch (error)
        {
            let t = null
            let temp = splitString.value[splitString.value.length - 1].substring(3)
            console.log({
                error: error,
                iconName: iconName.value,
                iconStyle: iconStyle.value,
                camel: camelCase(`fa-${iconName.value}`),
                here: arbitraries.some(x => iconName.value?.startsWith(x)),
                there: temp.split(' '),
                props: props,
            })
            
        }
    }
}

onBeforeMount(() => addIconToLibrary())
onUpdated(() => addIconToLibrary())

</script>
<template>
    <FontAwesomeIcon v-if="iconDef"
        :icon="iconDef"
        :rotation="faRotate == 90 ? 90 : faRotate == 180 ? 180 : faRotate == 270 ? 270 : undefined"
        :flip="faFlip == 'horizontal' ? 'horizontal' : faFlip == 'vertical' ? 'vertical' : undefined"
    />
</template>