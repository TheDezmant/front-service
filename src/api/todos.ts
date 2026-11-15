import { request } from './http';
import type { CreateTodoInput, Todo, UpdateTodoInput } from './types';

const path = (id: string): string => `/api/todos/${encodeURIComponent(id)}`;

export const todosApi = {
  list: () => request<Todo[]>('GET', '/api/todos'),
  create: (data: CreateTodoInput) => request<Todo>('POST', '/api/todos', data),
  update: (id: string, data: UpdateTodoInput) => request<Todo>('PATCH', path(id), data),
  remove: (id: string) => request<void>('DELETE', path(id)),
};
