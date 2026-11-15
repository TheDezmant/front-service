import { request } from './http';
import type { CreateTodoInput, Todo, TodoPage, UpdateTodoInput } from './types';

export const PAGE_SIZE = 20;

const path = (id: string): string => `/api/todos/${encodeURIComponent(id)}`;

export const todosApi = {
  list: (cursor?: string) => {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor) query.set('cursor', cursor);
    return request<TodoPage>('GET', `/api/todos?${query.toString()}`);
  },
  create: (data: CreateTodoInput) => request<Todo>('POST', '/api/todos', data),
  update: (id: string, data: UpdateTodoInput) => request<Todo>('PATCH', path(id), data),
  remove: (id: string) => request<void>('DELETE', path(id)),
};
