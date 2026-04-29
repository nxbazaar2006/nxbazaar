type ToastVariant = "default" | "destructive";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  return {
    toast: ({ title, description, variant = "default" }: ToastOptions) => {
      if (variant === "destructive") {
        console.error(title, description);
        alert(`❌ ${title}\n${description ?? ""}`);
      } else {
        console.log(title, description);
        alert(`✅ ${title}\n${description ?? ""}`);
      }
    },
  };
}