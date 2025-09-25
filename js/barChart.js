const tooltipPadding = 15;

function getActiveUserFromData(d, activeUser) {
  // This function is a mess as the followers and following data are slightly different.
  if (d.label == "Followers") {
  
  let keysArr = Object.keys(d).map((key) => [key, d[key]]);
  // Find correct user in array
  let [foundKey, foundObj] = keysArr.find((item) => { 
    //Messiness that comes from the object conversion turning the key and other data into array items
    if(typeof item[1] != 'object') { 
      return(false)
    }
    else if (!("id" in item[1])) {
      return(false)
    }
    else {
      return(item[1].id == activeUser )
    }})
  return(foundObj)
  }


  else if (d.label == "Following") {
  // This is significantly less complicated.
  return(d[+activeUser])
  }}



export default function barChart(parent, props) {
    const {
        fullData,
        getSelectedNode,
      setSelectedNode,
      getHoveredNode,
      setHoveredNode,
      winnerBool,
      margin,
      height,
      width
    } = props
    const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
    const xTickLabels = 5

    let activeUser = getSelectedNode()
     // Create an array, data, where data[0] contains the main data
     // and data[1] contains the following data
    let activeUserData = fullData.winnerNodes.find(d=> d.id == activeUser)
    const data = [fullData.winnerNodes]
    if(winnerBool) {
        data.push(fullData.winnerFollows)
    }
    else {
        data.push(fullData.earlybirdFollows)
    }

   
    // Labelling each part is useful
    data[0].label = "Followers"
    data[1].label = "Following"


    // Even JavaScript has its limits, I guess
    // Check if an array has a given item
    const safeArrayMembershipTest = (d) => {
      if ( Array.isArray(d)) {
        return(d.filter((d) => {return(d.id == activeUser)}).length >= 1)
      }
      else {
        return(false)
      }
    }

    const xValue = d => {return(d.label)}

    const yValue = (d) => {
      if (activeUser in d || safeArrayMembershipTest(d)) {
        activeUserData = getActiveUserFromData(d, activeUser)
        return([activeUserData.inGraphFollowsNum, activeUserData.outGraphFollows])}
        else {
          console.log("An error occured: User not in data set?")
          return(0)
        }
    }


    const chart = parent.selectAll('.barchart').data([null]);
  const chartEnter = chart
    .enter().append('g')
      .attr('class','barchart')

    // This is mostly just from the course materials

  // Initialise scales
  const xScale = d3.scaleBand()
    .domain(data.map(xValue))
    .range([0, innerWidth])
    .paddingInner(0.2)
    .paddingOuter(0.1);
    

  const yScale = d3.scaleLinear()
    .domain([0, Math.max((
      yValue(data[0])[0] + yValue(data[0])[1]), 
      yValue(data[1])[0] + yValue(data[1])[1])
    ])
    .range([innerHeight, 0])
    .nice()


  // Initialise axes
  const xAxis = d3.axisBottom(xScale)
    .ticks(xTickLabels)
    .tickSizeOuter(10)
    .tickPadding(5);
    
  const yAxis = d3.axisLeft(yScale)
    .ticks(6)
    .tickSizeOuter(10)
    .tickPadding(10);

  // Append empty x-axis group and move it to the bottom of the chart
  const xAxisG = chartEnter
    .append('g')
      .attr('class','axis x-axis')
      .attr('transform', `translate(0,${innerHeight})`);
  xAxisG.call(xAxis);

  // Append y-axis group
  const yAxisG = chartEnter
    .append('g')
      .attr('class','axis y-axis');
  yAxisG.call(yAxis);

  // Append y-axis title
  yAxisG
    .append('text')
      .attr('class', 'axis-title')
      .attr('x', 25)
      .attr('y', -25)
      .text("User: " + activeUser);

    // Mouse over and mouse leave events (tooltips)

    const mouseoverBar = (event) => {
      let followersData = getActiveUserFromData(data[0], activeUser)
      let followingData = getActiveUserFromData(data[1], activeUser)

      d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + tooltipPadding) + 'px')   
        .style('top', (event.pageY + tooltipPadding) + 'px')
        .html(`
          <div class="tooltip-title"> User: ${activeUser}</div>
          <ul>
            <li>Followers in shown graph: ${followersData.inGraphFollowsNum}</li>
            <li>Followers outside of shown graph: ${followersData.outGraphFollows}</li>
            <li>People they follow in shown graph: ${followingData.inGraphFollowsNum}</li>
            <li>People they follow outside of shown graph: ${followingData.outGraphFollows}</li>
            <li>Total likes on their account: ${followersData.totalLikes}</li>
          </ul>
        `);
    }

    const mouseleaveBar = (event) => {
      d3.select('#tooltip').style('display', 'none');
    }

    
  // Plot data
  const bars = chartEnter.merge(chart)
    .selectAll('.bar').data(data);
  const barsEnter = bars
    .enter()
    barsEnter.append('rect')
      .attr('class', 'bar1')
      .attr('x', d => xScale(xValue(d)))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(yValue(d)[0]))
      .attr('y', d => yScale(yValue(d)[0]))
    // Stacked bars!!
    barsEnter.append('rect')
      .attr('class', 'bar2')
      .attr('x', d => xScale(xValue(d)))
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(yValue(d)[0]) - yScale(yValue(d)[1]))
      .attr('y', d => yScale(yValue(d)[1]))

      
    parent.on('mouseover', mouseoverBar)
    .on('mouseleave', mouseleaveBar)


  // Add legend:
    const font_size = 10
    const legendMargin = {
      y1: 5,
      x: 2,
      y2: 30
    }
    const height_adjust = 7.5

  let legend = parent.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(${width-1}, ${height/2 - 20})`)
  
  legend.append('rect')
  .attr('class', 'bar1')
  .attr('x', 5)
  .attr('y', 5)
  .attr('width', 10)
  .attr('height', 10)

  legend.append('text')
  .attr('transform', `translate(${legendMargin.x + 15}, ${legendMargin.y1 - font_size/2 +height_adjust})`)
  .text("Followers within")
  .attr('font-size', `${font_size}`)
  legend.append('text')
  .attr('transform', `translate(${legendMargin.x + 15}, ${legendMargin.y1 + font_size/2 +height_adjust})`)
  .text("displayed graph")
  .attr('font-size', `${font_size}`)

  legend.append('rect')
  .attr('class', 'bar2')
  .attr('x', 5)
  .attr('y', legendMargin.y2)
  .attr('width', 10)
  .attr('height', 10)

  legend.append('text')

  .attr('transform', `translate(${legendMargin.x + 15}, ${legendMargin.y2 - font_size/2 + height_adjust})`)
  .text("Followers outside")
  .attr('font-size', `${font_size}`)
  legend.append('text')
  .attr('transform', `translate(${legendMargin.x + 15}, ${legendMargin.y2 + font_size/2 + height_adjust})`)
  .text("displayed graph")
  .attr('font-size', `${font_size}`)

    
}