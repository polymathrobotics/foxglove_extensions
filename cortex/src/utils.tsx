// Utility to convert ROS-style timestamp to local date/time string
export function formatUtcTimestampToLocalString(sec: number, nsec: number): string {
  const ms = sec * 1000 + Math.floor(nsec / 1e6);
  const date = new Date(ms);

  const datePart = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const timePart = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).split(" ");

  const time = timePart[0];
  const ampm = timePart[1];

  const milliseconds = String(ms % 1000).padStart(3, "0");

  const tz = date
    .toLocaleTimeString(undefined, { timeZoneName: "short" })
    .split(" ")
    .pop()
    ?.replace(/[^A-Z]/g, "") ?? "";

  return `${datePart} ${time}.${milliseconds} ${ampm} (${tz})`;
}
