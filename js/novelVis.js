

let activeUser = null

let circleRadius = 100
let legsLength = 2 // multiplier

export function initNovelVis(parent, props) {

    //console.log(parent)
    const {fullData, 
        getSelectedNode,
      setSelectedNode,
    } = props

    const compHeight = parent.node().getBoundingClientRect().height
    const compWidth = parent.node().getBoundingClientRect().width

    const chart = parent.selectAll('.chart').data([null])
        .join('g')
        .attr('class', 'chart')

    const centreCircle = chart.selectAll('.centreCircle').data([null])
    .join('circle')
    .attr('class', 'centreCircle')
    .attr('transform', `translate(${compWidth/2}, ${compHeight/2})`)
    .attr('r', circleRadius)
    .attr('fill', 'lightgray')
    .attr('stroke', 'red')

    //console.log(fullData)

    const centreData = chart.selectAll('.centreData').data([null])
        .join('g')
        .attr('class', 'centreData')
        .attr('transform', `translate(${compWidth/2}, ${compHeight/2})`)
        .append('text')
        .text('Select a user to begin.')
        .attr('text-anchor', 'middle')
}


export function updateNovelVis(parent, props) {
    const {fullData, 
        getSelectedNode,
        setSelectedNode,
    } = props

    const compHeight = parent.node().getBoundingClientRect().height
    const compWidth = parent.node().getBoundingClientRect().width

    const chart = parent.selectAll('.chart').data([null])
        .join('g')
        .attr('class', 'chart')

    let newNode = getSelectedNode()
    if (newNode != null) {
        activeUser = newNode
    }

    chart.selectAll('.centreData').remove()

    const centreData = chart.selectAll('.centreData').data([null])
    .join('g')
    .attr('class', 'centreData')
    .attr('transform', `translate(${compWidth/2}, ${compHeight/2})`)

    centreData.append('text')
    .text("User: " + activeUser)
    .attr('text-anchor', 'middle')

    let activeUserData = fullData.winnerNodes.find(d=> d.id == activeUser)

    //console.log(activeUserData)

    centreData.append('text')
    .text("Out of graph followers: " + activeUserData.outGraphFollows)
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(0, ${20})`)

    // spider legs

    chart.selectAll('.legsData').remove()

    const legsGroup = chart.selectAll('.legsData').data([null])
    .join('g')
    .attr('class', 'legsData')

    //get followers in graph:

    let activeInGraphFollows = []

    //console.log(fullData.winnerLinks)
    for (let linkIndex in fullData.winnerLinks) {
        let link = fullData.winnerLinks[linkIndex]
        //console.log(link)
        if (link.source.id == activeUser) {
            activeInGraphFollows.push(link.target.id)
        }
    }
    console.log(activeInGraphFollows)

    // display legs

    let angleDiff  = 2 * Math.PI / activeInGraphFollows.length

    for (let legIndex= 0; legIndex < activeInGraphFollows.length; legIndex++) {
        let leg = activeInGraphFollows[legIndex]
        //console.log("leg: " + leg)
        let sine = circleRadius * Math.sin(legIndex * angleDiff)
        let cosine = circleRadius * Math.cos(legIndex * angleDiff)

        //console.log(activeInGraphFollows.length)
        // start at vertical
        console.log("sine: " + sine)
        console.log("cosine: " + cosine)
        legsGroup.append('line')
        .attr('x1', compWidth/2 + (cosine))
        .attr('x2', compWidth/2 + (cosine * legsLength))
        .attr('y1', compHeight/2 + (sine ))
        .attr('y2', compHeight/2 + (sine * legsLength))
        .attr('stroke', 'red' )
        .attr('id', leg)

    }

}

