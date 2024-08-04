import html2canvas from 'html2canvas';

export const getRandomColor = () => {
  const colors = [
    '#1E3A8A', // Dark Blue
    '#1D4ED8', // Blue
    '#3B82F6', // Light Blue
    '#F59E0B', // Amber
    '#D97706', // Dark Amber
    '#B91C1C', // Red
    '#EF4444', // Light Red
    '#991B1B', // Dark Red
    '#78350F', // Dark Brown
    '#5F370E', // Brown
    '#A855F7', // Purple
    '#C084FC', // Light Purple
    '#EC4899', // Hot Pink
    '#DB2777', // Dark Pink
    '#D946EF', // Magenta
    '#C026D3', // Dark Magenta
    '#9333EA', // Violet
    '#7C3AED', // Dark Violet
    '#6D28D9', // Deep Violet
    '#4C1D95', // Very Dark Violet
    '#10B981', // Green
    '#059669', // Dark Green
    '#047857', // Deep Green
    '#065F46', // Very Dark Green
    '#F97316', // Orange
    '#EA580C', // Dark Orange
    '#C2410C', // Deep Orange
    '#9A3412', // Very Dark Orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};





export const excelDateToJSDate = (serial: number) => {
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

export const jsDateToExcelDate = (date: Date) => {
  const startDate = new Date(Date.UTC(1899, 11, 30));
  const diff = date.getTime() - startDate.getTime();
  return diff / (1000 * 60 * 60 * 24);
};

export const isDateColumn = (data: any[], column: string) => {
  return data.every(row => {
    const date = excelDateToJSDate(row[column]);
    return !isNaN(date.getTime());
  });
};

export const exportToImage2 = (id: string, filename: string) => {
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
export const exportToImage = (elementId: string, fileName: string, width: number, height: number) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Temporarily change the background color to white
    const originalBackgroundColor = element.style.backgroundColor;
    element.style.backgroundColor = 'white';

    html2canvas(element, { width, height }).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = fileName;
      link.click();

      // Revert the background color to the original
      element.style.backgroundColor = originalBackgroundColor;
    });
  }
};

export const getUniqueKeys = (data: any[]) => {
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


