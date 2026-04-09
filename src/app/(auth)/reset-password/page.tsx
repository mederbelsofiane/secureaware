"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="w-full max-w-md"
    >
      {/* Logo & Header */}
      <motion.div variants={fadeInUp} className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">SecureAware</span>
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-dark-400">Enter your new password below</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass-card p-8">
        {success ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Password Reset!</h2>
            <p className="text-dark-400 text-sm">
              Your password has been updated successfully. Redirecting you to
              sign in...
            </p>
          </div>
        ) : error && !token ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Invalid Link</h2>
            <p className="text-dark-400 text-sm">{error}</p>
            <Link
              href="/forgot-password"
              className="inline-block text-accent-blue hover:text-accent-blue/80 font-medium transition-colors text-sm"
            >
              Request a new reset link &rarr;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* New Password */}
            <div>
              <label htmlFor="password" className="label-text">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className={`input-field pl-11 pr-11 ${errors.password ? "input-error" : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label-text">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your new password"
                  className={`input-field pl-11 pr-11 ${
                    errors.confirmPassword ? "input-error" : ""
                  }`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>

      {!success && (
        <motion.p variants={fadeInUp} className="text-center mt-6 text-dark-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
          >
            Sign In
          </Link>
        </motion.p>
      )}
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
