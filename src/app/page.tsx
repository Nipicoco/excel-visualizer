"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import MainParticle from "@/components/MainParticles";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import NightModeBackground from "@/components/NightMode";
import LightModeBackground from "@/components/LightMode";
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area } from "recharts";
import { CSSTransition } from 'react-transition-group';
import 'animate.css';
import Link from "next/link";
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const generateRandomData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    name: `Page ${i + 1}`,
    uv: Math.floor(Math.random() * 4000),
    pv: Math.floor(Math.random() * 2400),
    amt: Math.floor(Math.random() * 2400),
  }));
};
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig
 
export default function Home() {
  const [title, setTitle] = useState("");
  const fullTitle = "ברוכים הבאים לפרוייט שמנתח את האקסל שלך תוך שניות";
  const [data, setData] = useState(generateRandomData());
  const [showLineChart, setShowLineChart] = useState(true);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTitle(fullTitle.slice(0, index));
      index++;
      if (index > fullTitle.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const toggleLightMode = () => {
    setIsLightMode(!isLightMode);
  };

  return (
    <main className={`flex items-center h-screen relative ${isLightMode ? 'light-mode' : 'dark-mode'}`} dir="rtl">
      {isLightMode ? <LightModeBackground /> : <NightModeBackground />}
      <Navbar />
      <Sidebar />
      
      <div className="flex flex-col gap-3 z-[10] p-10 md:pl-40 md:pr-5 md:pt-5 w-full" style={{ textAlign: 'right' }}>
      <button className="bg-gray-800 text-white p-1 rounded-full w-10 h-10 flex items-center justify-center" onClick={toggleLightMode}>
          {isLightMode ? "🌙" : "🌞"}
        </button>
        
        <h1 className="text-[35px] md:text-[55px] text-white w-4/4 animate__animated animate__fadeIn">
          {title}
        </h1>
        <p className="text-[16px] text-gray-200 mb-10 w-full animate__animated animate__fadeIn animate__delay-1s">
          הגיע הזמן להפוך את נתוני Excel שלך לתובנות חזקות, פשוטות כמו טעינה, בחירה ולחיצה על כפתור.
        </p>
        <p className="text-[16px] text-gray-200 mb-10 w-full animate__animated animate__fadeIn animate__delay-2s">
        לא מסובך. פשוט לתפעול. אין צורך בכתיבת קוד או פורמולות.
        </p>
        
        
        <div className="mt-10 animate__animated animate__fadeIn animate__delay-3s p-5 text-white">
          <CSSTransition in={showLineChart} timeout={500} classNames="chart" unmountOnExit>
            <AreaChart width={700} height={400} data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="pv" stroke="#8884d8" fill="url(#colorPv)" />
              <Area type="monotone" dataKey="uv" stroke="#82ca9d" fill="url(#colorUv)" />
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </CSSTransition>
          <CSSTransition in={!showLineChart} timeout={500} classNames="chart" unmountOnExit>
            <BarChart width={700} height={400} data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pv" fill="#8884d8" />
              <Bar dataKey="uv" fill="#82ca9d" />
            </BarChart>
          </CSSTransition>
        </div>
        
      </div>
    </main>
  );
}