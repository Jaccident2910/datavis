import { loadAndProcessData } from './loadAndProcessData.js'
import { initForceDiagram, updateForceDiagram, restartForceDiagram} from './forceDiagram.js'
import { initNovelVis, updateNovelVis } from './novelVis.js'

let data = null
let dataSize = 100
let winnerBool = true

let selectedNode = null
let setSelectedNode = (val) => {
    selectedNode = val
    updateVis()
    //svg.call(updateForceDiagram, {selectedNode})
}

let getSelectedNode = () => {
    return(selectedNode)
}



// TODO: This needs to be in a different file.
const svg1 = d3.select('#svg1');
const svg2 = d3.select('#svg2');

const initVis = () => {
    svg2.call(initForceDiagram, 
        {
        fullData: data,
        getSelectedNode,
        setSelectedNode,
    })

    svg1.call(initNovelVis, 
        {
            fullData: data,
            getSelectedNode,
            setSelectedNode
        }
    )
}

const updateVis = () => {
    svg2.call(updateForceDiagram, 
        {
        fullData: data,
        getSelectedNode,
        setSelectedNode,
    })

    svg1.call(updateNovelVis, 
        {
            fullData: data,
            getSelectedNode,
            setSelectedNode
        }
    )
}

const restartVis = () => {
    loadAndProcessData(dataSize, winnerBool).then(fullData => {
        data = fullData
        svg2.call(restartForceDiagram, 
        {
            fullData: data,
            getSelectedNode,
            setSelectedNode,
        })
    }
    )
}


let slider = document.getElementById("dataSlider");

//console.log(slider)
slider.oninput = () => {
    console.log(+slider.value)
    dataSize = +slider.value
    restartVis()
} 

const dataChangeFunc = (event) => {
    let dataSelection = event.target.value
    if (dataSelection == 'winner') {
        winnerBool = true
    }
    else {
        winnerBool = false
    }
    restartVis()
}
d3.select('#data-selection')
    .on('change', dataChangeFunc);

loadAndProcessData(dataSize, winnerBool).then(fullData => {
    data = fullData
    initVis()}
)