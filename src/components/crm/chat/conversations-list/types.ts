
export interface ConversationPreview {
  id: string;
  company_name?: string;
  contact_name?: string;
  last_message: string;
  last_message_time: string;
  last_message_type: string;
  unread_count: number;
  conversation_status: "open" | "closed" | "pending_response" | "archived" | string;
}

export interface ConversationsListProps {
  conversations: ConversationPreview[];
  isLoading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
}
