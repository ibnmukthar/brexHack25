import { WorkflowTemplate } from '../ai-providers/ai-provider-interface';

export const SUPPLIER_TEMPLATE: WorkflowTemplate = {
  id: 'supplier-evaluation',
  name: 'Supplier Performance Evaluation',
  description: 'Evaluate supplier performance and manage relationships based on key metrics',
  category: 'supplier',
  
  parameters: [
    {
      name: 'supplier_ids',
      type: 'multi-select',
      label: 'Suppliers to Evaluate',
      options: ['SUP001', 'SUP002', 'SUP003', 'SUP004'],
      required: true,
      default: ['SUP001', 'SUP002']
    },
    {
      name: 'evaluation_period',
      type: 'select',
      label: 'Evaluation Period',
      options: ['last_30_days', 'last_90_days', 'last_year'],
      default: 'last_90_days'
    },
    {
      name: 'performance_metrics',
      type: 'multi-select',
      label: 'Metrics to Evaluate',
      options: ['delivery_time', 'quality_score', 'cost_competitiveness', 'communication'],
      default: ['delivery_time', 'quality_score']
    },
    {
      name: 'minimum_score_threshold',
      type: 'number',
      label: 'Minimum Acceptable Score',
      min: 1,
      max: 10,
      default: 7,
      ui_hint: 'slider'
    }
  ],
  
  steps: [
    {
      id: 'fetch-supplier-performance',
      type: 'mock-api-call',
      name: 'Fetch Supplier Performance Data',
      config: {
        mock_data_key: 'supplier_performance',
        params: { 
          supplier_ids: '{{supplier_ids}}',
          period: '{{evaluation_period}}',
          metrics: '{{performance_metrics}}'
        }
      },
      outputs: ['supplier_data']
    },
    {
      id: 'calculate-performance-scores',
      type: 'data-processing',
      name: 'Calculate Performance Scores',
      config: {
        script: `
          const evaluations = [];
          
          supplier_ids.forEach(supplierId => {
            const data = supplier_data[supplierId];
            if (!data) return;
            
            let totalScore = 0;
            let metricCount = 0;
            
            performance_metrics.forEach(metric => {
              if (data[metric + '_score']) {
                totalScore += data[metric + '_score'];
                metricCount++;
              }
            });
            
            const averageScore = metricCount > 0 ? totalScore / metricCount : 0;
            
            evaluations.push({
              supplier_id: supplierId,
              supplier_name: data.supplier_name,
              individual_scores: performance_metrics.reduce((acc, metric) => {
                acc[metric] = data[metric + '_score'] || 0;
                return acc;
              }, {}),
              overall_score: averageScore,
              meets_threshold: averageScore >= minimum_score_threshold,
              order_count: data.order_count || 0,
              evaluation_period: evaluation_period
            });
          });
          
          return {
            evaluations: evaluations,
            total_suppliers: evaluations.length,
            passing_suppliers: evaluations.filter(e => e.meets_threshold).length
          };
        `,
        inputs: ['supplier_ids', 'supplier_data', 'performance_metrics', 'minimum_score_threshold', 'evaluation_period']
      },
      outputs: ['performance_evaluations']
    },
    {
      id: 'identify-underperformers',
      type: 'data-processing',
      name: 'Identify Underperforming Suppliers',
      config: {
        script: `
          const underperformers = performance_evaluations.evaluations.filter(eval => 
            !eval.meets_threshold
          );
          
          const actionItems = underperformers.map(supplier => ({
            supplier_id: supplier.supplier_id,
            supplier_name: supplier.supplier_name,
            current_score: supplier.overall_score,
            required_score: minimum_score_threshold,
            improvement_needed: minimum_score_threshold - supplier.overall_score,
            weak_areas: Object.entries(supplier.individual_scores)
              .filter(([metric, score]) => score < minimum_score_threshold)
              .map(([metric, score]) => ({ metric, score })),
            recommended_actions: generateRecommendations(supplier)
          }));
          
          function generateRecommendations(supplier) {
            const recommendations = [];
            Object.entries(supplier.individual_scores).forEach(([metric, score]) => {
              if (score < minimum_score_threshold) {
                switch(metric) {
                  case 'delivery_time':
                    recommendations.push('Schedule delivery performance review meeting');
                    break;
                  case 'quality_score':
                    recommendations.push('Implement quality improvement plan');
                    break;
                  case 'cost_competitiveness':
                    recommendations.push('Negotiate better pricing terms');
                    break;
                  case 'communication':
                    recommendations.push('Establish regular communication protocols');
                    break;
                }
              }
            });
            return recommendations;
          }
          
          return {
            underperformers: underperformers,
            action_items: actionItems,
            requires_action: underperformers.length > 0
          };
        `,
        inputs: ['performance_evaluations', 'minimum_score_threshold']
      },
      outputs: ['underperformer_analysis']
    },
    {
      id: 'check-action-required',
      type: 'conditional',
      name: 'Check if Action Required',
      config: {
        condition: 'underperformer_analysis.requires_action === true',
        branches: {
          true: 'generate-improvement-plans',
          false: 'generate-performance-report'
        }
      }
    },
    {
      id: 'generate-improvement-plans',
      type: 'data-processing',
      name: 'Generate Supplier Improvement Plans',
      config: {
        script: `
          const improvementPlans = underperformer_analysis.action_items.map(item => ({
            supplier_id: item.supplier_id,
            supplier_name: item.supplier_name,
            current_performance: item.current_score,
            target_performance: minimum_score_threshold,
            improvement_areas: item.weak_areas,
            action_plan: item.recommended_actions,
            review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            priority: item.improvement_needed > 2 ? 'high' : 'medium'
          }));
          
          return {
            improvement_plans: improvementPlans,
            total_plans: improvementPlans.length,
            high_priority_count: improvementPlans.filter(p => p.priority === 'high').length
          };
        `,
        inputs: ['underperformer_analysis', 'minimum_score_threshold']
      },
      outputs: ['improvement_plans']
    },
    {
      id: 'send-supplier-notifications',
      type: 'notification',
      name: 'Send Supplier Performance Notifications',
      config: {
        channels: [
          {
            type: 'email',
            to: 'procurement@company.com',
            template: 'supplier-performance',
            data: {
              total_suppliers: '{{performance_evaluations.total_suppliers}}',
              underperformers: '{{underperformer_analysis.underperformers.length}}',
              improvement_plans: '{{improvement_plans.total_plans}}'
            }
          }
        ]
      }
    },
    {
      id: 'generate-performance-report',
      type: 'data-processing',
      name: 'Generate Performance Report',
      config: {
        script: `
          return {
            report_summary: {
              evaluation_period: evaluation_period,
              total_suppliers_evaluated: performance_evaluations.total_suppliers,
              suppliers_meeting_threshold: performance_evaluations.passing_suppliers,
              suppliers_needing_improvement: underperformer_analysis.underperformers.length,
              average_score: performance_evaluations.evaluations.reduce((sum, e) => sum + e.overall_score, 0) / performance_evaluations.evaluations.length
            },
            detailed_evaluations: performance_evaluations.evaluations,
            improvement_plans: improvement_plans || { improvement_plans: [] },
            generated_at: new Date().toISOString()
          };
        `,
        inputs: ['evaluation_period', 'performance_evaluations', 'underperformer_analysis', 'improvement_plans']
      },
      outputs: ['final_report']
    }
  ],
  
  integrations: [
    { name: 'supplier_api', type: 'rest', required: true },
    { name: 'procurement_system', type: 'rest', required: true },
    { name: 'email_service', type: 'smtp', required: false }
  ],
  
  output_schema: {
    success: 'boolean',
    suppliers_evaluated: 'number',
    underperformers_identified: 'number',
    improvement_plans_created: 'number',
    average_score: 'number',
    execution_time: 'string'
  }
};
