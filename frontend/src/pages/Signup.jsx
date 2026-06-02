import AuthCard from '../components/auth/AuthCard';
import SignupForm from '../components/auth/SignupForm';

const Signup = () => (
  <div className="auth-page">
    <div className="auth-card-wrapper">
      <AuthCard title="Create account" subtitle="Create an account to post, like, and comment">
        <SignupForm />
      </AuthCard>
    </div>
  </div>
);

export default Signup;
