import { clusterTitles } from "../lib/dedupe";

console.log(
  JSON.stringify(
    clusterTitles(["alpha beta gamma", "alpha beta delta", "alpha delta epsilon"]),
  ),
);
console.log(JSON.stringify(clusterTitles(["", "solo title", ""])));
console.log(JSON.stringify(clusterTitles(["a b c", "a b d"], 0.9)));
console.log(
  JSON.stringify(
    clusterTitles([
      "alpha beta gamma",
      "AI Note Taker!",
      "Photo Editor Pro",
      "alpha beta delta",
      "photo editor",
      "ai note taker",
      "alpha delta epsilon",
    ]),
  ),
);
