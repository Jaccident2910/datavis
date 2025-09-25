export const colourbar = (parent, props) => {
  const { 
    colourScale,
    nTicks,
    barWidth,
    barHeight,
    title,
    x,
    y
  } = props;

  // Create legend group to append our legend
  const legendG = parent.append('g')
      .attr('class', 'legend')
      .attr('transform', d => `translate(${x},${y})`);


  // Legend title
  legendG.append('text')
      .attr('class', 'legend-title')
      .attr('y', -10)
      .text(title);

  // Legend labels
  const extent = colourScale.domain();

  
  let axisScale = d3.scaleLinear()
  .domain(colourScale.domain())
  .range([0,barWidth])

  let axisBottom = g => g
    .attr("class", `x-axis`)
    .attr("transform", `translate(${x},${y + barHeight})`)
    .call(d3.axisBottom(axisScale)
      .ticks(barWidth / 80)
      .tickSize(-barHeight))

  const linearGradient = parent.append("linearGradient")
      .attr("id", "linear-gradient");
  
  linearGradient.selectAll("stop")
    .data(colourScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, colour: colourScale(t) })))
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.colour);
  
  parent.append('g')
    .attr("transform", `translate(${x},${y})`)
    .append("rect")
    .attr('transform', `translate(0, 0)`)
	.attr("width", barWidth)
	.attr("height", barHeight)
	.style("fill", "url(#linear-gradient)");
  
  parent.append('g')
    .call(axisBottom);
}
