class CarSpec {
  final String id;
  final String variantId;
  final String? engine;
  final double? displacementLiters;
  final String? aspiration;
  final String? hybridSystem;
  final double? horsepowerHp;
  final double? horsepowerPs;
  final double? torqueLbFt;
  final double? torqueNm;
  final double? weightLb;
  final double? weightKg;
  final String? weightType;
  final double? lengthIn;
  final double? widthIn;
  final double? heightIn;
  final double? wheelbaseIn;
  final String? tireFront;
  final String? tireRear;
  final String? brakeFront;
  final String? brakeRear;
  final String? suspension;
  final String sourceConfidence;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  CarSpec({
    required this.id,
    required this.variantId,
    this.engine,
    this.displacementLiters,
    this.aspiration,
    this.hybridSystem,
    this.horsepowerHp,
    this.horsepowerPs,
    this.torqueLbFt,
    this.torqueNm,
    this.weightLb,
    this.weightKg,
    this.weightType,
    this.lengthIn,
    this.widthIn,
    this.heightIn,
    this.wheelbaseIn,
    this.tireFront,
    this.tireRear,
    this.brakeFront,
    this.brakeRear,
    this.suspension,
    this.sourceConfidence = 'medium',
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CarSpec.fromJson(Map<String, dynamic> json) {
    return CarSpec(
      id: json['id'] as String,
      variantId: json['variant_id'] as String,
      engine: json['engine'] as String?,
      displacementLiters: json['displacement_liters'] as double?,
      aspiration: json['aspiration'] as String?,
      hybridSystem: json['hybrid_system'] as String?,
      horsepowerHp: json['horsepower_hp'] as double?,
      horsepowerPs: json['horsepower_ps'] as double?,
      torqueLbFt: json['torque_lb_ft'] as double?,
      torqueNm: json['torque_nm'] as double?,
      weightLb: json['weight_lb'] as double?,
      weightKg: json['weight_kg'] as double?,
      weightType: json['weight_type'] as String?,
      lengthIn: json['length_in'] as double?,
      widthIn: json['width_in'] as double?,
      heightIn: json['height_in'] as double?,
      wheelbaseIn: json['wheelbase_in'] as double?,
      tireFront: json['tire_front'] as String?,
      tireRear: json['tire_rear'] as String?,
      brakeFront: json['brake_front'] as String?,
      brakeRear: json['brake_rear'] as String?,
      suspension: json['suspension'] as String?,
      sourceConfidence: json['source_confidence'] as String? ?? 'medium',
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'variant_id': variantId,
      'engine': engine,
      'displacement_liters': displacementLiters,
      'aspiration': aspiration,
      'hybrid_system': hybridSystem,
      'horsepower_hp': horsepowerHp,
      'horsepower_ps': horsepowerPs,
      'torque_lb_ft': torqueLbFt,
      'torque_nm': torqueNm,
      'weight_lb': weightLb,
      'weight_kg': weightKg,
      'weight_type': weightType,
      'length_in': lengthIn,
      'width_in': widthIn,
      'height_in': heightIn,
      'wheelbase_in': wheelbaseIn,
      'tire_front': tireFront,
      'tire_rear': tireRear,
      'brake_front': brakeFront,
      'brake_rear': brakeRear,
      'suspension': suspension,
      'source_confidence': sourceConfidence,
      'notes': notes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}