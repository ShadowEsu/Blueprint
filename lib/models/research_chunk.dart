class ResearchChunk {
  final String id;
  final String? carId;
  final String? variantId;
  final String? sourceId;
  final String? chunkTitle;
  final String chunkText;
  final String? chunkType;
  final Map<String, dynamic> metadata;
  final List<double>? embedding;
  final DateTime createdAt;

  ResearchChunk({
    required this.id,
    this.carId,
    this.variantId,
    this.sourceId,
    this.chunkTitle,
    required this.chunkText,
    this.chunkType,
    this.metadata = const {},
    this.embedding,
    required this.createdAt,
  });

  factory ResearchChunk.fromJson(Map<String, dynamic> json) {
    return ResearchChunk(
      id: json['id'] as String,
      carId: json['car_id'] as String?,
      variantId: json['variant_id'] as String?,
      sourceId: json['source_id'] as String?,
      chunkTitle: json['chunk_title'] as String?,
      chunkText: json['chunk_text'] as String,
      chunkType: json['chunk_type'] as String?,
      metadata: json['metadata'] != null
          ? Map<String, dynamic>.from(json['metadata'] as Map)
          : {},
      embedding: json['embedding'] != null
          ? List<double>.from(json['embedding'] as List)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'car_id': carId,
      'variant_id': variantId,
      'source_id': sourceId,
      'chunk_title': chunkTitle,
      'chunk_text': chunkText,
      'chunk_type': chunkType,
      'metadata': metadata,
      'embedding': embedding,
      'created_at': createdAt.toIso8601String(),
    };
  }
}