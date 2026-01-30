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
    PushData(){throw new Error("ApplyChanges é uma propriedade abstrata, por favor a mude por inheritance!")}
}
class PushStrat extends BaseEditStrat{
    constructor(){
        super()
    }
    PushData(){
        var Form = document.getElementById("Form")
        var Data = new FormData(Form)
        var formObject = Object.fromEntries(Data.entries());
        
        var Nome = formObject.Nome
        var Idade = formObject.Idade
        var Origem = formObject.Local
        var Desc = formObject.Desc
        
        PushNewBlock(formObject)
    }
}
class EditStrat extends BaseEditStrat{
    constructor(){
        super()
    }
    PushData(){
        console.log("EditStrat")
    }
}

const EditModes = { Push: new PushStrat(), Edit: new EditStrat() }
let EditStrategy = EditModes.Push
let DataBlocks = []

function RenderBlocks() {
    
}

function PushNewBlock(Data) {
    DataBlocks.push(Data)
    console.log(DataBlocks)
}

document.getElementById("Submit").addEventListener('click', function(){
    EditStrategy.PushData()
})