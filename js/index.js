import { loadAndProcessData } from './loadAndProcessData.js'
import { initForceDiagram, updateForceDiagram, restartForceDiagram} from './forceDiagram.js'
import { initNovelVis, updateNovelVis } from './novelVis.js'

let data = null
let dataSize = 100
let winnerBool = true


const colourValue = (d) => {
    return(d.inGraphFollowsNum + d.outGraphFollows)
}
let colourScale = null


// Manages the node that the mouse is hovering over
let hoveredNode = null
let setHoveredNode = (val) => {
    hoveredNode = val
    updateVis()
}

let getHoveredNode = () => {
    return(hoveredNode)
}

// Manages the node that the user has clicked and selected.
let selectedNode = null
let setSelectedNode = (val) => {
    selectedNode = val
    updateVis()
}

let getSelectedNode = () => {
    return(selectedNode)
}



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


// This is run when there are any changes to the dataset being displayed.
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

// Manages the slider input
let slider = document.getElementById("dataSlider");

slider.oninput = () => {
    dataSize = +slider.value
    document.getElementById("nodeCount").innerHTML = slider.value
    restartVis()
} 

// Manages the dropdown menu
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
