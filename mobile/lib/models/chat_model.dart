class ChatUserRef {
  final String id;
  final String name;
  final String? avatarUrl;

  const ChatUserRef({
    required this.id,
    required this.name,
    this.avatarUrl,
  });

  factory ChatUserRef.fromJson(Map<String, dynamic> json) {
    return ChatUserRef(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'User',
      avatarUrl: json['avatarUrl']?.toString(),
    );
  }
}

class ChatAdRef {
  final String id;
  final String title;
  final String slug;
  final double price;
  final String currency;
  final String status;
  final String? primaryImage;

  const ChatAdRef({
    required this.id,
    required this.title,
    required this.slug,
    required this.price,
    this.currency = 'PKR',
    this.status = 'ACTIVE',
    this.primaryImage,
  });

  factory ChatAdRef.fromJson(Map<String, dynamic> json) {
    String? imgUrl;
    if (json['images'] is List && (json['images'] as List).isNotEmpty) {
      final first = (json['images'] as List).first;
      if (first is Map && first['url'] != null) {
        imgUrl = first['url'].toString();
      } else if (first is String) {
        imgUrl = first;
      }
    }

    final rawPrice = json['price'];
    double parsedPrice = 0.0;
    if (rawPrice is num) {
      parsedPrice = rawPrice.toDouble();
    } else if (rawPrice is String) {
      parsedPrice = double.tryParse(rawPrice) ?? 0.0;
    }

    return ChatAdRef(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Classified Listing',
      slug: json['slug']?.toString() ?? '',
      price: parsedPrice,
      currency: json['currency']?.toString() ?? 'PKR',
      status: json['status']?.toString() ?? 'ACTIVE',
      primaryImage: imgUrl,
    );
  }
}

class ChatMessageModel {
  final String id;
  final String conversationId;
  final String senderId;
  final String text;
  final String? attachmentUrl;
  final bool isRead;
  final DateTime createdAt;
  final ChatUserRef? sender;

  const ChatMessageModel({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.text,
    this.attachmentUrl,
    this.isRead = false,
    required this.createdAt,
    this.sender,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id']?.toString() ?? '',
      conversationId: json['conversationId']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
      attachmentUrl: json['attachmentUrl']?.toString(),
      isRead: json['isRead'] == true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      sender: json['sender'] is Map<String, dynamic>
          ? ChatUserRef.fromJson(json['sender'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversationId': conversationId,
      'senderId': senderId,
      'text': text,
      'attachmentUrl': attachmentUrl,
      'isRead': isRead,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class ConversationModel {
  final String id;
  final String adId;
  final String buyerId;
  final String sellerId;
  final DateTime updatedAt;
  final ChatAdRef? ad;
  final ChatUserRef? buyer;
  final ChatUserRef? seller;
  final ChatMessageModel? lastMessage;
  final int unreadCount;

  const ConversationModel({
    required this.id,
    required this.adId,
    required this.buyerId,
    required this.sellerId,
    required this.updatedAt,
    this.ad,
    this.buyer,
    this.seller,
    this.lastMessage,
    this.unreadCount = 0,
  });

  ChatUserRef? otherUser(String currentUserId) {
    if (currentUserId == buyerId) {
      return seller;
    }
    return buyer;
  }

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    ChatMessageModel? latestMsg;
    if (json['lastMessage'] is Map<String, dynamic>) {
      latestMsg = ChatMessageModel.fromJson(json['lastMessage'] as Map<String, dynamic>);
    } else if (json['messages'] is List && (json['messages'] as List).isNotEmpty) {
      latestMsg = ChatMessageModel.fromJson((json['messages'] as List).first as Map<String, dynamic>);
    }

    return ConversationModel(
      id: json['id']?.toString() ?? '',
      adId: json['adId']?.toString() ?? '',
      buyerId: json['buyerId']?.toString() ?? '',
      sellerId: json['sellerId']?.toString() ?? '',
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      ad: json['ad'] is Map<String, dynamic>
          ? ChatAdRef.fromJson(json['ad'] as Map<String, dynamic>)
          : null,
      buyer: json['buyer'] is Map<String, dynamic>
          ? ChatUserRef.fromJson(json['buyer'] as Map<String, dynamic>)
          : null,
      seller: json['seller'] is Map<String, dynamic>
          ? ChatUserRef.fromJson(json['seller'] as Map<String, dynamic>)
          : null,
      lastMessage: latestMsg,
      unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
    );
  }
}
