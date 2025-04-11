export enum Thought {
  Analytical = "Analytical",
  Creative = "Creative",
  Repetitive = "Repetitive",
  Visionary = "Visionary",
}

export enum Emotion {
  Intense = "Intense",
  Calm = "Calm",
  Conflicted = "Conflicted",
  Fleeting = "Fleeting",
  Deep = "Deep",
}

export enum Impulse {
  Action = "Action",
  Hesitant = "Hesitant",
  Instinctive = "Instinctive",
  Delayed = "Delayed",
  Resisted = "Resisted",
  Inspired = "Inspired"
}

export enum Outcome {
  Productive = "Productive",
  Stagnant = "Stagnant",
  Chaotic = "Chaotic",
  Transformative = "Transformative",
  Routine = "Routine"
}

export enum Reaction {
  Controlled = "Controlled",
  Reactive = "Reactive",
  Detached = "Detached",
  Adaptive = "Adaptive",
  Proactive = "Proactive"
}

export enum Generation {
  Courage = "Courage",
  Hope = "Hope",
  Enthusiasm = "Enthusasm",
  Confidence = "Condifence",
}

export enum Source {
  MentalProduct = "MentalProduct",
  Health = "Health",
  TimeEfficiency = "TimeEfficiency",
  CreativePower = "CreativePower",
  Concentration = "Concentration"
}

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
}

export type State = {
  history: Message[]
}
