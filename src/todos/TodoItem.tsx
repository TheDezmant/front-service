import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Checkbox, List, Popconfirm, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import type { Todo } from '../api/types';

interface Props {
  readonly todo: Todo;
  readonly onToggle: (todo: Todo) => Promise<void>;
  readonly onEdit: (todo: Todo) => void;
  readonly onDelete: (todo: Todo) => Promise<void>;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: Props) {
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const created = dayjs(todo.createdAt);

  return (
    <List.Item
      className="!px-0"
      actions={[
        <Tooltip title="Редактировать" key="edit">
          <Button type="text" icon={<EditOutlined />} aria-label={`Редактировать «${todo.title}»`} onClick={() => onEdit(todo)} disabled={busy} />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="Удалить задачу?"
          okText="Удалить"
          cancelText="Отмена"
          okButtonProps={{ danger: true }}
          onConfirm={() => run(() => onDelete(todo))}
        >
          <Button type="text" danger icon={<DeleteOutlined />} aria-label={`Удалить «${todo.title}»`} loading={busy} />
        </Popconfirm>,
      ]}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Checkbox
          className="!mt-1"
          checked={todo.completed}
          disabled={busy}
          onChange={() => void run(() => onToggle(todo))}
          aria-label={todo.completed ? `Отметить «${todo.title}» как невыполненную` : `Отметить «${todo.title}» как выполненную`}
        />
        <div className="min-w-0 flex-1">
          <Typography.Text strong delete={todo.completed} type={todo.completed ? 'secondary' : undefined} className="block break-words">
            {todo.title}
          </Typography.Text>
          {todo.description && (
            <Typography.Paragraph type="secondary" className="!mb-1 whitespace-pre-wrap break-words">
              {todo.description}
            </Typography.Paragraph>
          )}
          <time dateTime={todo.createdAt} className="text-xs text-slate-400">
            Создано: {created.format('DD.MM.YYYY HH:mm')}
          </time>
        </div>
      </div>
    </List.Item>
  );
}
