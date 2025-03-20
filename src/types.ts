export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  taskId?: string;
}

export interface Task {
  id: string;
  content: string;
  assignedTo?: string;
  dueDate?: string;
  comments: Comment[];
  columnId?: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  order?: number;
}

export interface KanbanData {
  tasks: {
    [key: string]: Task;
  };
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
}