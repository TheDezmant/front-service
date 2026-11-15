import type { FormRule } from 'antd';

/** Ограничения совпадают с валидацией на сервере. */
export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 2000;

export const titleRules: FormRule[] = [
  { required: true, whitespace: true, message: 'Введите заголовок' },
  { max: TITLE_MAX, message: `Не более ${TITLE_MAX} символов` },
];

export const descriptionRules: FormRule[] = [{ max: DESCRIPTION_MAX, message: `Не более ${DESCRIPTION_MAX} символов` }];
