import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class ImagePickerGrid extends StatelessWidget {
  final List<File> selectedImages;
  final Function(List<File> updatedImages) onImagesChanged;
  final int maxImages;

  const ImagePickerGrid({
    super.key,
    required this.selectedImages,
    required this.onImagesChanged,
    this.maxImages = 8,
  });

  Future<void> _pickFromCamera(BuildContext context) async {
    if (selectedImages.length >= maxImages) return;
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );
      if (picked != null) {
        final list = List<File>.from(selectedImages)..add(File(picked.path));
        onImagesChanged(list);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Camera error: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _pickFromGallery(BuildContext context) async {
    final remaining = maxImages - selectedImages.length;
    if (remaining <= 0) return;

    try {
      final picker = ImagePicker();
      final pickedList = await picker.pickMultiImage(
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
        limit: remaining,
      );
      if (pickedList.isNotEmpty) {
        final newFiles = pickedList.take(remaining).map((x) => File(x.path)).toList();
        final list = List<File>.from(selectedImages)..addAll(newFiles);
        onImagesChanged(list);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gallery error: ${e.toString()}')),
        );
      }
    }
  }

  void _removeImage(int index) {
    final list = List<File>.from(selectedImages)..removeAt(index);
    onImagesChanged(list);
  }

  void _showSourceModal(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: AppColors.surfaceLight,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40.0,
                height: 4.0,
                decoration: BoxDecoration(
                  color: AppColors.borderLight,
                  borderRadius: BorderRadius.circular(2.0),
                ),
              ),
              const SizedBox(height: 16.0),
              const Text('Add Photos', style: AppTextStyles.h2),
              const SizedBox(height: 16.0),
              ListTile(
                leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primaryLight),
                title: const Text('Take a photo with camera'),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _pickFromCamera(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_outlined, color: AppColors.primaryLight),
                title: const Text('Choose from gallery'),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _pickFromGallery(context);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Upload Photos', style: AppTextStyles.bodyMedium),
            Text(
              '${selectedImages.length} / $maxImages',
              style: AppTextStyles.caption.copyWith(color: AppColors.mutedForegroundLight),
            ),
          ],
        ),
        const SizedBox(height: 8.0),
        SizedBox(
          height: 100.0,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: selectedImages.length < maxImages
                ? selectedImages.length + 1
                : selectedImages.length,
            separatorBuilder: (context, index) => const SizedBox(width: 10.0),
            itemBuilder: (context, index) {
              // Add photo button tile
              if (index == 0 && selectedImages.length < maxImages) {
                return InkWell(
                  onTap: () => _showSourceModal(context),
                  borderRadius: BorderRadius.circular(10.0),
                  child: Container(
                    width: 100.0,
                    height: 100.0,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(10.0),
                      border: Border.all(color: AppColors.primaryLight, style: BorderStyle.solid),
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_a_photo_outlined, color: AppColors.primaryLight, size: 28.0),
                        SizedBox(height: 4.0),
                        Text(
                          'Add Photo',
                          style: TextStyle(fontSize: 11.0, color: AppColors.primaryLight, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                );
              }

              final imageIndex = selectedImages.length < maxImages ? index - 1 : index;
              final imageFile = selectedImages[imageIndex];
              final isCover = imageIndex == 0;

              return Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10.0),
                    child: Image.file(
                      imageFile,
                      width: 100.0,
                      height: 100.0,
                      fit: BoxFit.cover,
                    ),
                  ),
                  if (isCover)
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 2.0),
                        color: Colors.black.withValues(alpha: 0.65),
                        child: const Text(
                          'COVER',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white, fontSize: 9.0, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  Positioned(
                    top: 4.0,
                    right: 4.0,
                    child: GestureDetector(
                      onTap: () => _removeImage(imageIndex),
                      child: Container(
                        padding: const EdgeInsets.all(2.0),
                        decoration: const BoxDecoration(
                          color: Colors.black54,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close, size: 16.0, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}
