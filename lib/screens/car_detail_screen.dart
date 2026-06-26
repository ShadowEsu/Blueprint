import 'package:flutter/material.dart';
import 'package:exotic_car_assistant/models/car.dart';
import 'package:exotic_car_assistant/models/car_variant.dart';
import 'package:exotic_car_assistant/models/car_spec.dart';
import 'package:exotic_car_assistant/models/performance_test.dart';
import 'package:exotic_car_assistant/models/track_record.dart';
import 'package:exotic_car_assistant/models/pricing_market.dart';
import 'package:exotic_car_assistant/models/ownership_safety.dart';
import 'package:exotic_car_assistant/repositories/car_repository.dart';

class CarDetailScreen extends StatefulWidget {
  final String carId;

  const CarDetailScreen({super.key, required this.carId});

  @override
  State<CarDetailScreen> createState() => _CarDetailScreenState();
}

class _CarDetailScreenState extends State<CarDetailScreen> {
  final CarRepository _repository = CarRepository();
  Car? _car;
  List<CarVariant> _variants = [];
  CarVariant? _primaryVariant;
  CarSpec? _specs;
  List<PerformanceTest> _performance = [];
  List<TrackRecord> _trackRecords = [];
  List<PricingMarket> _pricing = [];
  List<OwnershipSafety> _ownershipSafety = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCarDetails();
  }

  Future<void> _loadCarDetails() async {
    setState(() => _isLoading = true);
    try {
      final car = await _repository.getCarById(widget.carId);
      if (car == null) {
        setState(() => _isLoading = false);
        return;
      }

      final variants = await _repository.getVariantsForCar(widget.carId);
      final primaryVariant = variants.firstWhere(
        (v) => v.isPrimaryVariant,
        orElse: () => variants.first,
      );

      final specs = await _repository.getSpecsForVariant(primaryVariant.id);
      final performance = await _repository.getPerformanceTests(primaryVariant.id);
      final trackRecords = await _repository.getTrackRecords(primaryVariant.id);
      final pricing = await _repository.getPricing(primaryVariant.id);
      final ownershipSafety = await _repository.getOwnershipSafety(primaryVariant.id);

      setState(() {
        _car = car;
        _variants = variants;
        _primaryVariant = primaryVariant;
        _specs = specs;
        _performance = performance;
        _trackRecords = trackRecords;
        _pricing = pricing;
        _ownershipSafety = ownershipSafety;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load car details: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_car?.displayName ?? 'Car Details'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _car == null
              ? const Center(child: Text('Car not found'))
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Hero Section
                      _buildHeroSection(),

                      // Key Specs
                      if (_specs != null) _buildSpecsSection(),

                      // Performance
                      if (_performance.isNotEmpty) _buildPerformanceSection(),

                      // Track Records
                      if (_trackRecords.isNotEmpty) _buildTrackRecordsSection(),

                      // Pricing
                      if (_pricing.isNotEmpty) _buildPricingSection(),

                      // Ownership & Safety
                      if (_ownershipSafety.isNotEmpty) _buildOwnershipSafetySection(),

                      // Variants
                      if (_variants.length > 1) _buildVariantsSection(),

                      const SizedBox(height: 32),
                    ],
                  ),
                ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24.0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.grey[900]!, Colors.grey[700]!],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _car!.displayName,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          if (_car!.currentStatus != null)
            Text(
              _car!.currentStatus!,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[300],
              ),
            ),
          if (_car!.productionCount != null) ...[
            const SizedBox(height: 4),
            Text(
              '${_car!.productionCount} units produced',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[400],
              ),
            ),
          ],
          if (_car!.summary != null) ...[
            const SizedBox(height: 16),
            Text(
              _car!.summary!,
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey[200],
                height: 1.5,
              ),
            ),
          ],
          if (_car!.caveats != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber, color: Colors.orange),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _car!.caveats!,
                      style: const TextStyle(color: Colors.orange, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSpecsSection() {
    return ExpansionTile(
      title: const Text(
        'Key Specifications',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
      leading: const Icon(Icons.settings),
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_specs!.engine != null)
                _buildSpecRow('Engine', _specs!.engine!),
              if (_specs!.displacementLiters != null)
                _buildSpecRow('Displacement', '${_specs!.displacementLiters}L'),
              if (_specs!.aspiration != null)
                _buildSpecRow('Aspiration', _specs!.aspiration!),
              if (_specs!.hybridSystem != null)
                _buildSpecRow('Hybrid System', _specs!.hybridSystem!),
              if (_specs!.horsepowerHp != null)
                _buildSpecRow('Horsepower', '${_specs!.horsepowerHp} hp'),
              if (_specs!.torqueLbFt != null)
                _buildSpecRow('Torque', '${_specs!.torqueLbFt} lb-ft'),
              if (_specs!.weightKg != null)
                _buildSpecRow('Weight', '${_specs!.weightKg} kg'),
              if (_specs!.lengthIn != null)
                _buildSpecRow('Length', '${_specs!.lengthIn} in'),
              if (_specs!.widthIn != null)
                _buildSpecRow('Width', '${_specs!.widthIn} in'),
              if (_specs!.heightIn != null)
                _buildSpecRow('Height', '${_specs!.heightIn} in'),
              if (_specs!.wheelbaseIn != null)
                _buildSpecRow('Wheelbase', '${_specs!.wheelbaseIn} in'),
              if (_specs!.tireFront != null)
                _buildSpecRow('Tires (Front)', _specs!.tireFront!),
              if (_specs!.tireRear != null)
                _buildSpecRow('Tires (Rear)', _specs!.tireRear!),
              if (_specs!.brakeFront != null)
                _buildSpecRow('Brakes (Front)', _specs!.brakeFront!),
              if (_specs!.brakeRear != null)
                _buildSpecRow('Brakes (Rear)', _specs!.brakeRear!),
              if (_specs!.suspension != null)
                _buildSpecRow('Suspension', _specs!.suspension!),
              if (_specs!.notes != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    'Notes: ${_specs!.notes}',
                    style: TextStyle(fontSize: 13, color: Colors.grey[600], fontStyle: FontStyle.italic),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSpecRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceSection() {
    return ExpansionTile(
      title: const Text(
        'Performance',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
      leading: const Icon(Icons.speed),
      children: [
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          itemCount: _performance.length,
          itemBuilder: (context, index) {
            final perf = _performance[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12.0),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          perf.testType,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getSourceTypeColor(perf.sourceType),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            perf.sourceTypeLabel,
                            style: const TextStyle(fontSize: 12, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                    if (perf.sourceName != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Source: ${perf.sourceName}',
                        style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                      ),
                    ],
                    const SizedBox(height: 12),
                    if (perf.zeroTo60MphSec != null)
                      _buildPerfRow('0-60 mph', '${perf.zeroTo60MphSec}s'),
                    if (perf.zeroTo100KmhSec != null)
                      _buildPerfRow('0-100 km/h', '${perf.zeroTo100KmhSec}s'),
                    if (perf.quarterMileSec != null)
                      _buildPerfRow('Quarter Mile', '${perf.quarterMileSec}s @ ${perf.quarterMileMph} mph'),
                    if (perf.topSpeedMph != null)
                      _buildPerfRow('Top Speed', '${perf.topSpeedMph} mph'),
                    if (perf.braking600Ft != null)
                      _buildPerfRow('60-0 mph Braking', '${perf.braking600Ft} ft'),
                    if (perf.lateralG != null)
                      _buildPerfRow('Lateral G', '${perf.lateralG}'),
                    if (perf.notes != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          perf.notes!,
                          style: TextStyle(fontSize: 12, color: Colors.grey[600], fontStyle: FontStyle.italic),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildPerfRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14)),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Color _getSourceTypeColor(String sourceType) {
    switch (sourceType) {
      case 'official':
        return Colors.green;
      case 'third_party':
        return Colors.blue;
      case 'estimated':
        return Colors.orange;
      case 'unverified':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildTrackRecordsSection() {
    return ExpansionTile(
      title: const Text(
        'Track Records',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
      leading: const Icon(Icons.flag),
      children: [
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          itemCount: _trackRecords.length,
          itemBuilder: (context, index) {
            final record = _trackRecords[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 8.0),
              child: ListTile(
                title: Text(record.trackName),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (record.lapTime != null)
                      Text('Lap Time: ${record.lapTime}'),
                    if (record.driver != null) Text('Driver: ${record.driver}'),
                    if (record.tire != null) Text('Tires: ${record.tire}'),
                  ],
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.purple,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    record.recordTypeLabel,
                    style: const TextStyle(fontSize: 12, color: Colors.white),
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildPricingSection() {
    return ExpansionTile(
      title: const Text(
        'Pricing & Market Value',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
      leading: const Icon(Icons.attach_money),
      children: [
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          itemCount: _pricing.length,
          itemBuilder: (context, index) {
            final price = _pricing[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 8.0),
              child: ListTile(
                title: Text(
                  price.priceTypeLabel,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      price.formattedAmount,
                      style: const TextStyle(fontSize: 16, color: Colors.green),
                    ),
                    if (price.dateObserved != null)
                      Text('As of ${price.dateObserved}'),
                    if (price.context != null) Text(price.context!),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildOwnershipSafetySection() {
    return ExpansionTile(
      title: const Text(
        'Ownership, Safety & Caveats',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
      leading: const Icon(Icons.health_and_safety),
      children: [
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          itemCount: _ownershipSafety.length,
          itemBuilder: (context, index) {
            final item = _ownershipSafety[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 8.0),
              child: ListTile(
                title: Text(
                  item.title,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.categoryLabel),
                    if (item.details != null) Text(item.details!),
                    if (item.ratingValue != null)
                      Text('Rating: ${item.ratingValue}'),
                    if (item.isPublicRatingAvailable == false)
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'No public crash-test rating found',
                          style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildVariantsSection() {
    return ExpansionTile(
      title: const Text(
        'Variants',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
      leading: const Icon(Icons.list),
      children: [
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          itemCount: _variants.length,
          itemBuilder: (context, index) {
            final variant = _variants[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 8.0),
              child: ListTile(
                title: Text(
                  variant.variantName,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (variant.bodyStyle != null) Text('Body Style: ${variant.bodyStyle}'),
                    if (variant.drivetrain != null) Text('Drivetrain: ${variant.drivetrain}'),
                    if (variant.transmission != null) Text('Transmission: ${variant.transmission}'),
                    if (variant.seats != null) Text('Seats: ${variant.seats}'),
                  ],
                ),
                trailing: variant.isPrimaryVariant
                    ? const Icon(Icons.star, color: Colors.amber)
                    : null,
              ),
            );
          },
        ),
      ],
    );
  }
}