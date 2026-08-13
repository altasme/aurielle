"use client";

export function QuantityStepper({
  quantity,
  unit,
  onDecrease,
  onIncrease,
  size = "md",
}: {
  quantity: number;
  unit?: string;
  onDecrease: () => void;
  onIncrease: () => void;
  size?: "sm" | "md";
}) {
  const buttonPadding = size === "sm" ? "px-3 py-1.5" : "px-3 py-2";

  return (
    <div className="flex items-center border border-taupe/40">
      <button
        type="button"
        className={`${buttonPadding} text-sm`}
        onClick={onDecrease}
        aria-label="Decrease quantity"
      >
        &minus;
      </button>
      <span className="min-w-8 px-2 text-center text-sm">
        {quantity}
        {unit ? ` ${unit}` : ""}
      </span>
      <button
        type="button"
        className={`${buttonPadding} text-sm`}
        onClick={onIncrease}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
