"use client"

import React, { useState, useEffect, useMemo } from "react";
import FilesParticles from "@/components/FilesParticles";
import ExcelDropper from "@/components/ExcelDropper";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList, LineChart, Line } from 'recharts';
import dayjs from 'dayjs';
import Select from 'react-select';
import { excelDateToJSDate, isDateColumn, exportToImage, getUniqueKeys } from "@/utils";
import "@/app/globals.css";
import { getRandomColor } from "@/utils";
import { ClipLoader } from "react-spinners";

const Page = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [showBarChart, setShowBarChart] = useState<boolean>(false);
  const [showAreaChart, setShowAreaChart] = useState<boolean>(false);
  const [referenceColumn, setReferenceColumn] = useState<string>("תאריך הארוע");
  const [isDate, setIsDate] = useState<boolean>(false);
  const [years, setYears] = useState<number[]>([]);
  const [months, setMonths] = useState<number[]>([]);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [startMonth, setStartMonth] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [endMonth, setEndMonth] = useState<number | null>(null);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [useReferenceColumn, setUseReferenceColumn] = useState<boolean>(true);
  const [useDateRangeFilter, setUseDateRangeFilter] = useState<boolean>(false);
  const [selectedReferenceGraphType, setSelectedReferenceGraphType] = useState<string>("");
  const isAnyReferenceGraphChecked = selectedReferenceGraphType !== "";
  const [graphConfigs, setGraphConfigs] = useState<any[]>([]);
  const [showChartsHeader, setShowChartsHeader] = useState<boolean>(false);
  const [lineChartStartYear, setLineChartStartYear] = useState<number | null>(null);
  const [lineChartStartMonth, setLineChartStartMonth] = useState<number | null>(null);
  const [lineChartEndYear, setLineChartEndYear] = useState<number | null>(null);
  const [lineChartEndMonth, setLineChartEndMonth] = useState<number | null>(null);
  const [useLineChartDateRangeFilter, setUseLineChartDateRangeFilter] = useState<boolean>(false);
  const [filterLineChart, setFilterLineChart] = useState<boolean>(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [selectedFilterYear, setSelectedFilterYear] = useState<number | null>(null);
  const [selectedFilterMonth, setSelectedFilterMonth] = useState<number | null>(null);

  const addGraph = () => {
    const newConfig = {
      selectedColumn,
      useReferenceColumn,
      referenceColumn,
      selectedReferenceGraphType,
      selectedNames,
      startYear,
      startMonth,
      endYear,
      endMonth,
      isDate,
      useDateRangeFilter,
      lineChartData: [...lineChartData],
      chartData: [...chartData],
      years: [...years],
    };
    setGraphConfigs([...graphConfigs, newConfig]);
    setShowChartsHeader(true);
  };

  const handleColumnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const column = event.target.value;
    setSelectedColumn(column);
    if (column) {
      setSelectedColumns(prev => [...prev, column]);
    }
  };

  const handleReferenceColumnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const column = event.target.value;
    setReferenceColumn(column);
    setIsDate(isDateColumn(data, column));

    if (isDateColumn(data, column)) {
      const dates = data.map(row => excelDateToJSDate(row[column]));
      const uniqueYears = Array.from(new Set(dates.map(date => date.getFullYear()))).sort((a: number, b: number) => a - b);
      const uniqueMonths = Array.from(new Set(dates.map(date => date.getMonth()))).sort((a: number, b: number) => a - b);
      setYears(uniqueYears as number[]);
      setMonths(uniqueMonths as number[]);
    } else {
      setYears([]);
      setMonths([]);
    }
  };

  const handleStartYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStartYear(parseInt(event.target.value, 10));
  };

  const handleStartMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStartMonth(parseInt(event.target.value, 10));
  };

  const handleEndYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEndYear(parseInt(event.target.value, 10));
  };

  const handleEndMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEndMonth(parseInt(event.target.value, 10));
  };

  const handleNameChange = (selectedOptions: any) => {
    const selected = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setSelectedNames(selected);
  };

  const handleReferenceGraphTypeChange = (selectedOption: any) => {
    const selected = selectedOption ? selectedOption.value : "";
    setSelectedReferenceGraphType(selected);
    if (selected === 'bar') {
      setUseDateRangeFilter(false); // Hide date range filter if bar chart is selected
    }
  };

  const handleFilterChange = () => {
    setFilterLineChart(!filterLineChart);
  };

  const handleFilterYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilterYear(parseInt(event.target.value, 10));
  };

  const handleFilterMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilterMonth(parseInt(event.target.value, 10));
  };

  const referenceGraphTypeOptions = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
  ];

  const filterLineCharts = () => {
    const filteredData = data.filter(row => {
      const date = excelDateToJSDate(row[referenceColumn]);
      const startDate = new Date(lineChartStartYear!, lineChartStartMonth!, 1);
      const endDate = new Date(lineChartEndYear!, lineChartEndMonth! + 1, 0);
      return date >= startDate && date <= endDate;
    });

    const updatedConfigs = graphConfigs.map(config => {
      if (config.selectedReferenceGraphType === 'area') {
        const counts = filteredData.reduce((acc, row) => {
          const value = row[config.selectedColumn];
          const date = excelDateToJSDate(row[referenceColumn]);
          const year = date.getFullYear();
          if (value) {
            if (!acc[year]) acc[year] = {};
            if (!acc[year][value]) acc[year][value] = 0;
            acc[year][value] += 1;
          }
          return acc;
        }, {} as Record<number, Record<string, number>>);

        const transformedData = Object.keys(counts).map(year => ({
          year: parseInt(year),
          ...counts[year],
        }));

        return { ...config, lineChartData: transformedData };
      }
      return config;
    });

    setGraphConfigs(updatedConfigs);
  };

  useEffect(() => {
    if (selectedColumn && data.length > 0) {
      const filteredData = useLineChartDateRangeFilter && lineChartStartYear !== null && lineChartStartMonth !== null && lineChartEndYear !== null && lineChartEndMonth !== null
        ? data.filter(row => {
            const date = excelDateToJSDate(row[referenceColumn]);
            const startDate = new Date(lineChartStartYear, lineChartStartMonth, 1);
            const endDate = new Date(lineChartEndYear, lineChartEndMonth + 1, 0);
            return date >= startDate && date <= endDate;
          })
        : data;

      const counts = filteredData.reduce((acc, row) => {
        const value = row[selectedColumn];
        const date = excelDateToJSDate(row[referenceColumn]);
        const year = date.getFullYear();
        if (value) {
          if (!acc[year]) acc[year] = {};
          if (!acc[year][value]) acc[year][value] = 0;
          acc[year][value] += 1;
        }
        return acc;
      }, {} as Record<number, Record<string, number>>);

      const transformedData = Object.keys(counts).map(year => ({
        year: parseInt(year),
        ...counts[year],
      }));

      setLineChartData(transformedData);
      setSelectedNames(getUniqueKeys(transformedData));
    }
  }, [selectedColumn, data, lineChartStartYear, lineChartStartMonth, lineChartEndYear, lineChartEndMonth, referenceColumn, useLineChartDateRangeFilter]);

  useEffect(() => {
    if (selectedColumn && data.length > 0) {
        const filteredData = startYear !== null && startMonth !== null && endYear !== null && endMonth !== null
            ? data.filter(row => {
                const date = excelDateToJSDate(row[referenceColumn]);
                const startDate = new Date(startYear, startMonth, 1);
                const endDate = new Date(endYear, endMonth + 1, 0);
                return date >= startDate && date <= endDate;
            })
            : data;
        
        const counts = filteredData.reduce((acc, row) => {
            const value = row[selectedColumn];
            const date = excelDateToJSDate(row[referenceColumn]);
            const year = date.getFullYear();
            if (value) {
                if (!acc[value]) acc[value] = {};
                acc[value][year] = (acc[value][year] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, Record<number, number>>);

        const transformedData = Object.keys(counts).map(key => {
            const yearData = counts[key];
            return {
                name: key,
                ...yearData,
            };
        });

        const filteredTransformedData = transformedData.filter(item => selectedNames.includes(item.name));

        const completeData = filteredTransformedData.map(item => {
            const newItem = { ...item };
            selectedNames.forEach(name => {
                if (!newItem[name]) {
                    newItem[name] = 0;
                }
            });
            return newItem;
        });
        setChartData(completeData);
    }
  }, [selectedColumn, data, startYear, startMonth, endYear, endMonth, referenceColumn, selectedNames]);

  useEffect(() => {
    if (!useReferenceColumn) {
      setShowBarChart(false);
      setShowAreaChart(false);
      setSelectedReferenceGraphType("");
    }
  }, [useReferenceColumn]);

  useEffect(() => {
    if (!useDateRangeFilter) {
      setStartYear(null);
      setStartMonth(null);
      setEndYear(null);
      setEndMonth(null);
      setLineChartData(data);
      setChartData(data);
    }
  }, [useDateRangeFilter, data]);

  const handleDataChange = (newData: any[]) => {
    setLoading(true);
    const randomDelay = Math.random() * (2500 - 1000) + 1000;
    setTimeout(() => {
      setData(newData);
      setLoading(false);
    }, randomDelay);
  };

  useEffect(() => {
    if (data.length > 0) {
      const columnExists = data[0].hasOwnProperty("תאריך הארוע");
      if (columnExists) {
        setReferenceColumn("תאריך הארוע");
        setIsDate(isDateColumn(data, "תאריך הארוע"));

        if (isDateColumn(data, "תאריך הארוע")) {
          const dates = data.map(row => excelDateToJSDate(row["תאריך הארוע"]));
          const uniqueYears = Array.from(new Set(dates.map(date => date.getFullYear()))).sort((a: number, b: number) => a - b);
          const uniqueMonths = Array.from(new Set(dates.map(date => date.getMonth()))).sort((a: number, b: number) => a - b);
          setYears(uniqueYears);
          setMonths(uniqueMonths);
        } else {
          setYears([]);
          setMonths([]);
        }
        console.log("Reference column 'event date' found and selected.");
      } else {
        console.log("Reference column 'event date' not found.");
      }
    }
  }, [data]);

  const filteredLineChartData = useMemo(() => {
    if (filterLineChart && selectedFilterYear !== null && selectedFilterMonth !== null) {
      return lineChartData.filter(item => {
        const date = new Date(item.year, selectedFilterMonth, 1);
        return date.getFullYear() === selectedFilterYear && date.getMonth() === selectedFilterMonth;
      });
    }
    return lineChartData;
  }, [filterLineChart, selectedFilterYear, selectedFilterMonth, lineChartData]);

  useEffect(() => {
    if (filterLineChart && data.length > 0) {
      const dates = data.map(row => excelDateToJSDate(row[referenceColumn]));
      const uniqueYears = Array.from(new Set(dates.map(date => date.getFullYear()))).sort((a, b) => a - b);
      const uniqueMonths = Array.from(new Set(dates.map(date => date.getMonth()))).sort((a, b) => a - b);
      setAvailableYears(uniqueYears);
      setAvailableMonths(uniqueMonths);
    }
  }, [filterLineChart, data, referenceColumn]);
  
  return (
    <div className="flex items-center justify-center gap-5 flex-col md:flex-row min-h-screen bg-[#0C011A] bg-repeat w-full overflow-x-hidden rtl pb-10">
      <div className="absolute right-0 top-0 h-full w-full z-[1]">
        <FilesParticles />
      </div>
      <div className="flex flex-col gap-3 w-full md:w-4/5 z-[3] px-4">
        <h1 className="text-[50px] text-white font-semibold text-right">
          .Drop your file here
        </h1>
        <ExcelDropper onDataChange={handleDataChange} />
        {loading ? (
          <div className="flex flex-col items-center mt-4">
            <ClipLoader color="#ffffff" size={50} />
            <p className="text-white mt-2">Loading data, please wait</p>
          </div>
        ) : (
          data.length > 0 && (
            <>
              <h2 className="text-[30px] text-white font-semibold mt-4 text-right" dir="rtl">Excel Data</h2>
              <div className="overflow-auto max-h-[40rem] w-full rounded-lg" style={{borderRadius: '10px' }}>
                <table className="min-w-full bg-white w-full rounded-lg exceltable">
                  <thead className="rounded-t-lg">
                    <tr>
                      {Object.keys(data[0]).map((key) => (
                        <th key={key} className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-right text-sm font-semibold text-gray-700 break-words">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="rounded-b-lg">
                    {data.map((row, index) => (
                      <tr key={index}>
                        {Object.keys(data[0]).map((key, i) => (
                          <td key={i} className="py-2 px-4 border-b border-gray-200 text-xs text-gray-700 break-words">
                            {row[key] !== undefined ? row[key] as React.ReactNode : (key === "empty do not delete" ? "empty" : "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 w-full flex flex-col items-center">
              <h2 className="text-[30px] text-white font-semibold mt-4 text-right" dir="rtl">Chart Configuration</h2>
                <label htmlFor="column-select" className="text-white" dir="rtl" style={{ textAlign: 'right' }}>Select Column for Graph:</label>
                <select id="column-select" value={selectedColumn} onChange={handleColumnChange} className="mt-2 p-2 rounded w-full md:w-2/5" dir="rtl">
                  <option value="">None</option>
                  {Object.keys(data[0]).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              {selectedColumn && (
                <>
                  <div className="mt-4 w-full flex flex-col items-center">
                    {referenceColumn && (
                      <div className="mt-4 w-full flex flex-col items-center">
                        <label htmlFor="reference-graph-type-select" className="text-white" dir="rtl">Select Graph:</label>
                        <Select
                          id="reference-graph-type-select"
                          value={selectedReferenceGraphType ? { value: selectedReferenceGraphType, label: referenceGraphTypeOptions.find(option => option.value === selectedReferenceGraphType)?.label } : null}
                          onChange={handleReferenceGraphTypeChange}
                          options={referenceGraphTypeOptions}
                          className="mt-2 w-full md:w-2/5 text-right"
                        />
                      </div>
                    )}
                  </div>
                  {isAnyReferenceGraphChecked && (
                    <div className="mt-4 w-full flex flex-col items-center text-right">
                      <label htmlFor="name-select" className="text-white" dir="rtl">Select Names to Display:</label>
                      <Select
                        id="name-select"
                        isMulti
                        value={selectedNames.map(name => ({ value: name, label: name }))}
                        onChange={handleNameChange}
                        options={getUniqueKeys(lineChartData).map(key => ({ value: key, label: key }))}
                        className="mt-2 w-full md:w-2/5"
                      />
                    </div>
                  )}
                  {isDate && selectedReferenceGraphType === 'line' && (
                    <div className="mt-4 w-full flex flex-col items-center">
                      <label className="text-white">
                        <input type="checkbox" checked={useLineChartDateRangeFilter} onChange={() => setUseLineChartDateRangeFilter(!useLineChartDateRangeFilter)} className="mr-2" />
                        Date Range Filter
                      </label>
                      {useLineChartDateRangeFilter && (
                        <div className="mt-4 w-full flex flex-col items-center">
                          <label className="text-white">From:</label>
                          <div className="flex gap-2">
                            <select value={lineChartStartYear ?? ''} onChange={(e) => setLineChartStartYear(parseInt(e.target.value, 10))} className="p-2 rounded w-full md:w-2/5">
                              <option value="">Select a year</option>
                              {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                            <select value={lineChartStartMonth ?? ''} onChange={(e) => setLineChartStartMonth(parseInt(e.target.value, 10))} className="p-2 rounded w-full md:w-2/5">
                              <option value="">Select a month</option>
                              {months.map(month => (
                                <option key={month} value={month}>{dayjs().month(month).format('MMMM')}</option>
                              ))}
                            </select>
                          </div>
                          <label className="text-white mt-4">Until:</label>
                          <div className="flex gap-2">
                            <select value={lineChartEndYear ?? ''} onChange={(e) => setLineChartEndYear(parseInt(e.target.value, 10))} className="p-2 rounded w-full md:w-2/5">
                              <option value="">Select a year</option>
                              {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                            <select value={lineChartEndMonth ?? ''} onChange={(e) => setLineChartEndMonth(parseInt(e.target.value, 10))} className="p-2 rounded w-full md:w-2/5">
                              <option value="">Select a month</option>
                              {months.map(month => (
                                <option key={month} value={month}>{dayjs().month(month).format('MMMM')}</option>
                              ))}
                            </select>
                          </div>
                          <button onClick={filterLineCharts} className="mt-4 p-2 bg-green-500 text-white rounded w-full md:w-2/5">Filter</button>
                          </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-center mt-4 w-full">
                    <button onClick={addGraph} className="p-2 bg-green-500 text-white rounded w-full md:w-2/5">Add Graph</button>
                  </div>
                  {graphConfigs.some(config => config.selectedReferenceGraphType === 'bar') && showChartsHeader && (
                    <h2 className="text-[30px] text-white font-semibold mt-4 text-center">Box Charts</h2>
                  )}
                  <div className="charts-container grid grid-cols-1 md:grid-cols-2 gap-4">
                    {graphConfigs.filter(config => config.selectedReferenceGraphType === 'bar').map((config, index) => (
                      <div key={index} className="chart-item mt-4 w-full h-[300px] md:h-[500px] p-4 gap-4">
                        <div id={`bar-graph-${index}`} className="chart-item w-full h-full flex flex-col justify-center items-center mb-20">
                          <h2 className="text-white text-center mb-2">Bar graph for {config.selectedColumn}</h2>
                          <div className="mt-4 w-full flex justify-center">
                          <button onClick={() => exportToImage(`bar-graph-${index}`, 'bar-chart.png', 800, 600)} className="p-2 text-white rounded" style={{ backgroundColor: 'transparent', color: 'White', marginTop: '30px' }}>Export Bar Chart</button>
                          </div>
                          <ResponsiveContainer width="100%" height="100%" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
                          <BarChart data={config.chartData} margin={{ right: 30, left: 20}}>
                              <XAxis dataKey="name" interval={0} />
                              <YAxis padding={{ top: 20 }} />
                              <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none' }} />
                              <Legend />
                              {config.years.map((year: number) => (
                                <Bar key={year} dataKey={year.toString()} fill={getRandomColor()} barSize={90}>
                                  <LabelList dataKey={year.toString()} position="top" offset={15} />
                                </Bar>
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h2 className="text-white text-center mb-4 mt-20 text-3xl">Line charts</h2>
                  <div className="mt-4 w-full flex flex-col items-center">
                    <label className="text-white">
                      <input type="checkbox" checked={useLineChartDateRangeFilter} onChange={() => setUseLineChartDateRangeFilter(!useLineChartDateRangeFilter)} className="mr-2" />
                      Date Range Filter
                    </label>
                  </div>
                  {useLineChartDateRangeFilter && (
                      <div className="mt-4 w-full flex flex-col items-center justify-center" dir="rtl">
                        <label className="text-white">From:</label>
                        <div className="flex gap-2 w-full md:w-2/5 justify-center">
                          <select value={lineChartStartYear ?? ''} onChange={(e) => setLineChartStartYear(parseInt(e.target.value, 10))} className="p-2 rounded w-full md:w-3/5">
                            <option value="">Select a year</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <select value={lineChartStartMonth ?? ''} onChange={(e) => setLineChartStartMonth(parseInt(e.target.value, 10))} className="p-2 rounded w-full md:w-3/5">
                            <option value="">Select a month</option>
                            {months.map(month => (
                              <option key={month} value={month}>{dayjs().month(month).format('MMMM')}</option>
                            ))}
                          </select>
                        </div>
                        <label className="text-white mt-4">Until:</label>
                        <div className="flex gap-2 w-full md:w-2/5 justify-center">
                          <select value={lineChartEndYear ?? ''} onChange={(e) => setLineChartEndYear(parseInt(e.target.value, 10))} className="p-2 rounded w-full md:w-3/5">
                            <option value="">Select a year</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <select value={lineChartEndMonth ?? ''} onChange={(e) => setLineChartEndMonth(parseInt(e.target.value, 10))} className="p-2 rounded w-full md:w-3/5">
                            <option value="">Select a month</option>
                            {months.map(month => (
                              <option key={month} value={month}>{dayjs().month(month).format('MMMM')}</option>
                            ))}
                          </select>
                        </div>
                        <button onClick={filterLineCharts} className="mt-4 p-2 bg-green-500 text-white rounded w-full md:w-2/5">Filter</button>
                      </div>
                    )}
                  <div className="charts-container grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {graphConfigs.filter(config => config.selectedReferenceGraphType === 'area').map((config, index) => (
                      <div key={index} className="chart-item mt-4 w-full h-[300px] md:h-[500px] p-4 gap-4">
                        <div id={`area-graph-${index}`} className="w-full h-full mt-4">
                        <h2 className="text-white text-center mb-2">Line graph for {config.selectedColumn}</h2>
                          <div className="mt-4 w-full flex justify-center">
                          <button onClick={() => exportToImage(`area-graph-${index}`, 'area-chart.png', 1000, 800)} className="text-white rounded" style={{ backgroundColor: 'transparent', color: 'White', marginTop: '30px' }}>Export Area Chart</button>
                          </div>
                          <ResponsiveContainer width="100%" height="100%" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
                          <LineChart data={config.lineChartData} margin={{ top: 20, right: 30, left: 20}}>
                              <XAxis dataKey="year" interval={0} />
                              <YAxis padding={{ top: 20 }} />
                              <Tooltip />
                              <Legend />
                              {config.selectedNames.map((key: string) => (
                                <Line key={key} type="monotone" dataKey={key} stroke={getRandomColor()} dot={{ r: 7 }} strokeWidth={4}>
                                  <LabelList dataKey={key} position="top" offset={15} />
                                </Line>
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Page;