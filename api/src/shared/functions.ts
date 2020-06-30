import logger from "./Logger";

export const pErr = (err: Error) => {
  if (err) {
    logger.error(err);
  }
};

export const getRandomInt = () => {
  return Math.floor(Math.random() * 1_000_000_000_000);
};

//replaces accent chars and forces lowercase
export const normalizeInput = (stringInput: string) => {
  return stringInput
    .toLowerCase()
    .normalize("NFD")
    .replace(/['’`,-]/, "")
    .replace(/[\u0300-\u036f]/g, "");
};

export const fuzzysearch = (searchTerm: string, searchSubject: string) => {
  var needle = normalizeInput(searchTerm);
  var haystack = normalizeInput(searchSubject);
  return haystack.includes(needle);
};
