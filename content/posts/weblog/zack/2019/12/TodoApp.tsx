import React, { useReducer, Reducer } from 'react';
import { css } from '@emotion/core';
import TodoItem from './TodoItem';
import { todoReducer, Todo, IndexedTodoAction } from './todoReducer';

function initTodos(initialTodos: string[]): Todo[] {
  const todos = initialTodos != null ? initialTodos : ['Make a Todo'];
  return todos.map((e) => ({ text: e }));
}

const todoAppCss = css`
  margin: 1rem;
  border: 1px solid black;
  padding: 1rem;

  h1 {
    margin: 0;
  }
  ul {
    list-style-type: none;
    margin: 0;
    li {
      margin-bottom: 0;
    }
  }
`;

interface Props {
  initialTodos: string[];
}

const TodoApp: React.FC<Props> = ({ initialTodos }) => {
  const [todos, dispatch] = useReducer<
    Reducer<Todo[], IndexedTodoAction>,
    string[]
  >(todoReducer, initialTodos, initTodos);
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
    <div css={todoAppCss}>
      <h1>MY TODO LIST</h1>
      <ul>{todoItems}</ul>
    </div>
  );
};

export default TodoApp;
