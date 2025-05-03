// global.d.ts
interface Window {
  downloadPDF?: (offerId: number, offerNumber: string) => void;
}