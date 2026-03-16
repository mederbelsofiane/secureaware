'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { registerSchema } from '@/lib/validations';
import { apiPost } from '@/hooks/use-fetch';
import {
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
  X,
} from 'lucide-react';

type RegisterFormData = z.infer<typeof registerSchema>;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

interface PasswordRequirement {
  label: string;
  test: (pw: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getStrengthLevel(pw: string): { score: number; label: string; color: string } {
  const passed = passwordRequirements.filter((r) => r.test(pw)).length;
  if (passed <= 1) return { score: passed, label: 'Weak', color: 'bg-red-500' };
  if (passed <= 2) return { score: passed, label: 'Fair', color: 'bg-orange-500' };
  if (passed <= 3) return { score: passed, label: 'Good', color: 'bg-yellow-500' };
  if (passed === 4) return { score: passed, label: 'Strong', color: 'bg-emerald-500' };
  return { score: passed, label: 'Excellent', color: 'bg-accent-emerald' };
}

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchPassword = watch('password', '');

  const strength = useMemo(() => getStrengthLevel(watchPassword), [watchPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await apiPost('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Account created successfully! Please sign in.');
      router.push('/login');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      );
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
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-dark-400">Start your security awareness journey</p>
      </motion.div>

      {/* Register Card */}
      <motion.div variants={fadeInUp} className="glass-card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="label-text">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className={`input-field pl-11 ${errors.name ? 'input-error' : ''}`}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="label-text">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                className={`input-field pl-11 ${errors.email ? 'input-error' : ''}`}
                {...register('email')}
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className={`input-field pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                {...register('password')}
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

            {/* Password Strength Indicator */}
            {watchPassword.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-400">Password strength</span>
                  <span
                    className={`font-medium ${
                      strength.score <= 1
                        ? 'text-red-400'
                        : strength.score <= 2
                        ? 'text-orange-400'
                        : strength.score <= 3
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {strength.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i < strength.score ? strength.color : 'bg-dark-700'
                      }`}
                    />
                  ))}
                </div>
                <ul className="space-y-1 mt-2">
                  {passwordRequirements.map((req) => {
                    const met = req.test(watchPassword);
                    return (
                      <li
                        key={req.label}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          met ? 'text-emerald-400' : 'text-dark-500'
                        }`}
                      >
                        {met ? (
                          <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        {req.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="label-text">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm your password"
                className={`input-field pl-11 pr-11 ${errors.confirmPassword ? 'input-error' : ''}`}
                {...register('confirmPassword')}
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
              <p className="mt-1.5 text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-dark-500">
            By creating an account, you agree to our{' '}
            <span className="text-accent-blue hover:underline cursor-pointer">Terms of Service</span>{' '}
            and{' '}
            <span className="text-accent-blue hover:underline cursor-pointer">Privacy Policy</span>.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Login Link */}
      <motion.p
        variants={fadeInUp}
        className="text-center mt-6 text-dark-400"
      >
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
        >
          Sign In
        </Link>
      </motion.p>
    </motion.div>
  );
}
