import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated ring-2 ring-white/80 transition hover:opacity-90 sm:bottom-6 sm:right-6 sm:ring-0"
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
