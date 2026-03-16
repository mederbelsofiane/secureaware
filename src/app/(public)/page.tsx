'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  Target,
  BookOpen,
  BarChart3,
  Trophy,
  Award,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingDown,
  Layers,
  Zap,
  Eye,
  MonitorCheck,
  Quote,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.1 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.1 },
  }),
};

const stats = [
  { label: 'Companies Protected', value: '2,500+', icon: Shield },
  { label: 'Employees Trained', value: '1.2M+', icon: Users },
  { label: 'Phishing Risk Reduction', value: '87%', icon: TrendingDown },
  { label: 'Training Modules', value: '350+', icon: Layers },
];

const features = [
  {
    icon: Target,
    title: 'Phishing Simulation',
    description:
      'Deploy realistic phishing campaigns to test employee awareness. Track click rates, reporting behavior, and identify vulnerable departments in real time.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: BookOpen,
    title: 'Security Training',
    description:
      'Interactive training modules covering phishing, social engineering, password hygiene, data protection, and compliance. Adaptive learning paths for every skill level.',
    color: 'from-accent-blue to-accent-purple',
  },
  {
    icon: BarChart3,
    title: 'Risk Analytics',
    description:
      'Comprehensive dashboards with department-level risk scores, trend analysis, and predictive insights. Make data-driven decisions to strengthen your security posture.',
    color: 'from-accent-cyan to-accent-blue',
  },
  {
    icon: Trophy,
    title: 'Gamification',
    description:
      'Boost engagement with points, leaderboards, badges, and team challenges. Transform security training from a chore into a competitive, rewarding experience.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Award,
    title: 'Certificates',
    description:
      'Issue verifiable completion certificates for training programs. Track certification status across your organization and ensure compliance deadlines are met.',
    color: 'from-accent-emerald to-teal-500',
  },
  {
    icon: FileCheck,
    title: 'Compliance',
    description:
      'Meet regulatory requirements for SOC 2, ISO 27001, GDPR, HIPAA, and PCI DSS. Automated reporting and audit trails simplify your compliance journey.',
    color: 'from-accent-purple to-pink-500',
  },
];

const steps = [
  {
    number: '01',
    icon: Zap,
    title: 'Deploy',
    description:
      'Set up your organization in minutes. Import employees via SSO, LDAP, or CSV. Configure training paths and phishing templates tailored to your industry.',
  },
  {
    number: '02',
    icon: Eye,
    title: 'Train',
    description:
      'Employees complete interactive modules at their own pace. Simulated phishing attacks test real-world awareness. Adaptive content targets individual knowledge gaps.',
  },
  {
    number: '03',
    icon: MonitorCheck,
    title: 'Monitor',
    description:
      'Track progress with real-time analytics dashboards. Identify high-risk departments, measure improvement over time, and generate compliance reports automatically.',
  },
];

const testimonials = [
  {
    quote:
      'SecureAware reduced our phishing click rate from 32% to under 4% in just six months. The platform paid for itself after preventing a single social engineering attempt.',
    name: 'Sarah Chen',
    role: 'CISO, Meridian Financial Group',
  },
  {
    quote:
      'The gamification features transformed how our team approaches security training. Completion rates went from 45% to 98%, and employees actually look forward to new modules.',
    name: 'James Rodriguez',
    role: 'IT Director, NovaTech Solutions',
  },
  {
    quote:
      'We evaluated five platforms before choosing SecureAware. The risk analytics and compliance reporting alone saved our security team 20+ hours per month on audit preparation.',
    name: 'Dr. Emily Watts',
    role: 'VP of Information Security, HealthBridge Systems',
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-accent-purple/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-cyan/5 rounded-full blur-[140px]" />
        </div>

        <div className="page-container relative z-10 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-medium">
                <Shield className="w-4 h-4" />
                Enterprise Security Awareness Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            >
              Build a Human{' '}
              <span className="gradient-text">Firewall</span>{' '}
              That Actually Works
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Transform your workforce into your strongest security asset.
              SecureAware delivers intelligent phishing simulations, adaptive
              training, and real-time risk analytics that measurably reduce
              human-driven breaches.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register" className="btn-primary py-3.5 px-8 text-base flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/features" className="btn-secondary py-3.5 px-8 text-base">
                Explore Features
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="relative z-10 -mt-8">
        <div className="page-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="glass-card p-2"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  custom={i}
                  className="flex flex-col items-center justify-center py-6 px-4 relative"
                >
                  {i > 0 && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-gray-700/50 hidden lg:block" />
                  )}
                  <stat.icon className="w-6 h-6 text-accent-blue mb-2" />
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                  <span className="text-sm text-dark-400 mt-1">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURES GRID ============ */}
      <section className="py-24">
        <div className="page-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} custom={0} className="text-accent-blue text-sm font-semibold uppercase tracking-wider">
              Comprehensive Platform
            </motion.span>
            <motion.h2 variants={fadeInUp} custom={1} className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Secure</span> Your Team
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-dark-400 text-lg max-w-2xl mx-auto">
              A complete suite of tools designed to assess, educate, and monitor
              your organization&apos;s security awareness from onboarding to ongoing defense.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={scaleIn}
                custom={i}
                className="glass-card-hover p-8 group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-dark-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-dark-900/50" />
        <div className="page-container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} custom={0} className="text-accent-emerald text-sm font-semibold uppercase tracking-wider">
              Simple Process
            </motion.span>
            <motion.h2 variants={fadeInUp} custom={1} className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
              Up and Running in <span className="gradient-text">Three Steps</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-dark-400 text-lg max-w-2xl mx-auto">
              Getting started with SecureAware is straightforward. No complex
              integrations or lengthy setup processes.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeInUp}
                custom={i}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-accent-blue/40 to-transparent" />
                )}
                <div className="glass-card p-8 text-center relative">
                  <span className="text-6xl font-black text-dark-800 absolute top-4 right-6 select-none">
                    {step.number}
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-dark-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-24">
        <div className="page-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} custom={0} className="text-accent-purple text-sm font-semibold uppercase tracking-wider">
              Trusted by Industry Leaders
            </motion.span>
            <motion.h2 variants={fadeInUp} custom={1} className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
              What Security Leaders <span className="gradient-text">Say</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                custom={i}
                className="glass-card p-8 flex flex-col"
              >
                <Quote className="w-10 h-10 text-accent-blue/30 mb-4 flex-shrink-0" />
                <p className="text-dark-300 leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-gray-700/50 pt-4">
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-dark-500 text-sm">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-accent-blue/5 to-dark-950" />
        <div className="page-container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-8">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <motion.h2 variants={fadeInUp} custom={1} className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Strengthen Your{' '}
              <span className="gradient-text">Security Culture</span>?
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-dark-400 text-lg mb-10 leading-relaxed">
              Join thousands of organizations that trust SecureAware to protect
              their people and their data. Start building your human firewall
              today.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register" className="btn-primary py-3.5 px-8 text-base flex items-center gap-2">
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/contact" className="btn-secondary py-3.5 px-8 text-base">
                Schedule a Demo
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp} custom={4} className="mt-8 flex items-center justify-center gap-6 text-sm text-dark-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> Free 14-day trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-emerald" /> Cancel anytime</span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
