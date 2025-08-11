"use client";

export default function BankSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse h-16 bg-muted rounded-lg"
        ></div>
      ))}
    </div>
  );
}
