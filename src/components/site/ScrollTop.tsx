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
      className="fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated transition hover:opacity-90"
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
