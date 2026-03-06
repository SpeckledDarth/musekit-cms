"use client";

import { useState, useEffect, useMemo } from "react";
import { getBrowserClient } from "@/src/lib/supabase";
import { formatDate } from "@/src/lib/utils";
import { useToast } from "@/src/lib/toast";
import { RelativeTime } from "@/src/lib/RelativeTime";
import { Pagination, paginate } from "@/src/lib/Pagination";
import { auditLog } from "@/src/lib/audit";
import { useURLFilters } from "@/src/lib/useURLFilters";
import { Download, RefreshCw, Search, ChevronUp, ChevronDown, Plus, Trash2, X, Users } from "lucide-react";

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  referral_source: string | null;
  created_at: string;
}

type SortField = "email" | "name" | "created_at";
type SortDirection = "asc" | "desc";

export function WaitlistAdmin() {
  const { getParam, getNumericParam, setParams } = useURLFilters();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(getParam("q"));
  const [sortField, setSortField] = useState<SortField>(getParam("sort", "created_at") as SortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(getParam("dir", "desc") as SortDirection);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [addingEntry, setAddingEntry] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(getNumericParam("page", 1));
  const [emailError, setEmailError] = useState("");

  const { success, error: showError } = useToast();

  async function fetchEntries() {
    setLoading(true);
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase
        .from("waitlist_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error("Failed to fetch waitlist:", err);
      showError("Failed to load waitlist entries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredAndSortedEntries = useMemo(() => {
    let result = entries;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => e.email.toLowerCase().includes(q) || (e.name && e.name.toLowerCase().includes(q)));
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === "email") {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === "name") {
        comparison = (a.name || "").localeCompare(b.name || "");
      } else {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [entries, searchQuery, sortField, sortDirection]);

  const paginatedItems = paginate(filteredAndSortedEntries, page);

  function handleSort(field: SortField) {
    let newDir: SortDirection;
    if (sortField === field) {
      newDir = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDir);
    } else {
      newDir = "asc";
      setSortField(field);
      setSortDirection(newDir);
    }
    setParams({ sort: field, dir: newDir, page: null });
  }

  function SortIndicator({ field }: { field: SortField }) {
    if (sortField !== field) {
      return <ChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-30" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  }

  async function handleAddEntry() {
    if (!newEmail.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setAddingEntry(true);
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase
        .from("waitlist_entries")
        .insert({ email: newEmail.trim(), name: newName.trim() || null, referral_source: "manual" });
      if (error) throw error;
      auditLog({ action: "create", entity: "waitlist_entry", details: { email: newEmail.trim() } });
      setNewEmail("");
      setNewName("");
      setEmailError("");
      setShowAddForm(false);
      success("Entry added to waitlist");
      await fetchEntries();
    } catch (err) {
      console.error("Failed to add entry:", err);
      showError("Failed to add entry");
    } finally {
      setAddingEntry(false);
    }
  }

  async function handleDeleteEntry(id: string) {
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase
        .from("waitlist_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
      auditLog({ action: "delete", entity: "waitlist_entry", entityId: id });
      setDeleteConfirmId(null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      success("Entry deleted");
      await fetchEntries();
    } catch (err) {
      console.error("Failed to delete entry:", err);
      showError("Failed to delete entry");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filteredAndSortedEntries.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredAndSortedEntries.map((e) => e.id)));
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected entry(ies)?`)) return;
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase
        .from("waitlist_entries")
        .delete()
        .in("id", Array.from(selected));
      if (error) throw error;
      const count = selected.size;
      auditLog({ action: "bulk_delete", entity: "waitlist_entry", details: { count: selected.size } });
      setSelected(new Set());
      success(`${count} entry(ies) deleted`);
      await fetchEntries();
    } catch (err) {
      console.error("Failed to bulk delete:", err);
      showError("Failed to delete selected entries");
    }
  }

  function exportCSV() {
    const csv = [
      "Name,Email,Referral Source,Signed Up",
      ...filteredAndSortedEntries.map((e) =>
        [e.name || "", e.email, e.referral_source || "", e.created_at].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success("CSV exported");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Waitlist</h1>
          <p className="text-muted-foreground">{entries.length} total entries</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
          <button
            onClick={fetchEntries}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
            aria-label="Refresh waitlist"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 border border-border rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <label htmlFor="waitlist-add-name" className="sr-only">Name</label>
            <input
              id="waitlist-add-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name (optional)"
              className="w-40 px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <label htmlFor="waitlist-add-email" className="sr-only">Email address</label>
            <input
              id="waitlist-add-email"
              type="email"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
              placeholder="Enter email address..."
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleAddEntry}
              disabled={addingEntry || !newEmail.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50 text-sm"
            >
              {addingEntry ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewEmail(""); setNewName(""); setEmailError(""); }}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Close add form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <label htmlFor="waitlist-search" className="sr-only">Search waitlist entries</label>
          <input
            id="waitlist-search"
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setParams({ q: e.target.value, page: null }); }}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-muted rounded-lg" />
          ))}
        </div>
      ) : filteredAndSortedEntries.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "No entries match your search." : "No waitlist entries yet."}
          </p>
          {!searchQuery && entries.length === 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add first entry
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-muted/50">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === filteredAndSortedEntries.length && filteredAndSortedEntries.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all entries"
                      className="rounded border-border"
                    />
                  </th>
                  <th
                    onClick={() => handleSort("name")}
                    className="group text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Name
                      <SortIndicator field="name" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort("email")}
                    className="group text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Email
                      <SortIndicator field="email" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground select-none">
                    Source
                  </th>
                  <th
                    onClick={() => handleSort("created_at")}
                    className="group text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Signed Up
                      <SortIndicator field="created_at" />
                    </span>
                  </th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((entry) => (
                  <tr key={entry.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(entry.id)}
                        onChange={() => toggleSelect(entry.id)}
                        aria-label={`Select ${entry.email}`}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{entry.name || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-sm">{entry.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{entry.referral_source || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <RelativeTime date={entry.created_at} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {deleteConfirmId === entry.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 border border-border rounded text-xs hover:bg-muted"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(entry.id)}
                          className="p-1 text-muted-foreground hover:text-red-600 rounded transition-colors"
                          aria-label={`Delete ${entry.email}`}
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalItems={filteredAndSortedEntries.length} onPageChange={(p) => { setPage(p); setParams({ page: p > 1 ? p : null }); }} />
        </>
      )}
    </div>
  );
}
