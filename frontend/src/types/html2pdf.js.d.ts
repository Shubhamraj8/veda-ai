declare module "html2pdf.js" {
  /** Options forwarded to html2canvas inside html2pdf.js */
  interface Html2CanvasPdfOptions {
    scale?: number;
    useCORS?: boolean;
    letterRendering?: boolean;
    logging?: boolean;
    backgroundColor?: string | null;
  }

  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: Html2CanvasPdfOptions;
    jsPDF?: { unit: string; format: string; orientation: string };
    pagebreak?: { mode?: string | string[] };
  }

  // html2pdf() returns a chainable instance
  function html2pdf(): {
    set: (opt: Html2PdfOptions) => {
      from: (element: HTMLElement) => {
        save: () => void | Promise<void>;
      };
    };
  };

  export default html2pdf;
}

