async function padToCenter(lines, width) {
  const padding = " ".repeat(Math.max(0, (width - lines[0].length) / 2));
  return lines.map((line) => padding + line + padding).join("\n");
}
module.exports = padToCenter;
