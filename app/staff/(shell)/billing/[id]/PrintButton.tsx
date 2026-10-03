"use client";

export default function PrintButton() {
  return (
    <button className="btn btn-primary" type="button" onClick={() => window.print()} style={{ fontSize: 12, padding: "12px 22px" }}>
      Print
    </button>
  );
}
