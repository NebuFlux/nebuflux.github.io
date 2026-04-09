require('dotenv').config();
const mongoose = require('mongoose');
const Alert = require('./alert');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');

    const alerts = [
        { source: '192.168.1.105', source_port: 54321, destination: '10.0.0.1', destination_port: 80, category: 'DoS', reported: new Date('2026-04-01T08:15:00Z') },
        { source: '192.168.1.105', source_port: 54322, destination: '10.0.0.1', destination_port: 80, category: 'DoS', reported: new Date('2026-04-01T08:15:30Z') },
        { source: '172.16.0.50', source_port: 44100, destination: '10.0.0.5', destination_port: 443, category: 'DDoS', reported: new Date('2026-04-01T09:00:00Z') },
        { source: '172.16.0.51', source_port: 44101, destination: '10.0.0.5', destination_port: 443, category: 'DDoS', reported: new Date('2026-04-01T09:00:05Z') },
        { source: '172.16.0.52', source_port: 44102, destination: '10.0.0.5', destination_port: 443, category: 'DDoS', reported: new Date('2026-04-01T09:00:10Z') },
        { source: '10.10.10.99', source_port: 12345, destination: '10.0.0.2', destination_port: 22, category: 'Brute Force', reported: new Date('2026-04-02T14:30:00Z') },
        { source: '10.10.10.99', source_port: 12346, destination: '10.0.0.2', destination_port: 22, category: 'Brute Force', reported: new Date('2026-04-02T14:30:15Z') },
        { source: '10.10.10.99', source_port: 12347, destination: '10.0.0.2', destination_port: 22, category: 'Brute Force', reported: new Date('2026-04-02T14:30:30Z') },
        { source: '203.0.113.10', source_port: 60000, destination: '10.0.0.3', destination_port: 8080, category: 'Web Attack', reported: new Date('2026-04-02T16:45:00Z') },
        { source: '203.0.113.10', source_port: 60001, destination: '10.0.0.3', destination_port: 8080, category: 'Web Attack', reported: new Date('2026-04-02T16:45:20Z') },
        { source: '198.51.100.25', source_port: 33000, destination: '10.0.0.1', destination_port: 445, category: 'Port Scan', reported: new Date('2026-04-03T03:00:00Z') },
        { source: '198.51.100.25', source_port: 33001, destination: '10.0.0.1', destination_port: 3389, category: 'Port Scan', reported: new Date('2026-04-03T03:00:01Z') },
        { source: '198.51.100.25', source_port: 33002, destination: '10.0.0.1', destination_port: 21, category: 'Port Scan', reported: new Date('2026-04-03T03:00:02Z') },
        { source: '198.51.100.25', source_port: 33003, destination: '10.0.0.1', destination_port: 23, category: 'Port Scan', reported: new Date('2026-04-03T03:00:03Z') },
        { source: '192.168.2.200', source_port: 50505, destination: '10.0.0.4', destination_port: 6667, category: 'Bot', reported: new Date('2026-04-03T11:20:00Z') },
        { source: '192.168.2.201', source_port: 50506, destination: '10.0.0.4', destination_port: 6667, category: 'Bot', reported: new Date('2026-04-03T11:20:30Z') },
        { source: '10.0.0.77', source_port: 49999, destination: '10.0.0.6', destination_port: 4444, category: 'Infiltration', reported: new Date('2026-04-04T00:05:00Z') },
        { source: '203.0.113.50', source_port: 55555, destination: '10.0.0.7', destination_port: 443, category: 'Heartbleed', reported: new Date('2026-04-04T02:10:00Z') },
        { source: '192.168.1.10', source_port: 11111, destination: '10.0.0.1', destination_port: 80, category: 'DoS', reported: new Date('2026-04-04T18:00:00Z') },
        { source: '172.16.0.53', source_port: 44103, destination: '10.0.0.5', destination_port: 443, category: 'DDoS', reported: new Date('2026-04-05T06:30:00Z') },
    ];

    await Alert.insertMany(alerts);
    console.log(`Inserted ${alerts.length} alerts`);
    await mongoose.disconnect();
});
