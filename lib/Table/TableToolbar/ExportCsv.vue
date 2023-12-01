<script setup lang="ts">
import { inject } from 'vue'
import FasFileCsv from '../../Icons/FasFileCsv.vue'
import MutedButton from '../../Buttons/MutedButton.vue'

interface Props {
    reportTitle?: string,
}
const props = defineProps<Props>()


const tableUid = inject('tableUid') as string
const dark = inject('dark') as boolean

const exportToCsv = () => {
    let reportName = `${props.reportTitle ? `_${props.reportTitle}` : ''}`
    let now = new Date
    let dateString = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`

    const rows = document.querySelectorAll(`#${tableUid} tbody tr`)
    const header = document.querySelector(`#${tableUid} thead`)
    let csvRows = []

    // Get header data if exists
    if (header) {
        const headerCells = header.querySelectorAll('th:not([data-th-select])')

        //@ts-ignore
        csvRows.push(Array.from(headerCells).map(cell => cell.innerText.trim() ).join(','))
    }

    // Get table data
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const cells = row.querySelectorAll('td:not([data-th-select])')

        //@ts-ignore
        // csvRows.push(Array.from(cells).map(cell => cell.innerText.trim() ).join(','))

        csvRows.push(Array.from(cells).map(cell => {
            //@ts-ignore
            const cellText = cell.innerText.trim();
            return cellText.includes(',') ? `"${cellText}"` : cellText;
        }).join(','));
    }

    let data = csvRows.join("\n").replace(/(^\[)|(\]$)/gm, "")
    
    // Create a CSV content
    const blob = new Blob([data], { type: 'application/vnd.ms-excel' })

    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportName}_${dateString}.csv`;

    // Append the link to the body and trigger the click event
    document.body.appendChild(link);
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
}

</script>
<template>
    <MutedButton
        @click="exportToCsv"
        :class="[dark ? 'hover:bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-black']"
        class="flex items-center justify-center"
    >
        <FasFileCsv class="fill-green-500 mr-2 text-xl" />
        CSV
    </MutedButton>
</template>