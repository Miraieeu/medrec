import client from "prom-client";

// Kumpulin default metrics Node.js
client.collectDefaultMetrics({
  prefix: "medrec_",
});

export const register = client.register;
