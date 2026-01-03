export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function validateContactForm(
  data: { name: string; email: string; message: string },
  t: (key: string) => string
): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!validateRequired(data.name)) {
    errors.name = t('validation.required');
  }

  if (!validateRequired(data.email)) {
    errors.email = t('validation.required');
  } else if (!validateEmail(data.email)) {
    errors.email = t('validation.email');
  }

  if (!validateRequired(data.message)) {
    errors.message = t('validation.required');
  }

  return errors;
}

export function hasErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
