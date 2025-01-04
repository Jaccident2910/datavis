import barChart from "./barChart.js"

let activeUser = null

let circleRadius = 140
let legsLength = 2 // multiplier

const tooltipPadding = 15;

export function initNovelVis(parent, props) {

    //console.log(parent)
    const {fullData, 
        getSelectedNode,
      setSelectedNode,
      getHoveredNode,
      setHoveredNode,
      winnerBool,
      colourScale,
      colourValue
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
        getHoveredNode,
        setHoveredNode,
        winnerBool,
      colourScale,
      colourValue
    } = props

    const compHeight = parent.node().getBoundingClientRect().height
    const compWidth = parent.node().getBoundingClientRect().width

    const chart = parent.selectAll('.chart').data([null])
        .join('g')
        .attr('class', 'chart')

    let newNode = getSelectedNode()
    if (newNode != null) {
        activeUser = newNode
    
        const mouseoverNode = (event) => {
            let currentHover = getHoveredNode()
            if(currentHover != event.target.id) {
                setHoveredNode(event.target.id)
            }
            if (currentHover != null) {
            let activeHoverData = fullData.winnerNodes.find(d=> d.id == currentHover)
            d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + tooltipPadding) + 'px')   
        .style('top', (event.pageY + tooltipPadding) + 'px')
        .html(`
          <div class="tooltip-title"> User: ${activeHoverData.id}</div>
          <ul>
            <li>Followers in shown graph: ${activeHoverData.inGraphFollowsNum}</li>
            <li>Followers outside of shown graph: ${activeHoverData.outGraphFollows}</li>
          </ul>
        `);
        }}
        
        const mouseoutNode = (event) => {
            console.log("Mouse out")
            setHoveredNode(null)
            d3.select('#tooltip').style('display', 'none');
        }

        const clickNode = (event) => {
          setSelectedNode(event.target.id)
          //console.log(event.target.id)
          d3.select('#tooltip').style('display', 'none');
        }



    chart.selectAll('.centreData').remove()

    let centreWidth = 100
    let centreHeight = 100

    const centreData = chart.selectAll('.centreData').data([null])
    .join('g')
    .attr('class', 'centreData')
    .attr('transform', `translate(${compWidth/2 - centreWidth/2}, ${compHeight/2 - centreHeight/2})`)



    

    let activeUserData = fullData.winnerNodes.find(d=> d.id == activeUser)

    //console.log(activeUserData)

    /* OLD: Display text of user
    
    centreData.append('text')
    .text("Out of graph followers: " + activeUserData.outGraphFollows)
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(0, ${20})`)

    */

    // NEW: Bar chart of followers and following
    // It would've been nice to have this in a different file, but oh well
    if (typeof(activeUserData) != "undefined") {
    
        centreData.append('text')
        .text("User: " + activeUser)
        .attr('text-anchor', 'middle')
        .attr('class', 'barchart-title')
        .attr('transform', `translate(${centreWidth/2}, ${- 10})`);

    let graphGroup = centreData.append('g')
    graphGroup.append('rect')
    .attr('width', centreWidth)
    .attr('height', centreHeight)
    .attr('fill', 'white')

    
        barChart( graphGroup,
                {fullData, 
                getSelectedNode,
                setSelectedNode,
                getHoveredNode,
                setHoveredNode,
                winnerBool,
                margin: { top: 0, bottom: 0, left: 0, right: 0 },
                height: centreHeight,
                width: centreWidth
                })
    

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

    const strokeScale = d3.scaleSequential()
    .domain(colourScale.domain())
    .range([2, 20])

    let angleDiff  = 2 * Math.PI / activeInGraphFollows.length

    for (let legIndex= 0; legIndex < activeInGraphFollows.length; legIndex++) {
        let leg = activeInGraphFollows[legIndex]
        //console.log("leg: " + leg)
        let sine = circleRadius * Math.sin(legIndex * angleDiff)
        let cosine = circleRadius * Math.cos(legIndex * angleDiff)

        //find leg object:
        let legData = fullData.winnerNodes.find(d=> d.id == leg)

        //console.log(activeInGraphFollows.length)
        // start at vertical
        legsGroup.append('line')
        .attr('x1', compWidth/2 + (cosine))
        .attr('x2', compWidth/2 + (cosine * legsLength))
        .attr('y1', compHeight/2 + (sine ))
        .attr('y2', compHeight/2 + (sine * legsLength))
        .attr('stroke', colourScale(colourValue(legData)) )
        .attr('stroke-width', (d) => {
            if (leg == getHoveredNode()) {
                console.log("Hovered Node")
                console.log(getHoveredNode())
                return(strokeScale(colourValue(legData)) + 4)
            }
            else {
                return(strokeScale(colourValue(legData)))
            }
        })
        .attr('id', leg)
        .on('mouseover', mouseoverNode)
        .on('mouseleave', mouseoutNode)
        .on('click', clickNode)

    }
}
else {
    const centreData = chart.selectAll('.centreData').data([null])
    .join('g')
    .attr('class', 'centreData')
    .attr('transform', `translate(${compWidth/2}, ${compHeight/2})`);

    centreData.append('text')
    .text('No user selected')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${0}, ${-10})`);
    centreData.append('text')
    .text('Select a user to begin.')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${0}, ${10})`);

}
    }

}

