import React from 'react';
import { Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';

interface LineChartComponentProps {
  data: any;
  options: any;
  chartId: string;
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data, options, chartId }) => {
  const exportToImage = () => {
    const element = document.getElementById(chartId);
    if (element) {
      html2canvas(element).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'line-chart.png';
        link.click();
      });
    }
  };

  return (
    <div>
      <div id={chartId}>
        <Line data={data} options={options} />
      </div>
      <button onClick={exportToImage} className="mt-4 p-2 bg-green-500 text-white rounded">Export Line Chart</button>
    </div>
  );
};

export default LineChartComponent;