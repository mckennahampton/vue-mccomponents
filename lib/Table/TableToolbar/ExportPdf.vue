<script setup lang="ts">
import { inject } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import FasFilePdf from '../../Icons/FasFilePdf.vue'
import { toBase64 } from '../../Utilities/fileHelpers'
import MutedButton from '../../Buttons/MutedButton.vue'

interface Props {
    reportTitle?: string,
}
const props = defineProps<Props>()

const tableUid = inject('tableUid') as string
const localLogoUrl = inject('localLogoUrl') as string

const exportToPdf = async () => {

    // Generate logo base64
    let base64Img = ''
    if (localLogoUrl) {
        await toBase64(localLogoUrl).then(dataUrl => base64Img = dataUrl)
    }

    const doc = new jsPDF()
    autoTable(doc, {
        html: `#${tableUid}`,
        headStyles: {
            fillColor: '#000000'
        },
        didDrawPage: function (data) {
            // Header
            doc.setTextColor(40)
            if (base64Img) {
                doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 40, 16);
            }

            doc.setFontSize(10)
            doc.text(`${(new Date).toLocaleDateString()} ${(new Date).toLocaleTimeString()}`, 8, 5)
            
            doc.setFontSize(13)
            doc.text(`${props.reportTitle ? `: ${props.reportTitle}` : ''}`, data.settings.margin.left + 50, 22  )

            // Footer
            // jsPDF 1.4+ uses getWidth, <1.4 uses .width
            var str = "Page " + doc.getCurrentPageInfo().pageNumber
            doc.setFontSize(10)
            var pageSize = doc.internal.pageSize
            var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
            doc.text(str, data.settings.margin.left, pageHeight - 10)
        },
        margin: {top: 35}
    })
    let reportName = `${props.reportTitle ? `_${props.reportTitle}` : ''}`
    let now = new Date
    let dateString = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`
    doc.save(`${reportName}_${dateString}.pdf`)
}

</script>
<template>
    <MutedButton @click="exportToPdf" class="flex items-center justify-center hover:bg-neutral-100">
        <FasFilePdf class="text-red-500 mr-2 text-xl" />
        PDF
    </MutedButton>
</template>