class TrackRecord {
  final String id;
  final String variantId;
  final String trackName;
  final String? lapTime;
  final double? lapTimeSeconds;
  final String? driver;
  final String? tire;
  final String? packageOrOptions;
  final String? recordType;
  final String? notes;
  final String confidence;
  final DateTime createdAt;

  TrackRecord({
    required this.id,
    required this.variantId,
    required this.trackName,
    this.lapTime,
    this.lapTimeSeconds,
    this.driver,
    this.tire,
    this.packageOrOptions,
    this.recordType,
    this.notes,
    this.confidence = 'medium',
    required this.createdAt,
  });

  factory TrackRecord.fromJson(Map<String, dynamic> json) {
    return TrackRecord(
      id: json['id'] as String,
      variantId: json['variant_id'] as String,
      trackName: json['track_name'] as String,
      lapTime: json['lap_time'] as String?,
      lapTimeSeconds: json['lap_time_seconds'] as double?,
      driver: json['driver'] as String?,
      tire: json['tire'] as String?,
      packageOrOptions: json['package_or_options'] as String?,
      recordType: json['record_type'] as String?,
      notes: json['notes'] as String?,
      confidence: json['confidence'] as String? ?? 'medium',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'variant_id': variantId,
      'track_name': trackName,
      'lap_time': lapTime,
      'lap_time_seconds': lapTimeSeconds,
      'driver': driver,
      'tire': tire,
      'package_or_options': packageOrOptions,
      'record_type': recordType,
      'notes': notes,
      'confidence': confidence,
      'created_at': createdAt.toIso8601String(),
    };
  }

  String get recordTypeLabel {
    switch (recordType) {
      case 'official':
        return 'Official';
      case 'third_party':
        return 'Third-Party';
      case 'rumored':
        return 'Rumored';
      case 'unverified':
        return 'Unverified';
      default:
        return recordType ?? 'Unknown';
    }
  }
}