import type { FormInstance } from 'antd';
import { ApiError } from '../api/http';

/**
 * Переносит ошибки валидации сервера в поля формы AntD.
 * Возвращает текст общей ошибки, если её нельзя привязать к полю.
 */
export function applyServerErrors<T>(form: FormInstance<T>, error: unknown): string | null {
  if (!(error instanceof ApiError)) return 'Неизвестная ошибка';
  const names = new Set(Object.keys(form.getFieldsValue(true) as object));
  const fieldErrors = error.details.filter((d) => names.has(d.field));
  if (fieldErrors.length > 0) {
    form.setFields(fieldErrors.map((d) => ({ name: d.field as never, errors: [d.message] })));
    return null;
  }
  return error.message;
}
