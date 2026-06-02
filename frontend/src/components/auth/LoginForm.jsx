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
import {
  normalizeEmail,
  validateLogin,
  validators,
} from '../../utils/validators';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [needsSignup, setNeedsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let error = null;
    if (name === 'email') {
      const v = value.trim();
      if (!v) error = 'Email or username is required';
      else if (v.includes('@')) error = validators.email(v);
      else error = validators.username(v);
    }
    if (name === 'password') error = validators.loginPassword(value);
    setErrors((prev) => ({ ...prev, [name]: error || '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) validateField(name, value);
    setSubmitError('');
    setNeedsSignup(false);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      const normalized = value.trim().includes('@')
        ? normalizeEmail(value)
        : value.trim().toLowerCase();
      setForm((prev) => ({ ...prev, email: normalized }));
      validateField(name, normalized);
    } else {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setNeedsSignup(false);
    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const loginId = form.email.trim();
    const payload = {
      email: loginId.includes('@') ? normalizeEmail(loginId) : loginId.toLowerCase(),
      password: form.password,
    };

    setLoading(true);
    try {
      await login(payload);
      navigate('/feed', { replace: true });
    } catch (err) {
      const message = err.message || 'Login failed';
      setSubmitError(message);
      const isUnknownEmail =
        message.toLowerCase().includes('sign up') ||
        message.toLowerCase().includes('no account found');
      setNeedsSignup(isUnknownEmail);
      if (isUnknownEmail) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes('password')) {
        setErrors((prev) => ({ ...prev, password: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <Alert severity={needsSignup ? 'warning' : 'error'} sx={{ mb: 2 }}>
          {submitError}
          {needsSignup && (
            <Box mt={1}>
              <Button
                component={RouterLink}
                to="/signup"
                variant="outlined"
                size="small"
                color="warning"
              >
                Go to Sign up
              </Button>
            </Box>
          )}
        </Alert>
      )}
      <TextField
        fullWidth
        label="Email or username"
        name="email"
        type="text"
        inputMode="email"
        placeholder="name@gmail.com or your_username"
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
        helperText={errors.password}
        margin="normal"
        autoComplete="current-password"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3, py: 1.25 }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      <Typography align="center" variant="body2" sx={{ mt: 2 }} component="div">
        Don&apos;t have an account?{' '}
        <Link component={RouterLink} to="/signup" fontWeight={600}>
          Sign up
        </Link>
      </Typography>
    </Box>
  );
};

export default LoginForm;
