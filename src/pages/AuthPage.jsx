import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const getAuthErrorMessage = (error) => {
  const code = error?.code || "";

  if (code === "auth/operation-not-allowed") {
    return "Email/Password sign-up is disabled in Firebase. Enable it in Firebase Console > Authentication > Sign-in method.";
  }
  if (code === "auth/email-already-in-use") {
    return "This email is already registered. Try logging in instead.";
  }
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return "Invalid email or password.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in popup was closed before completing login.";
  }

  return error?.message || "Authentication failed";
};

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const destination = location.state?.from || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        await signup(form);
        toast.success("Account created");
      } else {
        await login(form);
        toast.success("Logged in");
      }
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Logged in with Google");
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h1 className="text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Secure authentication with Firebase email/password and Google OAuth.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" ? (
          <input
            type="text"
            required
            placeholder="Full name"
            value={form.displayName}
            onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          />
        ) : null}

        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
        />

        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-secondary disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
        </button>
      </form>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:border-primary dark:border-gray-600"
      >
        Continue with Google
      </button>

      <button
        onClick={() => setMode((prev) => (prev === "login" ? "signup" : "login"))}
        className="mt-4 text-sm text-primary"
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
      </button>
    </section>
  );
};

export default AuthPage;
