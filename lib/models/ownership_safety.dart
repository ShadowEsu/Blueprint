class OwnershipSafety {
  final String id;
  final String variantId;
  final String category;
  final String title;
  final String? details;
  final String? ratingValue;
  final String? ratingSource;
  final bool? isPublicRatingAvailable;
  final String? severity;
  final String confidence;
  final DateTime createdAt;

  OwnershipSafety({
    required this.id,
    required this.variantId,
    required this.category,
    required this.title,
    this.details,
    this.ratingValue,
    this.ratingSource,
    this.isPublicRatingAvailable,
    this.severity,
    this.confidence = 'medium',
    required this.createdAt,
  });

  factory OwnershipSafety.fromJson(Map<String, dynamic> json) {
    return OwnershipSafety(
      id: json['id'] as String,
      variantId: json['variant_id'] as String,
      category: json['category'] as String,
      title: json['title'] as String,
      details: json['details'] as String?,
      ratingValue: json['rating_value'] as String?,
      ratingSource: json['rating_source'] as String?,
      isPublicRatingAvailable: json['is_public_rating_available'] as bool?,
      severity: json['severity'] as String?,
      confidence: json['confidence'] as String? ?? 'medium',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'variant_id': variantId,
      'category': category,
      'title': title,
      'details': details,
      'rating_value': ratingValue,
      'rating_source': ratingSource,
      'is_public_rating_available': isPublicRatingAvailable,
      'severity': severity,
      'confidence': confidence,
      'created_at': createdAt.toIso8601String(),
    };
  }

  String get categoryLabel {
    switch (category) {
      case 'warranty':
        return 'Warranty';
      case 'maintenance':
        return 'Maintenance';
      case 'recall':
        return 'Recall';
      case 'safety':
        return 'Safety';
      case 'reliability':
        return 'Reliability';
      case 'practicality':
        return 'Practicality';
      default:
        return category;
    }
  }
}