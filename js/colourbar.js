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

  // Legend rectangle
  const legendRect = legendG.append('rect')
      .attr('width',  barWidth)
      .attr('height', barHeight);

  // Legend title
  legendG.append('text')
      .attr('class', 'legend-title')
      .attr('y', -10)
      .text(title);

  // Legend labels
  const extent = colourScale.domain();
  const ticks = Array.from(Array(nTicks).keys())
    .map( d => (extent[0] + (extent[1]-extent[0])*d/(nTicks-1)) );
  legendG.selectAll('.legend-label').data(ticks)
    .enter().append('text')
      .attr('class', 'legend-label')
      .attr('text-anchor', 'middle')
      .attr('y', 27.5 + barHeight)
      .attr('x', (d,i) => Math.round(barWidth*i/(nTicks-1)))
      .text(d => Math.round((Math.round(d*10000))/10000));
  
  const legendStops = [
    { color: colourScale(extent[0]), value: extent[0], offset: 0},
    { color: colourScale(extent[1]), value: extent[1], offset: 100},
  ]; 

  // Linear gradient to be used for the legend
  const linearGradient = parent.append('linearGradient')
    .attr("id", "legend-gradient");

  // Update gradient for legend
  linearGradient.selectAll('stop').data(legendStops)
    .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

  // Apply gradient to rectangle
  legendRect.attr('fill', 'url(#legend-gradient)');
}
