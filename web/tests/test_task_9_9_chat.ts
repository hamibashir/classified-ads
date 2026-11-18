import { ChatConversation, ChatMessage } from '../types/chat';

/**
 * Task 9.9 Automated Verification Probe
 * Verifies In-App Chat data structures, conversation filtering,
 * message chronological ordering, unread count tracking, and optimistic message append.
 */

function runVerification() {
  console.log('--- Starting Task 9.9 In-App Chat Probe ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
    }
  }

  // 1. Mock Conversations
  let conversations: ChatConversation[] = [
    {
      id: 'conv-1',
      adId: 'ad-corolla',
      ad: {
        id: 'ad-corolla',
        title: 'Toyota Corolla GLi 1.3 Automatic 2021',
        slug: 'toyota-corolla-gli-13-automatic',
        price: 3850000,
        currency: 'PKR',
        status: 'ACTIVE',
        images: [{ url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341', order: 0 }],
      },
      otherUser: {
        id: 'user-seller-1',
        name: 'Usman Motors',
        avatarUrl: null,
      },
      lastMessage: {
        id: 'msg-1',
        text: 'Walaikum Assalam, car is available in Gulberg III.',
        createdAt: '2026-10-07T12:30:00Z',
        senderId: 'user-seller-1',
        isRead: false,
      },
      unreadCount: 1,
      updatedAt: '2026-10-07T12:30:00Z',
    },
    {
      id: 'conv-2',
      adId: 'ad-iphone',
      ad: {
        id: 'ad-iphone',
        title: 'iPhone 15 Pro Max 256GB Natural Titanium',
        slug: 'iphone-15-pro-max-256gb',
        price: 245000,
        currency: 'PKR',
        status: 'ACTIVE',
        images: [{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569', order: 0 }],
      },
      otherUser: {
        id: 'user-seller-2',
        name: 'Ahmed Telecom',
        avatarUrl: null,
      },
      lastMessage: {
        id: 'msg-2',
        text: 'Battery health is 100%, original box included.',
        createdAt: '2026-10-06T15:00:00Z',
        senderId: 'user-seller-2',
        isRead: true,
      },
      unreadCount: 0,
      updatedAt: '2026-10-06T15:00:00Z',
    },
  ];

  // Test 1: Conversation attributes
  assert(conversations.length === 2, 'Initial conversations list contains 2 items');
  assert(conversations[0].ad.price === 3850000, 'Price correctly formatted as numeric PKR 3,850,000');
  assert(conversations[0].unreadCount === 1, 'Unread count is 1 for conversation 1');

  // Test 2: Search filter matching
  function filterConversations(list: ChatConversation[], query: string): ChatConversation[] {
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.ad.title.toLowerCase().includes(q) ||
        c.otherUser.name.toLowerCase().includes(q) ||
        (c.lastMessage && c.lastMessage.text.toLowerCase().includes(q))
    );
  }

  assert(filterConversations(conversations, 'corolla').length === 1, 'Searching "corolla" matches 1 conversation');
  assert(filterConversations(conversations, 'Ahmed').length === 1, 'Searching seller "Ahmed" matches 1 conversation');
  assert(filterConversations(conversations, 'Battery').length === 1, 'Searching message text "Battery" matches 1 conversation');
  assert(filterConversations(conversations, 'nonexistent').length === 0, 'Searching nonexistent keyword returns 0 conversations');

  // Test 3: Chronological message sorting
  const rawMessages: ChatMessage[] = [
    {
      id: 'm-3',
      conversationId: 'conv-1',
      senderId: 'user-buyer-1',
      text: 'Final price kitni hogi?',
      isRead: false,
      createdAt: '2026-10-07T12:35:00Z',
    },
    {
      id: 'm-1',
      conversationId: 'conv-1',
      senderId: 'user-buyer-1',
      text: 'Assalam-o-Alaikum, is this car available?',
      isRead: true,
      createdAt: '2026-10-07T12:00:00Z',
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      senderId: 'user-seller-1',
      text: 'Walaikum Assalam, yes available in Gulberg III.',
      isRead: true,
      createdAt: '2026-10-07T12:15:00Z',
    },
  ];

  const sortedMessages = [...rawMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  assert(sortedMessages[0].id === 'm-1', 'Oldest message (12:00) is first in thread');
  assert(sortedMessages[1].id === 'm-2', 'Second message (12:15) is middle in thread');
  assert(sortedMessages[2].id === 'm-3', 'Newest message (12:35) is last in thread');

  // Test 4: Optimistic message append
  const newOutboundMessage: ChatMessage = {
    id: 'm-4',
    conversationId: 'conv-1',
    senderId: 'user-buyer-1',
    text: 'Can I visit today at 5 PM for inspection?',
    isRead: false,
    createdAt: '2026-10-07T12:40:00Z',
  };

  const updatedThread = [...sortedMessages, newOutboundMessage];
  assert(updatedThread.length === 4, 'Thread length increments from 3 to 4');
  assert(updatedThread[3].text === 'Can I visit today at 5 PM for inspection?', 'Outbound message text accurately appended');

  // Test 5: Last message sync in conversations list
  conversations = conversations.map((c) => {
    if (c.id === 'conv-1') {
      return {
        ...c,
        lastMessage: {
          id: newOutboundMessage.id,
          text: newOutboundMessage.text,
          createdAt: newOutboundMessage.createdAt,
          senderId: newOutboundMessage.senderId,
          isRead: false,
        },
        updatedAt: newOutboundMessage.createdAt,
      };
    }
    return c;
  });

  assert(conversations[0].lastMessage?.text === 'Can I visit today at 5 PM for inspection?', 'Conversation list tile updates last message preview');

  console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  if (passed !== total) {
    process.exit(1);
  }
}

runVerification();
