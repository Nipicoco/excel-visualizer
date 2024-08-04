import React, { useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';

interface ConfigDropperProps {
  onConfigChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setLoading: (loading: boolean) => void;
}

const ConfigDropper: React.FC<ConfigDropperProps> = ({ onConfigChange, setLoading }) => {
  const onDrop: DropzoneOptions['onDrop'] = (acceptedFiles) => {
    setLoading(true);
    const file = acceptedFiles[0];
    const input = document.createElement('input');
    input.type = 'file';
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    const event = new Event('change', { bubbles: true }) as unknown as React.ChangeEvent<HTMLInputElement>;
    Object.defineProperty(event, 'target', { writable: false, value: input });
    Object.defineProperty(event, 'currentTarget', { writable: false, value: input });

    onConfigChange(event);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    }
  });

  return (
    <div {...getRootProps()} className="exceldropper border-dashed border-2 border-gray-400 p-5 text-center text-white cursor-pointer w-full">
      <input {...getInputProps()} />
      <p>Drop your config file here or click to select</p>
    </div>
  );
};

export default ConfigDropper;