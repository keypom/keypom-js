export const classNames = (names) => {
  if (!names) {
    return false;
  }

  const isArray = Array.isArray;

  if (typeof names === "string") {
    return names || "";
  }

  if (isArray(names) && names.length > 0) {
    return names
      .map((name) => classNames(name))
      .filter((name) => !!name)
      .join(" ");
  }

  return Object.keys(names)
    .filter((key) => names[key])
    .join(" ");
};

export const ACCOUNT_CHECK_TIMEOUT = 500;