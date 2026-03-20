import { create } from "zustand";

type SchoolBrandingState = {
  logoDataUrl: string | null;
  logoFileName: string | null;
  setSchoolLogo: (dataUrl: string, fileName: string) => void;
  clearSchoolLogo: () => void;
};

function readStoredLogo(): { logoDataUrl: string | null; logoFileName: string | null } {
  if (typeof window === "undefined") {
    return { logoDataUrl: null, logoFileName: null };
  }

  try {
    return {
      logoDataUrl: window.localStorage.getItem("vedaai.schoolLogoDataUrl"),
      logoFileName: window.localStorage.getItem("vedaai.schoolLogoFileName"),
    };
  } catch {
    return { logoDataUrl: null, logoFileName: null };
  }
}

export const useSchoolBrandingStore = create<SchoolBrandingState>((set) => {
  const initial = readStoredLogo();
  return {
    ...initial,
    setSchoolLogo: (dataUrl, fileName) => {
      set({ logoDataUrl: dataUrl, logoFileName: fileName });
      try {
        window.localStorage.setItem("vedaai.schoolLogoDataUrl", dataUrl);
        window.localStorage.setItem("vedaai.schoolLogoFileName", fileName);
      } catch {
        // UI-only persistence; ignore storage errors
      }
    },
    clearSchoolLogo: () => {
      set({ logoDataUrl: null, logoFileName: null });
      try {
        window.localStorage.removeItem("vedaai.schoolLogoDataUrl");
        window.localStorage.removeItem("vedaai.schoolLogoFileName");
      } catch {
        // ignore
      }
    },
  };
});

