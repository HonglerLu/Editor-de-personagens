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
        var formObject = Object.fromEntries(Data.entries());
        
        Form.reset()
        var Nome = formObject.Nome.trim()
        if (!Nome){
            alert("O Nome não pode estar em branco!")
            return
        }
        var Idade = formObject.Idade
        var Origem = formObject.Local
        var Desc = formObject.Desc
        
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
        var formObject = Object.fromEntries(Data.entries());
        for (const prop in this.Target) {
            if (Object.hasOwnProperty.call(this.Target, prop)) {
                delete this.Target[prop];
            }
        }

        for (let [key, value] of Object.entries(formObject)) {
            this.Target[key] = value
        }
        RenderBlocks()
        this.Target = null
        EditStrategy = EditModes.Push
        EditStrategy.OnChosen()
    }
    SetTarget(Target){
        console.log(Target)
        super.SetTarget(Target)
        for (let [key, value] of Object.entries(Target)) {
            console.log(`${key}: ${value}`);
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
        let Erase = document.createElement("button")
        Erase.classList.add("btn", "btn-danger", "flex-fill")
        Erase.innerText = "Deletar"
        Erase.onclick = () => {
            EraseBlock(Data)
        }
        Cont.appendChild(Erase)
        let Edit = document.createElement("button")
        Edit.classList.add("btn", "btn-primary", "flex-fill")
        Edit.innerText = "Editar"
        Cont.appendChild(Edit)
        Edit.onclick = () => {
            OnIconClick(Data)
        }

        Container.appendChild(Icon)
    }
}

function PushNewBlock(Data) {
    DataBlocks.push(Data)
}

document.getElementById("Submit").addEventListener('click', function(){
    EditStrategy.PushData()
})
CancelButton.addEventListener('click', () => {
    EditStrategy = EditModes.Push
    EditStrategy.OnChosen()
})

function HandleResize() {
    const newWindowWidth = window.innerWidth;
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