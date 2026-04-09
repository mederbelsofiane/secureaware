"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { loginSchema } from "@/lib/validations";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";

type LoginFormData = z.infer<typeof loginSchema>;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password. Please try again.");
        return;
      }

      toast.success("Welcome back! Redirecting...");

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "SUPER_ADMIN") {
        router.push("/super-admin");
      } else if (session?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
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
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-dark-400">Sign in to your security training platform</p>
      </motion.div>

      {/* Login Card */}
      <motion.div variants={fadeInUp} className="glass-card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="label-text">Email Address</label>
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

          {/* Password */}
          <div>
            <label htmlFor="password" className="label-text">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`input-field pl-11 pr-11 ${errors.password ? "input-error" : ""}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
            )}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Register Link */}
      <motion.p
        variants={fadeInUp}
        className="text-center mt-6 text-dark-400"
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
        >
          Create Account
        </Link>
      </motion.p>
    </motion.div>
  );
}
