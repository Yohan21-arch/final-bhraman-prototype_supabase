import { useRef } from "react";

export const DESTINATION_SECTIONS = [
  { id: "overview", label: "Overview" }, { id: "photos", label: "Photographs" },
  { id: "tips", label: "Travel tips" }, { id: "stay", label: "Stays & guides" },
  { id: "reviews", label: "Reviews" }, { id: "discover", label: "Discover more" },
] as const;
export type DestinationSection = typeof DESTINATION_SECTIONS[number]["id"];
export function DestinationSectionNav({ active, onChange }: { active: DestinationSection; onChange: (section: DestinationSection) => void }) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  return <nav className="destination-section-nav" aria-label="Destination sections">
    <div role="tablist" aria-label="Destination information">
      {DESTINATION_SECTIONS.map((section, index) => <button key={section.id} ref={el => { buttons.current[index] = el; }} id={"destination-tab-" + section.id}
        role="tab" aria-selected={active === section.id} aria-controls={"destination-section-" + section.id} tabIndex={active === section.id ? 0 : -1}
        onClick={() => onChange(section.id)}
        onKeyDown={event => {
          let next = index;
          if (event.key === "ArrowRight") next = (index + 1) % DESTINATION_SECTIONS.length;
          else if (event.key === "ArrowLeft") next = (index - 1 + DESTINATION_SECTIONS.length) % DESTINATION_SECTIONS.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = DESTINATION_SECTIONS.length - 1;
          else return;
          event.preventDefault(); onChange(DESTINATION_SECTIONS[next].id); buttons.current[next]?.focus();
        }}>{section.label}</button>)}
    </div>
  </nav>;
}

