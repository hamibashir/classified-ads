import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/chat_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/chat_model.dart';
import '../../ads/screens/ad_details_screen.dart';

class ChatScreen extends StatefulWidget {
  final ConversationModel conversation;

  const ChatScreen({
    super.key,
    required this.conversation,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isComposing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final chatProvider = context.read<ChatProvider>();
      chatProvider.fetchMessages(widget.conversation.id);
    });
  }

  @override
  void dispose() {
    final chatProvider = context.read<ChatProvider>();
    chatProvider.leaveConversation(widget.conversation.id);
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleSend() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    final authProvider = context.read<AuthProvider>();
    final chatProvider = context.read<ChatProvider>();

    chatProvider.sendMessage(
      conversationId: widget.conversation.id,
      text: text,
      currentUserId: authProvider.user?.id ?? '',
    );

    _textController.clear();
    setState(() {
      _isComposing = false;
    });

    chatProvider.emitStopTyping(widget.conversation.id);
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final chatProvider = context.watch<ChatProvider>();
    final currentUserId = authProvider.user?.id ?? '';
    final other = widget.conversation.otherUser(currentUserId);
    final ad = widget.conversation.ad;
    final messages = chatProvider.getMessages(widget.conversation.id);
    final isTyping = chatProvider.isUserTyping(widget.conversation.id);

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18.0,
              backgroundColor: AppColors.primaryLight.withValues(alpha: 0.15),
              child: Text(
                (other?.name.isNotEmpty == true) ? other!.name[0].toUpperCase() : 'U',
                style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primaryLight, fontSize: 14.0),
              ),
            ),
            const SizedBox(width: 10.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    other?.name ?? 'User',
                    style: const TextStyle(fontSize: 15.0, fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (ad != null)
                    Text(
                      'Rs ${NumberFormat('#,##,###').format(ad.price.toInt())} • ${ad.title}',
                      style: AppTextStyles.meta.copyWith(color: AppColors.priceLight),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          if (ad != null)
            IconButton(
              icon: const Icon(Icons.open_in_new, size: 20.0),
              tooltip: 'View Ad',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => AdDetailsScreen(slug: ad.slug),
                  ),
                );
              },
            ),
        ],
      ),
      body: Column(
        children: [
          // Ad Banner Header Pill
          if (ad != null)
            InkWell(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => AdDetailsScreen(slug: ad.slug)),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                color: AppColors.surfaceLight,
                child: Row(
                  children: [
                    const Icon(Icons.sell_outlined, size: 16.0, color: AppColors.primaryLight),
                    const SizedBox(width: 8.0),
                    Expanded(
                      child: Text(
                        ad.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12.0, fontWeight: FontWeight.w500),
                      ),
                    ),
                    Text(
                      'Rs ${NumberFormat('#,##,###').format(ad.price.toInt())}',
                      style: const TextStyle(
                        fontSize: 12.0,
                        fontWeight: FontWeight.w700,
                        color: AppColors.priceLight,
                      ),
                    ),
                    const Icon(Icons.chevron_right, size: 16.0, color: AppColors.mutedForegroundLight),
                  ],
                ),
              ),
            ),
          const Divider(height: 1.0),

          // Message Stream
          Expanded(
            child: chatProvider.isLoadingMessages && messages.isEmpty
                ? const Center(child: CircularProgressIndicator(color: AppColors.primaryLight))
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                    itemCount: messages.length,
                    itemBuilder: (context, index) {
                      final message = messages[index];
                      final isMine = message.senderId == currentUserId;

                      return _MessageBubble(
                        message: message,
                        isMine: isMine,
                      );
                    },
                  ),
          ),

          // Typing indicator
          if (isTyping)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              alignment: Alignment.centerLeft,
              child: Text(
                '${other?.name ?? "User"} is typing...',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.mutedForegroundLight,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),

          // Input Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
            decoration: const BoxDecoration(
              color: AppColors.surfaceLight,
              border: Border(top: BorderSide(color: AppColors.borderLight)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: const InputDecoration(
                        hintText: 'Type a message...',
                        contentPadding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
                      ),
                      onChanged: (val) {
                        final hasText = val.trim().isNotEmpty;
                        if (hasText != _isComposing) {
                          setState(() {
                            _isComposing = hasText;
                          });
                        }
                        if (hasText) {
                          chatProvider.emitTyping(widget.conversation.id);
                        } else {
                          chatProvider.emitStopTyping(widget.conversation.id);
                        }
                      },
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                  const SizedBox(width: 8.0),
                  IconButton.filled(
                    onPressed: _isComposing ? _handleSend : null,
                    icon: const Icon(Icons.send, size: 18.0),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessageModel message;
  final bool isMine;

  const _MessageBubble({
    required this.message,
    required this.isMine,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4.0),
        padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isMine ? AppColors.primaryLight : AppColors.cardLight,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(14.0),
            topRight: const Radius.circular(14.0),
            bottomLeft: Radius.circular(isMine ? 14.0 : 2.0),
            bottomRight: Radius.circular(isMine ? 2.0 : 14.0),
          ),
          border: isMine ? null : Border.all(color: AppColors.borderLight),
        ),
        child: Column(
          crossAxisAlignment: isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Text(
              message.text,
              style: TextStyle(
                color: isMine ? Colors.white : AppColors.foregroundLight,
                fontSize: 14.0,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 4.0),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  DateFormat('hh:mm a').format(message.createdAt),
                  style: TextStyle(
                    color: isMine ? Colors.white70 : AppColors.mutedForegroundLight,
                    fontSize: 10.0,
                  ),
                ),
                if (isMine) ...[
                  const SizedBox(width: 4.0),
                  Icon(
                    message.isRead ? Icons.done_all : Icons.done,
                    size: 12.0,
                    color: Colors.white70,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
