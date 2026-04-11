'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  BookOpen,
  BarChart3,
  Trophy,
  Award,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Shield,
  Settings,
  Globe,
  Lock,
  Smartphone,
  Database,
  Workflow,
  MailWarning,
  Brain,
  LineChart,
  Gamepad2,
  BadgeCheck,
  ScrollText,
  Plug,
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

const features = [
  {
    icon: Target,
    title: 'Phishing Simulation',
    subtitle: 'Test real-world awareness',
    description:
      'Launch sophisticated, customizable phishing campaigns that mirror real-world attacks. Choose from hundreds of templates or create your own, targeting specific departments or the entire organization.',
    capabilities: [
      'Email, SMS, and voice phishing templates',
      'Spear-phishing with personalized payloads',
      'Automated campaign scheduling and rotation',
      'Real-time click and report tracking',
      'Landing page credential capture analysis',
      'Immediate teachable-moment education',
    ],
    color: 'from-red-500 to-orange-500',
    detailIcon: MailWarning,
  },
  {
    icon: BookOpen,
    title: 'Security Training',
    subtitle: 'Adaptive learning at scale',
    description:
      'Deliver engaging, interactive training modules that adapt to each employee\'s knowledge level. From onboarding essentials to advanced threat recognition, build competence across your entire workforce.',
    capabilities: [
      'Interactive video and scenario-based modules',
      'Adaptive learning paths per skill level',
      'Multi-language support for global teams',
      'Micro-learning for minimal workflow disruption',
      'Knowledge assessments with instant feedback',
      'Custom content authoring tools',
    ],
    color: 'from-accent-blue to-accent-purple',
    detailIcon: Brain,
  },
  {
    icon: BarChart3,
    title: 'Risk Analytics',
    subtitle: 'Data-driven security insights',
    description:
      'Gain comprehensive visibility into your organization\'s human risk profile. Identify vulnerable departments, track improvement trends, and generate executive-ready reports with actionable recommendations.',
    capabilities: [
      'Department and individual risk scoring',
      'Trend analysis with predictive modeling',
      'Executive summary dashboard',
      'Exportable compliance reports',
      'Benchmarking against industry peers',
      'Custom KPI tracking and alerts',
    ],
    color: 'from-accent-cyan to-accent-blue',
    detailIcon: LineChart,
  },
  {
    icon: Trophy,
    title: 'Gamification',
    subtitle: 'Engage and motivate',
    description:
      'Transform security training from an obligation into an engaging experience. Points, badges, leaderboards, and team challenges drive participation and create healthy competition across your organization.',
    capabilities: [
      'Points system with customizable rewards',
      'Department and individual leaderboards',
      'Achievement badges and milestones',
      'Team-based challenges and competitions',
      'Streak tracking for consistent engagement',
      'Manager dashboards for team performance',
    ],
    color: 'from-yellow-500 to-orange-500',
    detailIcon: Gamepad2,
  },
  {
    icon: Award,
    title: 'Certificates',
    subtitle: 'Verify and track completion',
    description:
      'Issue professional completion certificates for training programs and compliance courses. Automated tracking ensures no employee falls through the cracks on critical certification requirements.',
    capabilities: [
      'Branded certificate generation',
      'Unique verification codes per certificate',
      'Automated expiration and renewal reminders',
      'Bulk certificate management',
      'Integration with HR systems',
      'Audit-ready certification reports',
    ],
    color: 'from-accent-emerald to-teal-500',
    detailIcon: BadgeCheck,
  },
  {
    icon: FileCheck,
    title: 'Compliance',
    subtitle: 'Simplify regulatory adherence',
    description:
      'Meet and exceed regulatory requirements with pre-built compliance frameworks. Automated evidence collection, audit trails, and reporting reduce the burden on your security and compliance teams.',
    capabilities: [
      'SOC 2, ISO 27001, GDPR frameworks',
      'HIPAA and PCI DSS training modules',
      'Automated audit trail generation',
      'Policy acknowledgment tracking',
      'Compliance gap analysis dashboard',
      'Regulatory change update alerts',
    ],
    color: 'from-accent-purple to-pink-500',
    detailIcon: ScrollText,
  },
];

