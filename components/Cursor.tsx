"use client";
import { type ReactNode, useRef } from "react";

type MagneticButtonProps = {
  children: ReactNode;
};

export default function MagneticButton({ children }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    ref.current!.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  };

  const reset = () => {
    if (!ref.current) return;
    ref.current.style.transform = `translate(0,0)`;
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="
        px-6 py-3 rounded-full
        bg-primary
        text-white cursor-pointer
        transition-transform duration-200
      "
    >
      {children}
    </div>
  );
}
