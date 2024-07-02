interface Contributor {
  name: string;
  cost: number;
  note?: string;
}

const KNOWN_HEAVY: Record<string, string> = {
  moment: "consider removing (use date-fns)",
  lodash: "use lodash-es with tree-shaking",
  "react-native-vector-icons": "use only specific icon families",
};

export function rankBundleContributors(): Contributor[] {
  // Real impl: parse Metro bundle output, weight by parse cost
  return [
    { name: "react-native-reanimated", cost: 217 },
    { name: "@react-navigation", cost: 184 },
    { name: "moment", cost: 163, note: "← " + KNOWN_HEAVY.moment },
    { name: "lottie-react-native", cost: 89 },
  ];
}
