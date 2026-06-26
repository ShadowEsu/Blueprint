class Car {
  final String id;
  final String make;
  final String model;
  final String? generation;
  final int? modelYear;
  final int? productionStartYear;
  final int? productionEndYear;
  final int? productionCount;
  final String? currentStatus;
  final String? summary;
  final String? caveats;
  final DateTime createdAt;
  final DateTime updatedAt;

  Car({
    required this.id,
    required this.make,
    required this.model,
    this.generation,
    this.modelYear,
    this.productionStartYear,
    this.productionEndYear,
    this.productionCount,
    this.currentStatus,
    this.summary,
    this.caveats,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Car.fromJson(Map<String, dynamic> json) {
    return Car(
      id: json['id'] as String,
      make: json['make'] as String,
      model: json['model'] as String,
      generation: json['generation'] as String?,
      modelYear: json['model_year'] as int?,
      productionStartYear: json['production_start_year'] as int?,
      productionEndYear: json['production_end_year'] as int?,
      productionCount: json['production_count'] as int?,
      currentStatus: json['current_status'] as String?,
      summary: json['summary'] as String?,
      caveats: json['caveats'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'make': make,
      'model': model,
      'generation': generation,
      'model_year': modelYear,
      'production_start_year': productionStartYear,
      'production_end_year': productionEndYear,
      'production_count': productionCount,
      'current_status': currentStatus,
      'summary': summary,
      'caveats': caveats,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  String get displayName {
    final year = modelYear != null ? '$modelYear ' : '';
    return '$year$make $model';
  }
}