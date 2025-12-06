'use client';

import { useReducer, Reducer } from 'react';
import TodoItem from './TodoItem';
import { todoReducer, Todo, IndexedTodoAction } from './todoReducer';

function initTodos(initialTodos: string[]): Todo[] {
  const todos = initialTodos != null ? initialTodos : ['Make a Todo'];
  return todos.map((e) => ({ text: e }));
}

interface Props {
  initialTodos: string[];
}

export default function TodoApp({ initialTodos }: Props) {
  const [todos, dispatch] = useReducer(
    todoReducer,
    initTodos(initialTodos)
  );

  const todoItems = todos.map((todo, idx) => {
    return (
      <TodoItem
        todo={todo}
        key={idx.toString()}
        dispatch={(action) => dispatch({ ...action, index: idx })}
      />
    );
  });

  return (
    <div className="my-4 border border-gray-800 dark:border-gray-300 p-4">
      <h1 className="mt-0 mb-2 text-2xl font-bold">MY TODO LIST</h1>
      <ul className="list-none m-0 p-0">{todoItems}</ul>
    </div>
  );
}
