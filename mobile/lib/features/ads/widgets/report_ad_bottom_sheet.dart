import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class ReportAdBottomSheet extends StatefulWidget {
  final String adId;
  final String adTitle;

  const ReportAdBottomSheet({
    super.key,
    required this.adId,
    required this.adTitle,
  });

  static Future<void> show(BuildContext context, {required String adId, required String adTitle}) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ReportAdBottomSheet(adId: adId, adTitle: adTitle),
    );
  }

  @override
  State<ReportAdBottomSheet> createState() => _ReportAdBottomSheetState();
}

class _ReportAdBottomSheetState extends State<ReportAdBottomSheet> {
  final ApiClient _apiClient = ApiClient();
  final TextEditingController _detailsController = TextEditingController();

  final List<Map<String, String>> _reasons = [
    {'value': 'SPAM', 'label': 'Spam / Misleading Ad'},
    {'value': 'FRAUD', 'label': 'Fraud / Counterfeit Item'},
    {'value': 'INAPPROPRIATE', 'label': 'Inappropriate / Offensive Content'},
    {'value': 'DUPLICATE', 'label': 'Duplicate Listing'},
  ];

  String _selectedReason = 'SPAM';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
  }

  Future<void> _submitReport() async {
    setState(() {
      _isSubmitting = true;
    });

    final response = await _apiClient.post<dynamic>(
      '/ads/${widget.adId}/report',
      data: {
        'reason': _selectedReason,
        'details': _detailsController.text.trim(),
      },
    );

    if (mounted) {
      setState(() {
        _isSubmitting = false;
      });

      Navigator.of(context).pop();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            response.success
                ? 'Thank you. The ad has been reported for admin review.'
                : response.error?.message ?? 'Failed to submit report. Please log in first.',
          ),
          backgroundColor: response.success ? AppColors.priceLight : AppColors.destructive,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        decoration: const BoxDecoration(
          color: AppColors.surfaceLight,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
        ),
        padding: const EdgeInsets.fromLTRB(20.0, 12.0, 20.0, 24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40.0,
                height: 4.0,
                decoration: BoxDecoration(
                  color: AppColors.borderLight,
                  borderRadius: BorderRadius.circular(2.0),
                ),
              ),
            ),
            const SizedBox(height: 12.0),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Report Listing', style: AppTextStyles.h2),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 4.0),
            Text(
              'Why are you reporting "${widget.adTitle}"?',
              style: AppTextStyles.caption.copyWith(color: AppColors.mutedForegroundLight),
            ),
            const SizedBox(height: 16.0),

            // Selection options
            ..._reasons.map((r) {
              final isSelected = _selectedReason == r['value'];
              return InkWell(
                onTap: () {
                  setState(() {
                    _selectedReason = r['value']!;
                  });
                },
                borderRadius: BorderRadius.circular(8.0),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
                  margin: const EdgeInsets.only(bottom: 6.0),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primaryLight.withValues(alpha: 0.08)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(8.0),
                    border: Border.all(
                      color: isSelected ? AppColors.primaryLight : AppColors.borderLight,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                        size: 20.0,
                        color: isSelected ? AppColors.primaryLight : AppColors.mutedForegroundLight,
                      ),
                      const SizedBox(width: 12.0),
                      Text(
                        r['label']!,
                        style: AppTextStyles.body.copyWith(
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: 12.0),
            TextField(
              controller: _detailsController,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: 'Additional details (optional)...',
              ),
            ),
            const SizedBox(height: 20.0),

            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitReport,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.destructive,
                foregroundColor: Colors.white,
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20.0,
                      height: 20.0,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.0,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Submit Report'),
            ),
          ],
        ),
      ),
    );
  }
}
