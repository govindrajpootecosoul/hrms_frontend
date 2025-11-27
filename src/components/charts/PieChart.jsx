'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/common/Card';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const PieChart = ({
  title,
  subtitle,
  data = [],
  labels = [],
  height = 350,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'],
  showLegend = true,
  legendPosition = 'bottom',
  showDataLabels = true,
  dataLabelsPosition = 'inside',
  loading = false,
  className = '',
  donut = false,
  donutSize = '70%',
  showTooltip = true,
  onDataPointClick,
  showTotal = false,
  totalLabel = 'Total',
  ...props
}) => {
  const [chartOptions, setChartOptions] = useState(null);
  const [chartSeries, setChartSeries] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const onDataPointClickRef = useRef(onDataPointClick);
  const prevDataKeyRef = useRef('');
  const lastProcessedDataRef = useRef(null);

  // Update ref when callback changes
  useEffect(() => {
    onDataPointClickRef.current = onDataPointClick;
  }, [onDataPointClick]);

  // Process data only when it actually changes
  useEffect(() => {
    const dataKey = JSON.stringify({ data, labels, colors });
    
    // Skip processing if data hasn't changed
    if (dataKey === prevDataKeyRef.current) {
      return;
    }
    
    prevDataKeyRef.current = dataKey;

    // Prepare series data and labels
    let seriesData = [];
    let chartLabelsData = [];

    if (data && data.length > 0) {
      // If data is array of numbers
      if (typeof data[0] === 'number') {
        seriesData = data.map(val => Number(val) || 0);
        chartLabelsData = labels && labels.length > 0 
          ? labels 
          : data.map((_, index) => `Item ${index + 1}`);
      } 
      // If data is array of objects with value and label/name
      else if (typeof data[0] === 'object') {
        seriesData = data.map(item => Number(item.value || item.count || item.amount || 0));
        chartLabelsData = data.map(item => item.label || item.name || item.category || 'Unknown');
      }
    }

    // Ensure all values are valid numbers
    seriesData = seriesData.map(val => {
      const numVal = Number(val);
      return isNaN(numVal) ? 0 : numVal;
    });

    const processedData = { seriesData, chartLabelsData, colors };
    lastProcessedDataRef.current = processedData;
    setChartSeries(seriesData);
    setChartLabels(chartLabelsData);
  }, [data, labels, colors]);

  // Update chart options when series or other props change
  useEffect(() => {
    const processedData = lastProcessedDataRef.current;
    if (!processedData) return;

    const { seriesData, chartLabelsData, colors: processedColors } = processedData;
    
    // Calculate total for display
    const total = seriesData.reduce((sum, val) => sum + (val || 0), 0);

    // Chart configuration
    const options = {
      chart: {
        type: donut ? 'donut' : 'pie',
        height: height,
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        events: {
          dataPointSelection: (event, chartContext, config) => {
            if (onDataPointClickRef.current) {
              const dataPoint = {
                seriesIndex: config.seriesIndex,
                dataPointIndex: config.dataPointIndex,
                value: seriesData[config.dataPointIndex] || 0,
                label: chartLabelsData[config.dataPointIndex] || '',
                percentage: total > 0 && seriesData[config.dataPointIndex] ? ((seriesData[config.dataPointIndex] / total) * 100).toFixed(1) : 0
              };
              onDataPointClickRef.current(dataPoint);
            }
          }
        }
      },
      labels: chartLabelsData,
      colors: processedColors || [],
      dataLabels: {
        enabled: showDataLabels,
        style: {
          fontSize: '14px',
          fontWeight: 600,
          colors: ['#fff']
        },
        formatter: (val, opts) => {
          if (dataLabelsPosition === 'inside') {
            return `${opts.w.config.labels[opts.seriesIndex]}\n${val.toFixed(1)}%`;
          }
          return `${val.toFixed(1)}%`;
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          opacity: 0.45
        }
      },
      legend: {
        show: showLegend,
        position: legendPosition,
        fontSize: '14px',
        fontWeight: 500,
        markers: {
          width: 12,
          height: 12,
          radius: 6
        },
        formatter: (seriesName, opts) => {
          const value = seriesData[opts.seriesIndex] || 0;
          const percentage = total > 0 && value ? ((value / total) * 100).toFixed(1) : 0;
          return `${seriesName}: ${value.toLocaleString()} (${percentage}%)`;
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      tooltip: {
        enabled: showTooltip,
        theme: 'light',
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: (value, { seriesIndex }) => {
            const numValue = value || 0;
            const percentage = total > 0 && numValue ? ((numValue / total) * 100).toFixed(1) : 0;
            return `${numValue.toLocaleString()} (${percentage}%)`;
          }
        },
        marker: {
          show: true
        }
      },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: donut ? {
            size: donutSize,
            labels: {
              show: showTotal,
              name: {
                show: true,
                fontSize: '16px',
                fontWeight: 600,
                color: '#374151',
                offsetY: -10
              },
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827',
                formatter: () => {
                  return (total || 0).toLocaleString();
                }
              },
              total: {
                show: showTotal,
                label: totalLabel,
                fontSize: '14px',
                fontWeight: 500,
                color: '#6b7280',
                formatter: () => {
                  return (total || 0).toLocaleString();
                }
              }
            }
          } : {}
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['#fff']
      },
      fill: {
        opacity: 1,
        type: 'solid'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: '100%'
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };

    setChartOptions(options);
  }, [chartSeries, chartLabels, height, showLegend, legendPosition, showDataLabels, dataLabelsPosition, donut, donutSize, showTooltip, showTotal, totalLabel]);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`} {...props}>
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="animate-pulse">
          <div className="bg-neutral-200 rounded-lg" style={{ height: `${height}px`, width: `${height}px`, margin: '0 auto' }}></div>
        </div>
      </Card>
    );
  }

  if (!chartOptions || !chartSeries || chartSeries.length === 0) {
    return (
      <Card className={`p-6 ${className}`} {...props}>
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className="text-neutral-500">No data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="w-full flex justify-center">
        {typeof window !== 'undefined' && (
          <Chart
            options={chartOptions}
            series={chartSeries}
            type={donut ? 'donut' : 'pie'}
            height={height}
            width="100%"
          />
        )}
      </div>
    </Card>
  );
};

export default PieChart;

