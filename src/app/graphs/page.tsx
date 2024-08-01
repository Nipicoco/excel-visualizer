"use client"

import React, { useState, useEffect } from "react";
import FilesParticles from "@/components/FilesParticles";
import ExcelDropper from "@/components/ExcelDropper";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList, LineChart, Line } from 'recharts';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';

const excelDateToJSDate = (serial: number) => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial);
  const total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;
  const minutes = Math.floor(total_seconds / 60) % 60;
  const hours = Math.floor(total_seconds / 3600);

  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
};

const jsDateToExcelDate = (date: Date) => {
  const startDate = new Date(Date.UTC(1899, 11, 30));
  const diff = date.getTime() - startDate.getTime();
  return diff / (1000 * 60 * 60 * 24);
};

const isDateColumn = (data: any[], column: string) => {
  return data.every(row => !isNaN(Date.parse(excelDateToJSDate(row[column]).toString())));
};

const exportToImage = (id: string, filename: string) => {
  const element = document.getElementById(id);
  if (element) {
    html2canvas(element).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      link.click();
    });
  }
};  

const getUniqueKeys = (data: any[]) => {
  const keys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'year') {
        keys.add(key);
      }
    });
  });
  return Array.from(keys);
};

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

      console.log("const lineChartData = [");
      transformedData.forEach(item => {
        console.log(`  { year: ${item.year}, ${Object.keys(item).filter(key => key !== 'year').map(key => `"${key}": ${item[key]}`).join(', ')} },`);
      });
      console.log("];");
    }
  }, [selectedColumn, data, startYear, startMonth, endYear, endMonth, referenceColumn]);

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

      setChartData(transformedData);
    }
  }, [selectedColumn, data, startYear, startMonth, endYear, endMonth, referenceColumn]);

  useEffect(() => {
    if (!useReferenceColumn) {
      setShowBarChart(false);
      setShowAreaChart(false);
    }
  }, [useReferenceColumn]);

  const handleColumnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(event.target.value);
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

  const handleNameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const options = event.target.options;
    const selected: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedNames(selected);
  };

  const getColorForYear = (year: number) => {
    const letters = '89ABCDEF';
    const color = '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    return color;
  };

  const getRandomColor = () => {
    const letters = '89ABCDEF';
    const color = '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    return color;
  };

  return (
    <div className="flex items-center justify-center gap-5 flex-col md:flex-row min-h-screen bg-[#0C011A] bg-repeat w-full overflow-x-hidden rtl">
      <style>
        {`
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }

          .blinking-dot {
            animation: blink 1s infinite;
          }
        `}
      </style>
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
            <div className="mt-4 w-full flex flex-col">
              <label htmlFor="column-select" className="text-white">Select Column for Graph:</label>
              <select id="column-select" value={selectedColumn} onChange={handleColumnChange} className="mt-2 p-2 rounded w-full md:w-1/5">
                <option value="">Select a column</option>
                {Object.keys(data[0]).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 w-full flex flex-col">
              <label className="text-white">
                <input type="checkbox" checked={useReferenceColumn} onChange={() => setUseReferenceColumn(!useReferenceColumn)} className="mr-2" />
                Use Reference Column
              </label>
            </div>
            <div id="graph" className="mt-4 w-full h-[300px] md:h-[500px]">
              {selectedColumn && (
                <>
                  <h2 className="text-white text-center mb-2">{selectedColumn}</h2>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={normalBarChartData}>
                      <XAxis dataKey="name" />
                      <YAxis padding={{ top: 20 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none' }} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]}>
                        <LabelList dataKey="value" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
            {useReferenceColumn && (
              <>
                <div className="mt-4 w-full flex flex-col">
                  <label htmlFor="reference-column-select" className="text-white">Select Reference Column:</label>
                  <select id="reference-column-select" value={referenceColumn} onChange={handleReferenceColumnChange} className="mt-2 p-2 rounded w-full md:w-1/5">
                    <option value="">Select a reference column</option>
                    {Object.keys(data[0]).map((key) => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
                {isDate && (
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
                <div className="mt-4 w-full flex gap-4">
                  <label className="text-white">
                    <input type="checkbox" checked={showBarChart} onChange={() => setShowBarChart(!showBarChart)} className="mr-2" />
                    Show Bar Chart
                  </label>
                  <label className="text-white">
                    <input type="checkbox" checked={showAreaChart} onChange={() => setShowAreaChart(!showAreaChart)} className="mr-2" />
                    Show Area Chart
                  </label>
                </div>
              </>
            )}
            <div className="mt-4 w-full flex flex-col">
              <label htmlFor="name-select" className="text-white">Select Names to Display:</label>
              <select id="name-select" multiple value={selectedNames} onChange={handleNameChange} className="mt-2 p-2 rounded w-full md:w-1/5">
                {getUniqueKeys(lineChartData).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            {showBarChart && (
              <>
                <div id="bar-graph" className="mt-4 w-full h-[300px] md:h-[500px]">
                  {selectedColumn && ( 
                    <>
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
                    </>
                  )}
                </div>
                <div className="mt-4 w-full flex justify-center">
                  <button onClick={() => exportToImage('bar-graph', 'bar-chart.png')} className="p-2 bg-blue-500 text-white rounded">Export Bar Chart</button>
                </div>
              </>
            )}
            {showAreaChart && (
            <div id="area-graph" className="mt-4 w-full h-[300px] md:h-[500px]">
              {selectedColumn && (
                <>
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
                </>
              )}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;