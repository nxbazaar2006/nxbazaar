import type { ReactNode } from "react";

type BackgroundWrapperProps = {
  children: ReactNode;
};

export function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  return (
    <div className="liquid-glass-shell">
      <div className="liquid-glass-background" aria-hidden="true" />
      <div className="liquid-glass-content">{children}</div>
    </div>
  );
}
