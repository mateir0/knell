import { normalizeTitle, rankMatches, titleSimilarity } from "../lib/similarity";

console.log(normalizeTitle("  Hello,  World! "));
console.log(titleSimilarity("ai note taker", "note taker ai"));
console.log(titleSimilarity("ai note taker", "ai photo editor"));
console.log(titleSimilarity("", ""));
console.log(
  JSON.stringify(
    rankMatches("smart recipe finder", [
      "recipe finder pro",
      "smart home hub",
      "finder smart recipe",
    ]),
  ),
);
console.log(JSON.stringify(rankMatches("a b", ["b a", "a b"])));
