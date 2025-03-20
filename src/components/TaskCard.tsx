import React, { useState } from 'react';
import { GripVertical, Calendar, User, MessageSquare, Edit, Send, Trash2 } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
  onEdit: () => void;
  onAddComment: (comment: string) => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onEdit, onAddComment, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="mb-2 bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden"
    >
      <div 
        className="p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="cursor-grab" onClick={(e) => e.stopPropagation()}>
            <GripVertical size={16} className="text-gray-400" />
          </div>
          <p className="font-medium flex-1">{task.content}</p>
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <Edit size={14} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this task?')) {
                  onDelete();
                }
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{task.assignedTo}</span>
            </div>
          )}
          
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          
          {(task.comments?.length ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={12} />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
      </div>
      
      {isExpanded && (task.comments?.length ?? 0) > 0 && (
        <div className="px-3 pb-2 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 mt-2 mb-1">Comments</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {(task.comments ?? []).map(comment => (
              <div key={comment.id} className="text-sm bg-gray-50 p-2 rounded">
                <p className="text-gray-800">{comment.text}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDateTime(comment.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isExpanded && (
        <div className="px-3 pb-3 pt-1">
          <form onSubmit={handleAddComment} className="flex gap-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add comment..."
              className="flex-1 text-sm p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700"
              disabled={!newComment.trim()}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskCard;