import React from "react";
import * as XLSX from "xlsx";

export interface Task {
  id: number;
  name: string;
  start: string;
  end: string;
}

interface EditableTableProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({ tasks, setTasks }) => {
  const handleChange = (id: number, field: keyof Task, value: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, [field]: value } : task
    );
    setTasks(updatedTasks);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    XLSX.writeFile(workbook, "takt-table-tasks.xlsx");
  };

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={exportExcel}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 mb-2"
        >
          Export Excel
        </button>
      </div>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">ID</th>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Start</th>
            <th className="border border-gray-300 p-2">End</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="border border-gray-300 p-2">{task.id}</td>
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  value={task.name}
                  onChange={(e) => handleChange(task.id, "name", e.target.value)}
                  className="w-full"
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="date"
                  value={task.start}
                  onChange={(e) => handleChange(task.id, "start", e.target.value)}
                  className="w-full"
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="date"
                  value={task.end}
                  onChange={(e) => handleChange(task.id, "end", e.target.value)}
                  className="w-full"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditableTable;