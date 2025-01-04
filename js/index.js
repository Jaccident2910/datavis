import { loadAndProcessData } from './loadAndProcessData.js'
import { initForceDiagram, updateForceDiagram, restartForceDiagram} from './forceDiagram.js'
import { initNovelVis, updateNovelVis } from './novelVis.js'

let data = null
let dataSize = 100
let winnerBool = true


/*
loadAndProcessData(500, true).then((fullData) => {
    console.log(fullData)
    for (let node in fullData.winnerNodes) {
        combinedData.push(fullData.winnerNodes[node])
    }


loadAndProcessData(500, false).then((fullData) => {
    for (let node in fullData.winnerNodes) {
        combinedData.push(fullData.winnerNodes[node])
    }
*/


const colourValue = (d) => {
    return(d.inGraphFollowsNum + d.outGraphFollows)
}
let colourScale = null

let hoveredNode = null
let setHoveredNode = (val) => {
    hoveredNode = val
    console.log(hoveredNode)
    updateVis()
}

let getHoveredNode = () => {
    //console.log(hoveredNode)
    return(hoveredNode)
}


let selectedNode = null
let setSelectedNode = (val) => {
    selectedNode = val
    console.log(selectedNode)
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
        getHoveredNode,
        setHoveredNode,
        winnerBool,
        colourScale,
        colourValue
    })

    svg1.call(initNovelVis, 
        {
            fullData: data,
            getSelectedNode,
            setSelectedNode,
            getHoveredNode,
            setHoveredNode,
            winnerBool,
            colourScale,
            colourValue
        }
    )
}

const updateVis = () => {
    svg2.call(updateForceDiagram, 
        {
        fullData: data,
        getSelectedNode,
        setSelectedNode,
        getHoveredNode,
        setHoveredNode,
        winnerBool,
        colourScale,
        colourValue
    })

    svg1.call(updateNovelVis, 
        {
            fullData: data,
            getSelectedNode,
            setSelectedNode,
            getHoveredNode,
            setHoveredNode,
            winnerBool,
            colourScale,
            colourValue
        }
    )
}

const restartVis = () => {
    loadAndProcessData(dataSize, winnerBool).then(fullData => {
        data = fullData
        let minVal = Math.min(...fullData.winnerNodes.map(colourValue))
        let maxVal = Math.max(...fullData.winnerNodes.map(colourValue))
        colourScale = d3.scaleSequential()
        .domain([minVal, maxVal])
        .interpolator(d3.interpolateViridis);
        svg2.call(restartForceDiagram, 
        {
            fullData: data,
            getSelectedNode,
            setSelectedNode,
            getHoveredNode,
            setHoveredNode,
            winnerBool,
            colourScale,
            colourValue
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
    let minVal = Math.min(...fullData.winnerNodes.map(colourValue))
    let maxVal = Math.max(...fullData.winnerNodes.map(colourValue))
    colourScale = d3.scaleSequential()
    .domain([minVal, maxVal])
    .interpolator(d3.interpolateViridis);

    initVis()}
)
