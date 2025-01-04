import { colourbar } from "./colourbar.js"

let simulation = d3.forceSimulation()

let nodeSize = 0.04

const minimumNodeSize = 2

let barWidth = 300
    let barHeight = 40

function drag(simulation) {    
  function dragstarted(event) {
    console.log(event.subject)
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  
  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}




export function initForceDiagram(parent, props) {

    console.log(parent)
    const {fullData, 
        getSelectedNode,
      setSelectedNode,
      getHoveredNode,
      setHoveredNode,
      winnerBool,
      colourScale,
      colourValue
    } = props
    
    /* 
    let minVal = Math.min(...fullData.winnerNodes.map(colourValue))
    let maxVal = Math.max(...fullData.winnerNodes.map(colourValue))
    const colourScale = d3.scaleSequential()
    .domain([minVal, maxVal])
    .interpolator(d3.interpolateViridis);*/


    console.log("colour scale")
    console.log(fullData.winnerNodes.map(colourValue))
    console.log(colourScale.domain())
    
    
    
    
        let winnerNodes = fullData.winnerNodes
        let winnerLinks = fullData.winnerLinks
        
        const compHeight = parent.node().getBoundingClientRect().height
        const compWidth = parent.node().getBoundingClientRect().width

        let maxNodeSize = winnerNodes.map(d=> d.inGraphFollowsNum + d.outGraphFollows).reduce((a, b) => Math.max(a, b), -Infinity);
        nodeSize = 36/ Math.sqrt(maxNodeSize)
    
        //console.log(compHeight)
        //console.log(compWidth)
    
        //console.log(winnerNodes)
        //console.log(winnerLinks)
    
        
    
    
        const chart = parent.selectAll('mainChart').data([null])
        .join('g')
        .attr('class', 'mainChart')
        
        simulation
        .force('link',   d3.forceLink().id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-70))
        .force('center', d3.forceCenter(compWidth/2, compHeight/2).strength(1));
    
        simulation.nodes(winnerNodes);
        simulation.force('link').links(winnerLinks);
        console.log(simulation)
      
        // Colour scale
        //const colorScale = d3.scaleOrdinal(d3.schemePaired)
        //  .domain(data.nodes.map(d => d.group));
        const clickNode = (event) => {
          setSelectedNode(event.target.id)
          //console.log(event.target.id)
        }
        const mouseoverNode = (event) => {
          let currentHover = getHoveredNode()
            if(currentHover != event.target.id) {
                setHoveredNode(event.target.id)
            }
          //console.log(selectedNode)
          /*
          chart.selectAll('circle').data(winnerNodes)
          .join('circle')
            .attr('stroke', d=> {
              if(d.id == selectedNode) {return('white')}
              else {return('None')}
          })
          chart.selectAll('line').data(winnerLinks)
          .join('line')
          .attr('opacity', d=> {
              if(d.source.id == selectedNode || d.target.id == selectedNode) {return(1)}
              else {return(0.1)}
          })
          .attr('stroke', d=> {
              if(d.source.id == selectedNode || d.target.id == selectedNode) {return('#0F0')}
              else {return('#000')}
          })
            */
      }
      
      const mouseoutNode = (event) => {
        setHoveredNode(null)
          /*chart.selectAll('circle').data(winnerNodes)
          .join('circle')
            .attr('stroke', d=> {
              if(d.id == selectedNode) {return('white')}
              else {return('None')}
          })
          chart.selectAll('line').data(winnerLinks)
          .join('line')
          .attr('opacity', d=> {
              if(d.source.id == selectedNode || d.target.id == selectedNode) {return(1)}
              else {return(0.1)}
          })
          .attr('stroke', d=> {
              if(d.source.id == selectedNode || d.target.id == selectedNode) {return('#0F0')}
              else {return('#000')}
          })
              */
      }
    
        // Append links
        const links = chart.selectAll('line').data(winnerLinks, d=> d.source.id + "-" + d.target.id)
        .join('line')
        .attr('opacity', d=> {
            if(d.source.id == getHoveredNode() || d.target.id == getHoveredNode()) {return(1)}
            else {return(0.1)}
        })
        .attr('stroke', d=> {
            if(d.source.id == getHoveredNode() || d.target.id == getHoveredNode()) {return('#FF7518')}
            else {return('#000')}
        })
    
    
        // Append nodes
        const nodes = chart.selectAll('circle').data(winnerNodes, d=> d.id)
            .join('circle')
            .attr('r', d=> Math.max(Math.sqrt(d.inGraphFollowsNum + d.outGraphFollows) * nodeSize, minimumNodeSize))
              .attr('fill', d=> {
                if (d.id == getSelectedNode() && getSelectedNode() != null) {return('aqua')}
                else {
                  return(colourScale(colourValue(d)))
                }
              })
              .attr('stroke', d=> {
                if(d.id == getHoveredNode()) {
                  console.log(d.id)
                  console.log(colourValue(d))
                  return('white')}
                if (d.id == getSelectedNode() && getSelectedNode() != null) {return('aqua')}
                else {return('black')}
            })
              .attr('id', d=>{
                //console.log(d)
                return(d.id)})
              .on('mouseover', mouseoverNode)
              .on('mouseout', mouseoutNode)
              .on('click', clickNode)
              .call(drag(simulation));
      
        // Update positions
        simulation.on('tick', () => {
          links
              .attr('x1', d => d.source.x)
              .attr('y1', d => d.source.y)
              .attr('x2', d => d.target.x)
              .attr('y2', d => d.target.y);
          nodes
              .attr('cx', d => d.x)
              .attr('cy', d => d.y);
        });

        chart.call(d3.zoom()
        .scaleExtent([0, 8])
        .translateExtent([[0, 0], [compWidth, compHeight]])
        .on('zoom', event => chart.attr('transform', event.transform)));
    /* */

    

    parent.call(colourbar, {
      colourScale,
      nTicks: 4,
      barWidth,
      barHeight,
      title: "Number of Followers",
      x: compWidth - barWidth - 50,
      y: compHeight - barHeight - 40
    })
    
    }
    
