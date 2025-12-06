'use client';

import { useEffect, useRef, Dispatch } from 'react';
import { Todo, TodoAction } from './todoReducer';

function todoItemOnKeyDown(
  dispatch: (action: TodoAction) => void,
): React.KeyboardEventHandler<HTMLInputElement> {
  return (e) => {
    if (e.key === 'Enter') {
      dispatch({
        type: 'SPLIT_TODO',
        start: e.currentTarget.selectionStart ?? 0,
        end: e.currentTarget.selectionEnd ?? 0,
      });
    } else if (
      e.key === 'Backspace' &&
      e.currentTarget.selectionStart === 0 &&
      e.currentTarget.selectionEnd === 0
    ) {
      e.preventDefault();
      dispatch({
        type: 'MERGE_PREV_TODO',
      });
    } else if (
      e.key === 'Delete' &&
      e.currentTarget.selectionStart === e.currentTarget.value.length &&
      e.currentTarget.selectionEnd === e.currentTarget.value.length
    ) {
      e.preventDefault();
      dispatch({
        type: 'MERGE_NEXT_TODO',
      });
    }
  };
}

interface Props {
  todo: Todo;
  dispatch: Dispatch<TodoAction>;
}

export default function TodoItem({ todo, dispatch }: Props) {
  const textInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (todo.focus != null && textInput.current != null) {
      textInput.current.focus();
      textInput.current.setSelectionRange(todo.focus, todo.focus);
      dispatch({
        type: 'SET_TODO',
        todo: { ...todo, focus: undefined },
      });
    }
  }, [todo, dispatch]);

  return (
    <li className="mb-1">
      <label className="inline-flex items-center cursor-pointer relative align-middle">
        <input
          type="checkbox"
          checked={todo.isDone ?? false}
          onChange={(e) =>
            dispatch({
              type: 'SET_TODO',
              todo: { ...todo, isDone: e.target.checked },
            })
          }
          className="h-6 w-6 appearance-none border border-gray-800 dark:border-gray-300 rounded cursor-pointer transition-all duration-300 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-300 checked:after:content-['✓'] checked:after:block checked:after:text-center checked:after:text-gray-800 dark:checked:after:text-gray-300 checked:after:absolute checked:after:left-1.5 checked:after:-top-0.5 checked:after:text-lg"
        />
      </label>
      <input
        type="text"
        ref={textInput}
        value={todo.text}
        onKeyDown={todoItemOnKeyDown(dispatch)}
        onChange={(e) =>
          dispatch({
            type: 'SET_TODO',
            todo: { ...todo, text: e.target.value },
          })
        }
        className={`border-none bg-transparent text-2xl outline-none w-4/5 align-middle ml-2 px-1 py-0.5 border focus:border-gray-800 dark:focus:border-gray-300 ${
          todo.isDone ? 'line-through' : ''
        }`}
      />
    </li>
  );
}
