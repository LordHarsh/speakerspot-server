export const generateUsername = (
  firstName: string,
  lastName: string,
): string => {
  const randomNumbers = Math.floor(1000 + Math.random() * 9000);
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNumbers}`;
};
