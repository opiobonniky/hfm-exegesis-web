// HimFirstMedia static content — no API calls needed, just returns data
export function useHimFirstMedia() {
  return {
    founders: [
      { name: "Apostle Charles Ubani", role: "Founder & President" },
      { name: "Apostle Judith Ubani", role: "Co-Founder & Vice President" },
    ],
    leadership: [
      { name: "Apostle Charles Ubani", role: "General Overseer / President" },
      { name: "Apostle Judith Ubani", role: "General Overseer / Vice President" },
    ],
  };
}
