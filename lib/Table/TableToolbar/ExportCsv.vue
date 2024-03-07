<script setup lang="ts">
import { inject } from 'vue'
import { type InternalColumn } from '../Table.vue'
import FasFileCsv from '../../Icons/FasFileCsv.vue'
import MutedButton from '../../Buttons/MutedButton.vue'
import { deepValue } from '../../Utilities/objectHelpers'
import {
    timestampToISO, timestampToLocaleTime, timestampToLocaleDate, timestampToFullFormatted, timestampToAbbreviatedDate as timestampToAbbreviatedDate
} from '../../Utilities/dateHelpers'
const props = defineProps<{
    reportTitle?: string,
    dark: boolean,
    items: any[],
    columns: InternalColumn[]
}>()


const tableUid = inject('tableUid') as string

const exportableColumns = props.columns.filter(column => {
    if (column.hasOwnProperty('exportOptions') && column.exportOptions?.hasOwnProperty('skip')) return !column.exportOptions.skip
    else return true
})

const exportToCsv = () => {
    let reportName = `${props.reportTitle ? `_${props.reportTitle}` : ''}`
    let now = new Date
    let dateString = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`

    const rows = document.querySelectorAll(`[data-row]`)
    const header = document.querySelector(`#${tableUid} thead`)
    let csvRows = []

    // Get header data if exists
    if (header) {
        const headerCells = [] as any[]
        exportableColumns.forEach(column => {
            headerCells.push(header.querySelector(`[data-th="${column.uid}"]`))
        })

        csvRows.push(Array.from(headerCells).map(cell => cell.innerText.trim() ).join(','))
    }

    // Get table data
    props.items.forEach(item => {
        csvRows.push(
            exportableColumns.map(column => {
                if (deepValue(column.key, item))
                {
                    if (column?.exportOptions?.isDate)
                    {
                        if (column?.exportOptions?.dateFormat)
                        {
                            if (column.exportOptions.dateFormat == 'timestampToAbreviatedDate') return timestampToAbbreviatedDate(deepValue(column.key, item))
                            else if (column.exportOptions.dateFormat == 'timestampToFullFormatted') return timestampToFullFormatted(deepValue(column.key, item))
                            else if (column.exportOptions.dateFormat == 'timestampToISO') return timestampToISO(deepValue(column.key, item))
                            else if (column.exportOptions.dateFormat == 'timestampToLocaleDate') return timestampToLocaleDate(deepValue(column.key, item))
                            else if (column.exportOptions.dateFormat == 'timestampToLocaleTime') return timestampToLocaleTime(deepValue(column.key, item))
                        }
                        else
                        {
                            return timestampToISO(deepValue(column.key, item))
                        }
                    }
                    else {
                        return deepValue(column.key, item).toString().includes(',') ? `"${deepValue(column.key, item)}"` : deepValue(column.key, item)
                    }
                }
                else
                {
                    return ''
                }
            }).join(',')
        )
    })

    let data = csvRows.join("\n").replace(/(^\[)|(\]$)/gm, "")
    
    // Create a CSV content
    const blob = new Blob([data], { type: 'application/vnd.ms-excel' })

    // Create a download link
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${reportName}_${dateString}.csv`

    // Append the link to the body and trigger the click event
    document.body.appendChild(link)
    link.click()

    // Remove the link from the document
    document.body.removeChild(link)
}

</script>
<template>
    <MutedButton
        @click="exportToCsv"
        :class="[props.dark ? 'hover:bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-black']"
        class="flex items-center justify-center"
    >
        <FasFileCsv class="fill-green-500 mr-2 text-xl" />
        CSV
    </MutedButton>
</template>