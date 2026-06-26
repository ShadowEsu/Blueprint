import 'package:exotic_car_assistant/models/car.dart';
import 'package:exotic_car_assistant/models/car_variant.dart';
import 'package:exotic_car_assistant/models/car_spec.dart';
import 'package:exotic_car_assistant/models/performance_test.dart';
import 'package:exotic_car_assistant/models/track_record.dart';
import 'package:exotic_car_assistant/models/pricing_market.dart';
import 'package:exotic_car_assistant/models/ownership_safety.dart';
import 'package:exotic_car_assistant/models/research_chunk.dart';
import 'package:exotic_car_assistant/repositories/car_repository.dart';

class AIContextBuilder {
  final CarRepository _repository = CarRepository();

  Future<String> buildContext({
    required String userQuestion,
    String? carId,
    String? variantId,
  }) async {
    final buffer = StringBuffer();

    buffer.writeln('=== EXOTIC CAR KNOWLEDGE BASE CONTEXT ===');
    buffer.writeln('You are a knowledgeable exotic car assistant. Answer ONLY using the verified data provided below.');
    buffer.writeln('If information is not in this context, say "Not confirmed in database."');
    buffer.writeln('Never hallucinate specs, prices, lap times, or other data.');
    buffer.writeln();

    // If specific car/variant is mentioned, load detailed data
    if (carId != null) {
      try {
        final car = await _repository.getCarById(carId);
        if (car != null) {
          buffer.writeln('--- CAR IDENTITY ---');
          buffer.writeln('Make: ${car.make}');
          buffer.writeln('Model: ${car.model}');
          if (car.generation != null) buffer.writeln('Generation: ${car.generation}');
          if (car.modelYear != null) buffer.writeln('Model Year: ${car.modelYear}');
          if (car.productionStartYear != null) buffer.writeln('Production Start: ${car.productionStartYear}');
          if (car.productionEndYear != null) buffer.writeln('Production End: ${car.productionEndYear}');
          if (car.productionCount != null) buffer.writeln('Production Count: ${car.productionCount} units');
          if (car.currentStatus != null) buffer.writeln('Status: ${car.currentStatus}');
          if (car.summary != null) buffer.writeln('Summary: ${car.summary}');
          if (car.caveats != null) buffer.writeln('Caveats: ${car.caveats}');
          buffer.writeln();
        }

        // Load variants
        final variants = await _repository.getVariantsForCar(carId);
        if (variants.isNotEmpty) {
          buffer.writeln('--- VARIANTS ---');
          for (final variant in variants) {
            buffer.writeln('Variant: ${variant.variantName}');
            if (variant.bodyStyle != null) buffer.writeln('  Body Style: ${variant.bodyStyle}');
            if (variant.drivetrain != null) buffer.writeln('  Drivetrain: ${variant.drivetrain}');
            if (variant.transmission != null) buffer.writeln('  Transmission: ${variant.transmission}');
            if (variant.seats != null) buffer.writeln('  Seats: ${variant.seats}');
            if (variant.description != null) buffer.writeln('  Description: ${variant.description}');
          }
          buffer.writeln();

          // Load specs for primary variant
          final primaryVariant = variants.firstWhere(
            (v) => v.isPrimaryVariant,
            orElse: () => variants.first,
          );

          final specs = await _repository.getSpecsForVariant(primaryVariant.id);
          if (specs != null) {
            buffer.writeln('--- SPECS (Primary Variant: ${primaryVariant.variantName}) ---');
            if (specs.engine != null) buffer.writeln('Engine: ${specs.engine}');
            if (specs.displacementLiters != null) buffer.writeln('Displacement: ${specs.displacementLiters}L');
            if (specs.aspiration != null) buffer.writeln('Aspiration: ${specs.aspiration}');
            if (specs.hybridSystem != null) buffer.writeln('Hybrid System: ${specs.hybridSystem}');
            if (specs.horsepowerHp != null) buffer.writeln('Horsepower: ${specs.horsepowerHp} hp');
            if (specs.horsepowerPs != null) buffer.writeln('  (${specs.horsepowerPs} PS)');
            if (specs.torqueLbFt != null) buffer.writeln('Torque: ${specs.torqueLbFt} lb-ft');
            if (specs.torqueNm != null) buffer.writeln('  (${specs.torqueNm} Nm)');
            if (specs.weightLb != null) buffer.writeln('Weight: ${specs.weightLb} lb');
            if (specs.weightKg != null) buffer.writeln('  (${specs.weightKg} kg)');
            if (specs.weightType != null) buffer.writeln('Weight Type: ${specs.weightType}');
            if (specs.lengthIn != null) buffer.writeln('Length: ${specs.lengthIn} in');
            if (specs.widthIn != null) buffer.writeln('Width: ${specs.widthIn} in');
            if (specs.heightIn != null) buffer.writeln('Height: ${specs.heightIn} in');
            if (specs.wheelbaseIn != null) buffer.writeln('Wheelbase: ${specs.wheelbaseIn} in');
            if (specs.tireFront != null) buffer.writeln('Tires (Front): ${specs.tireFront}');
            if (specs.tireRear != null) buffer.writeln('Tires (Rear): ${specs.tireRear}');
            if (specs.brakeFront != null) buffer.writeln('Brakes (Front): ${specs.brakeFront}');
            if (specs.brakeRear != null) buffer.writeln('Brakes (Rear): ${specs.brakeRear}');
            if (specs.suspension != null) buffer.writeln('Suspension: ${specs.suspension}');
            if (specs.notes != null) buffer.writeln('Notes: ${specs.notes}');
            buffer.writeln();
          }

          // Load performance tests
          final performance = await _repository.getPerformanceTests(primaryVariant.id);
          if (performance.isNotEmpty) {
            buffer.writeln('--- PERFORMANCE ---');
            for (final perf in performance) {
              buffer.writeln('Test Type: ${perf.testType} (${perf.sourceTypeLabel})');
              if (perf.sourceName != null) buffer.writeln('  Source: ${perf.sourceName}');
              if (perf.zeroTo60MphSec != null) buffer.writeln('  0-60 mph: ${perf.zeroTo60MphSec}s');
              if (perf.zeroTo100KmhSec != null) buffer.writeln('  0-100 km/h: ${perf.zeroTo100KmhSec}s');
              if (perf.zeroTo100MphSec != null) buffer.writeln('  0-100 mph: ${perf.zeroTo100MphSec}s');
              if (perf.zeroTo200KmhSec != null) buffer.writeln('  0-200 km/h: ${perf.zeroTo200KmhSec}s');
              if (perf.zeroTo300KmhSec != null) buffer.writeln('  0-300 km/h: ${perf.zeroTo300KmhSec}s');
              if (perf.quarterMileSec != null) buffer.writeln('  Quarter Mile: ${perf.quarterMileSec}s @ ${perf.quarterMileMph} mph');
              if (perf.topSpeedMph != null) buffer.writeln('  Top Speed: ${perf.topSpeedMph} mph');
              if (perf.topSpeedKmh != null) buffer.writeln('  (${perf.topSpeedKmh} km/h)');
              if (perf.braking600Ft != null) buffer.writeln('  60-0 mph Braking: ${perf.braking600Ft} ft');
              if (perf.braking700Ft != null) buffer.writeln('  70-0 mph Braking: ${perf.braking700Ft} ft');
              if (perf.lateralG != null) buffer.writeln('  Lateral G: ${perf.lateralG}');
              if (perf.conditions != null) buffer.writeln('  Conditions: ${perf.conditions}');
              if (perf.tire != null) buffer.writeln('  Tires: ${perf.tire}');
              if (perf.notes != null) buffer.writeln('  Notes: ${perf.notes}');
            }
            buffer.writeln();
          }

          // Load track records
          final trackRecords = await _repository.getTrackRecords(primaryVariant.id);
          if (trackRecords.isNotEmpty) {
            buffer.writeln('--- TRACK RECORDS ---');
            for (final record in trackRecords) {
              buffer.writeln('Track: ${record.trackName} (${record.recordTypeLabel})');
              if (record.lapTime != null) buffer.writeln('  Lap Time: ${record.lapTime}');
              if (record.lapTimeSeconds != null) buffer.writeln('  (${record.lapTimeSeconds}s)');
              if (record.driver != null) buffer.writeln('  Driver: ${record.driver}');
              if (record.tire != null) buffer.writeln('  Tires: ${record.tire}');
              if (record.packageOrOptions != null) buffer.writeln('  Package: ${record.packageOrOptions}');
              if (record.notes != null) buffer.writeln('  Notes: ${record.notes}');
            }
            buffer.writeln();
          }

          // Load pricing
          final pricing = await _repository.getPricing(primaryVariant.id);
          if (pricing.isNotEmpty) {
            buffer.writeln('--- PRICING & MARKET DATA ---');
            for (final price in pricing) {
              buffer.writeln('${price.priceTypeLabel}: ${price.formattedAmount}');
              if (price.marketRegion != null) buffer.writeln('  Region: ${price.marketRegion}');
              if (price.dateObserved != null) buffer.writeln('  Date: ${price.dateObserved}');
              if (price.mileage != null) buffer.writeln('  Mileage: ${price.mileage}');
              if (price.context != null) buffer.writeln('  Context: ${price.context}');
              if (price.sourceName != null) buffer.writeln('  Source: ${price.sourceName}');
            }
            buffer.writeln();
          }

          // Load ownership/safety
          final ownershipSafety = await _repository.getOwnershipSafety(primaryVariant.id);
          if (ownershipSafety.isNotEmpty) {
            buffer.writeln('--- OWNERSHIP, SAFETY & CAVEATS ---');
            for (final item in ownershipSafety) {
              buffer.writeln('${item.categoryLabel}: ${item.title}');
              if (item.details != null) buffer.writeln('  Details: ${item.details}');
              if (item.ratingValue != null) {
                buffer.writeln('  Rating: ${item.ratingValue}');
                if (item.ratingSource != null) buffer.writeln('  Source: ${item.ratingSource}');
              }
              if (item.isPublicRatingAvailable == false) {
                buffer.writeln('  Note: No public crash-test rating found');
              }
              if (item.severity != null) buffer.writeln('  Severity: ${item.severity}');
            }
            buffer.writeln();
          }
        }
      } catch (e) {
        buffer.writeln('Error loading car data: $e');
        buffer.writeln();
      }
    }

    // Search for relevant research chunks
    try {
      final chunks = await _repository.searchResearchChunks(
        userQuestion,
        carId: carId,
        variantId: variantId,
        limit: 5,
      );

      if (chunks.isNotEmpty) {
        buffer.writeln('--- RELEVANT RESEARCH ---');
        for (final chunk in chunks) {
          if (chunk.chunkTitle != null) {
            buffer.writeln('[${chunk.chunkTitle}]');
          }
          buffer.writeln(chunk.chunkText);
          buffer.writeln();
        }
      }
    } catch (e) {
      buffer.writeln('Note: Could not load additional research context.');
    }

    buffer.writeln('=== END OF CONTEXT ===');
    buffer.writeln();
    buffer.writeln('User Question: $userQuestion');
    buffer.writeln();
    buffer.writeln('Instructions: Answer the user\'s question using ONLY the data provided above. If the answer is not in the context, say "Not confirmed in database." Be precise with numbers and always cite whether data is official or from third-party tests.');

    return buffer.toString();
  }

