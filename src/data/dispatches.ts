export interface DispatchStage {
  label: string;
  time: string;
  done: boolean;
}

export interface Dispatch {
  id: string;
  /** CSS percentage position on the map */
  top: string;
  left: string;
  kitchen: string;
  kitchenType: string;
  neighborhood: string;
  meals: number;
  eta: string;
  status: "en route" | "prepping" | "delivered" | "matching";
  fundedBy: string;
  recipients: string;
  timeline: DispatchStage[];
}

export const DISPATCHES: Dispatch[] = [
  {
    id: "TF-0982",
    top: "30%",
    left: "43%",
    kitchen: "Mama Odell's Kitchen",
    kitchenType: "Family restaurant",
    neighborhood: "North Oak",
    meals: 84,
    eta: "6 min",
    status: "en route",
    fundedBy: "142 neighbors + TechCorp match",
    recipients: "North Oak Family Center — 31 households",
    timeline: [
      { label: "Funded", time: "13:52", done: true },
      { label: "Matched to kitchen", time: "13:54", done: true },
      { label: "Prep complete", time: "14:16", done: true },
      { label: "En route", time: "14:21", done: true },
      { label: "Delivered", time: "—", done: false },
    ],
  },
  {
    id: "TF-0983",
    top: "54%",
    left: "51%",
    kitchen: "Cielo Rojo Food Truck",
    kitchenType: "Mobile kitchen",
    neighborhood: "Riverside",
    meals: 60,
    eta: "18 min",
    status: "prepping",
    fundedBy: "City of Portland — Senior Outreach",
    recipients: "Riverside Senior Housing — 60 residents",
    timeline: [
      { label: "Funded", time: "14:02", done: true },
      { label: "Matched to kitchen", time: "14:05", done: true },
      { label: "Prep complete", time: "—", done: false },
      { label: "En route", time: "—", done: false },
      { label: "Delivered", time: "—", done: false },
    ],
  },
  {
    id: "TF-0984",
    top: "39%",
    left: "60%",
    kitchen: "St. Jude Community Kitchen",
    kitchenType: "Church kitchen",
    neighborhood: "Ward 4",
    meals: 220,
    eta: "delivered",
    status: "delivered",
    fundedBy: "TechCorp — 500 meal sponsorship",
    recipients: "Ward 4 shelter network — 220 individuals",
    timeline: [
      { label: "Funded", time: "11:10", done: true },
      { label: "Matched to kitchen", time: "11:12", done: true },
      { label: "Prep complete", time: "12:40", done: true },
      { label: "En route", time: "12:55", done: true },
      { label: "Delivered", time: "13:31", done: true },
    ],
  },
  {
    id: "TF-0985",
    top: "61%",
    left: "37%",
    kitchen: "Lincoln High Cafeteria",
    kitchenType: "School kitchen (after hours)",
    neighborhood: "Southgate",
    meals: 145,
    eta: "42 min",
    status: "prepping",
    fundedBy: "Southgate Neighborhood Fund",
    recipients: "After-school program — 145 students",
    timeline: [
      { label: "Funded", time: "13:20", done: true },
      { label: "Matched to kitchen", time: "13:26", done: true },
      { label: "Prep complete", time: "—", done: false },
      { label: "En route", time: "—", done: false },
      { label: "Delivered", time: "—", done: false },
    ],
  },
  {
    id: "TF-0986",
    top: "46%",
    left: "31%",
    kitchen: "Harbor Prep Co-op",
    kitchenType: "Meal prep co-op",
    neighborhood: "West Harbor",
    meals: 38,
    eta: "9 min",
    status: "en route",
    fundedBy: "38 individual funders",
    recipients: "Veterans housing collective — 38 residents",
    timeline: [
      { label: "Funded", time: "14:00", done: true },
      { label: "Matched to kitchen", time: "14:01", done: true },
      { label: "Prep complete", time: "14:19", done: true },
      { label: "En route", time: "14:24", done: true },
      { label: "Delivered", time: "—", done: false },
    ],
  },
  {
    id: "TF-0987",
    top: "68%",
    left: "58%",
    kitchen: "Unmatched demand",
    kitchenType: "Awaiting kitchen capacity",
    neighborhood: "East Flats",
    meals: 52,
    eta: "needs funding",
    status: "matching",
    fundedBy: "Partially funded — 61%",
    recipients: "East Flats mutual aid — 52 households",
    timeline: [
      { label: "Funded", time: "61%", done: false },
      { label: "Matched to kitchen", time: "—", done: false },
      { label: "Prep complete", time: "—", done: false },
      { label: "En route", time: "—", done: false },
      { label: "Delivered", time: "—", done: false },
    ],
  },
  {
    id: "TF-0988",
    top: "24%",
    left: "55%",
    kitchen: "Golden Crane Caterers",
    kitchenType: "Local caterer",
    neighborhood: "Uptown",
    meals: 96,
    eta: "delivered",
    status: "delivered",
    fundedBy: "Uptown Business Alliance",
    recipients: "Uptown day shelter — 96 meals",
    timeline: [
      { label: "Funded", time: "09:40", done: true },
      { label: "Matched to kitchen", time: "09:44", done: true },
      { label: "Prep complete", time: "11:05", done: true },
      { label: "En route", time: "11:18", done: true },
      { label: "Delivered", time: "11:52", done: true },
    ],
  },
  {
    id: "TF-0989",
    top: "50%",
    left: "68%",
    kitchen: "Bayou & Bell",
    kitchenType: "Family restaurant",
    neighborhood: "Mill District",
    meals: 40,
    eta: "27 min",
    status: "prepping",
    fundedBy: "Monthly subscribers (214)",
    recipients: "Single-parent support network — 40 families",
    timeline: [
      { label: "Funded", time: "13:45", done: true },
      { label: "Matched to kitchen", time: "13:48", done: true },
      { label: "Prep complete", time: "—", done: false },
      { label: "En route", time: "—", done: false },
      { label: "Delivered", time: "—", done: false },
    ],
  },
];
