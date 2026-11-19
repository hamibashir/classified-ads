import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/category_fields.dart';
import '../../../core/network/api_client.dart';
import '../../../core/providers/ads_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/location_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/category_model.dart';
import '../../../models/user_location.dart';
import '../../auth/screens/login_screen.dart';
import '../widgets/image_picker_grid.dart';

class PostAdScreen extends StatefulWidget {
  final VoidCallback? onAdPosted;

  const PostAdScreen({super.key, this.onAdPosted});

  @override
  State<PostAdScreen> createState() => _PostAdScreenState();
}

class _PostAdScreenState extends State<PostAdScreen> {
  final _formKey = GlobalKey<FormState>();
  final ApiClient _apiClient = ApiClient();

  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();

  String? _selectedCategoryId;
  String _condition = 'USED_GOOD';
  bool _isNegotiable = false;
  String _selectedCity = 'Lahore';
  double? _latitude = 31.5204;
  double? _longitude = 74.3587;
  bool _showPhone = true;
  bool _allowWhatsapp = true;
  final Map<String, String> _customFieldsMap = {};

  List<File> _selectedImages = [];
  bool _isSubmitting = false;
  String _submissionStatusText = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final loc = context.read<LocationProvider>().currentLocation;
      setState(() {
        if (!loc.isAllPakistan && CityInfo.pakistaniCities.any((c) => c.name == loc.cityName)) {
          _selectedCity = loc.cityName;
        } else {
          _selectedCity = 'Lahore';
        }
        _latitude = loc.latitude;
        _longitude = loc.longitude;
      });
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _handleGpsDetect() async {
    final locationProvider = context.read<LocationProvider>();
    final success = await locationProvider.detectGpsLocation();
    if (mounted && success) {
      final loc = locationProvider.currentLocation;
      setState(() {
        _latitude = loc.latitude;
        _longitude = loc.longitude;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('GPS coordinates attached to listing!')),
      );
    }
  }

