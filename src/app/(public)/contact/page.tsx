'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiPost } from '@/hooks/use-fetch';
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Tag,
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

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
}

const faqs = [
  {
    question: 'How long does it take to deploy SecureAware?',
    answer:
      'Most organizations are fully operational within 48 hours. Our onboarding team handles SSO configuration, user import, and initial campaign setup so you can start training immediately.',
  },
  {
    question: 'Do you offer a free trial?',
    answer:
      'Yes. We offer a 14-day free trial with full platform access, including phishing simulations, training modules, and analytics dashboards. No credit card required.',
  },
  {
    question: 'Can SecureAware integrate with our existing tools?',
    answer:
      'Absolutely. We support SSO via SAML 2.0 and OIDC, LDAP/Active Directory sync, SIEM forwarding to Splunk and Sentinel, and HRIS integrations with Workday and BambooHR.',
  },
  {
    question: 'What kind of support do you provide?',
    answer:
      'All plans include email support with a 4-hour SLA. Professional and Enterprise plans include a dedicated Customer Success Manager, priority phone support, and quarterly business reviews.',
  },
  {
    question: 'Is our data secure with SecureAware?',
    answer:
      'Security is our foundation. We are SOC 2 Type II certified, encrypt all data at rest and in transit, and undergo annual third-party penetration testing. Data is hosted in ISO 27001-certified facilities.',
  },
];

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@secureaware.io',
    href: 'mailto:contact@secureaware.io',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (888) 743-2927',
    href: 'tel:+18887432927',
  },
  {
    icon: MapPin,
    label: 'Headquarters',
    value: '100 Cybersecurity Blvd, Suite 400\nSan Francisco, CA 94105',
    href: null,
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon \u2013 Fri: 8:00 AM \u2013 6:00 PM PST',
    href: null,
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiPost('/api/contacts', {
        name: data.name,
        email: data.email,
        company: data.company || undefined,
        phone: data.phone || undefined,
        subject: data.subject,
        message: data.message,
      });
      setIsSuccess(true);
      reset();
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <MessageSquare className="w-4 h-4" />
              Get in Touch
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Let\u2019s Start a <span className="gradient-text">Conversation</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg text-dark-400 leading-relaxed"
            >
              Have questions about SecureAware? Want to schedule a personalized
              demo? Our team is ready to help you build a stronger security
              culture.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ============ CONTACT FORM + SIDEBAR ============ */}
      <section className="pb-24">
        <div className="page-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-3 gap-10"
          >
            {/* Form Column */}
            <motion.div variants={fadeInUp} custom={0} className="lg:col-span-2">
              {isSuccess ? (
                <div className="glass-card p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-accent-emerald/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-accent-emerald" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Message Sent Successfully
                  </h2>
                  <p className="text-dark-400 mb-8 max-w-md mx-auto">
                    Thank you for reaching out. A member of our team will review
                    your inquiry and respond within one business day.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="btn-secondary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="glass-card p-8 sm:p-10">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Name & Email Row */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="label-text">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                          <input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            className={`input-field pl-11 ${errors.name ? 'input-error' : ''}`}
                            {...register('name', {
                              required: 'Name is required',
                              minLength: { value: 2, message: 'Name must be at least 2 characters' },
                            })}
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="label-text">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                          <input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            className={`input-field pl-11 ${errors.email ? 'input-error' : ''}`}
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email address',
                              },
                            })}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Company & Phone Row */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="company" className="label-text">Company</label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                          <input
                            id="company"
                            type="text"
                            placeholder="Acme Corp"
                            className="input-field pl-11"
                            {...register('company')}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="label-text">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                          <input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="input-field pl-11"
                            {...register('phone')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="label-text">Subject *</label>
                      <div className="relative">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                        <select
                          id="subject"
                          className={`input-field pl-11 appearance-none cursor-pointer ${errors.subject ? 'input-error' : ''}`}
                          defaultValue=""
                          {...register('subject', { required: 'Please select a subject' })}
                        >
                          <option value="" disabled>Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="demo">Schedule a Demo</option>
                          <option value="pricing">Pricing Information</option>
                          <option value="support">Technical Support</option>
                          <option value="partnership">Partnership Opportunity</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none" />
                      </div>
                      {errors.subject && (
                        <p className="mt-1.5 text-sm text-red-400">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="label-text">Message *</label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us about your security awareness needs..."
                        className={`input-field resize-none ${errors.message ? 'input-error' : ''}`}
                        {...register('message', {
                          required: 'Message is required',
                          minLength: { value: 10, message: 'Message must be at least 10 characters' },
                        })}
                      />
                      {errors.message && (
                        <p className="mt-1.5 text-sm text-red-400">{errors.message.message}</p>
                      )}
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
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={fadeInUp} custom={1} className="space-y-6">
              <div className="glass-card p-8">
                <h3 className="text-lg font-semibold text-white mb-6">Contact Information</h3>
                <div className="space-y-6">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-accent-blue" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-500 mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-dark-300 hover:text-white transition-colors text-sm whitespace-pre-line"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-dark-300 text-sm whitespace-pre-line">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Enterprise Sales</h3>
                    <p className="text-dark-500 text-sm">For organizations with 500+ employees</p>
                  </div>
                </div>
                <p className="text-dark-400 text-sm leading-relaxed mb-4">
                  Need a tailored solution for your enterprise? Our sales team
                  can build a custom package including dedicated support,
                  on-premise deployment, and white-labeling options.
                </p>
                <a
                  href="mailto:enterprise@secureaware.io"
                  className="text-accent-blue text-sm font-medium hover:underline"
                >
                  enterprise@secureaware.io
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-dark-900/50" />
        <div className="page-container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeInUp} custom={0} className="text-center mb-12">
              <span className="text-accent-cyan text-sm font-semibold uppercase tracking-wider">
                Common Questions
              </span>
              <h2 className="text-4xl font-bold text-white mt-3">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  custom={i}
                  className="glass-card overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-dark-700/30 transition-colors"
                  >
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-dark-400 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === i ? 'max-h-48' : 'max-h-0'
                    }`}
                  >
                    <p className="px-6 pb-6 text-dark-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
