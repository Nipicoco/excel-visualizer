import React, { useState } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import * as XLSX from "xlsx";

const ExcelDropper = ({ onDataChange }: { onDataChange: (data: any[]) => void }) => {
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
        onDataChange(parsedData);
      }
    };
    reader.readAsBinaryString(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="border-dashed border-2 border-gray-400 p-5 text-center text-white cursor-pointer w-full">
      <input {...getInputProps()} />
      <p>Your Excel file here</p>
    </div>
  );
};

export default ExcelDropper;