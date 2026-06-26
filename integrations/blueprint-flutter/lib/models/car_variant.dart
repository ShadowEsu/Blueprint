class CarVariant {
  final String id;
  final String carId;
  final String variantName;
  final String? bodyStyle;
  final String? drivetrain;
  final String? transmission;
  final int? seats;
  final String? description;
  final bool isPrimaryVariant;
  final DateTime createdAt;
  final DateTime updatedAt;

  CarVariant({
    required this.id,
    required this.carId,
    required this.variantName,
    this.bodyStyle,
    this.drivetrain,
    this.transmission,
    this.seats,
    this.description,
    this.isPrimaryVariant = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CarVariant.fromJson(Map<String, dynamic> json) {
    return CarVariant(
      id: json['id'] as String,
      carId: json['car_id'] as String,
      variantName: json['variant_name'] as String,
      bodyStyle: json['body_style'] as String?,
      drivetrain: json['drivetrain'] as String?,
      transmission: json['transmission'] as String?,
      seats: json['seats'] as int?,
      description: json['description'] as String?,
      isPrimaryVariant: json['is_primary_variant'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'car_id': carId,
      'variant_name': variantName,
      'body_style': bodyStyle,
      'drivetrain': drivetrain,
      'transmission': transmission,
      'seats': seats,
      'description': description,
      'is_primary_variant': isPrimaryVariant,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}