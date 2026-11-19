import 'package:flutter/material.dart';
import '../../models/chat_model.dart';
import '../network/api_client.dart';
import '../services/chat_socket_service.dart';
import '../storage/token_storage.dart';
import '../constants/api_constants.dart';

class ChatProvider extends ChangeNotifier {
  final ApiClient _apiClient;
  final TokenStorage _tokenStorage;
  final ChatSocketService _socketService;

  List<ConversationModel> _conversations = [];
  final Map<String, List<ChatMessageModel>> _messages = {};
  final Map<String, bool> _typingStatus = {};

  bool _isLoadingConversations = false;
  bool _isLoadingMessages = false;
  String? _errorMessage;

  ChatProvider({
    ApiClient? apiClient,
    TokenStorage? tokenStorage,
    ChatSocketService? socketService,
  })  : _apiClient = apiClient ?? ApiClient(),
        _tokenStorage = tokenStorage ?? TokenStorage(),
        _socketService = socketService ?? ChatSocketService() {
    _setupSocketListeners();
  }

  List<ConversationModel> get conversations => _conversations;
  bool get isLoadingConversations => _isLoadingConversations;
  bool get isLoadingMessages => _isLoadingMessages;
  String? get errorMessage => _errorMessage;

  List<ChatMessageModel> getMessages(String conversationId) {
    return _messages[conversationId] ?? [];
  }

  bool isUserTyping(String conversationId) {
    return _typingStatus[conversationId] == true;
  }

  void _setupSocketListeners() {
    _socketService.onNewMessage = (message) {
      final list = _messages[message.conversationId] ?? [];
      // Prevent duplicates
      if (!list.any((m) => m.id == message.id)) {
        list.add(message);
        _messages[message.conversationId] = list;

        // Update conversation list item preview
        final convIdx = _conversations.indexWhere((c) => c.id == message.conversationId);
        if (convIdx != -1) {
          final current = _conversations[convIdx];
          _conversations[convIdx] = current.copyWith(
            lastMessage: message,
            updatedAt: message.createdAt,
          );
        }
        notifyListeners();
      }
    };

    _socketService.onUserTyping = (convId, _) {
      _typingStatus[convId] = true;
      notifyListeners();
    };

    _socketService.onUserStopTyping = (convId, _) {
      _typingStatus[convId] = false;
      notifyListeners();
    };
  }

  Future<void> initSocket() async {
    final token = await _tokenStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      _socketService.connect(token);
    }
  }

  Future<void> fetchConversations() async {
    _isLoadingConversations = true;
    _errorMessage = null;
    notifyListeners();

    final response = await _apiClient.get<List<ConversationModel>>(
      ApiConstants.conversations,
      fromJsonT: (data) {
        if (data is Map && data['conversations'] is List) {
          return (data['conversations'] as List)
              .map((c) => ConversationModel.fromJson(c as Map<String, dynamic>))
              .toList();
        } else if (data is List) {
          return data
              .map((c) => ConversationModel.fromJson(c as Map<String, dynamic>))
              .toList();
        }
        return <ConversationModel>[];
      },
    );

    if (response.success && response.data != null) {
      _conversations = response.data!;
    } else {
      _errorMessage = response.error?.message ?? 'Failed to load conversations';
    }

    _isLoadingConversations = false;
    notifyListeners();
  }

  Future<void> fetchMessages(String conversationId) async {
    _isLoadingMessages = true;
    notifyListeners();

    _socketService.joinConversation(conversationId);

    final response = await _apiClient.get<List<ChatMessageModel>>(
      '/chat/conversations/$conversationId/messages',
      fromJsonT: (data) {
        if (data is Map && data['messages'] is List) {
          return (data['messages'] as List)
              .map((m) => ChatMessageModel.fromJson(m as Map<String, dynamic>))
              .toList();
        } else if (data is List) {
          return data
              .map((m) => ChatMessageModel.fromJson(m as Map<String, dynamic>))
              .toList();
        }
        return <ChatMessageModel>[];
      },
    );

    if (response.success && response.data != null) {
      _messages[conversationId] = response.data!;
    }

    _isLoadingMessages = false;
    notifyListeners();
  }

  Future<ConversationModel?> startConversation({
    required String adId,
    String? initialMessage,
  }) async {
    final response = await _apiClient.post<ConversationModel>(
      ApiConstants.conversations,
      data: {
        'adId': adId,
        if (initialMessage != null && initialMessage.trim().isNotEmpty)
          'initialMessage': initialMessage.trim(),
      },
      fromJsonT: (data) => ConversationModel.fromJson(data as Map<String, dynamic>),
    );

    if (response.success && response.data != null) {
      await fetchConversations();
      return response.data;
    }
    return null;
  }

  void sendMessage({
    required String conversationId,
    required String text,
    required String currentUserId,
  }) {
    if (text.trim().isEmpty) return;

    // Send via real-time WebSocket
    _socketService.sendMessage(
      conversationId: conversationId,
      text: text.trim(),
      callback: (success, data) {
        if (success && data is Map<String, dynamic>) {
          final savedMsg = ChatMessageModel.fromJson(data);
          final list = _messages[conversationId] ?? [];
          if (!list.any((m) => m.id == savedMsg.id)) {
            list.add(savedMsg);
            _messages[conversationId] = list;
            notifyListeners();
          }
        }
      },
    );
  }

  void emitTyping(String conversationId) {
    _socketService.emitTyping(conversationId);
  }

  void emitStopTyping(String conversationId) {
    _socketService.emitStopTyping(conversationId);
  }

  void leaveConversation(String conversationId) {
    _socketService.leaveConversation(conversationId);
  }

  @override
  void dispose() {
    _socketService.disconnect();
    super.dispose();
  }
}