  Future<String> buildSimpleContext(String userQuestion) async {
    // For general questions without a specific car, search across all research
    final buffer = StringBuffer();

    buffer.writeln('=== EXOTIC CAR KNOWLEDGE BASE CONTEXT ===');
    buffer.writeln('You are a knowledgeable exotic car assistant. Answer ONLY using the verified data provided below.');
    buffer.writeln('If information is not in this context, say "Not confirmed in database."');
    buffer.writeln('Never hallucinate specs, prices, lap times, or other data.');
    buffer.writeln();

    try {
      final chunks = await _repository.searchResearchChunks(
        userQuestion,
        limit: 8,
      );

      if (chunks.isNotEmpty) {
        buffer.writeln('--- RELEVANT RESEARCH ---');
        for (final chunk in chunks) {
          if (chunk.chunkTitle != null) {
            buffer.writeln('[${chunk.chunkTitle}]');
          }
          buffer.writeln(chunk.chunkText);
          buffer.writeln();
        }
      } else {
        buffer.writeln('No specific research chunks found for this question.');
        buffer.writeln();
      }
    } catch (e) {
      buffer.writeln('Note: Could not load research context.');
    }

    buffer.writeln('=== END OF CONTEXT ===');
    buffer.writeln();
    buffer.writeln('User Question: $userQuestion');
    buffer.writeln();
    buffer.writeln('Instructions: Answer the user\'s question using ONLY the data provided above. If the answer is not in the context, say "Not confirmed in database." Be precise with numbers and always cite whether data is official or from third-party tests.');

    return buffer.toString();
  }
}