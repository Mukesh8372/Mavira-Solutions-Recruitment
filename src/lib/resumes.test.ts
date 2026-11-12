import { describe, expect, it } from "vitest";
import {
  RESUME_MAX_BYTES,
  detectResumeKind,
  isValidResumeKey,
  newResumeKey,
  resumeExtFromFileName,
  resumeExtFromKey,
  safeDownloadName,
} from "@/lib/resumes";

const ascii = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
};

const PDF = ascii("%PDF-1.7\n%\xe2\xe3\xcf\xd3\n");
const ZIP = Uint8Array.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
const OLE = Uint8Array.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00]);
const DOCX = concat(ZIP, ascii("[Content_Types].xml"), ZIP, ascii("word/document.xml"));

describe("detectResumeKind", () => {
  it("detects PDF, DOC and DOCX by their bytes", () => {
    expect(detectResumeKind(PDF)).toBe("pdf");
    expect(detectResumeKind(OLE)).toBe("doc");
    expect(detectResumeKind(DOCX)).toBe("docx");
  });
  it("rejects a plain ZIP, an empty-archive ZIP and a ZIP without Word parts", () => {
    expect(detectResumeKind(concat(ZIP, ascii("photo.jpg")))).toBeNull();
    expect(detectResumeKind(Uint8Array.from([0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0]))).toBeNull();
    expect(detectResumeKind(concat(ZIP, ascii("[Content_Types].xml"), ascii("xl/workbook.xml")))).toBeNull();
  });
  it("rejects text, random bytes and short input", () => {
    expect(detectResumeKind(ascii("Hello, this is a plain text resume"))).toBeNull();
    expect(detectResumeKind(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9]))).toBeNull();
    expect(detectResumeKind(ascii("%PDF-"))).toBeNull();
    expect(detectResumeKind(new Uint8Array(0))).toBeNull();
  });
});

describe("resumeExtFromFileName", () => {
  it("accepts allowed extensions in any case", () => {
    expect(resumeExtFromFileName("Resume.PDF")).toBe("pdf");
    expect(resumeExtFromFileName("cv.docx")).toBe("docx");
    expect(resumeExtFromFileName("old.doc")).toBe("doc");
  });
  it("rejects other and double extensions", () => {
    expect(resumeExtFromFileName("resume.pdf.exe")).toBeNull();
    expect(resumeExtFromFileName("resume.txt")).toBeNull();
    expect(resumeExtFromFileName("resume")).toBeNull();
    expect(resumeExtFromFileName("resume.")).toBeNull();
  });
});

describe("resume keys", () => {
  it("generates keys that match the key rule", () => {
    const key = newResumeKey("pdf");
    expect(isValidResumeKey(key)).toBe(true);
    expect(resumeExtFromKey(key)).toBe("pdf");
    expect(newResumeKey("docx")).not.toBe(newResumeKey("docx"));
  });
  it("rejects traversal, uppercase hex, wrong prefix and wrong extension", () => {
    const hex = "0123456789abcdef0123456789abcdef";
    expect(isValidResumeKey(`resumes/${hex}.pdf`)).toBe(true);
    expect(isValidResumeKey("resumes/../x.pdf")).toBe(false);
    expect(isValidResumeKey(`resumes/${hex.toUpperCase()}.pdf`)).toBe(false);
    expect(isValidResumeKey(`other/${hex}.pdf`)).toBe(false);
    expect(isValidResumeKey(`resumes/${hex}.exe`)).toBe(false);
    expect(isValidResumeKey(`resumes/${hex}.pdf\n`)).toBe(false);
    expect(isValidResumeKey(`/resumes/${hex}.pdf`)).toBe(false);
  });
});

describe("safeDownloadName", () => {
  it("strips paths, quotes and control characters and forces the extension", () => {
    expect(safeDownloadName('../../etc/"passwd".exe', "pdf")).toBe("passwd.pdf");
    expect(safeDownloadName("C:\\Users\\me\\My Resume.docx", "docx")).toBe("My Resume.docx");
    expect(safeDownloadName("a\r\nb;c.pdf", "pdf")).toBe("abc.pdf");
    expect(safeDownloadName(".pdf", "pdf")).toBe("resume.pdf");
  });
  it("caps the length at 120", () => {
    const name = safeDownloadName(`${"x".repeat(300)}.docx`, "docx");
    expect(name.length).toBeLessThanOrEqual(120);
    expect(name.endsWith(".docx")).toBe(true);
  });
});

it("limit is 2 MB", () => {
  expect(RESUME_MAX_BYTES).toBe(2_097_152);
});
