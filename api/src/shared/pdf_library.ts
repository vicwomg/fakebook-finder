export type pdfFile = {
  name: string;
  pdf: string;
  offset: number;
};

const pdfLibrary: pdfFile[] = [
  {
    name: "Colorado Cookbook.pdf",
    pdf: "colorado_cookbook.pdf",
    offset: 0,
  },
  {
    name: "Dick Hyman - 100 Tunes Every Musician Should Know",
    pdf: "dhpccs100t.pdf",
    offset: 0,
  },
  { name: "Fakebook-Django.pdf", pdf: "djangofb.pdf", offset: 0 },
  { name: "Firehouse Jazz Band.pdf", pdf: "fjfakebk.pdf", offset: 1 },
  { name: "JAZZFAKE.pdf", pdf: "jfakebk.pdf", offset: 0 },
  { name: "JAZZLTD.pdf", pdf: "jazzltd.pdf", offset: 0 },
  { name: "Library Of Musicians Jazz.pdf", pdf: "lmjazz.pdf", offset: 0 },
  { name: "New Real Book I.pdf", pdf: "nrealbk1.pdf", offset: 0 },
  { name: "NEWREAL2.pdf", pdf: "nrealbk2.pdf", offset: 0 },
  { name: "NEWREAL3.pdf", pdf: "nrealbk3.pdf", offset: 0 },
  { name: "REALBK1.pdf", pdf: "crealbk1.pdf", offset: 0 },
  { name: "REALBK2.pdf", pdf: "crealbk2.pdf", offset: 0 },
  { name: "REALBK3.pdf", pdf: "crealbk3.pdf", offset: 0 },
  { name: "THEBOOK.pdf", pdf: "thebook.pdf", offset: 0 },
  {
    name: "The Ultimate Pop Rock Fake Book.pdf",
    pdf: "ulpoprock.pdf",
    offset: 0,
  },
];

export default pdfLibrary;
