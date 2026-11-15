import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import type { CreateTodoInput } from '../api/types';
import { applyServerErrors } from '../lib/formErrors';
import { DESCRIPTION_MAX, TITLE_MAX, descriptionRules, titleRules } from './todoRules';

interface Props {
  readonly onCreate: (input: CreateTodoInput) => Promise<void>;
  readonly onError: (message: string) => void;
}

export function TodoForm({ onCreate, onError }: Props) {
  const [form] = Form.useForm<CreateTodoInput>();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: CreateTodoInput) => {
    setSubmitting(true);
    try {
      await onCreate({ title: values.title.trim(), description: values.description?.trim() ?? '' });
      form.resetFields();
    } catch (e: unknown) {
      const msg = applyServerErrors(form, e);
      if (msg) onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form<CreateTodoInput> form={form} layout="vertical" onFinish={onFinish} aria-label="Новая задача">
      <Form.Item label="Заголовок" name="title" rules={titleRules}>
        <Input placeholder="Что нужно сделать?" maxLength={TITLE_MAX} />
      </Form.Item>
      <Form.Item label="Описание" name="description" rules={descriptionRules}>
        <Input.TextArea placeholder="Подробности (необязательно)" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={DESCRIPTION_MAX} showCount />
      </Form.Item>
      <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting}>
        Добавить
      </Button>
    </Form>
  );
}
