import React, { useState, useEffect } from 'react';
import Column from './Column';
import TaskForm from './TaskForm';
import { Plus, Loader2 } from 'lucide-react';
import { KanbanData, Task, Comment } from '../types';

const KanbanBoard: React.FC = () => {
  const [data, setData] = useState<KanbanData>({
    tasks: {},
    columns: {},
    columnOrder: []
  });

  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from MySQL API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [columnsRes, tasksRes, commentsRes] = await Promise.all([
          fetch('http://localhost:5000/columns').then(res => res.json()),
          fetch('http://localhost:5000/tasks').then(res => res.json()),
          fetch('http://localhost:5000/comments').then(res => res.json()),
        ]);

        // Process columns
        const newData: KanbanData = {
          tasks: {},
          columns: {},
          columnOrder: []
        };

        columnsRes.forEach(column => {
          newData.columns[column.id] = {
            id: column.id,
            title: column.title,
            taskIds: [],
            order: column.column_order
          };
          newData.columnOrder.push(column.id);
        });

        tasksRes.forEach(task => {
          newData.tasks[task.id] = {
            id: task.id,
            content: task.content,
            assignedTo: task.assigned_to || '',
            dueDate: task.due_date || '',
            comments: commentsRes.filter(c => c.task_id === task.id),
            columnId: task.column_id
          };

          if (newData.columns[task.column_id]) {
            newData.columns[task.column_id].taskIds.push(task.id);
          }
        });

        setData(newData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTask = async (task: { content: string; assignedTo?: string; dueDate?: string; comment?: string }) => {
    if (!task.content.trim()) return;

    try {
        const newTaskId = `task-${Date.now()}`;
        const newTask: Task = {
            id: newTaskId,
            content: task.content,
            assignedTo: task.assignedTo || '',
            dueDate: task.dueDate || '',
            columnId: 'todo',
            comments: []  // ✅ Ensure comments is initialized
        };

        // Send task to database
        await fetch('http://localhost:5000/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        let comments: Comment[] = [];

        // ✅ If a comment is provided, insert it into the database
        if (task.comment && task.comment.trim()) {
            const newComment: Comment = {
                id: `comment-${Date.now()}`,
                taskId: newTaskId,
                text: task.comment,
                createdAt: new Date().toISOString()
            };

            await fetch('http://localhost:5000/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });

            comments.push(newComment);
        }

        // ✅ Update local state
        setData((prevData) => ({
            ...prevData,
            tasks: {
                ...prevData.tasks,
                [newTaskId]: { ...newTask, comments }
            },
            columns: {
                ...prevData.columns,
                todo: {
                    ...prevData.columns.todo,
                    taskIds: [...prevData.columns.todo.taskIds, newTaskId]
                }
            }
        }));

        setIsFormOpen(false);  // ✅ Close popup after adding task
    } catch (err) {
        console.error('Error adding task:', err);
    }
};


const handleAddComment = async (taskId: string, commentText: string) => {
  if (!commentText.trim()) return;

  try {
      const newComment: Comment = {
          id: `comment-${Date.now()}`,
          taskId,
          text: commentText,
          createdAt: new Date().toISOString()
      };

      await fetch('http://localhost:5000/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newComment)
      });

      setData(prevData => ({
          ...prevData,
          tasks: {
              ...prevData.tasks,
              [taskId]: {
                  ...prevData.tasks[taskId],
                  comments: [...prevData.tasks[taskId].comments, newComment] // ✅ Add new comment to UI
              }
          }
      }));
  } catch (err) {
      console.error('Error adding comment:', err);
  }
};



  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`http://localhost:5000/tasks/${taskId}`, { method: 'DELETE' });

      setData(prevData => {
        const updatedTasks = { ...prevData.tasks };
        delete updatedTasks[taskId];

        const updatedColumns = { ...prevData.columns };
        Object.keys(updatedColumns).forEach(columnId => {
          updatedColumns[columnId].taskIds = updatedColumns[columnId].taskIds.filter(id => id !== taskId);
        });

        return { ...prevData, tasks: updatedTasks, columns: updatedColumns };
      });
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleEditTask = (taskId: string) => {
    setSelectedTask(data.tasks[taskId]);
    setIsFormOpen(true);
  };



  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await fetch(`http://localhost:5000/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });

      setData(prevData => ({
        ...prevData,
        tasks: {
          ...prevData.tasks,
          [updatedTask.id]: updatedTask
        }
      }));
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setSelectedTask(null);
      setIsFormOpen(false);
    }
  };



  const handleDragOver = (columnId: string) => {
    setDragOverColumn(columnId);
};

const handleDragStart = (taskId: string) => {
  setDraggedTask(taskId);
};

const handleDrop = async (columnId: string) => {
  if (!draggedTask) return;

  // Get the full task object
  const movedTask = data.tasks[draggedTask];
  if (!movedTask) return;

  try {
      // ✅ Update task in MySQL with all fields
      await fetch(`http://localhost:5000/tasks/${draggedTask}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              content: movedTask.content,
              assigned_to: movedTask.assignedTo || null,
              due_date: movedTask.dueDate || null,
              column_id: columnId
          })
      });

      // ✅ Update UI
      setData(prevData => {
          // Remove task from the old column
          const sourceColumnId = Object.keys(prevData.columns).find(colId =>
              prevData.columns[colId].taskIds.includes(draggedTask)
          );

          if (!sourceColumnId) return prevData;

          const updatedColumns = {
              ...prevData.columns,
              [sourceColumnId]: {
                  ...prevData.columns[sourceColumnId],
                  taskIds: prevData.columns[sourceColumnId].taskIds.filter(id => id !== draggedTask)
              },
              [columnId]: {
                  ...prevData.columns[columnId],
                  taskIds: [...prevData.columns[columnId].taskIds, draggedTask]
              }
          };

          return {
              ...prevData,
              tasks: {
                  ...prevData.tasks,
                  [draggedTask]: {
                      ...movedTask,
                      columnId  // ✅ Ensure UI updates columnId correctly
                  }
              },
              columns: updatedColumns
          };
      });

  } catch (err) {
      console.error('Error updating task:', err);
  } finally {
      setDraggedTask(null);
      setDragOverColumn(null);
  }
};



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
        <p className="text-lg text-gray-700">Loading Kanban board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Data</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 shadow-sm border-b">
        <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
        <button
          onClick={() => {
            setSelectedTask(null);
            setIsFormOpen(true);
          }}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <Plus size={18} className="mr-1" /> Add Task
        </button>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="flex flex-col md:flex-row gap-4 h-full">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

            return (
              <Column 
                key={column.id} 
                column={column} 
                tasks={tasks}
                onEditTask={handleEditTask}
                onAddComment={handleAddComment} 
                onDeleteTask={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragOver={() => handleDragOver(column.id)}  
                onDrop={() => handleDrop(column.id)}
                isDragOver={dragOverColumn === column.id}
              />
            );
          })}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <TaskForm 
            onSubmit={selectedTask ? handleUpdateTask : handleAddTask} 
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
          />
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
