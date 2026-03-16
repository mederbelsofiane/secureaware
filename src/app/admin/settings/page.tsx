"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Settings,
  Save,
  Globe,
  Mail,
  Shield,
  Link2,
  Bell,
  Palette,
  Clock,
  Database,
  CheckCircle2,
} from "lucide-react";

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
}

const SECTIONS: SettingsSection[] = [
  { id: "general", title: "General", description: "Platform name, branding, and general configuration", icon: Globe, iconColor: "text-cyan-400" },
  { id: "email", title: "Email", description: "SMTP configuration and email templates", icon: Mail, iconColor: "text-blue-400" },
  { id: "security", title: "Security", description: "Authentication, password policies, and session settings", icon: Shield, iconColor: "text-emerald-400" },
  { id: "notifications", title: "Notifications", description: "Alert preferences and notification channels", icon: Bell, iconColor: "text-yellow-400" },
  { id: "integrations", title: "Integrations", description: "Third-party service connections and API keys", icon: Link2, iconColor: "text-purple-400" },
];

export default function AdminSettingsPage() {
  const { isLoading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);

  // Local state for settings (no backend API yet)
  const [general, setGeneral] = useState({
    platformName: "SecureAware",
    companyName: "DTS Solution",
    supportEmail: "support@secureaware.online",
    timezone: "UTC",
    language: "en",
    maintenanceMode: false,
  });

  const [email, setEmail] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    fromEmail: "noreply@secureaware.online",
    fromName: "SecureAware Platform",
    enableTLS: true,
  });

  const [security, setSecurity] = useState({
    sessionTimeout: "60",
    maxLoginAttempts: "5",
    lockoutDuration: "15",
    minPasswordLength: "8",
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    mfaEnabled: false,
    passwordExpiryDays: "90",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    campaignReminders: true,
    quizDeadlines: true,
    securityAlerts: true,
    weeklyDigest: true,
    reminderDaysBefore: "3",
  });

  const [integrations, setIntegrations] = useState({
    ssoEnabled: false,
    ssoProvider: "",
    ssoClientId: "",
    ssoClientSecret: "",
    ldapEnabled: false,
    ldapUrl: "",
    webhookUrl: "",
    slackWebhook: "",
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save delay since no backend API exists yet
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  if (authLoading) return <PageLoading />;

  return (
    <div className="page-container">
      <PageHeader
        title="Platform Settings"
        description="Configure your security awareness platform"
        icon={Settings}
        action={
          <button onClick={handleSave} className="btn-primary flex items-center gap-2" disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save All Settings"}
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 flex-shrink-0"
        >
          <div className="glass-card p-2 space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                  activeSection === section.id
                    ? "bg-accent-blue/15 text-accent-blue border border-accent-blue/20"
                    : "text-gray-400 hover:text-gray-300 hover:bg-dark-700/50 border border-transparent"
                }`}
              >
                <section.icon className={`w-4 h-4 ${activeSection === section.id ? "text-accent-blue" : section.iconColor}`} />
                {section.title}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          {/* General Settings */}
          {activeSection === "general" && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">General Settings</h3>
                  <p className="text-sm text-gray-500">Platform name, branding, and general configuration</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Platform Name</label>
                  <input
                    type="text"
                    value={general.platformName}
                    onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Company Name</label>
                  <input
                    type="text"
                    value={general.companyName}
                    onChange={(e) => setGeneral({ ...general, companyName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Support Email</label>
                  <input
                    type="email"
                    value={general.supportEmail}
                    onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Timezone</label>
                  <select
                    value={general.timezone}
                    onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                    className="input-field"
                  >
                    <option value="UTC">UTC</option>
                    <option value="US/Eastern">US/Eastern</option>
                    <option value="US/Pacific">US/Pacific</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Berlin">Europe/Berlin</option>
                    <option value="Asia/Dubai">Asia/Dubai</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Language</label>
                  <select
                    value={general.language}
                    onChange={(e) => setGeneral({ ...general, language: e.target.value })}
                    className="input-field"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={general.maintenanceMode}
                      onChange={(e) => setGeneral({ ...general, maintenanceMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&apos;&apos;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                  <span className="text-sm text-gray-400">Maintenance Mode</span>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeSection === "email" && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Email Configuration</h3>
                  <p className="text-sm text-gray-500">SMTP server settings and email defaults</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">SMTP Host</label>
                  <input
                    type="text"
                    value={email.smtpHost}
                    onChange={(e) => setEmail({ ...email, smtpHost: e.target.value })}
                    className="input-field"
                    placeholder="smtp.example.com"
                  />
                </div>
                <div>
                  <label className="label-text">SMTP Port</label>
                  <input
                    type="text"
                    value={email.smtpPort}
                    onChange={(e) => setEmail({ ...email, smtpPort: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">SMTP Username</label>
                  <input
                    type="text"
                    value={email.smtpUser}
                    onChange={(e) => setEmail({ ...email, smtpUser: e.target.value })}
                    className="input-field"
                    placeholder="username@example.com"
                  />
                </div>
                <div>
                  <label className="label-text">SMTP Password</label>
                  <input
                    type="password"
                    value={email.smtpPass}
                    onChange={(e) => setEmail({ ...email, smtpPass: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="label-text">From Email</label>
                  <input
                    type="email"
                    value={email.fromEmail}
                    onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">From Name</label>
                  <input
                    type="text"
                    value={email.fromName}
                    onChange={(e) => setEmail({ ...email, fromName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={email.enableTLS}
                      onChange={(e) => setEmail({ ...email, enableTLS: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&apos;&apos;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-sm text-gray-400">Enable TLS/SSL</span>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === "security" && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                  <p className="text-sm text-gray-500">Authentication policies and session management</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Max Login Attempts</label>
                  <input
                    type="number"
                    value={security.maxLoginAttempts}
                    onChange={(e) => setSecurity({ ...security, maxLoginAttempts: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Lockout Duration (minutes)</label>
                  <input
                    type="number"
                    value={security.lockoutDuration}
                    onChange={(e) => setSecurity({ ...security, lockoutDuration: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Minimum Password Length</label>
                  <input
                    type="number"
                    value={security.minPasswordLength}
                    onChange={(e) => setSecurity({ ...security, minPasswordLength: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Password Expiry (days)</label>
                  <input
                    type="number"
                    value={security.passwordExpiryDays}
                    onChange={(e) => setSecurity({ ...security, passwordExpiryDays: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div></div>
                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Password Requirements</h4>
                  {[
                    { key: "requireUppercase", label: "Require uppercase letters" },
                    { key: "requireNumbers", label: "Require numbers" },
                    { key: "requireSpecialChars", label: "Require special characters" },
                    { key: "mfaEnabled", label: "Enable Multi-Factor Authentication (MFA)" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(security as any)[item.key]}
                          onChange={(e) => setSecurity({ ...security, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&apos;&apos;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <span className="text-sm text-gray-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === "notifications" && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
                  <p className="text-sm text-gray-500">Configure alerting and notification channels</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { key: "emailNotifications", label: "Email Notifications", desc: "Send notifications via email" },
                  { key: "campaignReminders", label: "Campaign Reminders", desc: "Remind users about active campaigns" },
                  { key: "quizDeadlines", label: "Quiz Deadline Alerts", desc: "Notify users before quiz deadlines" },
                  { key: "securityAlerts", label: "Security Alerts", desc: "Alert admins about security events" },
                  { key: "weeklyDigest", label: "Weekly Digest", desc: "Send weekly summary to admins" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-dark-700/30 border border-gray-700/30">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(notifications as any)[item.key]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&apos;&apos;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                ))}
                <div className="mt-4">
                  <label className="label-text">Reminder Days Before Deadline</label>
                  <input
                    type="number"
                    value={notifications.reminderDaysBefore}
                    onChange={(e) => setNotifications({ ...notifications, reminderDaysBefore: e.target.value })}
                    className="input-field w-32"
                    min={1}
                    max={30}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Integration Settings */}
          {activeSection === "integrations" && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Link2 className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Integrations</h3>
                  <p className="text-sm text-gray-500">Connect third-party services and configure SSO</p>
                </div>
              </div>

              {/* SSO */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" /> Single Sign-On (SSO)
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrations.ssoEnabled}
                      onChange={(e) => setIntegrations({ ...integrations, ssoEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&apos;&apos;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                  <span className="text-sm text-gray-400">Enable SSO</span>
                </div>
                {integrations.ssoEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-purple-500/30">
                    <div>
                      <label className="label-text">SSO Provider</label>
                      <select
                        value={integrations.ssoProvider}
                        onChange={(e) => setIntegrations({ ...integrations, ssoProvider: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Select Provider</option>
                        <option value="azure">Azure AD</option>
                        <option value="okta">Okta</option>
                        <option value="google">Google Workspace</option>
                        <option value="onelogin">OneLogin</option>
                      </select>
                    </div>
                    <div></div>
                    <div>
                      <label className="label-text">Client ID</label>
                      <input
                        type="text"
                        value={integrations.ssoClientId}
                        onChange={(e) => setIntegrations({ ...integrations, ssoClientId: e.target.value })}
                        className="input-field"
                        placeholder="Enter client ID"
                      />
                    </div>
                    <div>
                      <label className="label-text">Client Secret</label>
                      <input
                        type="password"
                        value={integrations.ssoClientSecret}
                        onChange={(e) => setIntegrations({ ...integrations, ssoClientSecret: e.target.value })}
                        className="input-field"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* LDAP */}
              <div className="mb-6 pt-6 border-t border-gray-700/50">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" /> LDAP / Active Directory
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrations.ldapEnabled}
                      onChange={(e) => setIntegrations({ ...integrations, ldapEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&apos;&apos;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                  <span className="text-sm text-gray-400">Enable LDAP</span>
                </div>
                {integrations.ldapEnabled && (
                  <div className="pl-4 border-l-2 border-blue-500/30">
                    <label className="label-text">LDAP URL</label>
                    <input
                      type="text"
                      value={integrations.ldapUrl}
                      onChange={(e) => setIntegrations({ ...integrations, ldapUrl: e.target.value })}
                      className="input-field"
                      placeholder="ldap://directory.example.com:389"
                    />
                  </div>
                )}
              </div>

              {/* Webhooks */}
              <div className="pt-6 border-t border-gray-700/50">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-emerald-400" /> Webhooks
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Webhook URL</label>
                    <input
                      type="url"
                      value={integrations.webhookUrl}
                      onChange={(e) => setIntegrations({ ...integrations, webhookUrl: e.target.value })}
                      className="input-field"
                      placeholder="https://hooks.example.com/webhook"
                    />
                  </div>
                  <div>
                    <label className="label-text">Slack Webhook URL</label>
                    <input
                      type="url"
                      value={integrations.slackWebhook}
                      onChange={(e) => setIntegrations({ ...integrations, slackWebhook: e.target.value })}
                      className="input-field"
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button at bottom */}
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2" disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}