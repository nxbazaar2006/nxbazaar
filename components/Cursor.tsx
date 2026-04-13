"use client";
import { useRef } from "react";

export default function MagneticButton({ children }: any) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: any) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    ref.current!.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  };

  const reset = () => {
    ref.current!.style.transform = `translate(0,0)`;
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="
        px-6 py-3 rounded-xl
        bg-gradient-to-r from-indigo-500 to-purple-500
        text-white cursor-pointer
        transition-transform duration-200
      "
    >
      {children}
    </div>
  );
}