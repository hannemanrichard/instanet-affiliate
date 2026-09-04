export const formatCurrency = (amount: number | null) => {
  if (!amount) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "DZD",
  }).format(amount);
};

export const formatPercentage = (value: number | null) => {
  if (!value) return "-";
  return `${value}%`;
};

export const formatCurrency2 = (value: number) => {
  if (!value) return "-";

  return `${value.toLocaleString()} DA`;
};

export const formatDate = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

export const extractUsername = (email: string): string => {
  if (!email || !email.includes("@")) return "";
  return email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
    .toLowerCase();
};
