import axios from "@/axios";

export const fetchOptions = async (endpoint, params, resourceKey) => {
  try {
    let response = await axios.get(endpoint, { params });

    return resourceKey
      ? response.data[resourceKey]
      : response.data[endpoint] ?? response.data;
  } catch (error) {
    console.error(error);
  }
};

export const transformPrice = (price, nullable = false) => {
  let formattedPrice = price
    ?.toString()
    .replace(".00", "")
    .replace(/\s/g, "")
    .replace(/[^\d\s]/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    .trim();
  if (!formattedPrice && !nullable) {
    return "0";
  }
  return formattedPrice ?? "";
};


export const removeSpaces = (input) => {
  // Remove spaces, thousands separators, and handle decimal points
  const newVal = input?.toString()
      .replace(/\s+/g, "")               // Remove spaces
      .replace(/[^\d.-]/g, "")           // Remove anything that isn't a digit, dot, or minus
  // .replace(/(\..*?)\./g, "$1");      // Ensure only one decimal point

  const parsedValue = Number(newVal);

  return isNaN(parsedValue) ? 0 : parsedValue;
};

export function formatTimestamp(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);

  // Format each part with leading zeros
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const transformToDate = (value) => {
  // Remove any non-digit characters first
  const cleanValue = value?.replace(/\D/g, "");

  const day = cleanValue?.slice(0, 2);
  const month = cleanValue?.slice(2, 4);
  const year = cleanValue?.slice(4, 8);

  let formatted = day;
  if (cleanValue?.length > 2) {
    formatted += `.${month}`;
  }
  if (cleanValue?.length > 4) {
    formatted += `.${year}`;
  }
  return formatted;
};
