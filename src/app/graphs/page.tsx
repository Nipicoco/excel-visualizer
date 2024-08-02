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

const Page = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [showBarChart, setShowBarChart] = useState<boolean>(false);
  const [showAreaChart, setShowAreaChart] = useState<boolean>(false);
  const [referenceColumn, setReferenceColumn] = useState<string>("");
  const [isDate, setIsDate] = useState<boolean>(false);
  const [years, setYears] = useState<number[]>([]);
  const [months, setMonths] = useState<number[]>([]);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [startMonth, setStartMonth] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [endMonth, setEndMonth] = useState<number | null>(null);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [useReferenceColumn, setUseReferenceColumn] = useState<boolean>(false);
  const [normalBarChartData, setNormalBarChartData] = useState<any[]>([]);
  const [showNormalBarGraph, setShowNormalBarGraph] = useState<boolean>(false);
  const [showNormalLineGraph, setShowNormalLineGraph] = useState<boolean>(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [useDateRangeFilter, setUseDateRangeFilter] = useState<boolean>(false);
  const [selectedNormalGraphTypes, setSelectedNormalGraphTypes] = useState<string[]>([]);
  const [selectedReferenceGraphTypes, setSelectedReferenceGraphTypes] = useState<string[]>([]);
  const isAnyNormalGraphChecked = selectedNormalGraphTypes.length > 0;
  const isAnyReferenceGraphChecked = selectedReferenceGraphTypes.length > 0;
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
  const filteredNormalBarChartData = normalBarChartData.filter(item => selectedNames.includes(item.name));
  const handleNormalGraphTypeChange = (selectedOptions: any) => {
    const selected = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setSelectedNormalGraphTypes(selected);
  };
  const handleReferenceGraphTypeChange = (selectedOptions: any) => {
    const selected = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setSelectedReferenceGraphTypes(selected);
  };
  const normalGraphTypeOptions = [
    { value: 'normalBar', label: 'Normal Bar Graph' },
    { value: 'normalLine', label: 'Normal Line Graph' },
  ];
  const referenceGraphTypeOptions = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
  ];


  //Effect for Normal Bar Chart
  useEffect(() => {
    if (selectedColumn && data.length > 0) {
      const counts = data.reduce((acc, row) => {
        const value = row[selectedColumn];
        if (value) {
          acc[value] = (acc[value] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const transformedData = Object.keys(counts).map(key => ({
        name: key,
        value: counts[key],
      }));

      setNormalBarChartData(transformedData);
    }
  }, [selectedColumn, data]);

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

        setChartData(completeData);
    }
  }, [selectedColumn, data, startYear, startMonth, endYear, endMonth, referenceColumn, selectedNames]);

  //Effect to show/hide graphs based on useReferenceColumn
  useEffect(() => {
    if (!useReferenceColumn) {
      setShowBarChart(false);
      setShowAreaChart(false);
      setShowNormalBarGraph(false);
      setShowNormalLineGraph(false);
      setSelectedReferenceGraphTypes([]);
    } else {
      setShowNormalBarGraph(false);
      setShowNormalLineGraph(false);
      setSelectedNormalGraphTypes([]);
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
        <ExcelDropper onDataChange={setData} />
        {data.length > 0 && (
          <>
            <h2 className="text-[30px] text-white font-semibold mt-4">Excel Data</h2>
            <div className="overflow-auto max-h-[40rem] w-full">
              <table className="min-w-full bg-white w-full">
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key} className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700 break-words">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index}>
                      {Object.keys(data[0]).map((key, i) => (
                        <td key={i} className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700 break-words">
                          {row[key] !== undefined ? row[key] as React.ReactNode : (key === "empty do not delete" ? "empty" : "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 className="text-[30px] text-white font-semibold mt-4">Chart Configuration</h2>
            <div className="mt-4 w-full flex flex-col">
              <label htmlFor="column-select" className="text-white">Select Column for Graph:</label>
              <select id="column-select" value={selectedColumn} onChange={handleColumnChange} className="mt-2 p-2 rounded w-full md:w-1/5">
                <option value="">None</option>
                {Object.keys(data[0]).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            {selectedColumn && (
              <>
                <div className="mt-4 w-full flex flex-col">
                  <label className="text-white">
                    <input type="checkbox" checked={useReferenceColumn} onChange={() => setUseReferenceColumn(!useReferenceColumn)} className="mr-2" />
                    Use Reference Column
                  </label>
                </div>
                {!useReferenceColumn && (
                  <div className="mt-4 w-full flex flex-col">
                    <label htmlFor="normal-graph-type-select" className="text-white">Select Graphs:</label>
                    <Select
                      id="normal-graph-type-select"
                      isMulti
                      value={selectedNormalGraphTypes.map(type => ({ value: type, label: normalGraphTypeOptions.find(option => option.value === type)?.label }))}
                      onChange={handleNormalGraphTypeChange}
                      options={normalGraphTypeOptions}
                      className="mt-2 w-full md:w-1/5"
                    />
                  </div>
                )}
                {useReferenceColumn && (
                  <div className="mt-4 w-full flex flex-col">
                    <div className="flex flex-col">
                      <label htmlFor="reference-column-select" className="text-white">Select Reference Column:</label>
                      <select id="reference-column-select" value={referenceColumn} onChange={handleReferenceColumnChange} className="mt-2 p-2 rounded w-full md:w-1/5">
                        <option value="">None</option>  
                        {Object.keys(data[0]).map((key) => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                    {referenceColumn && (
                      <div className="mt-4 w-full flex flex-col">
                        <label htmlFor="reference-graph-type-select" className="text-white">Select Graphs:</label>
                        <Select
                          id="reference-graph-type-select"
                          isMulti
                          value={selectedReferenceGraphTypes.map(type => ({ value: type, label: referenceGraphTypeOptions.find(option => option.value === type)?.label }))}
                          onChange={handleReferenceGraphTypeChange}
                          options={referenceGraphTypeOptions}
                          className="mt-2 w-full md:w-1/5"
                        />
                      </div>
                    )}
                  </div>
                )}
                {(isAnyNormalGraphChecked || isAnyReferenceGraphChecked) && (
                  <div className="mt-4 w-full flex flex-col">
                    <label htmlFor="name-select" className="text-white">Select Names to Display:</label>
                    <Select
                      id="name-select"
                      isMulti
                      value={selectedNames.map(name => ({ value: name, label: name }))}
                      onChange={handleNameChange}
                      options={getUniqueKeys(lineChartData).map(key => ({ value: key, label: key }))}
                      className="mt-2 w-full md:w-1/5"
                    />
                  </div>
                )}
                {useReferenceColumn && isDate && (
                  <div className="mt-4 w-full flex flex-col">
                    <label className="text-white">
                      <input type="checkbox" checked={useDateRangeFilter} onChange={() => setUseDateRangeFilter(!useDateRangeFilter)} className="mr-2" />
                      Date Range Filter
                    </label>
                    {useDateRangeFilter && (
                      <div className="mt-4 w-full">
                        <label className="text-white">From:</label>
                        <div className="flex gap-2">
                          <select value={startYear ?? ''} onChange={handleStartYearChange} className="p-2 rounded w-full md:w-auto">
                            <option value="">Select a year</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <select value={startMonth ?? ''} onChange={handleStartMonthChange} className="p-2 rounded w-full md:w-auto">
                            <option value="">Select a month</option>
                            {months.map(month => (
                              <option key={month} value={month}>{dayjs().month(month).format('MMMM')}</option>
                            ))}
                          </select>
                        </div>
                        <label className="text-white mt-4">Until:</label>
                        <div className="flex gap-2">
                          <select value={endYear ?? ''} onChange={handleEndYearChange} className="p-2 rounded w-full md:w-auto">
                            <option value="">Select a year</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <select value={endMonth ?? ''} onChange={handleEndMonthChange} className="p-2 rounded w-full md:w-auto">
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
                {(isAnyNormalGraphChecked || isAnyReferenceGraphChecked) && (
                  <>
                    <h2 className="text-[30px] text-white font-semibold mt-4">Charts</h2>
                    <div className="charts-container">
                      {selectedNormalGraphTypes.includes('normalBar') && (
                        <div id="graph" className="chart-item mt-4 w-full h-[300px] md:h-[500px]">
                          <h2 className="text-white text-center mb-2">{selectedColumn}</h2>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredNormalBarChartData}>
                              <XAxis dataKey="name" />
                              <YAxis padding={{ top: 20 }} />
                              <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none' }} />
                              <Legend />
                              <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]}>
                                <LabelList dataKey="value" position="top" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      {selectedNormalGraphTypes.includes('normalLine') && (
                        <div id="line-graph" className="chart-item mt-4 w-full h-[300px] md:h-[500px]">
                          <h2 className="text-white text-center mb-2">{selectedColumn} Line Graph</h2>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredNormalBarChartData}>
                              <XAxis dataKey="name" />
                              <YAxis padding={{ top: 20 }} />
                              <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none' }} />
                              <Legend />
                              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2}>
                                <LabelList dataKey="value" position="top" />
                              </Line>
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      {useReferenceColumn && referenceColumn && selectedReferenceGraphTypes.includes('bar') && (
                        <div id="bar-graph" className="chart-item mt-4 w-full h-[300px] md:h-[500px]">
                          <h2 className="text-white text-center mb-2">{selectedColumn}</h2>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <XAxis dataKey="name" interval={0} />
                              <YAxis padding={{ top: 20 }} />
                              <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none' }} />
                              <Legend />
                              {years.map((year) => (
                                <Bar key={year} dataKey={year.toString()} fill={getRandomColor()} barSize={90}>
                                  <LabelList dataKey={year.toString()} position="top" offset={15} />
                                </Bar>
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                          <div className="mt-4 w-full flex justify-center">
                            <button onClick={() => exportToImage('bar-graph', 'bar-chart.png')} className="p-2 bg-blue-500 text-white rounded">Export Bar Chart</button>
                          </div>
                        </div>
                      )}
                      {useReferenceColumn && referenceColumn && selectedReferenceGraphTypes.includes('area') && (
                        <div id="area-graph" className="chart-item mt-4 w-full h-[300px] md:h-[500px]">
                          <h2 className="text-white text-center mb-2">{selectedColumn} Line Graph</h2>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={lineChartData}
                              margin={{
                                top: 50,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <XAxis dataKey="year" interval={0} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {selectedNames.map((key) => (
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
                          <div className="mt-4 w-full flex justify-center">
                            <button onClick={() => exportToImage('area-graph', 'area-chart.png')} className="p-2 bg-blue-500 text-white rounded">Export Area Chart</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
