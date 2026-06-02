import AuthCard from '../components/auth/AuthCard';
import LoginForm from '../components/auth/LoginForm';

const Login = () => (
  <div className="auth-page">
    <div className="auth-card-wrapper">
      <AuthCard title="Welcome back" subtitle="Sign in to continue to Social Feed">
        <LoginForm />
      </AuthCard>
    </div>
  </div>
);

export default Login;
