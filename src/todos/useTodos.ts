import { useCallback, useEffect, useState } from 'react';
import { todosApi } from '../api/todos';
import type { CreateTodoInput, Todo, UpdateTodoInput } from '../api/types';

export type TodosState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: string }
  | { readonly status: 'ready'; readonly items: readonly Todo[] };

const errorText = (e: unknown): string => (e instanceof Error ? e.message : 'Неизвестная ошибка');

/** Состояние списка задач и операции CRUD поверх реального API. */
export function useTodos() {
  const [state, setState] = useState<TodosState>({ status: 'loading' });

  const fetchList = useCallback(
    (isActive: () => boolean): Promise<void> =>
      todosApi.list().then(
        (items) => {
          if (isActive()) setState({ status: 'ready', items });
        },
        (e: unknown) => {
          if (isActive()) setState({ status: 'error', error: errorText(e) });
        },
      ),
    [],
  );

  useEffect(() => {
    let active = true;
    void fetchList(() => active);
    return () => {
      active = false;
    };
  }, [fetchList]);

  const reload = useCallback(async () => {
    setState({ status: 'loading' });
    await fetchList(() => true);
  }, [fetchList]);

  const mutate = (fn: (items: readonly Todo[]) => readonly Todo[]): void =>
    setState((s) => (s.status === 'ready' ? { status: 'ready', items: fn(s.items) } : s));

  const create = useCallback(async (input: CreateTodoInput) => {
    const todo = await todosApi.create(input);
    mutate((items) => [todo, ...items]);
  }, []);

  const update = useCallback(async (id: string, input: UpdateTodoInput) => {
    const todo = await todosApi.update(id, input);
    mutate((items) => items.map((t) => (t.id === id ? todo : t)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await todosApi.remove(id);
    mutate((items) => items.filter((t) => t.id !== id));
  }, []);

  return { state, reload, create, update, remove };
}