  Future<void> _submitAd() async {
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      if (!mounted) return;
      final loggedIn = await Navigator.of(context).push<bool>(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      if (loggedIn != true) return;
    }

    if (!mounted) return;
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a category for your ad'),
          backgroundColor: AppColors.destructive,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
      _submissionStatusText = 'Uploading photos...';
    });

    List<String> uploadedImageUrls = [];
    if (_selectedImages.isNotEmpty) {
      final uploadResponse = await _apiClient.uploadImages(_selectedImages);
      if (!uploadResponse.success || uploadResponse.data == null) {
        if (mounted) {
          setState(() {
            _isSubmitting = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(uploadResponse.error?.message ?? 'Failed to upload photos'),
              backgroundColor: AppColors.destructive,
            ),
          );
        }
        return;
      }
      uploadedImageUrls = uploadResponse.data!;
    }

    if (mounted) {
      setState(() {
        _submissionStatusText = 'Publishing listing...';
      });
    }

    final double price = double.tryParse(_priceController.text) ?? 0.0;

    final cityInfo = CityInfo.pakistaniCities.firstWhere(
      (c) => c.name == _selectedCity,
      orElse: () => CityInfo.pakistaniCities[1], // default Lahore
    );

    String formattedDescription = _descriptionController.text.trim();
    if (_customFieldsMap.isNotEmpty) {
      formattedDescription += '\n\n===SPECIFICATIONS===\n${jsonEncode(_customFieldsMap)}\n====================\n';
    }

    final payload = {
      'title': _titleController.text.trim(),
      'description': formattedDescription,
      'price': price,
      'currency': 'PKR',
      'isNegotiable': _isNegotiable,
      'condition': _condition,
      'categoryId': _selectedCategoryId,
      'locationCity': _selectedCity,
      'locationState': cityInfo.province,
      'latitude': _latitude ?? cityInfo.latitude,
      'longitude': _longitude ?? cityInfo.longitude,
      'showPhone': _showPhone,
      'allowWhatsapp': _allowWhatsapp,
      'images': uploadedImageUrls,
      'customFields': _customFieldsMap,
    };

    final response = await _apiClient.post<dynamic>(
      '/ads',
      data: payload,
    );

    if (mounted) {
      setState(() {
        _isSubmitting = false;
      });

      if (response.success) {
        final adData = response.data as Map<String, dynamic>?;
        final status = adData?['status']?.toString() ?? 'ACTIVE';

        await showDialog<void>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: AppColors.priceLight),
                SizedBox(width: 8.0),
                Text('Ad Published!'),
              ],
            ),
            content: Text(
              status == 'PENDING'
                  ? 'Your ad has been submitted for admin approval and will be live shortly.'
                  : 'Congratulations! Your ad is now live across Pakistan.',
            ),
            actions: [
              ElevatedButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('OK'),
              ),
            ],
          ),
        );

        // Reset form
        _titleController.clear();
        _descriptionController.clear();
        _priceController.clear();
        setState(() {
          _selectedImages = [];
        });

        if (widget.onAdPosted != null) {
          widget.onAdPosted!();
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.error?.message ?? 'Failed to create ad'),
            backgroundColor: AppColors.destructive,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final adsProvider = context.watch<AdsProvider>();

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Post an Ad'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Category Selection
              const Text('Category', style: AppTextStyles.bodyMedium),
              const SizedBox(height: 6.0),
              DropdownButtonFormField<String>(
                initialValue: adsProvider.categories.any((c) => c.id == _selectedCategoryId)
                    ? _selectedCategoryId
                    : null,
                hint: const Text('Select a category'),
                decoration: const InputDecoration(),
                items: adsProvider.categories.map((cat) {
                  return DropdownMenuItem<String>(
                    value: cat.id,
                    child: Text(cat.name),
                  );
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedCategoryId = val;
                    _customFieldsMap.clear();
                  });
                },
                validator: (val) {
                  if (val == null) return 'Please select a category';
                  return null;
                },
              ),
              _buildCustomFieldsSection(adsProvider, isDark),
              const SizedBox(height: 18.0),

              // 2. Ad Title
              const Text('Ad Title', style: AppTextStyles.bodyMedium),
              const SizedBox(height: 6.0),
              TextFormField(
                controller: _titleController,
                maxLength: 100,
                decoration: const InputDecoration(
                  hintText: 'e.g. Honda City 1.3 2017 Total Genuine',
                ),
                validator: (val) {
                  if (val == null || val.trim().length < 5) {
                    return 'Title must be at least 5 characters long';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 10.0),

              // 3. Description
              const Text('Description', style: AppTextStyles.bodyMedium),
              const SizedBox(height: 6.0),
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                maxLength: 2000,
                decoration: const InputDecoration(
                  hintText: 'Describe features, condition, reason for selling...',
                ),
                validator: (val) {
                  if (val == null || val.trim().length < 10) {
                    return 'Description must be at least 10 characters long';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 10.0),

              // 4. Price & Negotiable Switch
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Price (PKR)', style: AppTextStyles.bodyMedium),
                        const SizedBox(height: 6.0),
                        TextFormField(
                          controller: _priceController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            hintText: 'Rs 0',
                            prefixText: 'Rs ',
                          ),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Enter price';
                            final num = double.tryParse(val);
                            if (num == null || num <= 0) return 'Valid price';
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16.0),
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Negotiable', style: AppTextStyles.bodyMedium),
                        const SizedBox(height: 6.0),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(
                            _isNegotiable ? 'Yes' : 'No',
                            style: AppTextStyles.caption,
                          ),
                          value: _isNegotiable,
                          activeThumbColor: AppColors.primaryLight,
                          onChanged: (val) {
                            setState(() {
                              _isNegotiable = val;
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18.0),

              // 5. Item Condition
              const Text('Item Condition', style: AppTextStyles.bodyMedium),
              const SizedBox(height: 6.0),
              Wrap(
                spacing: 8.0,
                children: AppConstants.adConditions.entries.map((entry) {
                  final isSelected = _condition == entry.key;
                  return ChoiceChip(
                    label: Text(entry.value),
                    selected: isSelected,
                    selectedColor: AppColors.primaryLight.withValues(alpha: 0.15),
                    labelStyle: TextStyle(
                      color: isSelected ? AppColors.primaryLight : AppColors.foregroundLight,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    ),
                    onSelected: (val) {
                      if (val) {
                        setState(() {
                          _condition = entry.key;
                        });
                      }
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 20.0),

              // 6. Photo Uploader Grid
              ImagePickerGrid(
                selectedImages: _selectedImages,
                onImagesChanged: (list) {
                  setState(() {
                    _selectedImages = list;
                  });
                },
              ),
              const SizedBox(height: 20.0),

              // 7. Location (City + GPS)
              const Text('Location', style: AppTextStyles.bodyMedium),
              const SizedBox(height: 6.0),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      initialValue: CityInfo.pakistaniCities.any((c) => c.name == _selectedCity)
                          ? _selectedCity
                          : 'Lahore',
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.location_city, size: 20.0),
                      ),
                      items: CityInfo.pakistaniCities.map((city) {
                        return DropdownMenuItem<String>(
                          value: city.name,
                          child: Text(city.name),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _selectedCity = val;
                          });
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 8.0),
                  IconButton.filledTonal(
                    icon: const Icon(Icons.my_location),
                    tooltip: 'Detect GPS',
                    onPressed: _handleGpsDetect,
                  ),
                ],
              ),
              const SizedBox(height: 20.0),

              // 8. Contact Preferences
              Container(
                padding: const EdgeInsets.all(12.0),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(10.0),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Show phone number to buyers', style: AppTextStyles.body),
                      value: _showPhone,
                      activeThumbColor: AppColors.primaryLight,
                      onChanged: (val) => setState(() => _showPhone = val),
                    ),
                    const Divider(height: 1.0),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Enable direct WhatsApp button', style: AppTextStyles.body),
                      value: _allowWhatsapp,
                      activeThumbColor: AppColors.whatsapp,
                      onChanged: (val) => setState(() => _allowWhatsapp = val),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28.0),

              // Submit Button
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitAd,
                child: _isSubmitting
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 18.0,
                            height: 18.0,
                            child: CircularProgressIndicator(strokeWidth: 2.0, color: Colors.white),
                          ),
                          const SizedBox(width: 12.0),
                          Text(_submissionStatusText),
                        ],
                      )
                    : const Text('Publish Ad'),
              ),
              const SizedBox(height: 32.0),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCustomFieldsSection(AdsProvider adsProvider, bool isDark) {
    if (_selectedCategoryId == null) return const SizedBox.shrink();

    CategoryModel? selectedCat;
    try {
      selectedCat = adsProvider.categories.firstWhere((c) => c.id == _selectedCategoryId);
    } catch (_) {
      return const SizedBox.shrink();
    }

    final fields = CategoryFieldsRegistry.getFieldsForCategory(selectedCat.slug);
    if (fields.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 16.0),
        Row(
          children: [
            Icon(Icons.tune, size: 18.0, color: isDark ? AppColors.primaryDark : AppColors.primaryLight),
            const SizedBox(width: 6.0),
            Text(
              '${selectedCat.name} Specifications',
              style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
            ),
          ],
        ),
        const SizedBox(height: 10.0),
        Container(
          padding: const EdgeInsets.all(14.0),
          decoration: BoxDecoration(
            color: isDark ? AppColors.cardDark : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: fields.map((field) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      field.label,
                      style: AppTextStyles.caption.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.foregroundDark : AppColors.foregroundLight,
                      ),
                    ),
                    const SizedBox(height: 6.0),
                    if (field.type == CategoryFieldType.select)
                      DropdownButtonFormField<String>(
                        initialValue: _customFieldsMap[field.key],
                        hint: Text('Select ${field.label}', style: AppTextStyles.caption),
                        decoration: InputDecoration(
                          prefixIcon: Icon(field.icon, size: 18.0),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
                        ),
                        items: field.options.map((opt) {
                          return DropdownMenuItem<String>(
                            value: opt,
                            child: Text(opt, style: AppTextStyles.body),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setState(() {
                            if (val != null) {
                              _customFieldsMap[field.key] = val;
                            } else {
                              _customFieldsMap.remove(field.key);
                            }
                          });
                        },
                      )
                    else
                      TextFormField(
                        initialValue: _customFieldsMap[field.key],
                        decoration: InputDecoration(
                          hintText: field.placeholder ?? 'Enter ${field.label.toLowerCase()}',
                          prefixIcon: Icon(field.icon, size: 18.0),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
                        ),
                        keyboardType: field.type == CategoryFieldType.number
                            ? TextInputType.number
                            : TextInputType.text,
                        onChanged: (val) {
                          if (val.trim().isNotEmpty) {
                            _customFieldsMap[field.key] = val.trim();
                          } else {
                            _customFieldsMap.remove(field.key);
                          }
                        },
                      ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}
