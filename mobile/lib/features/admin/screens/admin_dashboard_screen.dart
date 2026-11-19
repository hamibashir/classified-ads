import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/launcher_utils.dart';
import '../../../models/ad_model.dart';
import '../../../models/category_model.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> with SingleTickerProviderStateMixin {
  final ApiClient _apiClient = ApiClient();
  late TabController _tabController;

  bool _isLoading = true;
  String? _errorMessage;

  Map<String, dynamic> _metrics = {};
  List<AdModel> _pendingAds = [];
  List<CategoryModel> _categories = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadAdminData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAdminData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // 1. Fetch metrics
      final dashRes = await _apiClient.get<Map<String, dynamic>>(
        '/admin/dashboard',
        fromJsonT: (data) => data is Map<String, dynamic> ? data : <String, dynamic>{},
      );

      // 2. Fetch pending ads
      final pendingRes = await _apiClient.get<List<AdModel>>(
        '/admin/ads/pending',
        fromJsonT: (data) {
          List<dynamic>? list;
          if (data is List) {
            list = data;
          } else if (data is Map && data['ads'] is List) {
            list = data['ads'] as List;
          }
          if (list != null) {
            return list.map((a) => AdModel.fromJson(a as Map<String, dynamic>)).toList();
          }
          return <AdModel>[];
        },
      );

      // 3. Fetch categories
      final catRes = await _apiClient.get<List<CategoryModel>>(
        '/admin/categories',
        fromJsonT: (data) {
          List<dynamic>? list;
          if (data is List) {
            list = data;
          } else if (data is Map && data['categories'] is List) {
            list = data['categories'] as List;
          }
          if (list != null) {
            return list.map((c) => CategoryModel.fromJson(c as Map<String, dynamic>)).toList();
          }
          return <CategoryModel>[];
        },
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
          if (dashRes.success && dashRes.data != null) {
            final raw = dashRes.data!;
            _metrics = (raw['metrics'] is Map<String, dynamic>)
                ? raw['metrics'] as Map<String, dynamic>
                : raw;
          }
          if (pendingRes.success && pendingRes.data != null) {
            _pendingAds = pendingRes.data!;
          }
          if (catRes.success && catRes.data != null) {
            _categories = catRes.data!;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
  }

  Future<void> _moderateAd(String adId, String newStatus) async {
    HapticFeedback.lightImpact();
    final response = await _apiClient.patch<dynamic>(
      '/admin/ads/$adId/moderate',
      data: {'status': newStatus},
    );

    if (mounted) {
      if (response.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(newStatus == 'ACTIVE' ? 'Ad approved & live!' : 'Ad rejected.'),
            backgroundColor: newStatus == 'ACTIVE' ? AppColors.priceLight : AppColors.destructive,
          ),
        );
        _loadAdminData();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.error?.message ?? 'Action failed'),
            backgroundColor: AppColors.destructive,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.admin_panel_settings, color: AppColors.primaryLight, size: 22.0),
            SizedBox(width: 8.0),
            Text('Admin Console', style: TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Metrics',
            onPressed: _loadAdminData,
          ),
          IconButton(
            icon: const Icon(Icons.open_in_browser),
            tooltip: 'Open Web Admin Panel',
            onPressed: () {
              LauncherUtils.launchBrowserUrl('https://app.zaazb.com/admin');
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryLight,
          indicatorColor: AppColors.primaryLight,
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Overview & Queue'),
                  if (_pendingAds.isNotEmpty) ...[
                    const SizedBox(width: 6.0),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
                      decoration: BoxDecoration(
                        color: AppColors.warning,
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      child: Text(
                        '${_pendingAds.length}',
                        style: const TextStyle(color: Colors.white, fontSize: 10.0, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Tab(text: 'Categories (${_categories.length})'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryLight))
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline, size: 48.0, color: AppColors.destructive),
                        const SizedBox(height: 12.0),
                        Text('Failed to load admin data: $_errorMessage', textAlign: TextAlign.center),
                        const SizedBox(height: 16.0),
                        ElevatedButton(onPressed: _loadAdminData, child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildOverviewAndQueue(isDark),
                    _buildCategoriesList(isDark),
                  ],
                ),
    );
  }

  Widget _buildOverviewAndQueue(bool isDark) {
    final totalAds = _metrics['totalAds'] ?? 0;
    final activeAds = _metrics['activeAds'] ?? 0;
    final pendingAds = _metrics['pendingAds'] ?? _pendingAds.length;
    final totalUsers = _metrics['totalUsers'] ?? 0;

    return RefreshIndicator(
      color: AppColors.primaryLight,
      onRefresh: _loadAdminData,
      child: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Metrics Grid (2x2)
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10.0,
            crossAxisSpacing: 10.0,
            childAspectRatio: 1.6,
            children: [
              _buildMetricCard(
                label: 'TOTAL ADS',
                value: '$totalAds',
                icon: Icons.inventory_2_outlined,
                color: const Color(0xFF0F172A),
                isDark: isDark,
              ),
              _buildMetricCard(
                label: 'ACTIVE LISTINGS',
                value: '$activeAds',
                icon: Icons.check_circle_outline,
                color: const Color(0xFF047857),
                isDark: isDark,
              ),
              _buildMetricCard(
                label: 'PENDING REVIEW',
                value: '$pendingAds',
                icon: Icons.pending_actions,
                color: const Color(0xFFD97706),
                isDark: isDark,
              ),
              _buildMetricCard(
                label: 'TOTAL USERS',
                value: '$totalUsers',
                icon: Icons.people_outline,
                color: const Color(0xFF2563EB),
                isDark: isDark,
              ),
            ],
          ),
          const SizedBox(height: 24.0),

          // Moderation Queue Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Pending Moderation Queue', style: AppTextStyles.h2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 3.0),
                decoration: BoxDecoration(
                  color: _pendingAds.isNotEmpty
                      ? AppColors.warning.withValues(alpha: 0.15)
                      : AppColors.primaryLight.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6.0),
                ),
                child: Text(
                  '${_pendingAds.length} pending',
                  style: TextStyle(
                    fontSize: 11.0,
                    fontWeight: FontWeight.w700,
                    color: _pendingAds.isNotEmpty ? AppColors.warning : AppColors.primaryLight,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12.0),

          // Pending Ads List or Empty State
          if (_pendingAds.isEmpty)
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: isDark ? AppColors.cardDark : Colors.white,
                borderRadius: BorderRadius.circular(14.0),
                border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
              ),
              child: const Column(
                children: [
                  Icon(Icons.task_alt, size: 40.0, color: AppColors.priceLight),
                  SizedBox(height: 10.0),
                  Text('All Caught Up!', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16.0)),
                  SizedBox(height: 4.0),
                  Text(
                    'There are currently no ads awaiting moderation review.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12.5, color: AppColors.mutedForegroundLight),
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _pendingAds.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10.0),
              itemBuilder: (context, idx) {
                final ad = _pendingAds[idx];
                return Container(
                  padding: const EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.cardDark : Colors.white,
                    borderRadius: BorderRadius.circular(14.0),
                    border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8.0),
                            child: SizedBox(
                              width: 65.0,
                              height: 50.0,
                              child: ad.primaryImageUrl.isNotEmpty
                                  ? Image.network(ad.primaryImageUrl, fit: BoxFit.cover)
                                  : Container(color: AppColors.mutedLight),
                            ),
                          ),
                          const SizedBox(width: 10.0),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  ad.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
                                ),
                                const SizedBox(height: 3.0),
                                Text(
                                  ad.formattedPrice,
                                  style: const TextStyle(
                                    color: AppColors.priceLight,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13.0,
                                  ),
                                ),
                                const SizedBox(height: 3.0),
                                Text(
                                  '${ad.locationCity} • ${ad.category?.name ?? "General"}',
                                  style: const TextStyle(fontSize: 11.0, color: AppColors.mutedForegroundLight),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10.0),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.destructive,
                              side: const BorderSide(color: AppColors.destructive),
                              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
                              minimumSize: Size.zero,
                            ),
                            onPressed: () => _moderateAd(ad.id, 'REJECTED'),
                            child: const Text('Reject', style: TextStyle(fontSize: 12.0)),
                          ),
                          const SizedBox(width: 8.0),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.priceLight,
                              padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 6.0),
                              minimumSize: Size.zero,
                            ),
                            onPressed: () => _moderateAd(ad.id, 'ACTIVE'),
                            child: const Text('Approve', style: TextStyle(fontSize: 12.0)),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: isDark ? AppColors.borderDark : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 9.5,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.4,
                  color: AppColors.mutedForegroundLight,
                ),
              ),
              Icon(icon, size: 16.0, color: color),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 20.0,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoriesList(bool isDark) {
    if (_categories.isEmpty) {
      return const Center(child: Text('No categories found.'));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16.0),
      itemCount: _categories.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8.0),
      itemBuilder: (context, idx) {
        final cat = _categories[idx];
        return ExpansionTile(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
            side: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight),
          ),
          collapsedShape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
            side: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight),
          ),
          backgroundColor: isDark ? AppColors.cardDark : Colors.white,
          collapsedBackgroundColor: isDark ? AppColors.cardDark : Colors.white,
          leading: Container(
            width: 32.0,
            height: 32.0,
            decoration: BoxDecoration(
              color: AppColors.primaryLight.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: const Icon(Icons.folder_outlined, size: 16.0, color: AppColors.primaryLight),
          ),
          title: Text(cat.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5)),
          subtitle: Text(
            'Order #${cat.order} • ${cat.children.length} subcategories • ${cat.adsCount} ads',
            style: const TextStyle(fontSize: 11.5, color: AppColors.mutedForegroundLight),
          ),
          children: cat.children.map((sub) {
            return ListTile(
              dense: true,
              leading: const Icon(Icons.subdirectory_arrow_right, size: 16.0, color: AppColors.mutedForegroundLight),
              title: Text(sub.name, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
              subtitle: Text('/${sub.slug} • ${sub.adsCount} ads', style: const TextStyle(fontSize: 10.5)),
            );
          }).toList(),
        );
      },
    );
  }
}
