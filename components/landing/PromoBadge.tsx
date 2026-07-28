type PromoBadgeProps = {
  label: "Batch 1 · Now Open" | "Free Consultation";
  tone?: "maroon" | "cream" | "gold";
};

export default function PromoBadge({ label, tone = "maroon" }: PromoBadgeProps) {
  return <span className={`promo-badge promo-badge--${tone}`}>{label}</span>;
}
