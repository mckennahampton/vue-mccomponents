export default function(uri: string, name: string)
{
    var link = document.createElement("a")
    link.download = name
    link.href = uri
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    //@ts-ignore
    link = null
}