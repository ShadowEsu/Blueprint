class PricingMarket {
  final String id;
  final String variantId;
  final String priceType;
  final double? amount;
  final String currency;
  final String? marketRegion;
  final DateTime? dateObserved;
  final String? mileage;
  final String? context;
  final String? sourceName;
  final String confidence;
  final DateTime createdAt;

  PricingMarket({
    required this.id,
    required this.variantId,
    required this.priceType,
    this.amount,
    this.currency = 'USD',
    this.marketRegion,
    this.dateObserved,
    this.mileage,
    this.context,
    this.sourceName,
    this.confidence = 'medium',
    required this.createdAt,
  });

  factory PricingMarket.fromJson(Map<String, dynamic> json) {
    return PricingMarket(
      id: json['id'] as String,
      variantId: json['variant_id'] as String,
      priceType: json['price_type'] as String,
      amount: json['amount'] as double?,
      currency: json['currency'] as String? ?? 'USD',
      marketRegion: json['market_region'] as String?,
      dateObserved: json['date_observed'] != null
          ? DateTime.parse(json['date_observed'] as String)
          : null,
      mileage: json['mileage'] as String?,
      context: json['context'] as String?,
      sourceName: json['source_name'] as String?,
      confidence: json['confidence'] as String? ?? 'medium',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'variant_id': variantId,
      'price_type': priceType,
      'amount': amount,
      'currency': currency,
      'market_region': marketRegion,
      'date_observed': dateObserved?.toIso8601String(),
      'mileage': mileage,
      'context': context,
      'source_name': sourceName,
      'confidence': confidence,
      'created_at': createdAt.toIso8601String(),
    };
  }

  String get priceTypeLabel {
    switch (priceType) {
      case 'launch_msrp':
        return 'Launch MSRP';
      case 'original_msrp':
        return 'Original MSRP';
      case 'auction_sale':
        return 'Auction Sale';
      case 'asking_price':
        return 'Asking Price';
      case 'market_estimate':
        return 'Market Estimate';
      default:
        return priceType;
    }
  }

  String get formattedAmount {
    if (amount == null) return 'Not available';
    return '\$${amount!.toStringAsFixed(0)}';
  }
}