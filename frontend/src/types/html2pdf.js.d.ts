declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: { scale: number };
    jsPDF?: { unit: string; format: string; orientation: string };
  }

  // html2pdf() returns a chainable instance
  function html2pdf(): {
    set: (opt: Html2PdfOptions) => {
      from: (element: HTMLElement) => {
        save: () => void;
      };
    };
  };

  export default html2pdf;
}

