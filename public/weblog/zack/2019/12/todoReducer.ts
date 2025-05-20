export interface Todo {
  text: string;
  isDone?: boolean;
  focus?: number;
}

export type TodoAction =
  | { type: 'SET_TODO'; todo: Todo }
  | { type: 'SPLIT_TODO'; start: number; end: number }
  | { type: 'MERGE_PREV_TODO' }
  | { type: 'MERGE_NEXT_TODO' };

export type IndexedTodoAction = TodoAction & { index: number };

function mergeTodos(todos: Todo[], idx: number): Todo[] {
  if (idx < 0 || idx >= todos.length - 1) {
    return todos;
  }
  const newTodos = [...todos];
  const firstTodo = newTodos[idx];
  const secondTodo = newTodos[idx + 1];
  newTodos.splice(idx, 2, {
    ...firstTodo,
    text: firstTodo.text + secondTodo.text,
    focus: firstTodo.text.length,
  });
  return newTodos;
}

export function todoReducer(todos: Todo[], action: IndexedTodoAction): Todo[] {
  const idx = action.index;
  switch (action.type) {
    case 'SET_TODO': {
      const newTodos = [...todos];
      newTodos[idx] = action.todo;
      return newTodos;
    }
    case 'SPLIT_TODO': {
      const newTodos = [...todos];
      const prevTodo = newTodos[idx];
      newTodos.splice(
        idx,
        1,
        { ...prevTodo, text: prevTodo.text.substring(0, action.start) },
        { text: prevTodo.text.substring(action.end), isDone: false, focus: 0 },
      );
      return newTodos;
    }
    case 'MERGE_PREV_TODO': {
      return mergeTodos(todos, idx - 1);
    }
    case 'MERGE_NEXT_TODO': {
      return mergeTodos(todos, idx);
    }
    default: {
      return todos;
    }
  }
}
