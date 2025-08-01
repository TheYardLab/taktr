import React, { useState } from 'react';
import EditableTable from '../components/EditableTable';
import GanttChart from '../components/GanttChart';

export interface Task {
  id: number;
  name: string;
  start: string;
  end: string;
  trade?: string;
}

const initialTasks: Task[] = [
  {
    id: 1,
    name: "Task 1",
    start: "2024-08-01",
    end: "2024-08-03",
    trade: "Carpenter"
  },
  {
    id: 2,
    name: "Task 2",
    start: "2024-08-04",
    end: "2024-08-07",
    trade: "Electrician"
  }
];

const HomePage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Takt Planner</h1>
      <EditableTable tasks={tasks} setTasks={setTasks} />
      <GanttChart tasks={tasks} />
    </div>
  );
};

export default HomePage;