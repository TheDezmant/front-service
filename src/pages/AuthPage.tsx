import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Tabs, Typography } from 'antd';
import { useState } from 'react';
import type { Credentials } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { applyServerErrors } from '../lib/formErrors';

type Mode = 'login' | 'register';

interface FormValues extends Credentials {
  readonly confirm?: string;
}

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<FormValues>();

  const onFinish = async ({ email, password }: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await (mode === 'login' ? login : register)({ email: email.trim(), password });
    } catch (e: unknown) {
      setError(applyServerErrors(form, e));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (key: string) => {
    setMode(key === 'register' ? 'register' : 'login');
    setError(null);
    form.resetFields(['password', 'confirm']);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-md">
        <Typography.Title level={1} className="!mb-1 text-center !text-2xl">
          Список задач
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="text-center">
          Войдите или создайте аккаунт
        </Typography.Paragraph>

        <Tabs
          centered
          activeKey={mode}
          onChange={switchMode}
          items={[
            { key: 'login', label: 'Вход' },
            { key: 'register', label: 'Регистрация' },
          ]}
        />

        {error && <Alert className="!mb-4" type="error" showIcon title={error} role="alert" />}

        <Form<FormValues> form={form} layout="vertical" onFinish={onFinish} requiredMark={false} noValidate>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
              { max: 254, message: 'Слишком длинный email' },
            ]}
          >
            <Input prefix={<MailOutlined aria-hidden />} autoComplete="email" placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 8, message: 'Минимум 8 символов' },
              { max: 128, message: 'Максимум 128 символов' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined aria-hidden />}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </Form.Item>

          {mode === 'register' && (
            <Form.Item
              label="Повторите пароль"
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Повторите пароль' },
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    !value || getFieldValue('password') === value
                      ? Promise.resolve()
                      : Promise.reject(new Error('Пароли не совпадают')),
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined aria-hidden />} autoComplete="new-password" />
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </Form>
      </Card>
    </main>
  );
}
