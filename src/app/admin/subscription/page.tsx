"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/hooks/use-auth";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CreditCard,
  Calendar,
  Users,
  Mail,
  Crown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  Building2,
  Star,
} from "lucide-react";

interface SubscriptionEvent {
  id: string;
  type: string;
  description: string | null;
  amount: number | null;
  currency: string;
  planFrom: string | null;
  planTo: string | null;
  createdAt: string;
}

interface SubscriptionData {
  id: string;
  name: string;
  plan: string;
  status: string;
  maxUsers: number;
  currentUsers: number;
  actualUsers: number;
  billingEmail: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  events: SubscriptionEvent[];
}

const planConfig: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; features: string[] }> = {
  FREE: {
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    icon: Shield,
    features: ["Up to 10 users", "Basic modules", "Email support", "Community access"],
  },
  STARTER: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: Zap,
    features: ["Up to 50 users", "All modules", "Quiz builder", "Basic reporting", "Email support"],
  },
  PROFESSIONAL: {
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: Star,
    features: ["Up to 200 users", "All modules", "Advanced quizzes", "Phishing simulations", "Full reporting", "Priority support"],
  },
  ENTERPRISE: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: Crown,
    features: ["Unlimited users", "All features", "Custom modules", "SSO/LDAP", "API access", "Dedicated support", "SLA guarantee"],
  },
};

const planBadgeVariant: Record<string, "default" | "info" | "purple" | "warning"> = {
  FREE: "default",
  STARTER: "info",
  PROFESSIONAL: "purple",
  ENTERPRISE: "warning",
};

const eventTypeConfig: Record<string, { color: string; icon: React.ElementType }> = {
  PAYMENT: { color: "text-green-400", icon: CreditCard },
  RENEWAL: { color: "text-blue-400", icon: ArrowUpRight },
  UPGRADE: { color: "text-purple-400", icon: ArrowUpRight },
  DOWNGRADE: { color: "text-orange-400", icon: ArrowUpRight },
  CANCELLATION: { color: "text-red-400", icon: AlertTriangle },
  TRIAL_START: { color: "text-cyan-400", icon: Clock },
  TRIAL_END: { color: "text-yellow-400", icon: Clock },
};

export default function AdminSubscriptionPage() {
  const { isLoading: authLoading } = useAuth();
  const { data, loading, error } = useFetch<SubscriptionData>("/api/admin/subscription");

  if (authLoading || loading) return <PageLoading />;

  if (error || !data) {
    return (
      <div className="page-container">
        <EmptyState
          icon={CreditCard}
          title="Unable to load subscription"
          description={error || "Could not load subscription information"}
        />
      </div>
    );
  }

  const config = planConfig[data.plan] || planConfig.FREE;
  const PlanIcon = config.icon;

  // Calculate days remaining
  const endDate = data.subscriptionEndDate ? new Date(data.subscriptionEndDate) : null;
  const now = new Date();
  const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null;

  // Subscription status
  const isExpired = endDate && endDate < now;
  const isActive = data.status === "ACTIVE" && !isExpired;
  const seatUsage = data.actualUsers / data.maxUsers;
  const seatPercentage = Math.min(100, Math.round(seatUsage * 100));

  return (
    <div className="page-container">
      <PageHeader
        title="Subscription"
        description="View your organization\'s subscription details and billing information"
        icon={CreditCard}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className={cn("glass-card p-6 border-2", config.border)}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", config.bg)}>
                  <PlanIcon className={cn("w-7 h-7", config.color)} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{data.plan} Plan</h3>
                  <p className="text-sm text-gray-400">{data.name}</p>
                </div>
              </div>
              <Badge variant={isActive ? "success" : isExpired ? "danger" : "warning"}>
                {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Start Date */}
              <div className="p-4 rounded-lg bg-dark-700/30 border border-gray-700/30">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Start Date</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {data.subscriptionStartDate ? formatDate(data.subscriptionStartDate) : "Not set"}
                </p>
              </div>

              {/* End Date */}
              <div className="p-4 rounded-lg bg-dark-700/30 border border-gray-700/30">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">End Date</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {data.subscriptionEndDate ? formatDate(data.subscriptionEndDate) : "Not set"}
                </p>
              </div>

              {/* Days Remaining */}
              <div className="p-4 rounded-lg bg-dark-700/30 border border-gray-700/30">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Days Remaining</span>
                </div>
                <p className={cn(
                  "text-sm font-semibold",
                  daysRemaining === null ? "text-gray-400" :
                  daysRemaining > 30 ? "text-green-400" :
                  daysRemaining > 7 ? "text-yellow-400" : "text-red-400"
                )}>
                  {daysRemaining !== null ? `${daysRemaining} days` : "N/A"}
                </p>
              </div>
            </div>

            {/* Seat Usage */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Seat Usage</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {data.actualUsers} / {data.maxUsers} users
                </span>
              </div>
              <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${seatPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    seatPercentage > 90 ? "bg-red-500" :
                    seatPercentage > 70 ? "bg-yellow-500" : "bg-accent-blue"
                  )}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {seatPercentage}% of available seats used
              </p>
            </div>

            {/* Billing Email */}
            {data.billingEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                <span>Billing email: <span className="text-white">{data.billingEmail}</span></span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Plan Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-card p-6 h-full">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Plan Features
            </h4>
            <ul className="space-y-3">
              {config.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={cn("w-4 h-4 flex-shrink-0", config.color)} />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-gray-700/50">
              <a
                href="mailto:sales@secureaware.online?subject=Plan Upgrade Inquiry"
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                Contact Us to Upgrade
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Plan Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent-blue" />
            Compare Plans
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(planConfig).map(([planName, pc]) => {
              const Icon = pc.icon;
              const isCurrentPlan = planName === data.plan;
              return (
                <div
                  key={planName}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    isCurrentPlan
                      ? `${pc.border} ${pc.bg}`
                      : "border-gray-700/30 bg-dark-700/20 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={cn("w-5 h-5", pc.color)} />
                    <span className={cn("font-semibold text-sm", pc.color)}>{planName}</span>
                    {isCurrentPlan && (
                      <Badge variant={planBadgeVariant[planName] || "default"}>Current</Badge>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {pc.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {pc.features.length > 4 && (
                      <li className="text-xs text-gray-500">+ {pc.features.length - 4} more</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Subscription History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-blue" />
            Subscription History
          </h4>
          {data.events.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No subscription events yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-700/50">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Event</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {data.events.map((event) => {
                    const etc = eventTypeConfig[event.type] || { color: "text-gray-400", icon: Clock };
                    const EventIcon = etc.icon;
                    return (
                      <tr key={event.id} className="text-sm">
                        <td className="py-3 text-gray-400">
                          {formatDate(event.createdAt)}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <EventIcon className={cn("w-4 h-4", etc.color)} />
                            <span className={cn("font-medium", etc.color)}>{event.type}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-300">
                          {event.description || "-"}
                        </td>
                        <td className="py-3 text-white font-medium">
                          {event.amount ? `$${event.amount.toFixed(2)} ${event.currency}` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}