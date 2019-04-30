import React, { useEffect } from 'react';
import * as d3 from 'd3';
import './App.css';

type BarChartProps = {
  data: Array<number>
  width: number
  height: number
}

const BarChart: React.FC<BarChartProps> = ({data, height, width}) => {
  useEffect(() => {
    drawChart();
  }, []);

  const drawChart = () => {
    const svg = d3.select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      // .style('margin-left', 100);

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * 70)
      .attr('y', (d, i) => height - 10 * d)
      .attr('width', 65)
      .attr('height', (d, i) => d * 10)
      .attr('fill', 'green');

    svg.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (d, i) => i * 70)
      .attr('y', (d, i) => height - (10 * d) - 3);
  };

  return (
    <div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <div>
      <BarChart data={[12, 5, 6, 6, 9, 10]} width={700} height={500} />
    </div>
  )
}

export default App;
