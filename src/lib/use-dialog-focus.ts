import { useEffect, useRef } from "react";

/** For portalled dialogs: isolate the page, contain focus, and restore the opener. */
export function useDialogFocus(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) return;
    const remember = () => { if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) lastFocus.current = document.activeElement; };
    remember(); document.addEventListener("focusin", remember);
    return () => document.removeEventListener("focusin", remember);
  }, [open]);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement !== document.body ? document.activeElement as HTMLElement : lastFocus.current;
    const root = document.getElementById("root");
    const wasInert = root?.inert ?? false;
    const overflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = "hidden";
    const dialog = ref.current;
    (dialog?.querySelector<HTMLElement>('[data-dialog-autofocus]') || dialog)?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key !== "Tab") return;
      const controls = [...(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]') || [])].filter(el => el.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (!controls.length) { event.preventDefault(); dialog?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first?.focus(); }
    };
    dialog?.addEventListener("keydown", onKeyDown);
    return () => {
      dialog?.removeEventListener("keydown", onKeyDown);
      if (root) root.inert = wasInert;
      document.body.style.overflow = overflow;
      requestAnimationFrame(() => { const target = opener?.isConnected ? opener : opener?.id ? document.getElementById(opener.id) : null; target?.focus({ preventScroll: true }); });
    };
  }, [open]);
  return ref;
}

