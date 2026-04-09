"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
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

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      // Always show success to avoid user enumeration
      setSubmitted(true);
    } catch {
      // Still show success
      setSubmitted(true);
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
        <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
        <p className="text-dark-400">We&apos;ll send you a link to reset your password</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass-card p-8">
        {submitted ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Check your email</h2>
            <p className="text-dark-400 text-sm leading-relaxed">
              If an account with that email address exists, we&apos;ve sent a password
              reset link. Check your inbox and spam folder.
            </p>
            <p className="text-dark-500 text-xs">The link will expire in 1 hour.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="label-text">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className={`input-field pl-11 ${errors.email ? "input-error" : ""}`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>

      <motion.p variants={fadeInUp} className="text-center mt-6 text-dark-400">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </motion.p>
    </motion.div>
  );
}
