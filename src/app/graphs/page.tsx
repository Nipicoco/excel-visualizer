"use client"

import React, { useState, useEffect } from "react";
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
  const [referenceColumn, setReferenceColumn] = useState<string>("event date");
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
      const uniqueYears = Array.from(new Set(dates.map(date => date.getFullYear()))).sort((a, b) => a - b);
      const uniqueMonths = Array.from(new Set(dates.map(date => date.getMonth()))).sort((a, b) => a - b);
      setYears(uniqueYears);
      setMonths(uniqueMonths);
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
  const referenceGraphTypeOptions = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
  ];

  //Effect for Referenced Line Chart
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

      console.log(filteredData)

      setLineChartData(transformedData);
      setSelectedNames(getUniqueKeys(transformedData));
    }
  }, [selectedColumn, data, startYear, startMonth, endYear, endMonth, referenceColumn]);

  //Effect for Referenced Bar Chart
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

        // Ensure all selected names are present in each data object
        const completeData = filteredTransformedData.map(item => {
            const newItem = { ...item };
            selectedNames.forEach(name => {
                if (!newItem[name]) {
                    newItem[name] = 0;
                }
            });
            return newItem;
        });
        console.log(completeData)
        setChartData(completeData);
    }
  }, [selectedColumn, data, startYear, startMonth, endYear, endMonth, referenceColumn, selectedNames]);

  //Effect to show/hide graphs based on useReferenceColumn
  useEffect(() => {
    if (!useReferenceColumn) {
      setShowBarChart(false);
      setShowAreaChart(false);
      setSelectedReferenceGraphType("");
    }
  }, [useReferenceColumn]);

  //Effect to show/hide date range filter
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
      const columnExists = data[0].hasOwnProperty("event date");
      if (columnExists) {
        setReferenceColumn("event date");
        setIsDate(isDateColumn(data, "event date"));

        if (isDateColumn(data, "event date")) {
          const dates = data.map(row => excelDateToJSDate(row["event date"]));
          const uniqueYears = Array.from(new Set(dates.map(date => date.getFullYear()))).sort((a, b) => a - b);
          const uniqueMonths = Array.from(new Set(dates.map(date => date.getMonth()))).sort((a, b) => a - b);
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

  return (
    <div className="flex items-center justify-center gap-5 flex-col md:flex-row min-h-screen bg-[#0C011A] bg-repeat w-full overflow-x-hidden rtl pb-10">
      <div className="absolute right-0 top-0 h-full w-full z-[1]">
        <FilesParticles />
      </div>
      <div className="flex flex-col gap-3 w-full md:w-4/5 z-[3] px-4">
        <h1 className="text-[50px] text-white font-semibold">
          Drop your file here<span className="text-red-500">.</span>
        </h1>
        <p className="max-w-[400px] text-[16px] text-gray-200 md:text-gray-400">
          Just drag and drop or click to select a file, and we will handle the rest.
        </p>
        <ExcelDropper onDataChange={handleDataChange} />
        {loading ? (
          <div className="flex flex-col items-center mt-4">
            <ClipLoader color="#ffffff" size={50} />
            <p className="text-white mt-2">Loading data, please wait</p>
          </div>
        ) : (
          data.length > 0 && (
            <>
              <h2 className="text-[30px] text-white font-semibold mt-4">Excel Data</h2>
              <div className="overflow-auto max-h-[40rem] w-full rounded-lg">
                <table className="min-w-full bg-white w-full rounded-lg">
                  <thead className="rounded-t-lg">
                    <tr>
                      {Object.keys(data[0]).map((key) => (
                        <th key={key} className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700 break-words">
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
              <h2 className="text-[30px] text-white font-semibold mt-4 text-center">Chart Configuration</h2>
              <div className="mt-4 w-full flex flex-col items-center">
                <label htmlFor="column-select" className="text-white">Select Column for Graph:</label>
                <select id="column-select" value={selectedColumn} onChange={handleColumnChange} className="mt-2 p-2 rounded w-full md:w-2/5">
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
                        <label htmlFor="reference-graph-type-select" className="text-white">Select Graph:</label>
                        <Select
                          id="reference-graph-type-select"
                          value={selectedReferenceGraphType ? { value: selectedReferenceGraphType, label: referenceGraphTypeOptions.find(option => option.value === selectedReferenceGraphType)?.label } : null}
                          onChange={handleReferenceGraphTypeChange}
                          options={referenceGraphTypeOptions}
                          className="mt-2 w-full md:w-2/5"
                        />
                      </div>
                    )}
                  </div>
                  {isAnyReferenceGraphChecked && (
                    <div className="mt-4 w-full flex flex-col items-center">
                      <label htmlFor="name-select" className="text-white">Select Names to Display:</label>
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
                        <input type="checkbox" checked={useDateRangeFilter} onChange={() => setUseDateRangeFilter(!useDateRangeFilter)} className="mr-2" />
                        Date Range Filter
                      </label>
                      {useDateRangeFilter && (
                        <div className="mt-4 w-full flex flex-col items-center">
                          <label className="text-white">From:</label>
                          <div className="flex gap-2">
                            <select value={startYear ?? ''} onChange={handleStartYearChange} className="p-2 rounded w-full md:w-2/5">
                              <option value="">Select a year</option>
                              {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                            <select value={startMonth ?? ''} onChange={handleStartMonthChange} className="p-2 rounded w-full md:w-2/5">
                              <option value="">Select a month</option>
                              {months.map(month => (
                                <option key={month} value={month}>{dayjs().month(month).format('MMMM')}</option>
                              ))}
                            </select>
                          </div>
                          <label className="text-white mt-4">Until:</label>
                          <div className="flex gap-2">
                            <select value={endYear ?? ''} onChange={handleEndYearChange} className="p-2 rounded w-full md:w-2/5">
                              <option value="">Select a year</option>
                              {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                            <select value={endMonth ?? ''} onChange={handleEndMonthChange} className="p-2 rounded w-full md:w-2/5">
                              <option value="">Select a month</option>
                              {months.map(month => (
                                <option key={month} value={month}>{dayjs().month(month).format('MMMM')}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-center mt-4 w-full">
                    <button onClick={addGraph} className="p-2 bg-green-500 text-white rounded w-full md:w-2/5">Add Graph</button>
                  </div>
                  {showChartsHeader && <h2 className="text-[30px] text-white font-semibold mt-4 text-center">Charts</h2>}
                  <div className="charts-container grid grid-cols-1 md:grid-cols-2 gap-4">
                    {graphConfigs.map((config, index) => (
                      <div key={index} className="chart-item mt-4 w-full h-[300px] md:h-[500px] p-4 gap-4">
                        {config.useReferenceColumn && config.referenceColumn && config.selectedReferenceGraphType === 'bar' && (
                          <div id={`bar-graph-${index}`} className="chart-item w-full h-full flex flex-col justify-center items-center mb-20" style={{}}>
                            <h2 className="text-white text-center mb-2">Bar graph for {config.selectedColumn}</h2>
                            <div className="mt-4 w-full flex justify-center">
                              <button onClick={() => exportToImage(`bar-graph-${index}`, 'bar-chart.png')} className="p-2 bg-blue-500 text-white rounded">Export Bar Chart</button>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={config.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                        )}
                        {config.useReferenceColumn && config.referenceColumn && config.selectedReferenceGraphType === 'area' && (
                          <div id={`area-graph-${index}`} className="w-full h-full mt-4">
                            <h2 className="text-white text-center mb-2 pt-7">Area graph for {config.selectedColumn}</h2>
                            <div className="mt-4 w-full flex justify-center">
                              <button onClick={() => exportToImage(`area-graph-${index}`, 'area-chart.png')} className="p-2 bg-blue-500 text-white rounded">Export Area Chart</button>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                            
                              <LineChart
                                data={config.lineChartData}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <XAxis dataKey="year" interval={0} />
                                <YAxis padding={{ top: 20 }}/>
                                <Tooltip />
                                <Legend />
                                {config.selectedNames.map((key: string) => (
                                  <Line 
                                    key={key} 
                                    type="monotone" 
                                    dataKey={key} 
                                    stroke={getRandomColor()} 
                                    dot={{ r: 7 }} 
                                    strokeWidth={4} 
                                  >
                                    <LabelList dataKey={key} position="top" offset={15} />
                                  </Line>
                                ))}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
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