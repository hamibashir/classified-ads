import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../auth/screens/login_screen.dart';
import '../../auth/screens/register_screen.dart';
import 'my_ads_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Account & Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (!authProvider.isAuthenticated || user == null)
              // Unauthenticated Card
              Container(
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 56.0,
                      height: 56.0,
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.person_outline,
                        size: 30.0,
                        color: AppColors.primaryLight,
                      ),
                    ),
                    const SizedBox(height: 12.0),
                    const Text(
                      'Log in to your account',
                      style: AppTextStyles.h2,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6.0),
                    const Text(
                      'Sign in to post classified ads, access chats, and manage your listings.',
                      style: TextStyle(
                        color: AppColors.mutedForegroundLight,
                        fontSize: 13.0,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 18.0),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                      child: const Text('Sign In'),
                    ),
                    const SizedBox(height: 10.0),
                    OutlinedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const RegisterScreen()),
                        );
                      },
                      child: const Text('Create New Account'),
                    ),
                  ],
                ),
              )
            else
              // Authenticated Profile Card
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 30.0,
                      backgroundColor: AppColors.primaryLight.withValues(alpha: 0.15),
                      child: Text(
                        user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                        style: const TextStyle(
                          fontSize: 24.0,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryLight,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16.0),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name,
                            style: AppTextStyles.h2,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2.0),
                          Text(
                            user.email,
                            style: AppTextStyles.caption.copyWith(color: AppColors.mutedForegroundLight),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (user.phone != null) ...[
                            const SizedBox(height: 2.0),
                            Text(
                              user.phone!,
                              style: AppTextStyles.meta.copyWith(color: AppColors.mutedForegroundLight),
                            ),
                          ],
                          const SizedBox(height: 4.0),
                          if (user.isPhoneVerified)
                            const Row(
                              children: [
                                Icon(Icons.verified, size: 14.0, color: AppColors.priceLight),
                                SizedBox(width: 4.0),
                                Text(
                                  'Phone Verified',
                                  style: TextStyle(
                                    fontSize: 11.0,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.priceLight,
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 20.0),

            // Profile Menu List
            if (authProvider.isAuthenticated) ...[
              _buildMenuItem(
                icon: Icons.list_alt_outlined,
                title: 'My Listings',
                subtitle: 'Manage, edit or mark ads as sold',
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const MyAdsScreen()),
                  );
                },
              ),
              const SizedBox(height: 8.0),
            ],

            _buildMenuItem(
              icon: Icons.info_outline,
              title: 'About ${AppConstants.appName}',
              subtitle: 'Version 1.0.0 • ${AppConstants.brandTagline}',
              onTap: () {
                showAboutDialog(
                  context: context,
                  applicationName: AppConstants.appName,
                  applicationVersion: '1.0.0',
                  applicationLegalese: '© 2026 Zaaz B. All rights reserved.',
                );
              },
            ),

            if (authProvider.isAuthenticated) ...[
              const SizedBox(height: 20.0),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.destructive.withValues(alpha: 0.1),
                  foregroundColor: AppColors.destructive,
                  side: const BorderSide(color: AppColors.destructive, width: 1.0),
                ),
                icon: const Icon(Icons.logout, size: 18.0),
                label: const Text('Log Out'),
                onPressed: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Log Out'),
                      content: const Text('Are you sure you want to log out?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(ctx).pop(false),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.destructive,
                          ),
                          onPressed: () => Navigator.of(ctx).pop(true),
                          child: const Text('Log Out'),
                        ),
                      ],
                    ),
                  );

                  if (confirm == true) {
                    await authProvider.logout();
                  }
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardLight,
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
        leading: Container(
          width: 40.0,
          height: 40.0,
          decoration: BoxDecoration(
            color: AppColors.mutedLight,
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Icon(icon, color: AppColors.primaryLight, size: 20.0),
        ),
        title: Text(title, style: AppTextStyles.bodyMedium),
        subtitle: Text(
          subtitle,
          style: AppTextStyles.caption.copyWith(color: AppColors.mutedForegroundLight),
        ),
        trailing: const Icon(Icons.chevron_right, color: AppColors.mutedForegroundLight),
      ),
    );
  }
}
