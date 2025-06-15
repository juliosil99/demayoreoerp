
import { ConversationListItem } from './conversations-list/ConversationListItem';
import { ConversationListSkeleton } from './conversations-list/ConversationListSkeleton';
import { ConversationListEmpty } from './conversations-list/ConversationListEmpty';
import { useInfiniteScroll } from './conversations-list/useInfiniteScroll';
import { ConversationsListProps } from './conversations-list/types';
import { NextPageLoader } from './conversations-list/NextPageLoader';

export const ConversationsList = ({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: ConversationsListProps) => {
  const { loadMoreRef } = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  if (conversations.length === 0) {
    return <ConversationListEmpty />;
  }

  return (
    <div className="h-full overflow-y-auto">
      <ul>
        {conversations.map((conv) => (
          <ConversationListItem
            key={conv.id}
            conversation={conv}
            isSelected={conv.id === selectedId}
            onSelect={onSelect}
          />
        ))}
        
        <li ref={loadMoreRef} className="h-1" />
        
        {isFetchingNextPage && <NextPageLoader />}
      </ul>
    </div>
  );
};