export function updateForceDiagram(parent, props) {

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


  let winnerNodes = fullData.winnerNodes
        let winnerLinks = fullData.winnerLinks
        
        const compHeight = parent.node().getBoundingClientRect().height
        const compWidth = parent.node().getBoundingClientRect().width
  const chart = parent.selectAll('.mainChart').data([null])
        .join('g')
        .attr('class', 'mainChart')


       
        /*
        const mouseoverNode = (event) => {
            setSelectedNode(event.target.id, fullData)
        }
        
        const mouseoutNode = (event) => {
            setSelectedNode(null, fullData)
        }
            */
  const links = chart.selectAll('line').data(winnerLinks, d=> d.source.id + "-" + d.target.id)
        .join('line')
        .attr('opacity', d=> {
            if(d.source.id == getHoveredNode() || d.target.id == getHoveredNode()) {return(1)}
            else {return(0.1)}
        })
        .attr('stroke', d=> {
            if(d.source.id == getHoveredNode() || d.target.id == getHoveredNode()) {return('#FF7518')}
            else {return('#000')}
        })
    
    
        // Append nodes
        const nodes = chart.selectAll('circle').data(winnerNodes, d=> d.id)
            .join('circle')
              .attr('stroke', d=> {
                if(d.id == getHoveredNode()) {
                  console.log(d.id)
                  console.log(colourValue(d))
                  return('white')}
                if (d.id == getSelectedNode() && getSelectedNode() != null) {return('aqua')}
                else {return('black')}
            })
            .attr('fill', d=> {
              if (d.id == getSelectedNode() && getSelectedNode() != null) {return('aqua')}
              else {
                return(colourScale(colourValue(d)))
              }
            })

}



export function restartForceDiagram(parent, props) {

    console.log("restarting..")
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
  


    let winnerNodes = fullData.winnerNodes
          let winnerLinks = fullData.winnerLinks
          
          const compHeight = parent.node().getBoundingClientRect().height
          const compWidth = parent.node().getBoundingClientRect().width

          let maxNodeSize = winnerNodes.map(d=> d.inGraphFollowsNum + d.outGraphFollows).reduce((a, b) => Math.max(a, b), -Infinity);
          nodeSize = 36/ Math.sqrt(maxNodeSize)

          parent.selectAll('g').remove()
          parent.selectAll('line').remove()
          parent.selectAll('circle').remove()


          const chart = parent.selectAll('.mainChart').data([null])
          .join('g')
          .attr('class', 'mainChart')
  
          simulation = null
          simulation = d3.forceSimulation()
          simulation
          .force('link',   d3.forceLink().id(d => d.id))
          .force('charge', d3.forceManyBody().strength(-70))
          .force('center', d3.forceCenter(compWidth/2, compHeight/2).strength(1));

        simulation.nodes(winnerNodes);
        simulation.force('link').links(winnerLinks);
          
          const mouseoverNode = (event) => {
              let currentHover = getHoveredNode()
            if(currentHover != event.target.id) {
                setHoveredNode(event.target.id)
            }
          }
          
          const mouseoutNode = (event) => {
              setHoveredNode(null)
          }

          const clickNode = (event) => {
            setSelectedNode(event.target.id)
            //console.log(event.target.id)
          }
      
    const links = chart.selectAll('line').data(winnerLinks, d=> d.source.id + "-" + d.target.id)
        .join('line')
        .attr('opacity', d=> {
            if(d.source.id == getHoveredNode() || d.target.id == getHoveredNode()) {return(1)}
            else {return(0.1)}
        })
        .attr('stroke', d=> {
            if(d.source.id == getHoveredNode() || d.target.id == getHoveredNode()) {return('#FF7518')}
            else {return('#000')}
        })
      
      
          // Append nodes
          const nodes = chart.selectAll('circle').data(winnerNodes, d=> d.id)
            .join('circle')
            .attr('r', d=> Math.max(Math.sqrt(d.inGraphFollowsNum + d.outGraphFollows) * nodeSize, minimumNodeSize))
              .attr('fill', d=> {
                if (d.id == getSelectedNode() && getSelectedNode() != null) {return('aqua')}
                else {
                  return(colourScale(colourValue(d)))
                }
              })
              .attr('stroke', d=> {
                if(d.id == getHoveredNode()) {return('white')}
                if (d.id == getSelectedNode() && getSelectedNode() != null) {return('aqua')}
                else {return('black')}
            })
              .attr('id', d=>{
                //console.log(d)
                return(d.id)})
              .on('mouseover', mouseoverNode)
              .on('mouseout', mouseoutNode)
              .on('click', clickNode)
              .call(drag(simulation));
  

              // Update positions
        simulation.on('tick', () => {
          links
              .attr('x1', d => d.source.x)
              .attr('y1', d => d.source.y)
              .attr('x2', d => d.target.x)
              .attr('y2', d => d.target.y);
          nodes
              .attr('cx', d => d.x)
              .attr('cy', d => d.y);
        });

        parent.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [compWidth, compHeight]])
        .on('zoom', event => chart.attr('transform', event.transform)));

        parent.call(colourbar, {
          colourScale,
          nTicks: 4,
          barWidth,
          barHeight,
          title: "Number of Followers",
          x: compWidth - barWidth - 50,
          y: compHeight - barHeight - 40
        })
  }
  