import Image from "next/image";
import Navbar from "@/components/Navbar";
import MainParticle from "@/components/MainParticles";
import Sidebar from "@/components/Sidebar";
export default function Home() {
  return (
    <main className="flex items-center h-screen relative bg-cover bg-[url('/assets/background.jpeg')]">
      <div className="absolute right-0 top-0 h-full w-[100%] z-[2]">
        <MainParticle />
      </div>
      <Navbar />
      <Sidebar />
      <div className="flex flex-col gap-3 z-[10] pl-10 pt-10 md:pl-40 md:pt-20">
        <h1 className="text-[35px] md:text-[55px] text-white max-w-[550px]">
          Turn your Excel Data{" "}
          <span className="text-red-500"> Into Powerful Insights</span>
        </h1>
        <p className="text-[16px] md:text-[18px] text-gray-200 md:text-gray-400 mb-10 md:pb-2 max-w-[400px]">
          Its time to turn your Excel data into powerful insights, simple as
          loading, selecting, and clicking a button.
        </p>
      </div>
    </main>
  );
}