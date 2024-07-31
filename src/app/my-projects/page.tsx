"use client";

import React, { useState } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import * as XLSX from "xlsx";
import FilesParticles from "@/components/FilesParticles";
const Page = () => {
  const [data, setData] = useState<any[]>([]);

  const onDrop: DropzoneOptions['onDrop'] = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      if (binaryStr) {
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        setData(parsedData);
      }
    };
    reader.readAsBinaryString(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex items-center justify-center gap-5 flex-col md:flex-row h-screen bg-[#0C011A] w-full">
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
        <div {...getRootProps()} className="border-dashed border-2 border-gray-400 p-5 text-center text-white cursor-pointer w-full">
          <input {...getInputProps()} />
          <p>Your Excel file here </p>
        </div>
        {data.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default Page;