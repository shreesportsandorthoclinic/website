import type { Metadata } from "next";
import ArticleAdmin from "./ArticleAdmin";

export const metadata: Metadata = {
  title: "Health library — Practice",
};

export default function StaffLibraryPage() {
  return <ArticleAdmin />;
}
