"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPut } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatDateTime } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mail,
  AlertTriangle,
  Eye,
  MessageSquare,
  User,
  Building2,
  Phone,
  Clock,
  Save,
} from "lucide-react";
import type { ContactRequest } from "@/types";

type ContactWithMeta = ContactRequest;

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "New", value: "NEW" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Closed", value: "CLOSED" },
];

function getStatusVariant(status: string): "info" | "warning" | "purple" | "default" | "success" {
  switch (status) {
    case "NEW": return "info";
    case "IN_REVIEW": return "warning";
    case "CONTACTED": return "purple";
    case "CLOSED": return "default";
    default: return "info";
  }
}

export default function AdminContactsPage() {
  const { isLoading: authLoading } = useAuth();
  const { data: contacts, loading, error, refetch } = useFetch<ContactWithMeta[]>("/api/contacts?all=true");

  const [activeTab, setActiveTab] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactWithMeta | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const openDetail = (contact: ContactWithMeta) => {
    setSelectedContact(contact);
    setEditStatus(contact.status);
    setEditNotes(contact.internalNotes || "");
  };

  const handleSave = async () => {
    if (!selectedContact) return;
    setSaving(true);
    try {
      await apiPut(`/api/contacts/${selectedContact.id}`, {
        status: editStatus,
        internalNotes: editNotes || null,
      });
      toast.success("Contact updated successfully");
      setSelectedContact(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update contact");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Contacts</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const allContacts = contacts || [];
  const filteredContacts = activeTab
    ? allContacts.filter((c) => c.status === activeTab)
    : allContacts;

  const statusCounts = {
    "": allContacts.length,
    NEW: allContacts.filter((c) => c.status === "NEW").length,
    IN_REVIEW: allContacts.filter((c) => c.status === "IN_REVIEW").length,
    CONTACTED: allContacts.filter((c) => c.status === "CONTACTED").length,
    CLOSED: allContacts.filter((c) => c.status === "CLOSED").length,
  };

  const columns: Column<ContactWithMeta>[] = [
    {
      key: "name",
      label: "Contact",
      render: (c) => (
        <div>
          <p className="text-sm font-medium text-white">{c.name}</p>
          <p className="text-xs text-gray-500">{c.email}</p>
        </div>
      ),
    },
    {
      key: "company",
      label: "Company",
      render: (c) => (
        <span className="text-sm text-gray-400">{c.company || "—"}</span>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (c) => (
        <p className="text-sm text-gray-400 truncate max-w-xs">
          {c.message.length > 80 ? c.message.substring(0, 80) + "..." : c.message}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (c) => <Badge variant={getStatusVariant(c.status)}>{c.status.replace(/_/g, " ")}</Badge>,
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (c) => <span className="text-sm text-gray-500">{formatDate(c.createdAt)}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (c) => (
        <button
          onClick={(e) => { e.stopPropagation(); openDetail(c); }}
          className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Contact Requests"
        description={`${allContacts.length} total contacts`}
        icon={Mail}
      />

      {/* Status Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex gap-1 p-1 bg-dark-800/50 rounded-xl border border-gray-700/30 inline-flex">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                  : "text-gray-400 hover:text-gray-300 hover:bg-dark-700/50 border border-transparent"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({statusCounts[tab.value as keyof typeof statusCounts] || 0})
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {filteredContacts.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No Contact Requests"
          description={activeTab ? `No contacts with status "${activeTab.replace(/_/g, " ")}".` : "No contact requests received yet."}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredContacts}
          keyField="id"
          onRowClick={openDetail}
        />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title="Contact Request Detail"
        size="lg"
      >
        {selectedContact && (
          <div className="space-y-4">
            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-gray-500 text-xs">Name</p>
                  <p className="text-white">{selectedContact.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-white">{selectedContact.email}</p>
                </div>
              </div>
              {selectedContact.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Company</p>
                    <p className="text-white">{selectedContact.company}</p>
                  </div>
                </div>
              )}
              {selectedContact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="text-white">{selectedContact.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Submitted</p>
                  <p className="text-white">{formatDateTime(selectedContact.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="label-text flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </label>
              <div className="p-4 rounded-lg bg-dark-700/50 border border-gray-700/30 text-sm text-gray-300 whitespace-pre-wrap">
                {selectedContact.message}
              </div>
            </div>

            {/* Status Update */}
            <div>
              <label className="label-text">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="input-field"
              >
                <option value="NEW">New</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="label-text">Internal Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="Add internal notes about this contact..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
              <button onClick={() => setSelectedContact(null)} className="btn-secondary" disabled={saving}>
                Close
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2" disabled={saving}>
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}