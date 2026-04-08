"use client";

import { useState, useEffect } from "react";
import { useFetch, apiPut } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import {
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Eye,
  Building2,
  Phone,
  Clock,
  X,
} from "lucide-react";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

interface ContactsResponse {
  items: ContactRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const statusBadgeVariant: Record<string, "info" | "warning" | "success" | "default"> = {
  NEW: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
};

export default function SuperAdminContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const limit = 20;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  }).toString();

  const { data, loading, error, refetch } = useFetch<ContactsResponse>(`/api/contacts?${queryParams}`);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleStatusUpdate = async (contactId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await apiPut(`/api/contacts/${contactId}`, { status: newStatus });
      refetch();
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading && !data) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container sa-page-content">
        <PageHeader title="Contact Requests" description="Manage contact form submissions from the website." icon={Mail} />
        <div className="sa-card rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold sa-text-primary mb-2">Failed to Load Contacts</h2>
          <p className="sa-text-muted mb-2">Could not load contact requests.</p>
          <p className="text-red-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const contacts = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div className="page-container sa-page-content">
      <PageHeader title="Contact Requests" description={`${total} total contact submissions from the website.`} icon={Mail} />

      {/* Filters */}
      <div className="sa-card rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sa-text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, company, or message..."
              className="sa-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </form>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sa-input rounded-xl px-4 py-2.5 text-sm min-w-[160px]"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card rounded-2xl overflow-hidden">
        {contacts.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 sa-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold sa-text-primary mb-2">No Contact Requests</h3>
            <p className="sa-text-muted text-sm">No contact submissions match your current filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="sa-table-header">
                    <th className="text-left text-sm font-medium py-3 px-4">Name</th>
                    <th className="text-left text-sm font-medium py-3 px-4">Email</th>
                    <th className="text-left text-sm font-medium py-3 px-4">Company</th>
                    <th className="text-left text-sm font-medium py-3 px-4">Phone</th>
                    <th className="text-left text-sm font-medium py-3 px-4">Message</th>
                    <th className="text-left text-sm font-medium py-3 px-4">Status</th>
                    <th className="text-left text-sm font-medium py-3 px-4">Date</th>
                    <th className="text-left text-sm font-medium py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="sa-table-row transition-colors">
                      <td className="py-3 px-4">
                        <span className="sa-text-primary text-sm font-medium">{contact.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <a href={`mailto:${contact.email}`} className="text-purple-400 hover:text-purple-300 text-sm">{contact.email}</a>
                      </td>
                      <td className="py-3 px-4 sa-text-secondary text-sm">{contact.company || "-"}</td>
                      <td className="py-3 px-4 sa-text-secondary text-sm">{contact.phone || "-"}</td>
                      <td className="py-3 px-4 sa-text-muted text-sm max-w-[200px] truncate">{contact.message}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusBadgeVariant[contact.status] || "default"}>
                          {contact.status === "IN_PROGRESS" ? "In Progress" : contact.status.charAt(0) + contact.status.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 sa-text-muted text-xs">{formatDateTime(contact.createdAt)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="p-2 rounded-lg hover:bg-purple-500/10 text-purple-400 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t sa-border">
                <p className="sa-text-muted text-sm">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="sa-pagination-btn p-2 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? "bg-purple-500 text-white"
                            : "sa-pagination-btn"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="sa-pagination-btn p-2 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="sa-modal-overlay absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedContact(null)} />
          <div className="sa-card relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold sa-text-primary">Contact Details</h2>
              <button onClick={() => setSelectedContact(null)} className="sa-text-muted hover:sa-text-primary p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="sa-label text-xs mb-0.5">Name & Email</p>
                  <p className="sa-text-primary text-sm font-medium">{selectedContact.name}</p>
                  <a href={`mailto:${selectedContact.email}`} className="text-purple-400 hover:text-purple-300 text-sm">{selectedContact.email}</a>
                </div>
              </div>

              {selectedContact.company && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="sa-label text-xs mb-0.5">Company</p>
                    <p className="sa-text-primary text-sm">{selectedContact.company}</p>
                  </div>
                </div>
              )}

              {selectedContact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="sa-label text-xs mb-0.5">Phone</p>
                    <p className="sa-text-primary text-sm">{selectedContact.phone}</p>
                  </div>
                </div>
              )}

              {selectedContact.subject && (
                <div>
                  <p className="sa-label text-xs mb-1">Subject</p>
                  <p className="sa-text-primary text-sm">{selectedContact.subject}</p>
                </div>
              )}

              <div>
                <p className="sa-label text-xs mb-1">Message</p>
                <div className="sa-input rounded-xl p-3 text-sm sa-text-secondary max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="sa-label text-xs mb-0.5">Submitted</p>
                  <p className="sa-text-muted text-sm">{formatDateTime(selectedContact.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="sa-label text-xs mb-2">Status</p>
                <div className="flex gap-2">
                  {["NEW", "IN_PROGRESS", "RESOLVED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(selectedContact.id, s)}
                      disabled={updatingStatus || selectedContact.status === s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedContact.status === s
                          ? s === "NEW" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : s === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "sa-pagination-btn border sa-border"
                      } disabled:opacity-50`}
                    >
                      {s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
