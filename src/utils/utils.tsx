export const extractVariables = (text) => {
  const regex = /{{(.*?)}}/g;
  const matches = [...text.matchAll(regex)];
  return matches.map(match => match[1].trim());
};