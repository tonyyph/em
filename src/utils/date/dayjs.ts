import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(isBetween);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export { dayjs };

export const toIsoDate = (value: dayjs.ConfigType) => dayjs(value).format("YYYY-MM-DD");
