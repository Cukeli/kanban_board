import React from 'react';
import TaskCard from './TaskCard';
import { Column as ColumnType, Task } from '../types';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onDragStart: (taskId: string) => void;
  onDragOver: () => void;
  onDrop: () => void;
  isDragOver: boolean;
  onEditTask: (taskId: string) => void;
  onAddComment: (taskId: string, comment: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ 
  column, 
  tasks, 
  onDragStart, 
  onDragOver, 
  onDrop,
  isDragOver,
  onEditTask,
  onAddComment,
  onDeleteTask
}) => {
  // Map column IDs to colors
  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return 'bg-blue-50 border-blue-200';
      case 'inProgress':
        return 'bg-yellow-50 border-yellow-200';
      case 'done':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Map column IDs to header colors
  const getHeaderColor = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return 'bg-blue-100 text-blue-800';
      case 'inProgress':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={`w-full md:w-80 h-full rounded-md ${getColumnColor(column.id)} border p-2 flex flex-col`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <div className={`p-2 mb-2 rounded-md font-medium ${getHeaderColor(column.id)}`}>
        <h2 className="text-center">{column.title}</h2>
      </div>
      <div className={`flex-1 overflow-y-auto ${isDragOver ? 'bg-gray-100 bg-opacity-50' : ''}`}>
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={() => onDragStart(task.id)}
            onEdit={() => onEditTask(task.id)}
            onAddComment={(comment) => onAddComment(task.id, comment)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;