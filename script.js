const Button = document.getElementById("Button")

// Setup Classes / Strategies
class BaseEditStrat {
    Target = null
    constructor(){
        if (new.target === BaseEditStrat){
            throw new Error("Não pode instanciar EditStrat diretamente!")
        }
    }
    SetTarget(Target){this.Target = Target}
    GetTarget(){return this.Target}
    PushData(){throw new Error("ApplyChanges é uma propriedade abstrata, por favor a mude por inheritance!")}
    OnChosen(){}
}
class PushStrat extends BaseEditStrat{
    constructor(){
        super()
    }
    PushData(){
        var Data = new FormData(Form)
        var formObject = Object.fromEntries(Data.entries())
        
        Form.reset()
        var Nome = formObject.Nome.trim()
        if (!Nome){
            alert("O Nome não pode estar em branco!")
            return
        }
        
        PushNewBlock(formObject)
        RenderBlocks()
    }
    OnChosen(){
        Form.reset()
        document.getElementById("Submit").innerText = "Enviar"
        CancelButton.remove()
    }
}
class EditStrat extends BaseEditStrat{
    constructor(){
        super()
    }
    PushData(){
        var Data = new FormData(Form)
        var formObject = Object.fromEntries(Data.entries())
        for (const prop in this.Target) {
            // Apaga os valores antigos do alvo, previnindo apagar valores importantes
            if (Object.hasOwnProperty.call(this.Target, prop)) {
                delete this.Target[prop]
            }
        }

        // JS usa valores complexos por ponteiro, ou seja, podemos usar edição in-place, o que esse loop faz
        for (let [key, value] of Object.entries(formObject)) {
            this.Target[key] = value
        }
        RenderBlocks()
        this.Target = null
        // Trocar de volta para o modo normal
        EditStrategy = EditModes.Push
        EditStrategy.OnChosen()
    }
    SetTarget(Target){
        super.SetTarget(Target)
        for (let [key, value] of Object.entries(Target)) {
            // Coloca os dados do alvo dentro do formulário
            if (!Form.elements[key])
                continue
            Form.elements[key].value = value
        }
    }
    OnChosen(){
        document.getElementById("Submit").innerText = "Editar"
        ButtonGroup.appendChild(CancelButton)
    }
}

// Os breakpoints usados pelo site
const GridBreaks = {
    0: 1,
    900: 2,
    1300: 3
}

let CurGridCount = 1
const Form = document.getElementById("Form")
const ButtonGroup = document.getElementById("ButtonGroup")
const CancelButton = document.getElementById("Cancel")
const Grid = document.getElementById("Grid")
const EditModes = { Push: new PushStrat(), Edit: new EditStrat() }
const ImportButton = document.getElementById("Importar")
const ExportButton = document.getElementById("Exportar")
const FileSelector = document.getElementById("FileInput")
let EditStrategy = EditModes.Push
let DataBlocks = []

EditStrategy.OnChosen()

function OnIconClick(Data){
    if (EditStrategy != EditModes.Edit){
        EditStrategy = EditModes.Edit
        EditStrategy.OnChosen()
    }
    if (EditStrategy.GetTarget() != Data)
        EditStrategy.SetTarget(Data)
}

function EraseBlock(Data) {
    let Index = DataBlocks.indexOf(Data)
    DataBlocks.splice(Index, 1)
    RenderBlocks()
    UpdateButtons()
    if (EditStrategy != EditModes.Edit)
        return
    if (EditStrategy.GetTarget() == Data){
        EditStrategy = EditModes.Push
        EditStrategy.OnChosen()
    }
}

function RenderBlocks() {
    let Container = null
    let NewNodes = []
    Grid.replaceChildren()
    for (let i = 0; i < DataBlocks.length; i++){
        let Data = DataBlocks[i]
        // Cria uma nova linha se o indice for 0 baseado no tamanho maximo de linhas
        if (i % CurGridCount == 0){
            Container = document.createElement("div")
            Container.classList.add("row")
            Grid.appendChild(Container)
            NewNodes.push(Container)
        }
        let Icon = document.createElement("button")
        Icon.classList.add("col")
        Icon.classList.add("Icon")
        Icon.style.position = "relative"
        
        // Montar a parte de dentro baseado nas informações
        for (let [key, value] of Object.entries(Data)) {
            if (!value)
                continue
            let text = document.createElement("div")
            text.innerHTML = `<b>${key}</b>: ${value}`
            Icon.appendChild(text)
        }

        let Cont = document.createElement("div")
        Cont.classList.add("flex-row", "gap-2", "Controls")

        Icon.appendChild(Cont)
        let Edit = document.createElement("button")
        Edit.classList.add("btn", "btn-primary", "flex-fill")
        Edit.innerText = "Editar"
        Cont.appendChild(Edit)
        Edit.onclick = () => {
            OnIconClick(Data)
        }
        let Erase = document.createElement("button")
        Erase.classList.add("btn", "btn-danger", "flex-fill")
        Erase.innerText = "Deletar"
        Erase.onclick = () => {
            EraseBlock(Data)
        }
        Cont.appendChild(Erase)

        Container.appendChild(Icon)
    }
}

function ExportCSV(){
    let Values = []
    let Datas = []

    // Inicializar valores basicos usados para modularidade
    for (let [_, data] of Object.entries(DataBlocks)) {
        Datas.push(data)
        for (let [key, _] of Object.entries(data)) {
            if (Values.includes(key))
                continue
            Values.push(key)
        }
    }

    // Montar as linhas do CSV
    let Lines = []
    Lines.push(Values.join(","))
    for (let dat of Datas){
        var Formatted = []
        for (let key of Values){
            Formatted.push(key in dat ? dat[key] : "")
        }
        Lines.push(Formatted.join(","))
    }
    let Separated = Lines.join("\n")

    // Criar um novo Blob para exportar o CSV
    const blob = new Blob([Separated], { type: 'text/csvcharset=utf-8' })
    const url = URL.createObjectURL(blob)

    // Cria um elemento <a> temporario para servir como download
    const link = document.createElement('a')
    link.href = url
    link.download = "Exported"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Remove URL para economizar memoria e previnir memory leak (não é muito importante num site pequeno assim mas é bom)
    URL.revokeObjectURL(url)
}

function ImportCSV(Data){
    const Lines = Data.split(/\r?\n/)
    var Values = Lines[0].split(",") // Inicializa indices basicos
    let Builts = []

    for (let i = 1; i < Lines.length; i++){
        let Line = Lines[i]
        let Val = Line.split(",")
        let Build = {}

        // Colocar cada valor no indice correto
        for (let s of Values){
            let ind = Values.indexOf(s)
            Build[s] = Val[ind]
        }
        Builts.push(Build)
    }
    for (let d of Builts){
        DataBlocks.push(d)
    }
    RenderBlocks()
    UpdateButtons()
}

function UpdateButtons(){
    if (DataBlocks.length > 0)
        ExportButton.disabled = false
    else
        ExportButton.disabled = true
}

function PushNewBlock(Data) {
    DataBlocks.push(Data)
    UpdateButtons()
}

function HandleResize() {
    const newWindowWidth = window.innerWidth
    let ChosenSize = null
    for (let [key, value] of Object.entries(GridBreaks)) {
        if (key <= newWindowWidth){
            ChosenSize = value
        }        
    }
    CurGridCount = ChosenSize
    RenderBlocks()
}
window.addEventListener('resize', HandleResize)
HandleResize()
RenderBlocks()
UpdateButtons()

document.getElementById("Submit").addEventListener('click', function(){
    EditStrategy.PushData()
})
CancelButton.addEventListener('click', () => {
    EditStrategy = EditModes.Push
    EditStrategy.OnChosen()
})
ImportButton.addEventListener('click', () => {
    FileSelector.click()
})
FileSelector.addEventListener('change', (Ev) => {
    const files = Ev.target.files
    if (files.length == 0)
        return
    const File = files[0]
    const reader = new FileReader()

    // Importar assim que o leitor acabar de ler
    reader.onload = function(e) {
        const contents = e.target.result
        ImportCSV(contents)
    }

    reader.readAsText(File)
})
ExportButton.addEventListener('click', ExportCSV)