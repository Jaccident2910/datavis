import { colourbar } from "./colourbar.js"

let simulation = d3.forceSimulation()

let nodeSize = 0.04
const tooltipPadding = 15;
const minimumNodeSize = 2

let barWidth = 300
    let barHeight = 40

function drag(simulation) {    
  function dragstarted(event) {
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


// The three functions below execute in different contexts and require slightly different handling of the data
// However, they do basically do the same thing
// If I had time to refactor the code, this would be the main priority.

export function initForceDiagram(parent, props) {

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
        
        // Compute dimensions of screen
        const compHeight = parent.node().getBoundingClientRect().height
        const compWidth = parent.node().getBoundingClientRect().width

        let maxNodeSize = winnerNodes.map(d=> d.inGraphFollowsNum + d.outGraphFollows).reduce((a, b) => Math.max(a, b), -Infinity);
        nodeSize = 36/ Math.sqrt(maxNodeSize)
    
        const chart = parent.selectAll('mainChart').data([null])
        .join('g')
        .attr('class', 'mainChart')
        
        // Set up simulation
        simulation
        .force('link',   d3.forceLink().id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-70))
        .force('center', d3.forceCenter(compWidth/2, compHeight/2).strength(1));
    
        simulation.nodes(winnerNodes);
        simulation.force('link').links(winnerLinks);

        // Set up event listeners
        const clickNode = (event) => {
          setSelectedNode(event.target.id)
        }
        const mouseoverNode = (event) => {
          let currentHover = getHoveredNode()
            if(currentHover != event.target.id) {
                setHoveredNode(event.target.id)
            }
            d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + tooltipPadding) + 'px')   
            .style('top', (event.pageY + tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title"> User: ${event.target.id}</div>
              `);
      }
      
      const mouseoutNode = (event) => {
        setHoveredNode(null)
        d3.select('#tooltip').style('display', 'none');
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
                if(d.id == getHoveredNode()) { return('white') }
                if (d.id == getSelectedNode() && getSelectedNode() != null) {return('aqua')}
                else {return('black')}
            })
              .attr('id', d=>{
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

        // Z O O M 
        parent.call(d3.zoom()
        .scaleExtent([0, 8])
        .translateExtent([[0, 0], [compWidth, compHeight]])
        .on('zoom', event => chart.attr('transform', event.transform)));
    
    // Add legend
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

  const {fullData, 
    getSelectedNode,
    setSelectedNode,
    getHoveredNode,
    setHoveredNode,
    winnerBool,
    colourScale,
    colourValue
  } = props

  // Get the nodes and links from the data
  let winnerNodes = fullData.winnerNodes
  let winnerLinks = fullData.winnerLinks
        
  // Compute dimensions of SVG
  const compHeight = parent.node().getBoundingClientRect().height
  const compWidth = parent.node().getBoundingClientRect().width
  const chart = parent.selectAll('.mainChart').data([null])
        .join('g')
        .attr('class', 'mainChart')

  // Adding more event listeners just slows down the program unnecessarily - none added here

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
              .attr('stroke', d=> {
                if(d.id == getHoveredNode()) { return('white') }
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

    const {fullData, 
      getSelectedNode,
      setSelectedNode,
      getHoveredNode,
      setHoveredNode,
      winnerBool,
      colourScale,
      colourValue
    } = props
  

    // Get nodes and links from data
    let winnerNodes = fullData.winnerNodes
    let winnerLinks = fullData.winnerLinks


    // Get computed height of parent SVG      
    const compHeight = parent.node().getBoundingClientRect().height
    const compWidth = parent.node().getBoundingClientRect().width

      let maxNodeSize = winnerNodes.map(d=> d.inGraphFollowsNum + d.outGraphFollows).reduce((a, b) => Math.max(a, b), -Infinity);
      nodeSize = 36/ Math.sqrt(maxNodeSize)

      // Delete everything from the SVG and start everything again
      parent.selectAll('g').remove()
      parent.selectAll('line').remove()
      parent.selectAll('circle').remove()


      const chart = parent.selectAll('.mainChart').data([null])
      .join('g')
      .attr('class', 'mainChart')

      // Restart simulation and pray that JavaScript's garbage collector does its job.
      simulation = null
      simulation = d3.forceSimulation()
      // Set up new simulation
      simulation
      .force('link',   d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-70))
      .force('center', d3.forceCenter(compWidth/2, compHeight/2).strength(1));

      simulation.nodes(winnerNodes);
      simulation.force('link').links(winnerLinks);
      
      // event listeners need to be created again.
      // Possible performance hit if the original listeners are also still running.
      const mouseoverNode = (event) => {
        let currentHover = getHoveredNode()
        if(currentHover != event.target.id) {
            setHoveredNode(event.target.id)
        }
        d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + tooltipPadding) + 'px')   
        .style('top', (event.pageY + tooltipPadding) + 'px')
        .html(`
          <div class="tooltip-title"> User: ${event.target.id}</div>
        `);
      }
      
      const mouseoutNode = (event) => {
          setHoveredNode(null)
          d3.select('#tooltip').style('display', 'none');
      }

      const clickNode = (event) => {
        setSelectedNode(event.target.id)
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
          if(d.id == getHoveredNode()) {return('white')}
          if (d.id == getSelectedNode() && getSelectedNode() != null) {return('aqua')}
          else {return('black')}
      })
        .attr('id', d=>{
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

        // Zoom
        parent.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [compWidth, compHeight]])
        .on('zoom', event => chart.attr('transform', event.transform)));


        // Append legend.
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
  