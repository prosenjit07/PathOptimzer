import { Provider as JotaiProvider } from "jotai";

export default function ATSResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JotaiProvider>{children}</JotaiProvider>;
}
