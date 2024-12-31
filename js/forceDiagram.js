let simulation = d3.forceSimulation()

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
    } = props
    
    
    
    
    
    
        let winnerNodes = fullData.winnerNodes
        let winnerLinks = fullData.winnerLinks
        
        const compHeight = parent.node().getBoundingClientRect().height
        const compWidth = parent.node().getBoundingClientRect().width
    
        //console.log(compHeight)
        //console.log(compWidth)
    
        //console.log(winnerNodes)
        //console.log(winnerLinks)
    
        
    
    
        const chart = parent.selectAll('g').data([null])
        .join('g')
        
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
      
        const mouseoverNode = (event) => {
          setSelectedNode(event.target.id)
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
        setSelectedNode(null)
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
            if(d.source.id == getSelectedNode() || d.target.id == getSelectedNode()) {return(1)}
            else {return(0.1)}
        })
        .attr('stroke', d=> {
            if(d.source.id == getSelectedNode() || d.target.id == getSelectedNode()) {return('#0F0')}
            else {return('#000')}
        })
    
    
        // Append nodes
        const nodes = chart.selectAll('circle').data(winnerNodes, d=> d.id)
            .join('circle')
              .attr('r', 3)
              .attr('fill', d => 'red')
              .attr('stroke', d=> {
                if(d.id == getSelectedNode()) {return('white')}
                else {return('None')}
            })
              .attr('id', d=>{
                //console.log(d)
                return(d.id)})
              .on('mouseover', mouseoverNode)
              .on('mouseout', mouseoutNode)
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
    /* */
    
    }
    
export function updateForceDiagram(parent, props) {

  //console.log(parent)
  const {fullData, 
    getSelectedNode,
    setSelectedNode,
  } = props

  let winnerNodes = fullData.winnerNodes
        let winnerLinks = fullData.winnerLinks
        
        const compHeight = parent.node().getBoundingClientRect().height
        const compWidth = parent.node().getBoundingClientRect().width
  const chart = parent.selectAll('g').data([null])
        .join('g')


       
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
            if(d.source.id == getSelectedNode() || d.target.id == getSelectedNode()) {return(1)}
            else {return(0.1)}
        })
        .attr('stroke', d=> {
            if(d.source.id == getSelectedNode() || d.target.id == getSelectedNode()) {return('#0F0')}
            else {return('#000')}
        })
    
    
        // Append nodes
        const nodes = chart.selectAll('circle').data(winnerNodes, d=> d.id)
            .join('circle')
              .attr('stroke', d=> {
                if(d.id == getSelectedNode()) {return('white')}
                else {return('None')}
            })

}



export function restartForceDiagram(parent, props) {

    console.log("restarting..")
    //console.log(parent)
    const {fullData, 
      getSelectedNode,
      setSelectedNode,
    } = props
  
    let winnerNodes = fullData.winnerNodes
          let winnerLinks = fullData.winnerLinks
          
          const compHeight = parent.node().getBoundingClientRect().height
          const compWidth = parent.node().getBoundingClientRect().width
          parent.selectAll('g').remove()
          parent.selectAll('line').remove()
          parent.selectAll('circle').remove()
          const chart = parent.selectAll('g').data([null])
          .join('g')
  
          simulation = null
          simulation = d3.forceSimulation()
          simulation
          .force('link',   d3.forceLink().id(d => d.id))
          .force('charge', d3.forceManyBody().strength(-70))
          .force('center', d3.forceCenter(compWidth/2, compHeight/2).strength(1));

        simulation.nodes(winnerNodes);
        simulation.force('link').links(winnerLinks);
          
          const mouseoverNode = (event) => {
              setSelectedNode(event.target.id)
          }
          
          const mouseoutNode = (event) => {
              setSelectedNode(null)
          }
      
    const links = chart.selectAll('line').data(winnerLinks, d=> d.source.id + "-" + d.target.id)
        .join('line')
        .attr('opacity', d=> {
            if(d.source.id == getSelectedNode() || d.target.id == getSelectedNode()) {return(1)}
            else {return(0.1)}
        })
        .attr('stroke', d=> {
            if(d.source.id == getSelectedNode() || d.target.id == getSelectedNode()) {return('#0F0')}
            else {return('#000')}
        })
      
      
          // Append nodes
          const nodes = chart.selectAll('circle').data(winnerNodes, d=> d.id)
            .join('circle')
              .attr('r', 3)
              .attr('fill', d => 'red')
              .attr('stroke', d=> {
                if(d.id == getSelectedNode()) {return('white')}
                else {return('None')}
            })
              .attr('id', d=>{
                //console.log(d)
                return(d.id)})
              .on('mouseover', mouseoverNode)
              .on('mouseout', mouseoutNode)
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
  }
  