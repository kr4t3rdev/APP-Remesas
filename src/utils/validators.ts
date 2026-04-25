export interface ValidatorErrors {
  name?: string;
  nickname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export interface FormData {
  name: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

/**
 * Validates email format using RFC 5322 simplified regex
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validates password strength:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - No leading/trailing spaces
 */
export const validatePassword = (password: string): boolean => {
  if (password !== password.trim()) return false;
  if (password.length < 8) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Validates name field
 * - Minimum 2 characters
 * - Not empty
 */
export const validateName = (name: string): boolean => {
  return name.length >= 2;
};

/**
 * Validates nickname field
 * - Optional (empty is valid)
 * - If provided: minimum 2 characters
 * - Only alphanumeric, hyphens, and underscores
 */
export const validateNickname = (nickname: string): boolean => {
  if (nickname === "") return true;
  if (nickname.length < 2) return false;

  const nicknameRegex = /^[a-zA-Z0-9_-]+$/;
  return nicknameRegex.test(nickname);
};

/**
 * Validates entire register form
 */
export const validateForm = (data: FormData): ValidatorErrors => {
  const errors: ValidatorErrors = {};

  if (!validateName(data.name)) {
    errors.name = "El nombre debe tener al menos 2 caracteres";
  }

  if (!validateNickname(data.nickname)) {
    errors.nickname = "El nickname debe contener solo letras, números, guiones y guiones bajos";
  }

  if (!validateEmail(data.email)) {
    errors.email = "Ingresa un correo electrónico válido";
  }

  if (!validatePassword(data.password)) {
    errors.password =
      "La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula y número";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  if (!data.acceptedTerms) {
    errors.terms = "Debes aceptar los términos y condiciones";
  }

  return errors;
};
