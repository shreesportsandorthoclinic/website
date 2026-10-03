"use client";

import { useActionState } from "react";
import {
  addPriceItemAction,
  removePriceItemAction,
  updatePriceItemAction,
  type BillingActionState,
} from "@/app/staff/billing-actions";
import { CATEGORIES, CATEGORY_LABEL, type Category, type PriceItem } from "@/lib/billing-shared";

const START: BillingActionState = { ok: false, message: "" };

const HINT: Record<Category, string> = {
  consultation: "The doctor picks exactly one of these per patient (or “No consultation fee”).",
  radiology: "X-rays, scans and other imaging. The doctor can tick several, with a quantity each.",
  procedure: "Injections, dressings, plaster, aspirations and so on. Several allowed, with quantity.",
};

function Msg({ state }: { state: BillingActionState }) {
  if (!state.message) return null;
  return (
    <span style={{ fontSize: 13, color: state.ok ? "var(--color-accent-700)" : "var(--color-accent-2-700)" }}>
      {state.message}
    </span>
  );
}

function PriceRow({ item }: { item: PriceItem }) {
  const [state, action, pending] = useActionState(updatePriceItemAction, START);
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "8px 0" }}>
      <form action={action} style={{ display: "contents" }}>
        <input type="hidden" name="id" value={item.id} />
        <input
          className="input"
          name="name"
          defaultValue={item.name}
          required
          aria-label="Name"
          style={{ flex: "1 1 220px", borderRadius: 10 }}
        />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          ₹
          <input
            className="input"
            name="price"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            defaultValue={item.price}
            required
            aria-label="Price in rupees"
            style={{ width: 110, textAlign: "right", borderRadius: 10 }}
          />
        </span>
        <button className="btn btn-secondary" type="submit" disabled={pending} style={{ fontSize: 12, padding: "8px 16px" }}>
          {pending ? "Saving…" : "Save"}
        </button>
      </form>
      <form action={removePriceItemAction}>
        <input type="hidden" name="id" value={item.id} />
        <button className="btn btn-ghost" type="submit" style={{ fontSize: 13, color: "var(--color-accent-2-700)" }}>
          Remove
        </button>
      </form>
      <Msg state={state} />
      {item.price === 0 && !state.message && (
        <span className="tag tag-accent-2" style={{ fontSize: 10 }}>
          PRICE NOT SET
        </span>
      )}
    </div>
  );
}

function AddRow({ category }: { category: Category }) {
  const [state, action, pending] = useActionState(addPriceItemAction, START);
  return (
    <form action={action} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "12px 0 0" }}>
      <input type="hidden" name="category" value={category} />
      <input
        className="input"
        name="name"
        required
        placeholder={`New ${CATEGORY_LABEL[category].toLowerCase()} item`}
        style={{ flex: "1 1 220px", borderRadius: 10 }}
      />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        ₹
        <input
          className="input"
          name="price"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          required
          placeholder="0"
          style={{ width: 110, textAlign: "right", borderRadius: 10 }}
        />
      </span>
      <button className="btn btn-primary" type="submit" disabled={pending} style={{ fontSize: 12, padding: "8px 16px" }}>
        {pending ? "Adding…" : "Add"}
      </button>
      <Msg state={state} />
    </form>
  );
}

export default function PriceEditor({ prices }: { prices: Record<Category, PriceItem[]> }) {
  return (
    <>
      {CATEGORIES.map((category) => (
        <section key={category} style={{ marginBottom: 44 }}>
          <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 6 }}>
            {CATEGORY_LABEL[category]}
          </h2>
          <p style={{ fontSize: 14, color: "var(--color-neutral-700)", margin: "0 0 10px" }}>{HINT[category]}</p>
          <div style={{ borderTop: "1px solid var(--color-divider)", borderBottom: "1px solid var(--color-divider)" }}>
            {prices[category].length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--color-neutral-600)", margin: "12px 0" }}>Nothing here yet.</p>
            ) : (
              prices[category].map((item) => <PriceRow key={item.id} item={item} />)
            )}
          </div>
          <AddRow category={category} />
        </section>
      ))}
    </>
  );
}
