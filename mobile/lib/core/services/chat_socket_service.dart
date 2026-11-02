import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/api_constants.dart';
import '../../models/chat_model.dart';

class ChatSocketService {
  io.Socket? _socket;
  bool _isConnected = false;

  Function(ChatMessageModel message)? onNewMessage;
  Function(String conversationId, String userId)? onUserTyping;
  Function(String conversationId, String userId)? onUserStopTyping;

  bool get isConnected => _isConnected;

  void connect(String accessToken) {
    if (_socket != null && _isConnected) return;

    final options = io.OptionBuilder()
        .setTransports(['websocket'])
        .disableAutoConnect()
        .setAuth({'token': accessToken})
        .enableReconnection()
        .setReconnectionAttempts(5)
        .setReconnectionDelay(2000)
        .build();

    _socket = io.io(ApiConstants.socketUrl, options);

    _socket!.onConnect((_) {
      _isConnected = true;
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
    });

    _socket!.onConnectError((data) {
      _isConnected = false;
    });

    _socket!.on('new_message', (data) {
      if (data is Map<String, dynamic> && onNewMessage != null) {
        final message = ChatMessageModel.fromJson(data);
        onNewMessage!(message);
      }
    });

    _socket!.on('user_typing', (data) {
      if (data is Map<String, dynamic> && onUserTyping != null) {
        final convId = data['conversationId']?.toString() ?? '';
        final userId = data['userId']?.toString() ?? '';
        onUserTyping!(convId, userId);
      }
    });

    _socket!.on('user_stop_typing', (data) {
      if (data is Map<String, dynamic> && onUserStopTyping != null) {
        final convId = data['conversationId']?.toString() ?? '';
        final userId = data['userId']?.toString() ?? '';
        onUserStopTyping!(convId, userId);
      }
    });

    _socket!.connect();
  }

  void joinConversation(String conversationId) {
    if (_socket != null && _isConnected) {
      _socket!.emit('join_conversation', {'conversationId': conversationId});
    }
  }

  void leaveConversation(String conversationId) {
    if (_socket != null && _isConnected) {
      _socket!.emit('leave_conversation', {'conversationId': conversationId});
    }
  }

  void sendMessage({
    required String conversationId,
    required String text,
    Function(bool success, dynamic data)? callback,
  }) {
    if (_socket != null && _isConnected) {
      _socket!.emitWithAck(
        'send_message',
        {
          'conversationId': conversationId,
          'text': text,
        },
        ack: (response) {
          if (response is Map) {
            final success = response['success'] == true;
            callback?.call(success, response['data']);
          }
        },
      );
    }
  }

  void emitTyping(String conversationId) {
    if (_socket != null && _isConnected) {
      _socket!.emit('typing', {'conversationId': conversationId});
    }
  }

  void emitStopTyping(String conversationId) {
    if (_socket != null && _isConnected) {
      _socket!.emit('stop_typing', {'conversationId': conversationId});
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }
}
