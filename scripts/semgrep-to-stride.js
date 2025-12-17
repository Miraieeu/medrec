const fs = require("fs");

const data = JSON.parse(fs.readFileSync("semgrep.json"));
const threats = [];

data.results.forEach((r, i) => {
  let stride = "Tampering";

  const id = r.check_id.toLowerCase();
  if (id.includes("auth")) stride = "Spoofing";
  if (id.includes("role") || id.includes("permission")) stride = "Elevation of Privilege";
  if (id.includes("sql") || id.includes("injection")) stride = "Tampering";
  if (id.includes("log")) stride = "Repudiation";
  if (id.includes("secret") || id.includes("token")) stride = "Information Disclosure";

  threats.push({
    id: `AUTO-${i + 1}`,
    title: r.extra.message,
    stride,
    component: r.path,
    risk: "Medium",
    mitigation: "Apply RBAC, validation, logging, and least privilege"
  });
});

fs.writeFileSync(
  "threat-model.json",
  JSON.stringify({ threats }, null, 2)
);

console.log("✅ threat-model.json generated");
