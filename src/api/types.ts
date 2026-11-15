export interface User {
  readonly id: string;
  readonly email: string;
  readonly createdAt: string;
}

export interface AuthResponse {
  readonly token: string;
  readonly user: User;
}

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TodoPage {
  readonly items: readonly Todo[];
  /** null — больше задач нет. */
  readonly nextCursor: string | null;
}

export interface CreateTodoInput {
  readonly title: string;
  readonly description?: string;
}

export type UpdateTodoInput = Partial<Pick<Todo, 'title' | 'description' | 'completed'>>;
