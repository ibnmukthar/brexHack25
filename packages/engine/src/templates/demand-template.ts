import { WorkflowTemplate } from '../ai-providers/ai-provider-interface';

export const DEMAND_TEMPLATE: WorkflowTemplate = {
  id: 'demand-forecasting',
  name: 'Demand Forecasting & Planning',
  description: 'Forecast demand and optimize inventory planning based on historical data and trends',
  category: 'demand',
  
  parameters: [
    {
      name: 'product_categories',
      type: 'multi-select',
      label: 'Product Categories',
      options: ['electronics', 'clothing', 'home_goods', 'books', 'automotive'],
      required: true,
      default: ['electronics', 'clothing']
    },
    {
      name: 'forecast_horizon',
      type: 'select',
      label: 'Forecast Period',
      options: ['30_days', '90_days', '180_days', '365_days'],
      default: '90_days'
    },
    {
      name: 'include_seasonality',
      type: 'boolean',
      label: 'Include Seasonal Adjustments',
      default: true
    },
    {
      name: 'confidence_level',
      type: 'number',
      label: 'Confidence Level (%)',
      min: 80,
      max: 99,
      default: 95,
      ui_hint: 'slider'
    }
  ],
  
  steps: [
    {
      id: 'fetch-historical-data',
      type: 'mock-api-call',
      name: 'Collect Historical Sales Data',
      config: {
        mock_data_key: 'demand_forecast',
        params: {
          categories: '{{product_categories}}',
          period: 'last_2_years',
          granularity: 'daily'
        }
      },
      outputs: ['historical_data']
    },
    {
      id: 'prepare-forecast-data',
      type: 'data-processing',
      name: 'Prepare Data for Forecasting',
      config: {
        script: `
          const preparedData = {};
          
          product_categories.forEach(category => {
            const categoryData = historical_data[category];
            if (categoryData) {
              // Simulate data cleaning and preparation
              preparedData[category] = {
                data_points: Math.floor(Math.random() * 500) + 200,
                avg_daily_demand: categoryData.predicted_demand / 90, // Simulate daily average
                trend: categoryData.trend,
                seasonality_factor: include_seasonality ? categoryData.seasonality_factor : 1.0,
                confidence: categoryData.confidence_score,
                quality_score: Math.random() * 20 + 80 // 80-100%
              };
            }
          });
          
          return {
            prepared_categories: preparedData,
            total_categories: Object.keys(preparedData).length,
            data_quality_avg: Object.values(preparedData).reduce((sum, cat) => sum + cat.quality_score, 0) / Object.keys(preparedData).length
          };
        `,
        inputs: ['historical_data', 'product_categories', 'include_seasonality']
      },
      outputs: ['prepared_data']
    },
    {
      id: 'generate-forecasts',
      type: 'data-processing',
      name: 'Generate Demand Forecasts',
      config: {
        script: `
          const forecasts = {};
          const horizonDays = {
            '30_days': 30,
            '90_days': 90,
            '180_days': 180,
            '365_days': 365
          };
          
          const days = horizonDays[forecast_horizon] || 90;
          
          Object.entries(prepared_data.prepared_categories).forEach(([category, data]) => {
            const baseDemand = data.avg_daily_demand * days;
            const seasonalAdjustment = include_seasonality ? data.seasonality_factor : 1.0;
            const trendMultiplier = data.trend === 'increasing' ? 1.1 : data.trend === 'decreasing' ? 0.9 : 1.0;
            
            const predictedDemand = Math.round(baseDemand * seasonalAdjustment * trendMultiplier);
            const confidenceScore = Math.min(data.confidence * (confidence_level / 100), 0.99);
            
            forecasts[category] = {
              category: category,
              predicted_demand: predictedDemand,
              confidence_score: confidenceScore,
              forecast_horizon: forecast_horizon,
              trend: data.trend,
              seasonality_applied: include_seasonality,
              daily_average: Math.round(predictedDemand / days),
              variance_range: {
                low: Math.round(predictedDemand * 0.85),
                high: Math.round(predictedDemand * 1.15)
              }
            };
          });
          
          return {
            forecasts: forecasts,
            forecast_summary: {
              total_categories: Object.keys(forecasts).length,
              avg_confidence: Object.values(forecasts).reduce((sum, f) => sum + f.confidence_score, 0) / Object.keys(forecasts).length,
              total_predicted_demand: Object.values(forecasts).reduce((sum, f) => sum + f.predicted_demand, 0)
            }
          };
        `,
        inputs: ['prepared_data', 'forecast_horizon', 'include_seasonality', 'confidence_level']
      },
      outputs: ['forecast_results']
    },
    {
      id: 'validate-forecasts',
      type: 'data-processing',
      name: 'Validate Forecast Results',
      config: {
        script: `
          const validation = {
            quality_checks: [],
            warnings: [],
            recommendations: []
          };
          
          Object.entries(forecast_results.forecasts).forEach(([category, forecast]) => {
            // Quality checks
            if (forecast.confidence_score < 0.7) {
              validation.warnings.push(\`Low confidence for \${category}: \${(forecast.confidence_score * 100).toFixed(1)}%\`);
            }
            
            if (forecast.predicted_demand <= 0) {
              validation.warnings.push(\`Invalid demand prediction for \${category}\`);
            }
            
            // Recommendations
            if (forecast.trend === 'increasing') {
              validation.recommendations.push(\`Consider increasing inventory for \${category} due to upward trend\`);
            } else if (forecast.trend === 'decreasing') {
              validation.recommendations.push(\`Review inventory levels for \${category} due to declining demand\`);
            }
          });
          
          const overallQuality = validation.warnings.length === 0 ? 'high' : 
                               validation.warnings.length <= 2 ? 'medium' : 'low';
          
          return {
            validation_results: validation,
            overall_quality: overallQuality,
            forecast_reliability: forecast_results.forecast_summary.avg_confidence > 0.8 ? 'reliable' : 'moderate'
          };
        `,
        inputs: ['forecast_results']
      },
      outputs: ['validation_results']
    },
    {
      id: 'generate-inventory-recommendations',
      type: 'data-processing',
      name: 'Generate Inventory Recommendations',
      config: {
        script: `
          const recommendations = [];
          
          Object.entries(forecast_results.forecasts).forEach(([category, forecast]) => {
            const currentStock = Math.floor(Math.random() * 1000) + 100; // Simulate current stock
            const safetyStock = Math.round(forecast.predicted_demand * 0.2); // 20% safety stock
            const recommendedStock = forecast.predicted_demand + safetyStock;
            const orderQuantity = Math.max(0, recommendedStock - currentStock);
            
            recommendations.push({
              category: category,
              current_stock: currentStock,
              predicted_demand: forecast.predicted_demand,
              safety_stock: safetyStock,
              recommended_stock_level: recommendedStock,
              order_quantity: orderQuantity,
              confidence: forecast.confidence_score,
              priority: orderQuantity > forecast.predicted_demand * 0.5 ? 'high' : 
                       orderQuantity > 0 ? 'medium' : 'low',
              estimated_cost: orderQuantity * (Math.random() * 50 + 10), // Simulate unit cost
              stockout_risk: currentStock < forecast.daily_average * 7 ? 'high' : 'low'
            });
          });
          
          const totalOrderValue = recommendations.reduce((sum, rec) => sum + rec.estimated_cost, 0);
          const highPriorityItems = recommendations.filter(rec => rec.priority === 'high').length;
          
          return {
            recommendations: recommendations,
            summary: {
              total_categories: recommendations.length,
              high_priority_orders: highPriorityItems,
              total_order_value: Math.round(totalOrderValue),
              categories_needing_restock: recommendations.filter(rec => rec.order_quantity > 0).length
            }
          };
        `,
        inputs: ['forecast_results']
      },
      outputs: ['inventory_recommendations']
    },
    {
      id: 'send-forecast-notifications',
      type: 'notification',
      name: 'Send Forecast Notifications',
      config: {
        channels: [
          {
            type: 'email',
            to: 'planning@company.com',
            template: 'demand-forecast',
            data: {
              forecast_period: '{{forecast_horizon}}',
              categories_analyzed: '{{forecast_results.forecast_summary.total_categories}}',
              avg_confidence: '{{forecast_results.forecast_summary.avg_confidence}}',
              high_priority_orders: '{{inventory_recommendations.summary.high_priority_orders}}',
              total_order_value: '{{inventory_recommendations.summary.total_order_value}}'
            }
          }
        ]
      }
    },
    {
      id: 'generate-final-report',
      type: 'data-processing',
      name: 'Generate Demand Planning Report',
      config: {
        script: `
          return {
            executive_summary: {
              forecast_period: forecast_horizon,
              categories_analyzed: forecast_results.forecast_summary.total_categories,
              total_predicted_demand: forecast_results.forecast_summary.total_predicted_demand,
              average_confidence: Math.round(forecast_results.forecast_summary.avg_confidence * 100),
              forecast_quality: validation_results.overall_quality,
              inventory_investment_needed: inventory_recommendations.summary.total_order_value
            },
            detailed_forecasts: forecast_results.forecasts,
            inventory_recommendations: inventory_recommendations.recommendations,
            validation_summary: validation_results.validation_results,
            generated_at: new Date().toISOString(),
            parameters_used: {
              categories: product_categories,
              horizon: forecast_horizon,
              seasonality: include_seasonality,
              confidence_level: confidence_level
            }
          };
        `,
        inputs: ['forecast_horizon', 'forecast_results', 'validation_results', 'inventory_recommendations', 'product_categories', 'include_seasonality', 'confidence_level']
      },
      outputs: ['final_report']
    }
  ],
  
  integrations: [
    { name: 'sales_analytics_api', type: 'rest', required: true },
    { name: 'inventory_api', type: 'rest', required: true },
    { name: 'ml_forecasting_service', type: 'rest', required: false },
    { name: 'email_service', type: 'smtp', required: false }
  ],
  
  output_schema: {
    success: 'boolean',
    categories_forecasted: 'number',
    total_predicted_demand: 'number',
    average_confidence: 'number',
    recommendations_generated: 'number',
    total_investment_needed: 'number',
    execution_time: 'string'
  }
};
