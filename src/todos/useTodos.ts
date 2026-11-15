import { useCallback, useEffect, useRef, useState } from 'react';
import { todosApi } from '../api/todos';
import type { CreateTodoInput, Todo, UpdateTodoInput } from '../api/types';

export type TodosState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: string }
  | {
      readonly status: 'ready';
      readonly items: readonly Todo[];
      /** Курсор следующей страницы; null — всё загружено. */
      readonly nextCursor: string | null;
      readonly loadingMore: boolean;
    };

type Ready = Extract<TodosState, { status: 'ready' }>;

const errorText = (e: unknown): string => (e instanceof Error ? e.message : 'Неизвестная ошибка');

/** Состояние списка задач (постранично, по курсору) и операции CRUD поверх реального API. */
export function useTodos() {
  const [state, setState] = useState<TodosState>({ status: 'loading' });
  // Синхронная защита от повторного запроса той же страницы (двойной клик до перерисовки).
  const loadingMoreRef = useRef(false);

  const fetchFirstPage = useCallback(
    (isActive: () => boolean): Promise<void> =>
      todosApi.list().then(
        (page) => {
          if (isActive()) setState({ status: 'ready', items: page.items, nextCursor: page.nextCursor, loadingMore: false });
        },
        (e: unknown) => {
          if (isActive()) setState({ status: 'error', error: errorText(e) });
        },
      ),
    [],
  );

  useEffect(() => {
    let active = true;
    void fetchFirstPage(() => active);
    return () => {
      active = false;
    };
  }, [fetchFirstPage]);

  const reload = useCallback(async () => {
    setState({ status: 'loading' });
    await fetchFirstPage(() => true);
  }, [fetchFirstPage]);

  const patchReady = (fn: (s: Ready) => Ready): void => setState((s) => (s.status === 'ready' ? fn(s) : s));

  /** Догружает следующую страницу. Ошибку пробрасывает вызывающему — уже загруженный список не теряется. */
  const loadMore = useCallback(async () => {
    if (state.status !== 'ready' || !state.nextCursor || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    patchReady((s) => ({ ...s, loadingMore: true }));
    try {
      const page = await todosApi.list(state.nextCursor);
      patchReady((s) => {
        const known = new Set(s.items.map((t) => t.id));
        return {
          ...s,
          items: [...s.items, ...page.items.filter((t) => !known.has(t.id))],
          nextCursor: page.nextCursor,
          loadingMore: false,
        };
      });
    } catch (e: unknown) {
      patchReady((s) => ({ ...s, loadingMore: false }));
      throw e;
    } finally {
      loadingMoreRef.current = false;
    }
  }, [state]);

  const create = useCallback(async (input: CreateTodoInput) => {
    const todo = await todosApi.create(input);
    // Новая задача — самая свежая, её место наверху; курсор следующей страницы не меняется.
    patchReady((s) => ({ ...s, items: [todo, ...s.items] }));
  }, []);

  const update = useCallback(async (id: string, input: UpdateTodoInput) => {
    const todo = await todosApi.update(id, input);
    patchReady((s) => ({ ...s, items: s.items.map((t) => (t.id === id ? todo : t)) }));
  }, []);

  const remove = useCallback(async (id: string) => {
    await todosApi.remove(id);
    // Курсор хранит значения (createdAt, id), а не ссылку на запись, поэтому остаётся валидным и после удаления.
    patchReady((s) => ({ ...s, items: s.items.filter((t) => t.id !== id) }));
  }, []);

  return { state, reload, loadMore, create, update, remove };
}
