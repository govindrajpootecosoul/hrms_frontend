'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/common/Card';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const BarGraph = ({
  title,
  subtitle,
  data = [],
  categories = [],
  seriesName = 'Value',
  height = 350,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
  showGrid = true,
  showLegend = false,
  horizontal = false,
  stacked = false,
  loading = false,
  className = '',
  yAxisTitle = '',
  xAxisTitle = '',
  dataLabels = false,
  tooltipEnabled = true,
  barWidth,
  onDataPointClick,
  ...props
}) => {
  const [chartOptions, setChartOptions] = useState(null);
  const [chartSeries, setChartSeries] = useState([]);
  const onDataPointClickRef = useRef(onDataPointClick);
  const prevDataKeyRef = useRef('');
  const lastProcessedDataRef = useRef(null);

  // Update ref when callback changes
  useEffect(() => {
    onDataPointClickRef.current = onDataPointClick;
  }, [onDataPointClick]);

  // Process data only when it actually changes
  useEffect(() => {
    const dataKey = JSON.stringify({ data, categories, seriesName, colors });
    
    // Skip processing if data hasn't changed
    if (dataKey === prevDataKeyRef.current) {
      return;
    }
    
    prevDataKeyRef.current = dataKey;

    // Prepare series data
    let seriesData = [];
    
    if (data && data.length > 0) {
      // If data is array of numbers, create single series
      if (typeof data[0] === 'number') {
        seriesData = [{
          name: seriesName,
          data: data
        }];
      } 
      // If data is array of objects with name and data
      else if (typeof data[0] === 'object' && data[0].data) {
        seriesData = data.map(item => ({
          name: item.name || seriesName,
          data: item.data || []
        }));
      }
      // If data is array of objects with value property
      else if (typeof data[0] === 'object' && data[0].value !== undefined) {
        seriesData = [{
          name: seriesName,
          data: data.map(item => item.value || 0)
        }];
      }
    }

    // Prepare categories
    let chartCategories = categories;
    if (!chartCategories || chartCategories.length === 0) {
      if (data && data.length > 0 && typeof data[0] === 'object' && data[0].label) {
        chartCategories = data.map(item => item.label || item.name || '');
      }
    }

    const processedData = { seriesData, chartCategories, colors };
    lastProcessedDataRef.current = processedData;
    setChartSeries(seriesData);
  }, [data, categories, seriesName, colors]);

  // Update chart options when series or other props change
  useEffect(() => {
    const processedData = lastProcessedDataRef.current;
    if (!processedData) return;

    const { chartCategories, seriesData, colors: processedColors } = processedData;
    const options = {
      chart: {
        type: 'bar',
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
                value: config.w.globals.series[config.seriesIndex][config.dataPointIndex],
                category: chartCategories[config.dataPointIndex]
              };
              onDataPointClickRef.current(dataPoint);
            }
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: horizontal,
          borderRadius: 8,
          columnWidth: barWidth || (horizontal ? '60%' : '70%'),
          dataLabels: {
            position: horizontal ? 'center' : 'top'
          },
          distributed: !stacked && seriesData.length === 1 && (processedColors?.length || 0) > 1
        }
      },
      dataLabels: {
        enabled: dataLabels,
        style: {
          fontSize: '12px',
          fontWeight: 600,
          colors: ['#fff']
        },
        offsetY: horizontal ? 0 : -20
      },
      xaxis: {
        categories: chartCategories,
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px',
            fontWeight: 500
          },
          rotate: horizontal ? 0 : -45,
          rotateAlways: false
        },
        title: {
          text: xAxisTitle,
          style: {
            color: '#374151',
            fontSize: '14px',
            fontWeight: 600
          }
        },
        axisBorder: {
          show: true,
          color: '#e5e7eb'
        },
        axisTicks: {
          show: true,
          color: '#e5e7eb'
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px',
            fontWeight: 500
          },
          formatter: (value) => {
            return value.toLocaleString();
          }
        },
        title: {
          text: yAxisTitle,
          style: {
            color: '#374151',
            fontSize: '14px',
            fontWeight: 600
          }
        }
      },
      colors: processedColors || [],
      grid: {
        show: showGrid,
        borderColor: '#e5e7eb',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      legend: {
        show: showLegend,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '14px',
        fontWeight: 500,
        markers: {
          width: 12,
          height: 12,
          radius: 6
        }
      },
      tooltip: {
        enabled: tooltipEnabled,
        theme: 'light',
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: (value) => {
            return value.toLocaleString();
          }
        },
        marker: {
          show: true
        }
      },
      fill: {
        opacity: 1,
        type: 'solid'
      },
      stroke: {
        show: false
      }
    };

    setChartOptions(options);
  }, [chartSeries, height, showGrid, showLegend, horizontal, stacked, dataLabels, tooltipEnabled, yAxisTitle, xAxisTitle, barWidth]);

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
          <div className="bg-neutral-200 rounded-lg" style={{ height: `${height}px` }}></div>
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
      
      <div className="w-full">
        {typeof window !== 'undefined' && (
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={height}
          />
        )}
      </div>
    </Card>
  );
};

export default BarGraph;

