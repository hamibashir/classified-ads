import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/chat_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/launcher_utils.dart';
import '../../../models/ad_model.dart';
import '../../../core/widgets/shimmer_box.dart';
import '../../auth/screens/login_screen.dart';
import '../../chat/screens/chat_screen.dart';
import '../widgets/ad_details_skeleton.dart';
import '../widgets/mobile_ad_card.dart';
import '../widgets/report_ad_bottom_sheet.dart';

class AdDetailsScreen extends StatefulWidget {
  final String slug;
  final AdModel? initialAd;
  final Function(String sellerId, String adId, String adTitle)? onStartChat;

  const AdDetailsScreen({
    super.key,
    required this.slug,
    this.initialAd,
    this.onStartChat,
  });

  @override
  State<AdDetailsScreen> createState() => _AdDetailsScreenState();
}

class _AdDetailsScreenState extends State<AdDetailsScreen> {
  final ApiClient _apiClient = ApiClient();
  final PageController _pageController = PageController();

  AdModel? _ad;
  bool _isLoading = false;
  String? _errorMessage;
  int _currentImageIndex = 0;
  bool _isPhoneRevealed = false;
  List<AdModel> _similarAds = [];

  @override
  void initState() {
    super.initState();
    if (widget.initialAd != null) {
      _ad = widget.initialAd;
      _fetchSimilarAds(_ad?.category?.slug, _ad!.id);
    } else {
      _fetchAdDetails();
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _fetchSimilarAds(String? categorySlug, String currentAdId) async {
    if (categorySlug == null || categorySlug.isEmpty) return;

    final res = await _apiClient.get<List<AdModel>>(
      '/ads',
      queryParameters: {
        'category': categorySlug,
        'limit': 6,
      },
      fromJsonT: (data) {
        if (data is Map && data['ads'] is List) {
          return (data['ads'] as List)
              .map((a) => AdModel.fromJson(a as Map<String, dynamic>))
              .toList();
        } else if (data is List) {
          return data
              .map((a) => AdModel.fromJson(a as Map<String, dynamic>))
              .toList();
        }
        return <AdModel>[];
      },
    );

    if (mounted) {
      setState(() {
        if (res.success && res.data != null) {
          _similarAds = res.data!.where((item) => item.id != currentAdId).toList();
        }
      });
    }
  }

  Future<void> _fetchAdDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final response = await _apiClient.get<AdModel>(
      '/ads/${widget.slug}',
      fromJsonT: (data) => AdModel.fromJson(data as Map<String, dynamic>),
    );

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (response.success && response.data != null) {
          _ad = response.data;
          _fetchSimilarAds(_ad?.category?.slug, _ad!.id);
        } else {
          _errorMessage = response.error?.message ?? 'Failed to load ad details.';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const AdDetailsSkeleton();
    }

    if (_errorMessage != null || _ad == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48.0, color: AppColors.destructive),
                const SizedBox(height: 12.0),
                Text(_errorMessage ?? 'Ad not found', style: AppTextStyles.h2),
                const SizedBox(height: 16.0),
                ElevatedButton(
                  onPressed: _fetchAdDetails,
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final ad = _ad!;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final marketplace = Theme.of(context).extension<MarketplaceColors>();

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: Text(
          ad.category?.name ?? 'Ad Details',
          style: const TextStyle(fontSize: 16.0, fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            icon: Icon(
              ad.isFavorite ? Icons.favorite : Icons.favorite_border,
              color: ad.isFavorite ? AppColors.destructive : AppColors.foregroundLight,
            ),
            onPressed: () {
              HapticFeedback.lightImpact();
              setState(() {
                _ad = ad.copyWith(isFavorite: !ad.isFavorite);
              });
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (val) {
              if (val == 'report') {
                ReportAdBottomSheet.show(context, adId: ad.id, adTitle: ad.title);
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: 'report',
                child: Row(
                  children: [
                    Icon(Icons.flag_outlined, size: 18.0, color: AppColors.destructive),
                    SizedBox(width: 8.0),
                    Text('Report Ad', style: TextStyle(color: AppColors.destructive)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image Carousel (4:3 aspect ratio)
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ad.images.isNotEmpty
                      ? PageView.builder(
                          controller: _pageController,
                          itemCount: ad.images.length,
                          onPageChanged: (idx) {
                            setState(() {
                              _currentImageIndex = idx;
                            });
                          },
                          itemBuilder: (context, index) {
                            return Image.network(
                              ad.images[index],
                              fit: BoxFit.cover,
                              cacheWidth: 900,
                              cacheHeight: 675,
                              loadingBuilder: (context, child, loadingProgress) {
                                if (loadingProgress == null) return child;
                                return const ShimmerEffect(
                                  child: ShimmerBox(borderRadius: 0),
                                );
                              },
                              errorBuilder: (context, error, stackTrace) => _buildImagePlaceholder(),
                            );
                          },
                        )
                      : _buildImagePlaceholder(),

                  // Page Counter Pill (e.g. 1 / 4)
                  if (ad.images.length > 1)
                    Positioned(
                      bottom: 12.0,
                      right: 12.0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 4.0),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.65),
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        child: Text(
                          '${_currentImageIndex + 1} / ${ad.images.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12.0,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Content Container
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price and Negotiable Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        ad.formattedPrice,
                        style: AppTextStyles.priceLarge.copyWith(
                          color: marketplace?.priceColor ?? AppColors.priceLight,
                        ),
                      ),
                      if (ad.isNegotiable)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 4.5),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF064E3B).withValues(alpha: 0.45)
                                : const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(8.0),
                            border: Border.all(
                              color: isDark
                                  ? const Color(0xFF059669).withValues(alpha: 0.45)
                                  : const Color(0xFFA7F3D0),
                              width: 1.0,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.handshake_outlined,
                                size: 14.0,
                                color: isDark ? const Color(0xFF34D399) : const Color(0xFF059669),
                              ),
                              const SizedBox(width: 4.0),
                              Text(
                                'Negotiable',
                                style: TextStyle(
                                  color: isDark ? const Color(0xFF34D399) : const Color(0xFF047857),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12.0,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8.0),

                  // Title
                  Text(
                    ad.title,
                    style: AppTextStyles.h1,
                  ),
                  const SizedBox(height: 8.0),

                  // Location and Distance Row
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 16.0, color: AppColors.mutedForegroundLight),
                      const SizedBox(width: 4.0),
                      Text(
                        '${ad.locationCity}, ${ad.locationState}',
                        style: AppTextStyles.caption.copyWith(color: AppColors.mutedForegroundLight),
                      ),
                      if (ad.formattedDistance.isNotEmpty) ...[
                        const SizedBox(width: 8.0),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4.0),
                          ),
                          child: Text(
                            ad.formattedDistance,
                            style: const TextStyle(
                              color: AppColors.primaryLight,
                              fontWeight: FontWeight.w600,
                              fontSize: 11.0,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 16.0),
                  const Divider(),
                  const SizedBox(height: 16.0),

                  // Specifications (Vertical Minimal Modern List)
                  const Text('Overview & Specifications', style: AppTextStyles.h3),
                  const SizedBox(height: 10.0),
                  _buildVerticalSpecsList(ad, isDark),
                  const SizedBox(height: 20.0),

                  // Description Header & Meta Stats
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Description', style: AppTextStyles.h3),
                      InkWell(
                        onTap: () {
                          Clipboard.setData(ClipboardData(
                            text: ad.cleanDescription.isNotEmpty ? ad.cleanDescription : ad.description,
                          ));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Description copied to clipboard'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(6.0),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
                          child: Row(
                            children: [
                              Icon(Icons.copy_outlined, size: 14.0, color: AppColors.primaryLight),
                              SizedBox(width: 4.0),
                              Text(
                                'Copy',
                                style: TextStyle(
                                  fontSize: 12.0,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primaryLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    '${(ad.cleanDescription.isNotEmpty ? ad.cleanDescription : ad.description).trim().split(RegExp(r'\s+')).length} words • ~${((ad.cleanDescription.isNotEmpty ? ad.cleanDescription : ad.description).trim().split(RegExp(r'\s+')).length / 180).ceil()} min read',
                    style: const TextStyle(
                      fontSize: 11.5,
                      color: AppColors.mutedForegroundLight,
                    ),
                  ),
                  const SizedBox(height: 10.0),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14.0),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(12.0),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Text(
                      ad.cleanDescription.isNotEmpty ? ad.cleanDescription : ad.description,
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.foregroundLight,
                        height: 1.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24.0),

                  // Seller Profile Card
                  const Text('Seller Information', style: AppTextStyles.h3),
                  const SizedBox(height: 10.0),
                  Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: AppColors.cardLight,
                      borderRadius: BorderRadius.circular(14.0),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 26.0,
                          backgroundColor: AppColors.primaryLight.withValues(alpha: 0.15),
                          child: Text(
                            (ad.seller?.name.isNotEmpty == true)
                                ? ad.seller!.name[0].toUpperCase()
                                : 'S',
                            style: const TextStyle(
                              color: AppColors.primaryLight,
                              fontSize: 20.0,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(width: 14.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                ad.seller?.name ?? 'Seller',
                                style: const TextStyle(
                                  fontSize: 16.0,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.foregroundLight,
                                ),
                              ),
                              const SizedBox(height: 2.0),
                              if (ad.seller?.isPhoneVerified == true)
                                const Row(
                                  children: [
                                    Icon(Icons.verified, size: 14.0, color: AppColors.priceLight),
                                    SizedBox(width: 4.0),
                                    Text(
                                      'Verified Phone',
                                      style: TextStyle(
                                        color: AppColors.priceLight,
                                        fontSize: 12.0,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              if (ad.seller?.memberSince != null)
                                Text(
                                  'Member since ${DateFormat('MMM yyyy').format(ad.seller!.memberSince!)}',
                                  style: AppTextStyles.caption.copyWith(
                                    color: AppColors.mutedForegroundLight,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // More Listings You May Like (Category-Aware Recommendations)
                  if (_similarAds.isNotEmpty) ...[
                    const SizedBox(height: 24.0),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'More Listings You May Like',
                          style: AppTextStyles.h3,
                        ),
                        if (ad.category != null)
                          Text(
                            ad.category!.name,
                            style: const TextStyle(
                              fontSize: 12.0,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primaryLight,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12.0),
                    SizedBox(
                      height: 240.0,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _similarAds.length,
                        separatorBuilder: (context, index) => const SizedBox(width: 12.0),
                        itemBuilder: (context, index) {
                          final similar = _similarAds[index];
                          return SizedBox(
                            width: 175.0,
                            child: MobileAdCard(
                              ad: similar,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => AdDetailsScreen(
                                      slug: similar.slug,
                                      initialAd: similar,
                                    ),
                                  ),
                                );
                              },
                              onToggleFavorite: () {},
                            ),
                          );
                        },
                      ),
                    ),
                  ],

                  const SizedBox(height: 100.0), // Padding for bottom sticky bar
                ],
              ),
            ),
          ],
        ),
      ),

      // Sticky Bottom Contact Bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        decoration: const BoxDecoration(
          color: AppColors.surfaceLight,
          border: Border(top: BorderSide(color: AppColors.borderLight)),
        ),
        child: SafeArea(
          child: Row(
            children: [
              // Chat CTA (Primary Teal)
              Expanded(
                flex: 3,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    HapticFeedback.lightImpact();
                    if (widget.onStartChat != null) {
                      widget.onStartChat!(ad.userId, ad.id, ad.title);
                      return;
                    }

                    final auth = context.read<AuthProvider>();
                    if (!auth.isAuthenticated) {
                      final loggedIn = await Navigator.of(context).push<bool>(
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                      if (loggedIn != true || !context.mounted) return;
                    }

                    final chatProvider = context.read<ChatProvider>();
                    final conv = await chatProvider.startConversation(adId: ad.id);
                    if (context.mounted && conv != null) {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ChatScreen(conversation: conv),
                        ),
                      );
                    }
                  },
                  icon: const Icon(Icons.chat_bubble_outline, size: 18.0),
                  label: const Text('Chat'),
                ),
              ),

              // WhatsApp CTA (Brand Green)
              if (ad.allowWhatsapp && ad.seller?.phone != null) ...[
                const SizedBox(width: 8.0),
                Expanded(
                  flex: 3,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.whatsapp,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () async {
                      HapticFeedback.lightImpact();
                      await LauncherUtils.launchWhatsApp(
                        phone: ad.seller!.phone!,
                        adTitle: ad.title,
                      );
                    },
                    icon: const Icon(Icons.message, size: 18.0),
                    label: const Text('WhatsApp'),
                  ),
                ),
              ],

              // Call CTA (Click to reveal phone)
              if (ad.showPhone && ad.seller?.phone != null) ...[
                const SizedBox(width: 8.0),
                Expanded(
                  flex: 2,
                  child: OutlinedButton(
                    onPressed: () async {
                      HapticFeedback.lightImpact();
                      if (!_isPhoneRevealed) {
                        setState(() {
                          _isPhoneRevealed = true;
                        });
                      } else {
                        await LauncherUtils.launchPhoneDialer(ad.seller!.phone!);
                      }
                    },
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(_isPhoneRevealed ? 'Call' : 'Show Tel'),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVerticalSpecsList(AdModel ad, bool isDark) {
    final List<Map<String, dynamic>> items = [
      {'label': 'Condition', 'value': ad.conditionLabel, 'icon': Icons.verified_outlined},
      {'label': 'Category', 'value': ad.category?.name ?? 'General', 'icon': Icons.category_outlined},
      {'label': 'City', 'value': ad.locationCity, 'icon': Icons.location_city_outlined},
      if (ad.locationAddress != null && ad.locationAddress!.isNotEmpty)
        {'label': 'Area / Address', 'value': ad.locationAddress!, 'icon': Icons.map_outlined},
      {'label': 'Price Type', 'value': ad.isNegotiable ? 'Negotiable' : 'Fixed Price', 'icon': Icons.sell_outlined},
      {'label': 'Listed Date', 'value': DateFormat('dd MMM yyyy').format(ad.createdAt), 'icon': Icons.calendar_today_outlined},
    ];

    // Append category-specific custom fields
    ad.customFields.forEach((key, val) {
      if (val.trim().isNotEmpty) {
        final formattedKey = key
            .replaceAllMapped(RegExp(r'([A-Z])'), (m) => ' ${m.group(1)}')
            .trim();
        final label = formattedKey.isNotEmpty
            ? formattedKey.substring(0, 1).toUpperCase() + formattedKey.substring(1)
            : key;

        IconData icon = Icons.tune;
        final lower = key.toLowerCase();
        if (lower.contains('make') || lower.contains('brand')) {
          icon = Icons.directions_car_outlined;
        } else if (lower.contains('fuel')) {
          icon = Icons.local_gas_station_outlined;
        } else if (lower.contains('trans')) {
          icon = Icons.settings_suggest_outlined;
        } else if (lower.contains('mile')) {
          icon = Icons.speed_outlined;
        } else if (lower.contains('year')) {
          icon = Icons.calendar_today_outlined;
        } else if (lower.contains('pta')) {
          icon = Icons.verified_user_outlined;
        } else if (lower.contains('ram') || lower.contains('storage')) {
          icon = Icons.memory_outlined;
        } else if (lower.contains('bed') || lower.contains('room')) {
          icon = Icons.bed_outlined;
        } else if (lower.contains('bath')) {
          icon = Icons.bathtub_outlined;
        } else if (lower.contains('area') || lower.contains('size')) {
          icon = Icons.square_foot_outlined;
        }

        items.add({
          'label': label,
          'value': val,
          'icon': icon,
        });
      }
    });

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(
          color: isDark ? AppColors.borderDark : const Color(0xFFE2E8F0),
          width: 1.0,
        ),
      ),
      child: Column(
        children: List.generate(items.length, (index) {
          final item = items[index];
          final isLast = index == items.length - 1;
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 11.0),
                child: Row(
                  children: [
                    Container(
                      width: 28.0,
                      height: 28.0,
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0xFF064E3B).withValues(alpha: 0.3)
                            : const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(7.0),
                        border: Border.all(
                          color: isDark
                              ? const Color(0xFF059669).withValues(alpha: 0.3)
                              : const Color(0xFFA7F3D0),
                          width: 0.8,
                        ),
                      ),
                      child: Icon(
                        item['icon'] as IconData,
                        size: 15.0,
                        color: isDark ? const Color(0xFF34D399) : const Color(0xFF047857),
                      ),
                    ),
                    const SizedBox(width: 10.0),
                    Expanded(
                      flex: 4,
                      child: Text(
                        item['label'] as String,
                        style: TextStyle(
                          fontSize: 13.0,
                          fontWeight: FontWeight.w500,
                          color: isDark ? AppColors.mutedForegroundDark : const Color(0xFF64748B),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Expanded(
                      flex: 5,
                      child: Text(
                        item['value'] as String,
                        textAlign: TextAlign.end,
                        style: TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.foregroundDark : const Color(0xFF0F172A),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              if (!isLast)
                Divider(
                  height: 1.0,
                  thickness: 0.8,
                  color: isDark ? AppColors.borderDark : const Color(0xFFE2E8F0),
                  indent: 14.0,
                  endIndent: 14.0,
                ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      color: AppColors.mutedLight,
      child: const Center(
        child: Icon(
          Icons.image_outlined,
          size: 56.0,
          color: AppColors.mutedForegroundLight,
        ),
      ),
    );
  }
}
