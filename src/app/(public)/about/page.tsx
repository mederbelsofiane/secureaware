'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Target,
  Heart,
  Lightbulb,
  Users,
  Globe,
  Lock,
  TrendingUp,
  Award,
  Building2,
  Linkedin,
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

const values = [
  {
    icon: Shield,
    title: 'Security First',
    description:
      'We practice what we preach. Security is embedded in every line of code we write and every decision we make.',
    color: 'from-accent-blue to-accent-purple',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We leverage behavioral science, machine learning, and adaptive algorithms to stay ahead of evolving threats.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Heart,
    title: 'People Centered',
    description:
      'We design for humans, not checkboxes. Engaging experiences drive lasting behavioral change and genuine security awareness.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Target,
    title: 'Measurable Impact',
    description:
      'Every feature is built to deliver quantifiable risk reduction. We help you prove ROI to stakeholders with real data.',
    color: 'from-accent-emerald to-teal-500',
  },
  {
    icon: Users,
    title: 'Partnership',
    description:
      'We succeed when our customers succeed. Dedicated support, onboarding, and ongoing strategic guidance come standard.',
    color: 'from-accent-cyan to-accent-blue',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description:
      'Multi-language support, regional compliance templates, and localized content ensure effective training across borders.',
    color: 'from-accent-purple to-violet-500',
  },
];

const team = [
  {
    name: 'Michael Reeves',
    role: 'Chief Executive Officer',
    bio: 'Former VP of Security at a Fortune 500 financial services firm with 18 years in cybersecurity leadership and enterprise risk management.',
  },
  {
    name: 'Dr. Anika Patel',
    role: 'Chief Technology Officer',
    bio: 'PhD in Computer Science from MIT. Previously led engineering at a leading threat intelligence platform. Expert in ML-driven security systems.',
  },
  {
    name: 'David Kim',
    role: 'Chief Product Officer',
    bio: '15 years building SaaS products at scale. Former Director of Product at a major identity security company. Passionate about user-centric design.',
  },
  {
    name: 'Rachel Okonkwo',
    role: 'VP of Customer Success',
    bio: 'Decade of experience in enterprise customer success. Drives adoption strategy for organizations with 10,000+ employees across multiple industries.',
  },
];

const achievements = [
  { value: '2019', label: 'Founded' },
  { value: '2,500+', label: 'Organizations' },
  { value: '45+', label: 'Countries' },
  { value: '1.2M+', label: 'Users Trained' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4.8/5', label: 'Customer Rating' },
];

export default function AboutPage() {
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
          <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-accent-blue/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-accent-purple/8 rounded-full blur-[100px]" />
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
              <Building2 className="w-4 h-4" />
              About SecureAware
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Empowering Organizations Through{' '}
              <span className="gradient-text">Security Awareness</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg text-dark-400 leading-relaxed"
            >
              We believe that cybersecurity starts with people. SecureAware was
              founded to bridge the gap between technical defenses and human
              behavior, creating a culture where every employee becomes a
              vigilant defender against cyber threats.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ============ MISSION & VISION ============ */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp} custom={0} className="glass-card p-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-dark-400 leading-relaxed">
                To dramatically reduce human-driven security incidents by
                delivering intelligent, engaging, and measurable awareness
                training that transforms employee behavior at scale. We make
                enterprise-grade security education accessible to organizations
                of every size.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} custom={1} className="glass-card p-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-emerald to-teal-500 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-dark-400 leading-relaxed">
                A world where every organization has the tools and knowledge to
                build a resilient security culture. We envision a future where
                phishing attacks and social engineering become ineffective
                because employees are trained, alert, and empowered to respond
                correctly every time.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ CORE VALUES ============ */}
      <section className="py-20 relative">
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
              className="text-accent-emerald text-sm font-semibold uppercase tracking-wider"
            >
              What Drives Us
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4"
            >
              Our Core <span className="gradient-text">Values</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                variants={scaleIn}
                custom={i}
                className="glass-card-hover p-8 group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-dark-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ LEADERSHIP TEAM ============ */}
      <section className="py-20">
        <div className="page-container">
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
              className="text-accent-blue text-sm font-semibold uppercase tracking-wider"
            >
              Leadership
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4"
            >
              Meet the <span className="gradient-text">Team</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-dark-400 text-lg max-w-2xl mx-auto"
            >
              Seasoned cybersecurity professionals, product builders, and
              customer champions dedicated to your success.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                variants={fadeInUp}
                custom={i}
                className="glass-card p-8 text-center group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-white">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-accent-blue text-sm font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-dark-400 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ ACHIEVEMENTS ============ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-accent-blue/5 to-dark-950" />
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
              className="text-accent-purple text-sm font-semibold uppercase tracking-wider"
            >
              By The Numbers
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl font-bold text-white mt-3"
            >
              Our <span className="gradient-text">Impact</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {achievements.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                custom={i}
                className="glass-card p-6 text-center"
              >
                <p className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-dark-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
