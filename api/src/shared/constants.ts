export const paramMissingError =
  "One or more of the required parameters was missing.";

export type songObject = {
  title: string;
  source: string;
  page: number;
};

export type libraryObject = {
  name: string;
  pdf: string;
  offset: number; // page offset, for misaligned indexes
};
