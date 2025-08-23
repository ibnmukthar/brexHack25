"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockIntegrations = void 0;
class MockIntegrations {
    async queryERP(query) {
        await this.delay(500);
        const mockData = {
            inventory_status: {
                warehouses: [
                    {
                        id: 'WH001',
                        location: 'Chicago, IL',
                        items: [
                            { sku: 'SKU001', name: 'Widget A', current_stock: 45, reorder_level: 50, status: 'reorder_needed' },
                            { sku: 'SKU002', name: 'Widget B', current_stock: 120, reorder_level: 25, status: 'sufficient' },
                            { sku: 'SKU003', name: 'Gadget C', current_stock: 8, reorder_level: 20, status: 'critical_low' }
                        ]
                    },
                    {
                        id: 'WH002',
                        location: 'Los Angeles, CA',
                        items: [
                            { sku: 'SKU001', name: 'Widget A', current_stock: 75, reorder_level: 50, status: 'sufficient' },
                            { sku: 'SKU004', name: 'Tool D', current_stock: 15, reorder_level: 30, status: 'reorder_needed' }
                        ]
                    }
                ],
                total_items_below_threshold: 3,
                total_reorder_value: 15420.50
            },
            shipments: [
                {
                    id: 'SH001',
                    status: 'pending',
                    origin: 'Chicago, IL',
                    destination: 'New York, NY',
                    items: 25,
                    weight: '450 lbs',
                    created_date: '2024-01-12T08:00:00Z'
                },
                {
                    id: 'SH002',
                    status: 'in_transit',
                    origin: 'Los Angeles, CA',
                    destination: 'Phoenix, AZ',
                    items: 12,
                    weight: '180 lbs',
                    created_date: '2024-01-11T14:30:00Z'
                }
            ]
        };
        return mockData[query] || { message: `No mock data available for query: ${query}` };
    }
    async trackCarrier(carrier, trackingNumber) {
        await this.delay(300);
        const mockStatuses = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
        const currentStatusIndex = Math.floor(Math.random() * mockStatuses.length);
        const currentStatus = mockStatuses[currentStatusIndex];
        const mockLocations = [
            'Chicago, IL', 'Indianapolis, IN', 'Columbus, OH', 'Pittsburgh, PA', 'New York, NY'
        ];
        const events = [];
        const baseTime = new Date('2024-01-13T10:00:00Z').getTime();
        for (let i = 0; i <= currentStatusIndex; i++) {
            events.push({
                time: new Date(baseTime + (i * 6 * 60 * 60 * 1000)).toISOString(),
                description: this.getStatusDescription(mockStatuses[i]),
                location: mockLocations[i] || 'In Transit'
            });
        }
        return {
            trackingNumber,
            carrier: carrier.toUpperCase(),
            status: currentStatus,
            currentLocation: mockLocations[currentStatusIndex] || 'In Transit',
            estimatedDelivery: new Date(baseTime + (5 * 24 * 60 * 60 * 1000)).toISOString(),
            progress: Math.round((currentStatusIndex + 1) / mockStatuses.length * 100),
            events: events.reverse(),
            serviceType: 'Ground',
            weight: '2.5 lbs',
            dimensions: '12x8x4 inches'
        };
    }
    async optimizeRoute(locations) {
        await this.delay(800);
        const shuffled = [...locations].sort(() => Math.random() - 0.5);
        const distance = Math.floor(Math.random() * 300) + 50;
        const estimatedTime = Math.floor(distance / 35 * 60); // Assuming 35 mph average
        const fuelCost = Math.round(distance * 0.15 * 3.50); // $3.50/gal, 15mpg
        const driverCost = Math.round(estimatedTime / 60 * 25); // $25/hour
        const totalCost = fuelCost + driverCost;
        return {
            optimizedRoute: shuffled,
            routeDetails: {
                totalDistance: `${distance} miles`,
                estimatedTime: `${Math.floor(estimatedTime / 60)}h ${estimatedTime % 60}m`,
                totalCost: `$${totalCost}`,
                costBreakdown: {
                    fuel: `$${fuelCost}`,
                    driver: `$${driverCost}`,
                    vehicle: '$15'
                },
                savings: {
                    distanceReduction: `${Math.floor(Math.random() * 50) + 10} miles`,
                    timeReduction: `${Math.floor(Math.random() * 60) + 15} minutes`,
                    costSavings: `$${Math.floor(Math.random() * 40) + 10}`
                }
            },
            waypoints: shuffled.map((location, index) => ({
                stop: index + 1,
                location,
                estimatedArrival: new Date(Date.now() + (index + 1) * 45 * 60 * 1000).toISOString(),
                packages: Math.floor(Math.random() * 5) + 1,
                serviceTime: '15 minutes'
            })),
            confidence: 0.94,
            alternatives: [
                {
                    name: 'Fastest Route',
                    timeSaving: '25 minutes',
                    costIncrease: '$12'
                },
                {
                    name: 'Most Economical',
                    costSaving: '$18',
                    timeIncrease: '35 minutes'
                }
            ]
        };
    }
    async getCarrierRates(shipmentDetails) {
        await this.delay(600);
        const carriers = [
            {
                name: 'FedEx',
                services: [
                    { name: 'Ground', cost: 12.45, deliveryDays: 3, reliability: 0.96 },
                    { name: 'Express', cost: 24.80, deliveryDays: 1, reliability: 0.98 },
                    { name: '2Day', cost: 18.30, deliveryDays: 2, reliability: 0.97 }
                ]
            },
            {
                name: 'UPS',
                services: [
                    { name: 'Ground', cost: 11.80, deliveryDays: 3, reliability: 0.95 },
                    { name: 'Next Day', cost: 26.10, deliveryDays: 1, reliability: 0.97 },
                    { name: '2nd Day', cost: 17.95, deliveryDays: 2, reliability: 0.96 }
                ]
            },
            {
                name: 'DHL',
                services: [
                    { name: 'Express', cost: 28.50, deliveryDays: 1, reliability: 0.94 },
                    { name: 'Standard', cost: 19.75, deliveryDays: 2, reliability: 0.93 }
                ]
            },
            {
                name: 'USPS',
                services: [
                    { name: 'Ground', cost: 9.95, deliveryDays: 4, reliability: 0.89 },
                    { name: 'Priority', cost: 15.20, deliveryDays: 2, reliability: 0.91 }
                ]
            }
        ];
        return {
            shipmentId: `QUOTE_${Date.now()}`,
            requestedDate: new Date().toISOString(),
            origin: shipmentDetails.origin || 'Chicago, IL',
            destination: shipmentDetails.destination || 'New York, NY',
            weight: shipmentDetails.weight || '5 lbs',
            dimensions: shipmentDetails.dimensions || '12x8x6 inches',
            carriers: carriers.map(carrier => ({
                ...carrier,
                services: carrier.services.map(service => ({
                    ...service,
                    estimatedDelivery: new Date(Date.now() + service.deliveryDays * 24 * 60 * 60 * 1000).toISOString(),
                    features: ['tracking', 'insurance', 'signature_required'].slice(0, Math.floor(Math.random() * 3) + 1)
                }))
            }))
        };
    }
    async processReturn(returnRequest) {
        await this.delay(400);
        const rmaNumber = `RMA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        return {
            rmaNumber,
            status: 'approved',
            returnInstructions: {
                steps: [
                    'Package item securely in original packaging',
                    'Print and attach the provided return label',
                    'Drop off at any UPS location or schedule pickup',
                    'Track return progress with RMA number'
                ],
                returnLabel: {
                    trackingNumber: `1Z${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
                    carrier: 'UPS',
                    serviceType: 'Ground'
                },
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            },
            refundDetails: {
                amount: returnRequest.refundAmount || 89.99,
                method: 'original_payment_method',
                processingTime: '3-5 business days after item received'
            },
            inspectionCriteria: [
                'Item must be in original condition',
                'All accessories and packaging included',
                'No signs of wear or damage beyond normal use'
            ]
        };
    }
    getStatusDescription(status) {
        const descriptions = {
            picked_up: 'Package picked up from sender',
            in_transit: 'Package in transit to destination',
            out_for_delivery: 'Out for delivery',
            delivered: 'Package delivered'
        };
        return descriptions[status] || 'Status update';
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.MockIntegrations = MockIntegrations;
