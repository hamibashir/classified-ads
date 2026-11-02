import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/chat_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../auth/screens/login_screen.dart';
import 'chat_screen.dart';

class ConversationsListScreen extends StatefulWidget {
  const ConversationsListScreen({super.key});

  @override
  State<ConversationsListScreen> createState() => _ConversationsListScreenState();
}

class _ConversationsListScreenState extends State<ConversationsListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.isAuthenticated) {
        final chat = context.read<ChatProvider>();
        chat.initSocket();
        chat.fetchConversations();
      }
    });
  }

  String _formatRelativeTime(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inDays > 0) {
      return DateFormat('dd/MM').format(dateTime);
    } else if (diff.inHours > 0) {
      return '${diff.inHours}h ago';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}m ago';
    }
    return 'Just now';
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final chatProvider = context.watch<ChatProvider>();
    final currentUserId = authProvider.user?.id ?? '';

    if (!authProvider.isAuthenticated) {
      return Scaffold(
        backgroundColor: AppColors.backgroundLight,
        appBar: AppBar(title: const Text('Messages')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.chat_bubble_outline, size: 56.0, color: AppColors.mutedForegroundLight),
                const SizedBox(height: 16.0),
                const Text('Sign in to view messages', style: AppTextStyles.h2),
                const SizedBox(height: 6.0),
                const Text(
                  'Chat with sellers and buyers directly in real-time.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.mutedForegroundLight, fontSize: 13.0),
                ),
                const SizedBox(height: 20.0),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                  },
                  child: const Text('Sign In'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Messages'),
      ),
      body: chatProvider.isLoadingConversations && chatProvider.conversations.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryLight))
          : RefreshIndicator(
              color: AppColors.primaryLight,
              onRefresh: chatProvider.fetchConversations,
              child: chatProvider.conversations.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.forum_outlined, size: 56.0, color: AppColors.mutedForegroundLight),
                            const SizedBox(height: 12.0),
                            const Text('No conversations yet', style: AppTextStyles.h2),
                            const SizedBox(height: 6.0),
                            Text(
                              'When you contact a seller or receive an inquiry, chats will appear here.',
                              textAlign: TextAlign.center,
                              style: AppTextStyles.caption.copyWith(color: AppColors.mutedForegroundLight),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      itemCount: chatProvider.conversations.length,
                      separatorBuilder: (context, index) => const Divider(height: 1.0),
                      itemBuilder: (context, index) {
                        final conv = chatProvider.conversations[index];
                        final other = conv.otherUser(currentUserId);
                        final lastMsg = conv.lastMessage;

                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
                          leading: Stack(
                            children: [
                              CircleAvatar(
                                radius: 24.0,
                                backgroundColor: AppColors.primaryLight.withValues(alpha: 0.12),
                                child: Text(
                                  (other?.name.isNotEmpty == true) ? other!.name[0].toUpperCase() : 'U',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primaryLight,
                                    fontSize: 16.0,
                                  ),
                                ),
                              ),
                              if (conv.unreadCount > 0)
                                Positioned(
                                  top: 0,
                                  right: 0,
                                  child: Container(
                                    padding: const EdgeInsets.all(4.0),
                                    decoration: const BoxDecoration(
                                      color: AppColors.priceLight,
                                      shape: BoxShape.circle,
                                    ),
                                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                                    child: Text(
                                      '${conv.unreadCount}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 10.0,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          title: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  other?.name ?? 'User',
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    fontWeight: conv.unreadCount > 0 ? FontWeight.w700 : FontWeight.w600,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Text(
                                _formatRelativeTime(conv.updatedAt),
                                style: AppTextStyles.meta.copyWith(color: AppColors.mutedForegroundLight),
                              ),
                            ],
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (conv.ad != null)
                                Text(
                                  'Listing: ${conv.ad!.title}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTextStyles.caption.copyWith(
                                    color: AppColors.primaryLight,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              Text(
                                lastMsg?.text ?? 'Started conversation',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 13.0,
                                  color: conv.unreadCount > 0 ? AppColors.foregroundLight : AppColors.mutedForegroundLight,
                                  fontWeight: conv.unreadCount > 0 ? FontWeight.w600 : FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => ChatScreen(conversation: conv),
                              ),
                            );
                          },
                        );
                      },
                    ),
            ),
    );
  }
}
