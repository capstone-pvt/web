'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { FeatureImportanceChart } from '@/app/components/ml/FeatureImportanceChart';
import { AccuracyTrendChart } from '@/app/components/ml/AccuracyTrendChart';
import { PerformanceDistributionChart } from '@/app/components/ml/PerformanceDistributionChart';
import {
  useModelPerformance,
  useFeatureImportance,
  useDepartmentInsights,
  useAccuracyTrends,
} from '@/lib/hooks/useMLAnalytics';
import { LoadingSkeleton, ErrorDisplay } from '@/app/components/ui';
import {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Building2,
} from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

export default function AnalyticsPage() {
  const { data: modelPerf, isLoading: perfLoading, error: perfError } = useModelPerformance();
  const { data: features, isLoading: featLoading, error: featError } = useFeatureImportance();
  const { data: deptInsights, isLoading: deptLoading, error: deptError } = useDepartmentInsights();
  const { data: accuracyData, isLoading: accLoading, error: accError } = useAccuracyTrends();

  const isLoading = perfLoading || featLoading || deptLoading || accLoading;
  const error = perfError || featError || deptError || accError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">ML Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error?.message || 'Failed to load analytics'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          ML Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive insights into ML model performance and predictions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Model Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {modelPerf ? (modelPerf.accuracy * 100).toFixed(2) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current model: {modelPerf?.currentVersion || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{modelPerf?.predictionCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {modelPerf ? (modelPerf.avgConfidence * 100).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Prediction confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{deptInsights?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Analyzed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Feature Importance</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Trend */}
            {accuracyData && accuracyData.length > 0 && (
              <AccuracyTrendChart data={accuracyData} />
            )}

            {/* Performance Distribution */}
            {deptInsights && deptInsights.length > 0 && (
              <PerformanceDistributionChart
                data={deptInsights.reduce(
                  (acc, dept) => ({
                    excellent: acc.excellent + dept.distribution.excellent,
                    good: acc.good + dept.distribution.good,
                    average: acc.average + dept.distribution.average,
                    belowAverage: acc.belowAverage + dept.distribution.belowAverage,
                    poor: acc.poor + dept.distribution.poor,
                  }),
                  {
                    excellent: 0,
                    good: 0,
                    average: 0,
                    belowAverage: 0,
                    poor: 0,
                  }
                )}
              />
            )}
          </div>

          {/* Model Performance Over Time */}
          {modelPerf?.accuracyOverTime && modelPerf.accuracyOverTime.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historical Model Performance</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Accuracy trends across different time periods
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modelPerf.accuracyOverTime.slice(-10).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${item.accuracy * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-16 text-right">
                          {(item.accuracy * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {features && features.length > 0 ? (
            <FeatureImportanceChart data={features} maxFeatures={15} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No feature importance data available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          {deptInsights && deptInsights.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Department Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deptInsights.map((dept) => (
                      <div
                        key={dept.departmentId}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {dept.departmentName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {dept.employeeCount} employees
                            </p>
                          </div>
                          <Badge className={getRiskLevelColor(dept.riskLevel)}>
                            {dept.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                          <div className="text-center p-2 rounded bg-muted/50">
                            <p className="text-2xl font-bold">
                              {dept.avgPredictedScore.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Avg Score</p>
                          </div>
                          <div className="text-center p-2 rounded bg-green-500/10">
                            <p className="text-2xl font-bold text-green-600">
                              {dept.distribution.excellent}
                            </p>
                            <p className="text-xs text-muted-foreground">Excellent</p>
                          </div>
                          <div className="text-center p-2 rounded bg-blue-500/10">
                            <p className="text-2xl font-bold text-blue-600">
                              {dept.distribution.good}
                            </p>
                            <p className="text-xs text-muted-foreground">Good</p>
                          </div>
                          <div className="text-center p-2 rounded bg-yellow-500/10">
                            <p className="text-2xl font-bold text-yellow-600">
                              {dept.distribution.average}
                            </p>
                            <p className="text-xs text-muted-foreground">Average</p>
                          </div>
                          <div className="text-center p-2 rounded bg-orange-500/10">
                            <p className="text-2xl font-bold text-orange-600">
                              {dept.distribution.belowAverage}
                            </p>
                            <p className="text-xs text-muted-foreground">Below Avg</p>
                          </div>
                          <div className="text-center p-2 rounded bg-red-500/10">
                            <p className="text-2xl font-bold text-red-600">
                              {dept.distribution.poor}
                            </p>
                            <p className="text-xs text-muted-foreground">Poor</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No department insights available
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
