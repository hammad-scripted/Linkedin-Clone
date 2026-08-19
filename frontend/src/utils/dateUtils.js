import { format, parseISO, isValid } from "date-fns";

export const formatDate = (dateString) => {
    if (!dateString) return "Present";

    const date = parseISO(String(dateString));
    return isValid(date) ? format(date, "MMM yyyy") : "Unknown date";
};
