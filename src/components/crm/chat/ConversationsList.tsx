
import React, { useState } from "react";
import { ConversationGroup } from "@/hooks/useCrmConversations";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface ConversationsListProps {
  conversations: ConversationGroup[];
  activeKey: string | null;
  onSelect: (key: string) => void;
  filters: {
    onlyUnanswered: boolean;
    statusFilter: string;
    search: string;
  };
  setFilters: (f: any) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  activeKey,
  onSelect,
  filters,
  setFilters,
}) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="p-2">
        <Input
          placeholder="Buscar..."
          value={filters.search}
          onChange={handleSearch}
          className="mb-2"
        />
        <div className="flex gap-2 mb-2">
          <Badge
            variant={filters.statusFilter === "open" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilters({ ...filters, statusFilter: "open" })}
          >
            Activas
          </Badge>
          <Badge
            variant={filters.statusFilter === "closed" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilters({ ...filters, statusFilter: "closed" })}
          >
            Cerradas
          </Badge>
          <Badge
            variant={filters.onlyUnanswered ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              setFilters((prev: any) => ({
                ...prev,
                onlyUnanswered: !prev.onlyUnanswered,
              }))
            }
          >
            Sin Responder
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {conversations
            .filter((c) =>
              filters.statusFilter === "closed"
                ? c.status === "closed"
                : c.status !== "closed"
            )
            .filter(
              (c) =>
                !filters.onlyUnanswered ||
                (c.latest && !c.latest.is_read && c.status !== "closed")
            )
            .filter((c) =>
              filters.search
                ? (c.companyName || "")
                    .toLowerCase()
                    .includes(filters.search.toLowerCase()) ||
                  (c.contactName || "")
                    .toLowerCase()
                    .includes(filters.search.toLowerCase())
                : true
            )
            .map((c) => (
              <div
                key={c.conversationKey}
                onClick={() => onSelect(c.conversationKey)}
                className={`flex items-center justify-between p-3 hover:bg-blue-50 rounded cursor-pointer transition ${
                  activeKey === c.conversationKey
                    ? "bg-blue-100"
                    : "bg-transparent"
                }`}
              >
                <div>
                  <div className="font-medium text-sm line-clamp-1">
                    {c.companyName || c.contactName || "Sin nombre"}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {c.latest.subject || "Sin asunto"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={c.status === "closed" ? "outline" : "secondary"}
                    className="text-2xs"
                  >
                    {c.status === "closed" ? "Cerrada" : "Activa"}
                  </Badge>
                  {c.unreadCount > 0 && (
                    <span className="text-2xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};
