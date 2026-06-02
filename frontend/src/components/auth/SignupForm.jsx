import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import PasswordField from '../common/PasswordField';
import useAuth from '../../hooks/useAuth';
import PasswordStrength from './PasswordStrength';
import {
  normalizeEmail,
  normalizeUsername,
  validateSignup,
  validators,
} from '../../utils/validators';

const SignupForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case 'username':
        error = validators.username(value);
        break;
      case 'email':
        error = validators.email(value);
        break;
      case 'password':
        error = validators.password(value);
        break;
      case 'confirmPassword':
        error = validators.confirmPassword(value, form.password);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error || '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'password' && prev.confirmPassword) {
        setErrors((err) => ({
          ...err,
          confirmPassword:
            validators.confirmPassword(prev.confirmPassword, value) || '',
        }));
      }
      return next;
    });
    if (errors[name]) validateField(name, value);
    setSubmitError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setForm((prev) => ({ ...prev, email: normalizeEmail(value) }));
      validateField(name, normalizeEmail(value));
    } else {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateSignup(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      username: normalizeUsername(form.username),
      email: normalizeEmail(form.email),
      password: form.password,
    };

    setLoading(true);
    try {
      await signup(payload);
      navigate('/feed', { replace: true });
    } catch (err) {
      const message = err.message || 'Signup failed';
      setSubmitError(message);
      if (message.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes('username')) {
        setErrors((prev) => ({ ...prev, username: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}
      <TextField
        fullWidth
        label="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!errors.username}
        helperText={errors.username || 'Must be unique — like Instagram @handle'}
        margin="normal"
        autoComplete="username"
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="text"
        inputMode="email"
        placeholder="name@gmail.com"
        value={form.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
        autoComplete="email"
      />
      <PasswordField
        label="Password"
        name="password"
        value={form.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!errors.password}
        helperText={errors.password || 'Minimum 6 characters'}
        margin="normal"
        autoComplete="new-password"
      />
      <PasswordStrength password={form.password} />
      <PasswordField
        label="Confirm password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        margin="normal"
        autoComplete="new-password"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3, py: 1.25 }}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
      <Typography align="center" variant="body2" sx={{ mt: 2 }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" fontWeight={600}>
          Sign in
        </Link>
      </Typography>
    </Box>
  );
};

export default SignupForm;
