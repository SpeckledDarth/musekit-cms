"use client";

import { useState } from "react";
import { BlogAdmin } from "@/src/blog";
import { WaitlistAdmin } from "@/src/marketing";
import { CustomPageEditor } from "@/src/custom-pages";
import { cn } from "@/src/lib/utils";
import { FileText, Users, Layout } from "lucide-react";

const tabs = [
  { id: "blog", label: "Blog", icon: FileText },
  { id: "waitlist", label: "Waitlist", icon: Users },
  { id: "pages", label: "Pages", icon: Layout },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("blog");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex gap-2 mb-8 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "blog" && <BlogAdmin />}
      {activeTab === "waitlist" && <WaitlistAdmin />}
      {activeTab === "pages" && <CustomPageEditor />}
    </div>
  );
}
