import { useState, useEffect, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  Compass,
  X,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const {
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(defaultMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "microsoft" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        resetFormState();
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const resetFormState = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(false);
    setSocialLoading(null);
  };

  const handleModeChange = (newMode: "signin" | "signup" | "forgot") => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSocialLoading("google");
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMessage(error);
      setSocialLoading(null);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSocialLoading("microsoft");
    const { error } = await signInWithMicrosoft();
    if (error) {
      setErrorMessage(error);
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (mode === "forgot") {
      setIsLoading(true);
      const { error } = await resetPassword(email);
      setIsLoading(false);
      if (error) {
        setErrorMessage(error);
      } else {
        setSuccessMessage("Password reset instructions have been sent to your email.");
      }
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    if (mode === "signin") {
      const { error } = await signInWithEmail(email, password);
      setIsLoading(false);
      if (error) {
        setErrorMessage(error);
      } else {
        resetFormState();
        onClose();
      }
    } else if (mode === "signup") {
      const { error, requiresEmailConfirmation } = await signUpWithEmail(
        email,
        password,
        fullName
      );
      setIsLoading(false);
      if (error) {
        setErrorMessage(error);
      } else if (requiresEmailConfirmation) {
        setSuccessMessage(
          "Account created! Please check your email to confirm your registration before signing in."
        );
      } else {
        resetFormState();
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              resetFormState();
              onClose();
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-[calc(100vw-24px)] sm:max-w-[440px] overflow-hidden rounded-2xl border border-border/80 bg-background/98 shadow-2xl backdrop-blur-xl my-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                resetFormState();
                onClose();
              }}
              aria-label="Close dialog"
              className="absolute right-3.5 top-3.5 z-20 flex size-8 items-center justify-center rounded-full bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            {/* Top Decorative Header */}
            <div className="relative px-4 sm:px-6 pt-6 sm:pt-7 pb-4 bg-gradient-to-b from-primary/10 via-background/40 to-background border-b border-border/40 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25 shadow-sm">
                <Compass className="size-6 animate-pulse" />
              </div>
              <h2 className="display-font text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {mode === "signin" && "Welcome to Bhraman"}
                {mode === "signup" && "Create Your Account"}
                {mode === "forgot" && "Reset Password"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                {mode === "signin" && "Sign in to save your dream destinations, itineraries, and travel bookings across India."}
                {mode === "signup" && "Join India's curated expedition platform with personalized travel intelligence."}
                {mode === "forgot" && "Enter your email address and we'll send you instructions to recover your account."}
              </p>
            </div>

            <div className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4">
              {/* Status Alerts */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {mode !== "forgot" && (
                <>
                  {/* Primary Social OAuth Logins: Google & Microsoft */}
                  <div className="space-y-2.5">
                    {/* 1. Google */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={Boolean(socialLoading) || isLoading}
                      className="w-full flex items-center justify-center gap-3 rounded-xl border border-border/90 bg-card hover:bg-muted/80 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-150 shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {socialLoading === "google" ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : (
                        <svg className="size-4.5 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      <span>Continue with Google</span>
                    </button>

                    {/* 2. Microsoft */}
                    <button
                      type="button"
                      onClick={handleMicrosoftSignIn}
                      disabled={Boolean(socialLoading) || isLoading}
                      className="w-full flex items-center justify-center gap-3 rounded-xl border border-border/90 bg-card hover:bg-muted/80 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-150 shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {socialLoading === "microsoft" ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : (
                        <svg className="size-4.5 shrink-0" viewBox="0 0 23 23">
                          <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                          <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
                          <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
                          <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
                        </svg>
                      )}
                      <span>Continue with Microsoft</span>
                    </button>
                  </div>

                  {/* OR Divider */}
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/80" />
                    </div>
                    <span className="relative bg-background px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      OR
                    </span>
                  </div>
                </>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === "signup" && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="w-full rounded-xl border border-border bg-card/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-border bg-card/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">
                        Password
                      </label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => handleModeChange("forgot")}
                          className="text-[11px] text-primary hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-border bg-card/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || Boolean(socialLoading)}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : mode === "signin" ? (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="size-4" />
                    </>
                  ) : mode === "signup" ? (
                    <>
                      <span>Create Account</span>
                      <Sparkles className="size-4" />
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <KeyRound className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle between Sign In / Sign Up / Back */}
              <div className="pt-2 text-center text-xs text-muted-foreground">
                {mode === "signin" && (
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("signup")}
                      className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </p>
                )}
                {mode === "signup" && (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("signin")}
                      className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
                {mode === "forgot" && (
                  <p>
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("signin")}
                      className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
