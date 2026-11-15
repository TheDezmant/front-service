import { Form, Input, Modal } from 'antd';
import { useEffect, useState } from 'react';
import type { Todo, UpdateTodoInput } from '../api/types';
import { applyServerErrors } from '../lib/formErrors';
import { DESCRIPTION_MAX, TITLE_MAX, descriptionRules, titleRules } from './todoRules';

interface Props {
  readonly todo: Todo | null;
  readonly onSave: (id: string, input: UpdateTodoInput) => Promise<void>;
  readonly onClose: () => void;
  readonly onError: (message: string) => void;
}

interface Values {
  readonly title: string;
  readonly description: string;
}

export function TodoEditModal({ todo, onSave, onClose, onError }: Props) {
  const [form] = Form.useForm<Values>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (todo) form.setFieldsValue({ title: todo.title, description: todo.description });
  }, [todo, form]);

  const submit = async () => {
    if (!todo) return;
    let values: Values;
    try {
      values = await form.validateFields();
    } catch {
      return; // ошибки уже показаны в полях
    }
    setSaving(true);
    try {
      await onSave(todo.id, { title: values.title.trim(), description: values.description.trim() });
      onClose();
    } catch (e: unknown) {
      const msg = applyServerErrors(form, e);
      if (msg) onError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={todo !== null}
      title="Редактирование задачи"
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={saving}
      onOk={() => void submit()}
      onCancel={onClose}
      forceRender
    >
      <Form<Values> form={form} layout="vertical" onFinish={() => void submit()}>
        <Form.Item label="Заголовок" name="title" rules={titleRules}>
          <Input maxLength={TITLE_MAX} />
        </Form.Item>
        <Form.Item label="Описание" name="description" rules={descriptionRules}>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={DESCRIPTION_MAX} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