const integrations = [
  { name: 'SSO / SAML', icon: Lock, desc: 'Single sign-on with SAML 2.0 and OIDC providers' },
  { name: 'LDAP / AD', icon: Database, desc: 'Sync users and groups from Active Directory' },
  { name: 'SIEM', icon: Workflow, desc: 'Forward events to Splunk, Sentinel, and QRadar' },
  { name: 'HRIS', icon: Settings, desc: 'Integrate with Workday, BambooHR, and SAP' },
  { name: 'LMS', icon: BookOpen, desc: 'Connect to existing learning management systems' },
  { name: 'Email', icon: Globe, desc: 'Microsoft 365 and Google Workspace integration' },
  { name: 'API', icon: Plug, desc: 'RESTful API for custom integrations and automation' },
  { name: 'Mobile', icon: Smartphone, desc: 'Native iOS and Android companion apps' },
];

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
          <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-accent-blue/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-[400px] h-[400px] bg-accent-purple/8 rounded-full blur-[100px]" />
        </div>

        <div className="page-container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.span
              variants={fadeInUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-medium mb-6"
            >
              <Shield className="w-4 h-4" />
              Platform Capabilities
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Every Tool You Need for{' '}
              <span className="gradient-text">Complete Protection</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg text-dark-300 leading-relaxed"
            >
              A unified platform covering the full lifecycle of security
              awareness—from simulated attacks and interactive training to
              risk analytics and compliance reporting.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ============ DETAILED FEATURES ============ */}
      <section className="pb-16">
        <div className="page-container">
          <div className="space-y-20">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={staggerContainer}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  idx % 2 === 1 ? 'lg:direction-rtl' : ''
                }`}
              >
                <motion.div
                  variants={fadeInUp}
                  custom={0}
                  className={idx % 2 === 1 ? 'lg:order-2' : ''}
                >
                  <div
                    className={`inline-flex w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} items-center justify-center mb-5`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-accent-blue text-sm font-medium mb-4">
                    {feature.subtitle}
                  </p>
                  <p className="text-dark-300 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.capabilities.map((cap) => (
                      <li
                        key={cap}
                        className="flex items-start gap-3 text-dark-300"
                      >
                        <CheckCircle2 className="w-5 h-5 text-accent-emerald flex-shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  variants={scaleIn}
                  custom={1}
                  className={`glass-card p-10 flex items-center justify-center min-h-[320px] ${
                    idx % 2 === 1 ? 'lg:order-1' : ''
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-6 opacity-80`}
                    >
                      <feature.detailIcon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-dark-500 text-sm max-w-xs mx-auto">
                      {feature.subtitle}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INTEGRATIONS ============ */}
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
            <motion.span
              variants={fadeInUp}
              custom={0}
              className="text-accent-cyan text-sm font-semibold uppercase tracking-wider"
            >
              Seamless Connectivity
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4"
            >
              Integrates With Your{' '}
              <span className="gradient-text">Existing Stack</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-dark-300 text-lg max-w-2xl mx-auto"
            >
              SecureAware connects natively with your identity providers, email
              platforms, SIEM tools, and HR systems for frictionless deployment.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {integrations.map((integration, i) => (
              <motion.div
                key={integration.name}
                variants={scaleIn}
                custom={i}
                className="glass-card-hover p-6 text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-blue/20 transition-colors duration-300">
                  <integration.icon className="w-6 h-6 text-dark-300 group-hover:text-accent-blue transition-colors duration-300" />
                </div>
                <h3 className="text-white font-semibold mb-1">
                  {integration.name}
                </h3>
                <p className="text-dark-500 text-xs leading-relaxed">
                  {integration.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ CTA ============ */}
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
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
            >
              Ready to See It in <span className="gradient-text">Action</span>?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-dark-300 text-lg mb-10 leading-relaxed"
            >
              Start your free trial today and experience the full power of
              SecureAware. No credit card required.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              custom={2}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="btn-primary py-3.5 px-8 text-base flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="btn-secondary py-3.5 px-8 text-base"
              >
                Request a Demo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
