import 'package:flutter_test/flutter_test.dart';
import 'package:classified_ads_mobile/models/chat_model.dart';
import 'package:classified_ads_mobile/core/providers/chat_provider.dart';

void main() {
  group('Chat Models Serialization Tests', () {
    test('parses ChatMessageModel and handles sender reference', () {
      final json = {
        'id': 'msg-1',
        'conversationId': 'conv-10',
        'senderId': 'user-1',
        'text': 'Is this Honda City still available for sale?',
        'isRead': false,
        'createdAt': '2026-10-26T12:00:00.000Z',
        'sender': {
          'id': 'user-1',
          'name': 'Ali Raza',
        },
      };

      final msg = ChatMessageModel.fromJson(json);

      expect(msg.id, 'msg-1');
      expect(msg.conversationId, 'conv-10');
      expect(msg.senderId, 'user-1');
      expect(msg.text, 'Is this Honda City still available for sale?');
      expect(msg.isRead, isFalse);
      expect(msg.sender?.name, 'Ali Raza');
    });

    test('parses ConversationModel and resolves otherUser correctly', () {
      final json = {
        'id': 'conv-10',
        'adId': 'ad-1',
        'buyerId': 'buyer-1',
        'sellerId': 'seller-2',
        'updatedAt': '2026-10-26T12:30:00.000Z',
        'ad': {
          'id': 'ad-1',
          'title': 'Honda City 2017',
          'slug': 'honda-city-2017',
          'price': 2850000,
          'currency': 'PKR',
          'status': 'ACTIVE',
        },
        'buyer': {
          'id': 'buyer-1',
          'name': 'Ali Buyer',
        },
        'seller': {
          'id': 'seller-2',
          'name': 'Usman Seller',
        },
        'lastMessage': {
          'id': 'msg-1',
          'conversationId': 'conv-10',
          'senderId': 'buyer-1',
          'text': 'Price final?',
          'createdAt': '2026-10-26T12:30:00.000Z',
        },
        'unreadCount': 2,
      };

      final conv = ConversationModel.fromJson(json);

      expect(conv.id, 'conv-10');
      expect(conv.unreadCount, 2);
      expect(conv.ad?.title, 'Honda City 2017');
      expect(conv.ad?.price, 2850000);

      // When current user is buyer, other user should be seller
      expect(conv.otherUser('buyer-1')?.name, 'Usman Seller');

      // When current user is seller, other user should be buyer
      expect(conv.otherUser('seller-2')?.name, 'Ali Buyer');
    });
  });

  group('ChatProvider Tests', () {
    test('initial state has empty conversations and not loading', () {
      final provider = ChatProvider();
      expect(provider.conversations, isEmpty);
      expect(provider.isLoadingConversations, isFalse);
      expect(provider.isLoadingMessages, isFalse);
    });
  });
}
