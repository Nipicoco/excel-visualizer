import React from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import * as XLSX from "xlsx";

const ExcelDropper = ({ onDataChange }: { onDataChange: (data: any[], fileType: string) => void }) => {
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
        onDataChange(parsedData, file.type);
      }
    };
    reader.readAsBinaryString(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    }
  });

  return (
    <div {...getRootProps()} className="exceldropper border-dashed border-2 border-gray-400 p-5 text-center text-white cursor-pointer w-full" dir="rtl">
      <input {...getInputProps()} />
      <p>השלך את קובץ ה-Excel שלך כאן או לחץ לבחירה</p>
    </div>
  );
};

export default ExcelDropper;