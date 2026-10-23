import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";

function AuthPage({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: new URLSearchParams(location.search).get("phone") || "",
    password: "",
    confirmPassword: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";
  const isPhoneVerification = mode === "verify-phone";
  const title = isSignup ? "Create your account" : isForgot ? "Reset your password" : isReset ? "Choose a new password" : isPhoneVerification ? "Verify your mobile" : "Welcome back";

  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (isPhoneVerification && !/^\d{6}$/.test(verificationCode)) {
      setError("Enter the 6-digit code sent to your mobile.");
      return;
    }
    if ((isSignup || isReset) && values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const path = isSignup
        ? "/api/auth/signup"
        : mode === "signin"
          ? "/api/auth/login"
          : isForgot
            ? "/api/auth/forgot-password"
            : isPhoneVerification
              ? "/api/auth/phone-otp/check"
            : "/api/auth/reset-password";
      const payload = isSignup
        ? { fullName: values.fullName, email: values.email, phone: values.phone, password: values.password }
        : mode === "signin"
          ? { email: values.email, password: values.password }
          : isForgot
            ? { email: values.email }
            : isPhoneVerification
              ? { phone: values.phone, code: verificationCode }
            : { token, password: values.password };

      const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed. Please try again.");

      if (isSignup && values.phone) {
        navigate(`/verify-phone?phone=${encodeURIComponent(values.phone)}`);
      } else if (isSignup || mode === "signin" || isPhoneVerification) {
        navigate("/dashboard");
      } else if (isForgot) {
        setMessage(data.message);
      } else {
        setMessage(data.message || "Password updated. Please sign in.");
        window.setTimeout(() => navigate("/signin"), 1200);
      }
    } catch (requestError) {
      setError(requestError.message || "Could not connect to the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function requestPhoneOtp() {
    const phone = values.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/auth/phone-otp/start`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not send verification code.");
      setOtpRequested(true);
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message || "Could not send verification code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="st-auth">
      <section className="st-auth__story">
        <Link className="st-brand" to="/">
          <span className="st-brand__mark">S</span>
          <span>Stock<span>Traders</span></span>
        </Link>
        <div className="st-auth__story-copy">
          <div className="st-eyebrow">INVEST WITH CLARITY</div>
          <h1>Make room for <em>better decisions.</em></h1>
          <p>A thoughtful workspace for learning about markets and keeping your investments organized.</p>
          <div className="st-auth__note"><span>✓</span> Your account is protected with a secure session.</div>
          <div className="st-auth__note"><span>✓</span> Orders in this application are simulated only.</div>
        </div>
        <div className="st-auth__decoration" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
      </section>
      <section className="st-auth__form-side">
        <form className="st-auth-card" onSubmit={submit}>
          <div className="st-auth-card__top">
            <div className="st-eyebrow">{isSignup ? "GET STARTED" : isForgot || isReset ? "ACCOUNT RECOVERY" : isPhoneVerification ? "OPTIONAL ONBOARDING" : "SIGN IN"}</div>
            <h2>{title}</h2>
            <p>{isSignup ? "Join Stock Traders and explore your investing workspace." : isForgot ? "Enter your email and we’ll send instructions if an account matches." : isReset ? "Use a strong password you have not used elsewhere." : isPhoneVerification ? "Verify your mobile using the configured SMS provider, or skip and verify later." : "Sign in to continue to your workspace."}</p>
          </div>

          {isSignup && (
            <label className="st-field">
              <span>Full name</span>
              <input name="fullName" value={values.fullName} onChange={update} autoComplete="name" minLength={2} maxLength={80} required />
            </label>
          )}
          {!isReset && !isPhoneVerification && (
            <label className="st-field">
              <span>Email address</span>
              <input name="email" type="email" value={values.email} onChange={update} autoComplete="email" maxLength={254} required />
            </label>
          )}
          {(isSignup || isPhoneVerification) && (
            <label className="st-field">
              <span>Mobile number {isSignup && <small>Optional</small>}</span>
              <div className="st-phone-field"><span>+91</span><input name="phone" type="tel" value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))} autoComplete="tel-national" inputMode="numeric" maxLength={10} /></div>
            </label>
          )}
          {isPhoneVerification && otpRequested && (
            <label className="st-field">
              <span>SMS verification code</span>
              <input value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
            </label>
          )}
          {!isForgot && !isPhoneVerification && (
            <label className="st-field">
              <span>Password</span>
              <div className="st-password-field">
                <input name="password" type={showPassword ? "text" : "password"} value={values.password} onChange={update} autoComplete={isSignup ? "new-password" : isReset ? "new-password" : "current-password"} minLength={10} maxLength={128} required />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
              </div>
              {(isSignup || isReset) && <small className="st-field-hint">At least 10 characters, including uppercase, lowercase, and a number.</small>}
            </label>
          )}
          {(isSignup || isReset) && (
            <label className="st-field">
              <span>Confirm password</span>
              <input name="confirmPassword" type={showPassword ? "text" : "password"} value={values.confirmPassword} onChange={update} autoComplete="new-password" minLength={10} maxLength={128} required />
            </label>
          )}

          {error && <div className="st-form-message st-form-message--error" role="alert">{error}</div>}
          {message && <div className="st-form-message st-form-message--success" role="status">{message}</div>}
          {isPhoneVerification ? (
            <>
              {!otpRequested && <button className="st-auth-submit" type="button" onClick={requestPhoneOtp} disabled={busy}>{busy ? <><span className="st-spinner" /> Please wait…</> : "Send SMS code"}</button>}
              {otpRequested && <button className="st-auth-submit" type="submit" disabled={busy}>{busy ? <><span className="st-spinner" /> Please wait…</> : "Verify mobile"}</button>}
            </>
          ) : (
            <button className="st-auth-submit" type="submit" disabled={busy || (isReset && !token)}>
              {busy ? <><span className="st-spinner" /> Please wait…</> : isSignup ? "Create account" : mode === "signin" ? "Sign in" : isForgot ? "Send reset instructions" : "Update password"}
            </button>
          )}

          <div className="st-auth-links">
            {isPhoneVerification ? <Link to="/dashboard">Skip verification for now</Link> : isSignup ? <>Already registered? <Link to="/signin">Sign in</Link></> :
              mode === "signin" ? <><Link to="/forgot-password">Forgot password?</Link><span>New to Stock Traders? <Link to="/signup">Create an account</Link></span></> :
                <Link to="/signin">Back to sign in</Link>}
          </div>
          <p className="st-auth-legal">By continuing, you agree to use Stock Traders as an educational demo. Simulated values are not investment advice.</p>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
