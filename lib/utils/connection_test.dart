import 'package:flutter/material.dart';
import 'package:exotic_car_assistant/core/supabase_config.dart';

class ConnectionTestScreen extends StatefulWidget {
  const ConnectionTestScreen({super.key});

  @override
  State<ConnectionTestScreen> createState() => _ConnectionTestScreenState();
}

class _ConnectionTestScreenState extends State<ConnectionTestScreen> {
  String _status = 'Testing connection...';
  bool _isConnected = false;
  List<dynamic> _cars = [];

  @override
  void initState() {
    super.initState();
    _testConnection();
  }

  Future<void> _testConnection() async {
    setState(() => _status = 'Testing Supabase connection...');

    try {
      // Test 1: Check if Supabase is initialized
      if (!SupabaseConfig.isInitialized) {
        setState(() {
          _status = '❌ FAILED: Supabase not initialized';
        });
        return;
      }

      // Test 2: Try to query cars table
      final response = await SupabaseConfig.client
          .from('cars')
          .select()
          .limit(5);

      setState(() {
        _cars = response;
        _isConnected = true;
        _status = '✅ SUCCESS: Connected to Supabase!';
      });
    } catch (e) {
      setState(() {
        _status = '❌ ERROR: $e';
        _isConnected = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Connection Test'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Card
            Card(
              color: _isConnected ? Colors.green[50] : Colors.red[50],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Connection Status',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: _isConnected ? Colors.green[900] : Colors.red[900],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _status,
                      style: TextStyle(
                        fontSize: 14,
                        color: _isConnected ? Colors.green[800] : Colors.red[800],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Supabase Config Info
            const Text(
              'Configuration:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text('URL: ${SupabaseConfig.client.supabaseUrl}'),
            Text('Anon Key: ${SupabaseConfig.client.supabaseKey.substring(0, 20)}...'),

            const SizedBox(height: 24),

            // Test Results
            if (_isConnected) ...[
              const Text(
                'Test Results:',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text('✅ Supabase initialized'),
              Text('✅ Can query database'),
              Text('✅ Found ${_cars.length} cars in database'),
              
              const SizedBox(height: 16),
              
              const Text(
                'Cars in database:',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: ListView.builder(
                  itemCount: _cars.length,
                  itemBuilder: (context, index) {
                    final car = _cars[index];
                    return Card(
                      child: ListTile(
                        title: Text('${car['make']} ${car['model']}'),
                        subtitle: Text('Year: ${car['model_year']}'),
                        trailing: Text(car['current_status'] ?? 'Unknown'),
                      ),
                    );
                  },
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Retry Button
            if (!_isConnected)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _testConnection,
                  style: ElevatedButton(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Retry Connection Test'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}