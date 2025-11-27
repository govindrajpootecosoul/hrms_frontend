'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/common/Card';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const LineChart = ({
  title,
  subtitle,
  data = [],
  categories = [],
  seriesName = 'Series',
  height = 320,
  colors = ['#3b82f6', '#06b6d4', '#10b981', '#f97316', '#a855f7'],
  showLegend = true,
  showGrid = true,
  smooth = true,
  showMarkers = true,
  markerSize = 4,
  strokeWidth = 3,
  strokeOptions = {},
  fillArea = false,
  areaOpacity = 0.15,
  dataLabels = false,
  tooltipEnabled = true,
  yAxisTitle = '',
  xAxisTitle = '',
  xAxisOptions = {},
  yAxisOptions = {},
  loading = false,
  className = '',
  onDataPointClick,
  ...props
}) => {
  const [chartOptions, setChartOptions] = useState(null);
  const [chartSeries, setChartSeries] = useState([]);
  const onDataPointClickRef = useRef(onDataPointClick);
  const prevDataKeyRef = useRef('');
  const lastProcessedDataRef = useRef(null);

  const strokeOptionsKey = useMemo(() => JSON.stringify(strokeOptions || {}), [strokeOptions]);
  const xAxisOptionsKey = useMemo(() => JSON.stringify(xAxisOptions || {}), [xAxisOptions]);
  const yAxisOptionsKey = useMemo(() => JSON.stringify(yAxisOptions || {}), [yAxisOptions]);

  useEffect(() => {
    onDataPointClickRef.current = onDataPointClick;
  }, [onDataPointClick]);

  // Process incoming data only when underlying values actually change
  useEffect(() => {
    const dataKey = JSON.stringify({ data, categories, seriesName, colors });
    if (dataKey === prevDataKeyRef.current) {
      return;
    }
    prevDataKeyRef.current = dataKey;

    let seriesData = [];

    if (data && data.length > 0) {
      if (typeof data[0] === 'number') {
        seriesData = [
          {
            name: seriesName,
            data: data.map((value) => (Number.isFinite(value) ? value : Number(value) || 0))
          }
        ];
      } else if (typeof data[0] === 'object' && Array.isArray(data[0]?.data)) {
        seriesData = data.map((item) => ({
          name: item.name || seriesName,
          data: (item.data || []).map((value) => (Number.isFinite(value) ? value : Number(value) || 0))
        }));
      } else if (typeof data[0] === 'object' && data[0].value !== undefined) {
        seriesData = [
          {
            name: seriesName,
            data: data.map((item) => {
              const value = item.value ?? item.count ?? item.amount;
              return Number.isFinite(value) ? value : Number(value) || 0;
            })
          }
        ];
      }
    }

    let chartCategories = categories;
    if ((!chartCategories || chartCategories.length === 0) && data && data.length > 0) {
      if (typeof data[0] === 'object') {
        chartCategories = data.map((item) => item.label || item.name || '');
      }
    }

    lastProcessedDataRef.current = {
      seriesData,
      categories: chartCategories || [],
      colors
    };
    setChartSeries(seriesData);
  }, [data, categories, seriesName, colors]);

  // Configure chart options whenever processed data or display props change
  useEffect(() => {
    const processed = lastProcessedDataRef.current;
    if (!processed) return;

    const { seriesData, categories: chartCategories, colors: processedColors } = processed;

    const options = {
      chart: {
        type: 'line',
        height,
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 650
        },
        zoom: {
          enabled: false
        },
        events: {
          dataPointSelection: (event, chartContext, config) => {
            if (!onDataPointClickRef.current) return;
            const value = chartContext.w.globals.series[config.seriesIndex][config.dataPointIndex];
            const category = chartCategories[config.dataPointIndex];
            onDataPointClickRef.current({
              seriesIndex: config.seriesIndex,
              dataPointIndex: config.dataPointIndex,
              value,
              category
            });
          }
        }
      },
      stroke: {
        curve: smooth ? 'smooth' : 'straight',
        width: strokeWidth,
        lineCap: 'round',
        colors: processedColors,
        ...strokeOptions
      },
      markers: {
        size: showMarkers ? markerSize : 0,
        strokeWidth: 2,
        strokeColors: '#fff',
        hover: {
          sizeOffset: showMarkers ? 2 : 0
        }
      },
      dataLabels: {
        enabled: dataLabels,
        style: {
          fontSize: '12px',
          fontWeight: 600
        },
        formatter: (value) => {
          const numeric = Number.isFinite(value) ? value : Number(value) || 0;
          return numeric.toLocaleString();
        }
      },
      colors: processedColors || [],
      grid: {
        show: showGrid,
        borderColor: '#e5e7eb',
        strokeDashArray: 4,
        padding: {
          top: 10,
          right: 20,
          bottom: 0,
          left: 10
        }
      },
      xaxis: {
        categories: chartCategories,
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px',
            fontWeight: 500
          }
        },
        axisBorder: {
          show: true,
          color: '#e5e7eb'
        },
        axisTicks: {
          show: true,
          color: '#e5e7eb'
        },
        title: {
          text: xAxisTitle,
          style: {
            color: '#374151',
            fontSize: '14px',
            fontWeight: 600
          }
        },
        ...xAxisOptions
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px',
            fontWeight: 500
          },
          formatter: (value) => {
            const numeric = Number.isFinite(value) ? value : Number(value) || 0;
            return numeric.toLocaleString();
          }
        },
        title: {
          text: yAxisTitle,
          style: {
            color: '#374151',
            fontSize: '14px',
            fontWeight: 600
          }
        },
        ...yAxisOptions
      },
      fill: fillArea
        ? {
            type: 'gradient',
            gradient: {
              shadeIntensity: 0.6,
              opacityFrom: areaOpacity,
              opacityTo: 0.05,
              stops: [0, 100]
            }
          }
        : { opacity: 1 },
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
        marker: {
          show: true
        },
        y: {
          formatter: (value) => {
            const numeric = Number.isFinite(value) ? value : Number(value) || 0;
            return numeric.toLocaleString();
          }
        }
      }
    };

    setChartOptions(options);
  }, [
    chartSeries,
    height,
    showLegend,
    showGrid,
    smooth,
    showMarkers,
    markerSize,
    strokeWidth,
    fillArea,
    areaOpacity,
    dataLabels,
    tooltipEnabled,
    yAxisTitle,
    xAxisTitle,
    strokeOptionsKey,
    xAxisOptionsKey,
    yAxisOptionsKey
  ]);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`} {...props}>
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>}
            {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
          </div>
        )}
        <div className="animate-pulse">
          <div className="bg-neutral-200 rounded-lg" style={{ height: `${height}px` }}></div>
        </div>
      </Card>
    );
  }

  const hasData = Array.isArray(chartSeries) && chartSeries.some((series) => Array.isArray(series.data) && series.data.length > 0);

  if (!chartOptions || !hasData) {
    return (
      <Card className={`p-6 ${className}`} {...props}>
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>}
            {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
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
          {title && <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>}
          {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
        </div>
      )}
      <div className="w-full">
        {typeof window !== 'undefined' && (
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={height}
          />
        )}
      </div>
    </Card>
  );
};

export default LineChart;
