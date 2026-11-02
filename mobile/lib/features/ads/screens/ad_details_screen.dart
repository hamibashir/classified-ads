import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/chat_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/launcher_utils.dart';
import '../../../models/ad_model.dart';
import '../../auth/screens/login_screen.dart';
import '../../chat/screens/chat_screen.dart';
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

  @override
  void initState() {
    super.initState();
    if (widget.initialAd != null) {
      _ad = widget.initialAd;
    } else {
      _fetchAdDetails();
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
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
        } else {
          _errorMessage = response.error?.message ?? 'Failed to load ad details.';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.backgroundLight,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primaryLight),
        ),
      );
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
                          padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 4.0),
                          decoration: BoxDecoration(
                            color: AppColors.mutedLight,
                            borderRadius: BorderRadius.circular(6.0),
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: const Text(
                            'Negotiable',
                            style: TextStyle(
                              color: AppColors.mutedForegroundLight,
                              fontWeight: FontWeight.w600,
                              fontSize: 12.0,
                            ),
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

                  // Quick Attributes Grid (Condition & Posted Date)
                  const Text('Attributes', style: AppTextStyles.h3),
                  const SizedBox(height: 10.0),
                  Row(
                    children: [
                      _buildAttributeChip(
                        title: 'Condition',
                        value: ad.conditionLabel,
                        icon: Icons.check_circle_outline,
                      ),
                      const SizedBox(width: 12.0),
                      _buildAttributeChip(
                        title: 'Posted',
                        value: DateFormat('dd MMM yyyy').format(ad.createdAt),
                        icon: Icons.calendar_today_outlined,
                      ),
                    ],
                  ),
                  const SizedBox(height: 20.0),

                  // Description
                  const Text('Description', style: AppTextStyles.h3),
                  const SizedBox(height: 8.0),
                  Text(
                    ad.description,
                    style: AppTextStyles.body.copyWith(
                      color: AppColors.foregroundLight,
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
                      borderRadius: BorderRadius.circular(12.0),
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

  Widget _buildAttributeChip({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
        decoration: BoxDecoration(
          color: AppColors.mutedLight,
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18.0, color: AppColors.primaryLight),
            const SizedBox(width: 8.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontSize: 11.0, color: AppColors.mutedForegroundLight),
                  ),
                  Text(
                    value,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13.0,
                      fontWeight: FontWeight.w600,
                      color: AppColors.foregroundLight,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
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
