class PerformanceTest {
  final String id;
  final String variantId;
  final String testType;
  final String sourceType;
  final String? sourceName;
  final double? zeroTo60MphSec;
  final double? zeroTo100KmhSec;
  final double? zeroTo100MphSec;
  final double? zeroTo200KmhSec;
  final double? zeroTo300KmhSec;
  final double? quarterMileSec;
  final double? quarterMileMph;
  final double? topSpeedMph;
  final double? topSpeedKmh;
  final double? braking600Ft;
  final double? braking700Ft;
  final double? lateralG;
  final String? conditions;
  final String? tire;
  final String? notes;
  final String confidence;
  final DateTime createdAt;

  PerformanceTest({
    required this.id,
    required this.variantId,
    required this.testType,
    required this.sourceType,
    this.sourceName,
    this.zeroTo60MphSec,
    this.zeroTo100KmhSec,
    this.zeroTo100MphSec,
    this.zeroTo200KmhSec,
    this.zeroTo300KmhSec,
    this.quarterMileSec,
    this.quarterMileMph,
    this.topSpeedMph,
    this.topSpeedKmh,
    this.braking600Ft,
    this.braking700Ft,
    this.lateralG,
    this.conditions,
    this.tire,
    this.notes,
    this.confidence = 'medium',
    required this.createdAt,
  });

  factory PerformanceTest.fromJson(Map<String, dynamic> json) {
    return PerformanceTest(
      id: json['id'] as String,
      variantId: json['variant_id'] as String,
      testType: json['test_type'] as String,
      sourceType: json['source_type'] as String,
      sourceName: json['source_name'] as String?,
      zeroTo60MphSec: json['zero_to_60_mph_sec'] as double?,
      zeroTo100KmhSec: json['zero_to_100_kmh_sec'] as double?,
      zeroTo100MphSec: json['zero_to_100_mph_sec'] as double?,
      zeroTo200KmhSec: json['zero_to_200_kmh_sec'] as double?,
      zeroTo300KmhSec: json['zero_to_300_kmh_sec'] as double?,
      quarterMileSec: json['quarter_mile_sec'] as double?,
      quarterMileMph: json['quarter_mile_mph'] as double?,
      topSpeedMph: json['top_speed_mph'] as double?,
      topSpeedKmh: json['top_speed_kmh'] as double?,
      braking600Ft: json['braking_60_0_ft'] as double?,
      braking700Ft: json['braking_70_0_ft'] as double?,
      lateralG: json['lateral_g'] as double?,
      conditions: json['conditions'] as String?,
      tire: json['tire'] as String?,
      notes: json['notes'] as String?,
      confidence: json['confidence'] as String? ?? 'medium',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'variant_id': variantId,
      'test_type': testType,
      'source_type': sourceType,
      'source_name': sourceName,
      'zero_to_60_mph_sec': zeroTo60MphSec,
      'zero_to_100_kmh_sec': zeroTo100KmhSec,
      'zero_to_100_mph_sec': zeroTo100MphSec,
      'zero_to_200_kmh_sec': zeroTo200KmhSec,
      'zero_to_300_kmh_sec': zeroTo300KmhSec,
      'quarter_mile_sec': quarterMileSec,
      'quarter_mile_mph': quarterMileMph,
      'top_speed_mph': topSpeedMph,
      'top_speed_kmh': topSpeedKmh,
      'braking_60_0_ft': braking600Ft,
      'braking_70_0_ft': braking700Ft,
      'lateral_g': lateralG,
      'conditions': conditions,
      'tire': tire,
      'notes': notes,
      'confidence': confidence,
      'created_at': createdAt.toIso8601String(),
    };
  }

  String get sourceTypeLabel {
    switch (sourceType) {
      case 'official':
        return 'Official';
      case 'third_party':
        return 'Third-Party Test';
      case 'estimated':
        return 'Estimated';
      case 'unverified':
        return 'Unverified';
      default:
        return sourceType;
    }
  }
}