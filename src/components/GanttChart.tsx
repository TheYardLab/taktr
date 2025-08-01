import React, { useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface Task {
  id: number;
  name: string;
  start: string;
  end: string;
  trade?: string;
}

interface GanttChartProps {
  tasks: Task[];
}

function getDateRange(tasks: Task[]) {
  const startDates = tasks.map((t) => new Date(t.start));
  const endDates = tasks.map((t) => new Date(t.end));
  const min = new Date(Math.min(...startDates.map((d) => d.getTime())));
  const max = new Date(Math.max(...endDates.map((d) => d.getTime())));
  return [min, max];
}

function dateDiffInDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

const colorList = [
  "bg-blue-500", "bg-green-500", "bg-red-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
];

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  if (tasks.length === 0) return null;

  const [minDate, maxDate] = getDateRange(tasks);
  const totalDays = Math.max(1, dateDiffInDays(minDate, maxDate));
  const tradeColors = new Map<string, string>();
  let colorIdx = 0;

  // Assign a color to each unique trade for the chart
  tasks.forEach(t => {
    if (t.trade && !tradeColors.has(t.trade)) {
      tradeColors.set(t.trade, colorList[colorIdx % colorList.length]);
      colorIdx += 1;
    }
  });

  const exportPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("gantt-chart.pdf");
  };

  const exportPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "gantt-chart.png";
    link.click();
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    XLSX.writeFile(workbook, "gantt-takt-tasks.xlsx");
  };

  return (
    <div className="mt-8">
      <h3 className="font-bold mb-4">Gantt/Takt Chart View</h3>
      <div className="mb-4 space-x-2">
        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export PDF
        </button>
        <button
          onClick={exportPNG}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export PNG
        </button>
        <button
          onClick={exportExcel}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Export Excel
        </button>
      </div>
      <div ref={chartRef}>
        <div className="overflow-x-auto border p-4 bg-white rounded">
          {/* Timeline header */}
          <div className="flex font-semibold mb-2">
            <div className="w-48"></div>
            {Array.from({ length: totalDays + 1 }).map((_, i) => {
              const date = new Date(minDate);
              date.setDate(minDate.getDate() + i);
              return (
                <div
                  key={i}
                  className="text-xs text-center"
                  style={{ minWidth: 32 }}
                >
                  {date.toISOString().slice(5, 10)}
                </div>
              );
            })}
          </div>
          {/* Tasks */}
          {tasks.map((task) => {
            const start = dateDiffInDays(minDate, new Date(task.start));
            const end = dateDiffInDays(minDate, new Date(task.end));
            const barLen = Math.max(1, end - start + 1);
            const tradeColor = task.trade && tradeColors.get(task.trade) ? tradeColors.get(task.trade) : "bg-gray-400";
            return (
              <div className="flex items-center mb-2" key={task.id}>
                <div className="w-48 truncate text-sm">{task.name}</div>
                <div className="flex-1 flex" style={{ minWidth: (totalDays + 1) * 32 }}>
                  {/* Blank days before start */}
                  {start > 0 && (
                    <div style={{ width: start * 32 }} />
                  )}
                  {/* Bar */}
                  <div
                    className={`h-6 ${tradeColor} rounded text-xs text-white flex items-center justify-center`}
                    style={{ width: barLen * 32, minWidth: 32 }}
                    title={`${task.start} to ${task.end}${task.trade ? ' (' + task.trade + ')' : ''}`}
                  >
                    {task.trade}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex space-x-4 mt-4">
          {Array.from(tradeColors.entries()).map(([trade, color]) => (
            <div key={trade} className="flex items-center space-x-2">
              <span className={`inline-block w-4 h-4 ${color} rounded`}></span>
              <span className="text-xs">{trade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;