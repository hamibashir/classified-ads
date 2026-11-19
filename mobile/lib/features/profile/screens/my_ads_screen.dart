import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/ad_model.dart';
import '../../ads/screens/ad_details_screen.dart';
import '../../ads/widgets/ad_card_skeleton.dart';
import '../../auth/screens/login_screen.dart';

class MyAdsScreen extends StatefulWidget {
  const MyAdsScreen({super.key});

  @override
  State<MyAdsScreen> createState() => _MyAdsScreenState();
}

class _MyAdsScreenState extends State<MyAdsScreen> with SingleTickerProviderStateMixin {
  final ApiClient _apiClient = ApiClient();
  late TabController _tabController;

  List<AdModel> _myAds = [];
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _fetchMyAds();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchMyAds() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = null;
        });
      }
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final response = await _apiClient.get<List<AdModel>>(
      ApiConstants.myAds,
      fromJsonT: (data) {
        List<dynamic>? list;
        if (data is List) {
          list = data;
        } else if (data is Map && data['ads'] is List) {
          list = data['ads'] as List;
        }
        if (list != null) {
          return list
              .whereType<Map>()
              .map((a) => AdModel.fromJson(Map<String, dynamic>.from(a)))
              .toList();
        }
        return <AdModel>[];
      },
    );

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (response.success && response.data != null) {
          _myAds = response.data!;
        } else {
          _errorMessage = response.error?.message ?? 'Failed to load your ads.';
        }
      });
    }
  }

  Future<void> _markAsSold(String adId) async {
    final response = await _apiClient.patch<dynamic>(
      '/ads/$adId/status',
      data: {'status': 'SOLD'},
    );

    if (mounted) {
      if (response.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ad marked as SOLD')),
        );
        _fetchMyAds();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.error?.message ?? 'Failed to update ad status'),
            backgroundColor: AppColors.destructive,
          ),
        );
      }
    }
  }

  Future<void> _deleteAd(String adId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Ad'),
        content: const Text('Are you sure you want to permanently delete this listing?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.destructive),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final response = await _apiClient.delete<dynamic>('/ads/$adId');
      if (mounted) {
        if (response.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Ad deleted successfully')),
          );
          _fetchMyAds();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.error?.message ?? 'Failed to delete ad'),
              backgroundColor: AppColors.destructive,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('My Listings'),
        bottom: authProvider.isAuthenticated
            ? TabBar(
                controller: _tabController,
                labelColor: AppColors.primaryLight,
                unselectedLabelColor: AppColors.mutedForegroundLight,
                indicatorColor: AppColors.primaryLight,
                tabs: const [
                  Tab(text: 'All'),
                  Tab(text: 'Active'),
                  Tab(text: 'Sold'),
                ],
              )
            : null,
      ),
      body: !authProvider.isAuthenticated
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(28.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 64.0,
                      height: 64.0,
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.lock_outline,
                        size: 32.0,
                        color: AppColors.primaryLight,
                      ),
                    ),
                    const SizedBox(height: 16.0),
                    const Text(
                      'Sign In to View Your Listings',
                      style: AppTextStyles.h2,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8.0),
                    const Text(
                      'Log in to your Zaaz B account to view, edit, and manage your posted ads.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13.5,
                        color: AppColors.mutedForegroundLight,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 20.0),
                    ElevatedButton(
                      onPressed: () async {
                        final loggedIn = await Navigator.of(context).push<bool>(
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                        if (loggedIn == true && mounted) {
                          _fetchMyAds();
                        }
                      },
                      child: const Text('Sign In to Account'),
                    ),
                  ],
                ),
              ),
            )
          : _isLoading
              ? ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  itemCount: 3,
                  itemBuilder: (context, index) => const AdCardSkeleton(),
                )
              : _errorMessage != null
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(_errorMessage!, style: AppTextStyles.body),
                          const SizedBox(height: 12.0),
                          ElevatedButton(onPressed: _fetchMyAds, child: const Text('Retry')),
                        ],
                      ),
                    )
                  : TabBarView(
                      controller: _tabController,
                      children: [
                        _buildAdsList(_myAds),
                        _buildAdsList(_myAds.where((a) => a.status == 'ACTIVE').toList()),
                        _buildAdsList(_myAds.where((a) => a.status == 'SOLD').toList()),
                      ],
                    ),
    );
  }

  Widget _buildAdsList(List<AdModel> ads) {
    if (ads.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.inbox_outlined, size: 48.0, color: AppColors.mutedForegroundLight),
              const SizedBox(height: 12.0),
              const Text('No ads in this category', style: AppTextStyles.h2),
              const SizedBox(height: 6.0),
              Text(
                'Post an ad to start selling to buyers nearby!',
                style: AppTextStyles.caption.copyWith(color: AppColors.mutedForegroundLight),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primaryLight,
      onRefresh: _fetchMyAds,
      child: ListView.separated(
        padding: const EdgeInsets.all(16.0),
        itemCount: ads.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12.0),
        itemBuilder: (context, index) {
          final ad = ads[index];
          final isSold = ad.status == 'SOLD';

          return Container(
            decoration: BoxDecoration(
              color: AppColors.cardLight,
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: InkWell(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => AdDetailsScreen(slug: ad.slug, initialAd: ad),
                  ),
                );
              },
              borderRadius: BorderRadius.circular(12.0),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Image Thumbnail
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8.0),
                          child: SizedBox(
                            width: 80.0,
                            height: 60.0,
                            child: ad.primaryImageUrl.isNotEmpty
                                ? Image.network(
                                    ad.primaryImageUrl,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) =>
                                        Container(color: AppColors.mutedLight),
                                  )
                                : Container(color: AppColors.mutedLight),
                          ),
                        ),
                        const SizedBox(width: 12.0),
                        // Title and Price
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                ad.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTextStyles.adTitle,
                              ),
                              const SizedBox(height: 4.0),
                              Text(
                                ad.formattedPrice,
                                style: AppTextStyles.price.copyWith(color: AppColors.priceLight),
                              ),
                              const SizedBox(height: 4.0),
                              Text(
                                '${ad.locationCity} • ${ad.viewsCount} views',
                                style: AppTextStyles.meta.copyWith(color: AppColors.mutedForegroundLight),
                              ),
                            ],
                          ),
                        ),
                        // Status Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 3.0),
                          decoration: BoxDecoration(
                            color: isSold
                                ? AppColors.mutedLight
                                : ad.status == 'ACTIVE'
                                    ? AppColors.priceLight.withValues(alpha: 0.12)
                                    : AppColors.warning.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6.0),
                          ),
                          child: Text(
                            ad.status,
                            style: TextStyle(
                              fontSize: 10.0,
                              fontWeight: FontWeight.w700,
                              color: isSold
                                  ? AppColors.mutedForegroundLight
                                  : ad.status == 'ACTIVE'
                                      ? AppColors.priceLight
                                      : AppColors.warning,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 20.0),
                    // Action Buttons Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        if (!isSold) ...[
                          TextButton.icon(
                            icon: const Icon(Icons.check_circle_outline, size: 16.0),
                            label: const Text('Mark as Sold'),
                            onPressed: () => _markAsSold(ad.id),
                          ),
                          const SizedBox(width: 8.0),
                        ],
                        IconButton(
                          icon: const Icon(Icons.delete_outline, color: AppColors.destructive, size: 20.0),
                          onPressed: () => _deleteAd(ad.id),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
