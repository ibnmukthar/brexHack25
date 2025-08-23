export declare class MockIntegrations {
    queryERP(query: string): Promise<any>;
    trackCarrier(carrier: string, trackingNumber: string): Promise<{
        trackingNumber: string;
        carrier: string;
        status: string;
        currentLocation: string;
        estimatedDelivery: string;
        progress: number;
        events: {
            time: string;
            description: string;
            location: string;
        }[];
        serviceType: string;
        weight: string;
        dimensions: string;
    }>;
    optimizeRoute(locations: string[]): Promise<{
        optimizedRoute: string[];
        routeDetails: {
            totalDistance: string;
            estimatedTime: string;
            totalCost: string;
            costBreakdown: {
                fuel: string;
                driver: string;
                vehicle: string;
            };
            savings: {
                distanceReduction: string;
                timeReduction: string;
                costSavings: string;
            };
        };
        waypoints: {
            stop: number;
            location: string;
            estimatedArrival: string;
            packages: number;
            serviceTime: string;
        }[];
        confidence: number;
        alternatives: ({
            name: string;
            timeSaving: string;
            costIncrease: string;
            costSaving?: undefined;
            timeIncrease?: undefined;
        } | {
            name: string;
            costSaving: string;
            timeIncrease: string;
            timeSaving?: undefined;
            costIncrease?: undefined;
        })[];
    }>;
    getCarrierRates(shipmentDetails: any): Promise<{
        shipmentId: string;
        requestedDate: string;
        origin: any;
        destination: any;
        weight: any;
        dimensions: any;
        carriers: {
            services: {
                estimatedDelivery: string;
                features: string[];
                name: string;
                cost: number;
                deliveryDays: number;
                reliability: number;
            }[];
            name: string;
        }[];
    }>;
    processReturn(returnRequest: any): Promise<{
        rmaNumber: string;
        status: string;
        returnInstructions: {
            steps: string[];
            returnLabel: {
                trackingNumber: string;
                carrier: string;
                serviceType: string;
            };
            deadline: string;
        };
        refundDetails: {
            amount: any;
            method: string;
            processingTime: string;
        };
        inspectionCriteria: string[];
    }>;
    private getStatusDescription;
    private delay;
}
