'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { parseStringPromise } from 'xml2js';
import type { Task } from '@/types/Task';

type FileUploadProps = {
  onTasksLoaded?: (tasks: Task[]) => void;
};

const EditableCell: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return editing ? (
    <td className="border px-2 py-1 bg-yellow-50">
      <input
        className="w-full px-1 py-0.5"
        autoFocus
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(localValue);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setEditing(false);
            onChange(localValue);
          }
        }}
      />
    </td>
  ) : (
    <td
      className="border px-2 py-1 cursor-pointer hover:bg-yellow-100"
      onClick={() => setEditing(true)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setEditing(true);
      }}
    >
      {value}
    </td>
  );
};

const FileUpload: React.FC<FileUploadProps> = ({ onTasksLoaded }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        if (!evt.target?.result) return;

        if (file.name.endsWith('.xlsx')) {
          // Parse XLSX
          const workbook = XLSX.read(evt.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          // Try to standardize the data format for display
          const tasks = json.map((row, i) => ({
            id: String(row.ID || row['Task ID'] || i + 1),
            name: row.Name || row.Task || row['Task Name'] || '',
            startDate: row['Start'] || row['Start Date'] || '',
            endDate: row['Finish'] || row['End Date'] || '',
            location: row.Location || row.Zone || '',
            trade: row.Trade || row['Resource Names'] || '',
            dependencies: row.Predecessors || '',
          }));
          setTasks(tasks);
          if (onTasksLoaded) onTasksLoaded(tasks);
        } else if (file.name.endsWith('.xml')) {
          // Parse XML
          const xmlString = evt.target.result as string;
          const result = await parseStringPromise(xmlString);
          // Find tasks (example for MS Project XML)
          const rawTasks = result?.Project?.Tasks?.[0]?.Task || [];
          const tasks: Task[] = rawTasks
            .filter((t: any) => t.Name?.[0] && t.UID?.[0] !== '0')
            .map((t: any) => ({
              id: t.UID?.[0] || '',
              name: t.Name?.[0] || '',
              startDate: t.Start?.[0]?.split('T')[0] || '',
              endDate: t.Finish?.[0]?.split('T')[0] || '',
              location: t.Location?.[0] || '',
              trade: t.Trade?.[0] || '',
              dependencies: t.PredecessorLink?.map((d: any) => d.PredecessorUID?.[0]).join(', ') || '',
            }));
          setTasks(tasks);
          if (onTasksLoaded) onTasksLoaded(tasks);
        } else {
          setError('Please upload a .xlsx or .xml file.');
        }
      } catch (err) {
        setError('Failed to parse file. Check format.');
        console.error(err);
      }
    };

    if (file.name.endsWith('.xlsx')) {
      reader.readAsBinaryString(file);
    } else if (file.name.endsWith('.xml')) {
      reader.readAsText(file);
    } else {
      setError('Unsupported file type.');
    }
  };

  // Column order for editable table
  const columns: (keyof Task)[] = [
    'id',
    'name',
    'startDate',
    'endDate',
    'location',
    'trade',
    'dependencies',
  ];

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="font-semibold text-lg mb-2">Upload MS Project Schedule (.xml or .xlsx)</h2>
      <input
        type="file"
        accept=".xlsx,.xml"
        onChange={handleFile}
        className="mb-4"
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {tasks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border">
            <thead>
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Start</th>
                <th className="border px-2 py-1">End</th>
                <th className="border px-2 py-1">Location</th>
                <th className="border px-2 py-1">Trade</th>
                <th className="border px-2 py-1">Dependencies</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, rowIdx) => (
                <tr key={task.id}>
                  {columns.map((col) => (
                    <EditableCell
                      key={col}
                      value={task[col] ?? ''}
                      onChange={(newValue) => {
                        const updatedTasks = [...tasks];
                        (updatedTasks[rowIdx] as any)[col] = newValue;
                        setTasks(updatedTasks);
                        if (onTasksLoaded) onTasksLoaded(updatedTasks);
                      }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileUpload;