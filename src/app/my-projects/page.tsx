"use client"

import React, { useState, useEffect } from "react";
import FilesParticles from "@/components/FilesParticles";
import ExcelDropper from "@/components/ExcelDropper";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const Page = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);

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

      setChartData(transformedData);
    }
  }, [selectedColumn, data]);

  const handleColumnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(event.target.value);
  };

  return (
    <div className="flex items-center justify-center gap-5 flex-col md:flex-row min-h-screen bg-[#0C011A] bg-repeat w-full">
      <div className="absolute right-0 top-0 h-full w-[100%] z-[1]">
        <FilesParticles />
      </div>
      <div className="flex flex-col gap-3 w-full md:w-1/2 z-[3]">
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
            <div className="mt-4">
              <label htmlFor="column-select" className="text-white">Select Column for Graph:</label>
              <select id="column-select" value={selectedColumn} onChange={handleColumnChange} className="ml-2 p-2 rounded">
                <option value="">Select a column</option>
                {Object.keys(data[0]).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div id="graph" className="mt-4 w-full h-[300px] md:h-[500px]">
              {selectedColumn && (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis padding={{ top: 20 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none' }} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]}>
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;