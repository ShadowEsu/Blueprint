import 'package:flutter/material.dart';
import 'package:exotic_car_assistant/models/car.dart';
import 'package:exotic_car_assistant/repositories/car_repository.dart';

class CompareScreen extends StatefulWidget {
  const CompareScreen({super.key});

  @override
  State<CompareScreen> createState() => _CompareScreenState();
}

class _CompareScreenState extends State<CompareScreen> {
  final CarRepository _repository = CarRepository();
  List<Car> _cars = [];
  Car? _car1;
  Car? _car2;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCars();
  }

  Future<void> _loadCars() async {
    setState(() => _isLoading = true);
    try {
      final cars = await _repository.getAllCars();
      setState(() {
        _cars = cars;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Compare Cars'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _cars.isEmpty
              ? const Center(child: Text('No cars available to compare'))
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      // Car Selection
                      Row(
                        children: [
                          Expanded(child: _buildCarSelector(1)),
                          const SizedBox(width: 16),
                          Expanded(child: _buildCarSelector(2)),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Comparison Results
                      if (_car1 != null && _car2 != null)
                        Expanded(
                          child: _buildComparisonView(),
                        ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildCarSelector(int carNumber) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Car $carNumber',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<Car>(
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          value: carNumber == 1 ? _car1 : _car2,
          hint: const Text('Select a car'),
          items: _cars.map((car) {
            return DropdownMenuItem<Car>(
              value: car,
              child: Text(car.displayName),
            );
          }).toList(),
          onChanged: (car) {
            setState(() {
              if (carNumber == 1) {
                _car1 = car;
              } else {
                _car2 = car;
              }
            });
          },
        ),
      ],
    );
  }

  Widget _buildComparisonView() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Comparison',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Divider(),
            _buildComparisonRow('Make', _car1!.make, _car2!.make),
            _buildComparisonRow('Model', _car1!.model, _car2!.model),
            if (_car1!.modelYear != null || _car2!.modelYear != null)
              _buildComparisonRow(
                'Model Year',
                _car1!.modelYear?.toString() ?? 'N/A',
                _car2!.modelYear?.toString() ?? 'N/A',
              ),
            if (_car1!.productionCount != null || _car2!.productionCount != null)
              _buildComparisonRow(
                'Production Count',
                _car1!.productionCount?.toString() ?? 'N/A',
                _car2!.productionCount?.toString() ?? 'N/A',
              ),
            const Divider(),
            const Text(
              'Note: Detailed specs, performance, and pricing comparison requires loading full car data.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildComparisonRow(String label, String value1, String value2) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
          ),
          Expanded(
            child: Text(
              value1,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            child: Text(
              value2,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}