import 'package:exotic_car_assistant/core/supabase_config.dart';
import 'package:exotic_car_assistant/models/car.dart';
import 'package:exotic_car_assistant/models/car_variant.dart';
import 'package:exotic_car_assistant/models/car_spec.dart';
import 'package:exotic_car_assistant/models/performance_test.dart';
import 'package:exotic_car_assistant/models/track_record.dart';
import 'package:exotic_car_assistant/models/pricing_market.dart';
import 'package:exotic_car_assistant/models/ownership_safety.dart';
import 'package:exotic_car_assistant/models/research_chunk.dart';

class CarRepository {
  final SupabaseClient _client = SupabaseConfig.client;

  Future<List<Car>> getAllCars() async {
    try {
      final response = await _client
          .from('cars')
          .select()
          .order('make', ascending: true)
          .order('model', ascending: true);

      return (response as List)
          .map((json) => Car.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load cars: $e');
    }
  }

  Future<Car?> getCarById(String carId) async {
    try {
      final response = await _client
          .from('cars')
          .select()
          .eq('id', carId)
          .single();

      return Car.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }

  Future<List<CarVariant>> getVariantsForCar(String carId) async {
    try {
      final response = await _client
          .from('car_variants')
          .select()
          .eq('car_id', carId)
          .order('is_primary_variant', ascending: false)
          .order('variant_name', ascending: true);

      return (response as List)
          .map((json) => CarVariant.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load variants: $e');
    }
  }

  Future<CarVariant?> getPrimaryVariant(String carId) async {
    try {
      final response = await _client
          .from('car_variants')
          .select()
          .eq('car_id', carId)
          .eq('is_primary_variant', true)
          .limit(1)
          .single();

      return CarVariant.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }

  Future<CarSpec?> getSpecsForVariant(String variantId) async {
    try {
      final response = await _client
          .from('car_specs')
          .select()
          .eq('variant_id', variantId)
          .limit(1)
          .single();

      return CarSpec.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }

  Future<List<PerformanceTest>> getPerformanceTests(String variantId) async {
    try {
      final response = await _client
          .from('performance_tests')
          .select()
          .eq('variant_id', variantId)
          .order('source_type', ascending: true)
          .order('test_type', ascending: true);

      return (response as List)
          .map((json) => PerformanceTest.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load performance tests: $e');
    }
  }

  Future<List<TrackRecord>> getTrackRecords(String variantId) async {
    try {
      final response = await _client
          .from('track_records')
          .select()
          .eq('variant_id', variantId)
          .order('lap_time_seconds', ascending: true);

      return (response as List)
          .map((json) => TrackRecord.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load track records: $e');
    }
  }

  Future<List<PricingMarket>> getPricing(String variantId) async {
    try {
      final response = await _client
          .from('pricing_market')
          .select()
          .eq('variant_id', variantId)
          .order('date_observed', ascending: false);

      return (response as List)
          .map((json) => PricingMarket.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load pricing: $e');
    }
  }

  Future<List<OwnershipSafety>> getOwnershipSafety(String variantId) async {
    try {
      final response = await _client
          .from('ownership_safety')
          .select()
          .eq('variant_id', variantId)
          .order('category', ascending: true);

      return (response as List)
          .map((json) => OwnershipSafety.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load ownership/safety data: $e');
    }
  }

  Future<List<ResearchChunk>> getResearchChunks({
    String? carId,
    String? variantId,
    int limit = 10,
  }) async {
    try {
      var query = _client.from('research_chunks').select();

      if (carId != null) {
        query = query.eq('car_id', carId);
      }
      if (variantId != null) {
        query = query.eq('variant_id', variantId);
      }

      final response = await query.limit(limit);

      return (response as List)
          .map((json) => ResearchChunk.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load research chunks: $e');
    }
  }

  Future<List<ResearchChunk>> searchResearchChunks(
    String query, {
    String? carId,
    String? variantId,
    int limit = 8,
  }) async {
    try {
      // Note: This requires embedding the query first with an AI service
      // For now, we'll do a simple text search as a fallback
      var dbQuery = _client.from('research_chunks').select();

      if (carId != null) {
        dbQuery = dbQuery.eq('car_id', carId);
      }
      if (variantId != null) {
        dbQuery = dbQuery.eq('variant_id', variantId);
      }

      // Simple text search - in production, use vector search with embeddings
      final response = await dbQuery
          .or('chunk_text.ilike.%$query%,chunk_title.ilike.%$query%')
          .limit(limit);

      return (response as List)
          .map((json) => ResearchChunk.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to search research chunks: $e');
    }
  }

  Future<Map<String, dynamic>> getCarDetailData(String carId) async {
    try {
      final variants = await getVariantsForCar(carId);
      final primaryVariant = variants.firstWhere(
        (v) => v.isPrimaryVariant,
        orElse: () => variants.isNotEmpty ? variants.first : throw Exception('No variants found'),
      );

      final specs = await getSpecsForVariant(primaryVariant.id);
      final performance = await getPerformanceTests(primaryVariant.id);
      final trackRecords = await getTrackRecords(primaryVariant.id);
      final pricing = await getPricing(primaryVariant.id);
      final ownershipSafety = await getOwnershipSafety(primaryVariant.id);
      final researchChunks = await getResearchChunks(carId: carId, limit: 10);

      return {
        'variants': variants,
        'primaryVariant': primaryVariant,
        'specs': specs,
        'performance': performance,
        'trackRecords': trackRecords,
        'pricing': pricing,
        'ownershipSafety': ownershipSafety,
        'researchChunks': researchChunks,
      };
    } catch (e) {
      throw Exception('Failed to load car details: $e');
    }
  }
}