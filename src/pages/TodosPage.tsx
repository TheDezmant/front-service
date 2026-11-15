import { LogoutOutlined, ReloadOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, List, Result, Segmented, Skeleton, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { Todo, User } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { TodoEditModal } from '../todos/TodoEditModal';
import { TodoForm } from '../todos/TodoForm';
import { TodoItem } from '../todos/TodoItem';
import { useTodos } from '../todos/useTodos';

type Filter = 'all' | 'active' | 'completed';

const FILTERS: Record<Filter, (t: Todo) => boolean> = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

const errorText = (e: unknown): string => (e instanceof Error ? e.message : 'Неизвестная ошибка');

export function TodosPage({ user }: { readonly user: User }) {
  const { logout } = useAuth();
  const { message } = App.useApp();
  const { state, reload, create, update, remove } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<Todo | null>(null);

  const items = useMemo(() => (state.status === 'ready' ? state.items : []), [state]);
  const visible = useMemo(() => items.filter(FILTERS[filter]), [items, filter]);
  const doneCount = items.filter((t) => t.completed).length;

  const showError = (msg: string) => void message.error(msg);

  const handleToggle = async (todo: Todo) => {
    try {
      await update(todo.id, { completed: !todo.completed });
    } catch (e: unknown) {
      showError(errorText(e));
    }
  };

  const handleDelete = async (todo: Todo) => {
    try {
      await remove(todo.id);
      void message.success('Задача удалена');
    } catch (e: unknown) {
      showError(errorText(e));
    }
  };

  const handleCreate = async (input: Parameters<typeof create>[0]) => {
    await create(input);
    void message.success('Задача добавлена');
  };

  const handleSave = async (id: string, input: Parameters<typeof update>[1]) => {
    await update(id, input);
    void message.success('Изменения сохранены');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Typography.Title level={1} className="!m-0 !text-xl">
            Мои задачи
          </Typography.Title>
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-sm text-slate-500" title={user.email}>
              {user.email}
            </span>
            <Button icon={<LogoutOutlined />} onClick={logout}>
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <Card title={<h2 className="m-0 text-base font-semibold">Новая задача</h2>}>
          <TodoForm onCreate={handleCreate} onError={showError} />
        </Card>

        <Card
          title={<h2 className="m-0 text-base font-semibold">Список</h2>}
          extra={
            state.status === 'ready' && (
              <span className="text-sm text-slate-500" aria-live="polite">
                Выполнено {doneCount} из {items.length}
              </span>
            )
          }
        >
          {state.status === 'loading' && <Skeleton active paragraph={{ rows: 4 }} />}

          {state.status === 'error' && (
            <Result
              status="error"
              title="Не удалось загрузить задачи"
              subTitle={state.error}
              extra={
                <Button icon={<ReloadOutlined />} onClick={() => void reload()}>
                  Повторить
                </Button>
              }
            />
          )}

          {state.status === 'ready' && (
            <>
              <Segmented<Filter>
                className="!mb-2"
                value={filter}
                onChange={setFilter}
                options={[
                  { label: 'Все', value: 'all' },
                  { label: 'Активные', value: 'active' },
                  { label: 'Выполненные', value: 'completed' },
                ]}
                aria-label="Фильтр задач"
              />
              <List
                dataSource={visible}
                rowKey="id"
                locale={{
                  emptyText: (
                    <Empty description={items.length === 0 ? 'Задач пока нет — добавьте первую' : 'Нет задач в этом фильтре'} />
                  ),
                }}
                renderItem={(todo) => (
                  <TodoItem todo={todo} onToggle={handleToggle} onEdit={setEditing} onDelete={handleDelete} />
                )}
              />
            </>
          )}
        </Card>
      </main>

      <TodoEditModal todo={editing} onSave={handleSave} onClose={() => setEditing(null)} onError={showError} />
    </div>
  );
}
