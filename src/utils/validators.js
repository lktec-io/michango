export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const isValidPhone = (value) => /^[+]?[\d\s().-]{7,16}$/.test(String(value || '').trim());

export const isStrongPassword = (value) => String(value || '').length >= 6;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!name?.trim()) errors.name = 'Full name is required';
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (!isStrongPassword(password)) errors.password = 'Password must be at least 6 characters';
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function validateEvent({ eventName, brideName, groomName, eventDate, location }) {
  const errors = {};
  if (!eventName?.trim()) errors.eventName = 'Event name is required';
  if (!brideName?.trim()) errors.brideName = "Bride's name is required";
  if (!groomName?.trim()) errors.groomName = "Groom's name is required";
  if (!eventDate) errors.eventDate = 'Event date is required';
  if (!location?.trim()) errors.location = 'Event location is required';
  return errors;
}

export function validateContributor({ fullName, phone, amount }) {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = 'Full name is required';
  if (!phone?.trim()) errors.phone = 'Phone number is required';
  else if (!isValidPhone(phone)) errors.phone = 'Enter a valid phone number';
  if (amount === '' || amount === null || amount === undefined) errors.amount = 'Amount is required';
  else if (Number.isNaN(Number(amount)) || Number(amount) < 0) errors.amount = 'Enter a valid amount';
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
