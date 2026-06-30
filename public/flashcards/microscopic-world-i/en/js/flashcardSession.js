/** Study algorithm — notes-to-flashcards / study-runtime.md */

export const RATE_AGAIN = 1.7;
export const RATE_GOT_IT = 0.7;
export const RATE_NEUTRAL = 1.0;
export const RATE_MASTERED = 0.1;
export const GOT_IT_MASTER_COUNT = 3;

export function rateToCopyCount(rate) {
  const whole = Math.floor(rate);
  const frac = rate - whole;
  return whole + (Math.random() < frac ? 1 : 0);
}

export function createCardStates(deck) {
  const states = {};
  for (const card of deck) {
    states[card.id] = {
      nextRate: RATE_NEUTRAL,
      totalGotIt: 0,
      roundAgain: 0,
      roundGotIt: 0,
      roundNeutral: 0,
    };
  }
  return states;
}

export function buildRoundCopyPlan(deck, cardStates, roundNumber) {
  if (roundNumber === 1) {
    return deck.map((c) => ({ id: c.id, count: 1 }));
  }
  const plan = [];
  for (const card of deck) {
    const count = rateToCopyCount(cardStates[card.id].nextRate);
    if (count > 0) plan.push({ id: card.id, count });
  }
  return plan;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSequenceQueueNoAdjacent(plan) {
  const remaining = new Map(plan.map((p) => [p.id, p.count]));
  const ids = [...remaining.keys()].sort((a, b) => a - b);
  const queue = [];
  let last = null;

  while ([...remaining.values()].some((n) => n > 0)) {
    let placed = false;
    for (const id of ids) {
      if ((remaining.get(id) || 0) <= 0) continue;
      if (id === last) continue;
      queue.push(id);
      remaining.set(id, remaining.get(id) - 1);
      last = id;
      placed = true;
      break;
    }
    if (!placed) {
      const id = ids.find((i) => (remaining.get(i) || 0) > 0);
      queue.push(id);
      remaining.set(id, remaining.get(id) - 1);
      last = id;
    }
  }
  return queue;
}

export function buildRoundQueue(plan, roundNumber, mode) {
  if (!plan.length) return [];

  if (mode === "random") {
    if (roundNumber === 1) {
      return shuffle(plan.map((p) => p.id));
    }
    const expanded = [];
    for (const p of plan) {
      for (let i = 0; i < p.count; i += 1) expanded.push(p.id);
    }
    return shuffle(expanded);
  }

  if (roundNumber === 1) {
    return plan.map((p) => p.id).sort((a, b) => a - b);
  }
  return buildSequenceQueueNoAdjacent(plan);
}

export class FlashcardSession {
  constructor(deck) {
    this.fullDeck = deck;
    this.activeDeck = deck;
    this.filterSubtopic = null;
    this.cardStates = createCardStates(deck);
    this.roundNumber = 1;
    this.mode = "sequence";
    this.roundCopyPlan = [];
    this.roundQueue = [];
    this.queueIndex = 0;
    this.flipped = false;
    this.phase = "study";
    this.sessionComplete = false;
    this.startRound();
  }

  setFilter(subtopic) {
    this.filterSubtopic = subtopic || null;
    this.activeDeck = subtopic
      ? this.fullDeck.filter((c) => c.subtopic === subtopic)
      : [...this.fullDeck];
    this.resetSession();
  }

  resetSession() {
    this.cardStates = createCardStates(this.activeDeck);
    this.roundNumber = 1;
    this.phase = "study";
    this.sessionComplete = false;
    this.startRound();
  }

  startRound() {
    for (const card of this.activeDeck) {
      const s = this.cardStates[card.id];
      s.roundAgain = 0;
      s.roundGotIt = 0;
      s.roundNeutral = 0;
    }

    this.roundCopyPlan = buildRoundCopyPlan(
      this.activeDeck,
      this.cardStates,
      this.roundNumber,
    );

    if (!this.roundCopyPlan.length) {
      this.phase = "summary";
      this.sessionComplete = true;
      this.roundQueue = [];
      this.queueIndex = 0;
      this.flipped = false;
      return;
    }

    this.roundQueue = buildRoundQueue(
      this.roundCopyPlan,
      this.roundNumber,
      this.mode,
    );
    this.queueIndex = 0;
    this.flipped = false;
    this.phase = "study";
    this.sessionComplete = false;
  }

  getCurrentCard() {
    const id = this.roundQueue[this.queueIndex];
    return this.activeDeck.find((c) => c.id === id) ?? null;
  }

  setMode(mode) {
    if (this.mode === mode || this.phase !== "study") return;
    this.mode = mode;
    this.roundQueue = buildRoundQueue(
      this.roundCopyPlan,
      this.roundNumber,
      this.mode,
    );
    this.queueIndex = 0;
    this.flipped = false;
  }

  flip() {
    if (this.phase !== "study") return;
    this.flipped = !this.flipped;
  }

  prev() {
    if (this.phase !== "study" || this.queueIndex <= 0) return;
    this.queueIndex -= 1;
    this.flipped = false;
  }

  nextNavigate() {
    if (this.phase !== "study") return;
    if (this.queueIndex < this.roundQueue.length - 1) {
      this.queueIndex += 1;
      this.flipped = false;
    }
  }

  advanceAfterRating() {
    this.flipped = false;
    if (this.queueIndex >= this.roundQueue.length - 1) {
      this.phase = "summary";
    } else {
      this.queueIndex += 1;
    }
  }

  rateAgain() {
    if (!this.flipped || this.phase !== "study") return false;
    const card = this.getCurrentCard();
    if (!card) return false;
    const s = this.cardStates[card.id];
    s.nextRate = RATE_AGAIN;
    s.totalGotIt = 0;
    s.roundAgain += 1;
    this.advanceAfterRating();
    return true;
  }

  rateGotIt() {
    if (!this.flipped || this.phase !== "study") return false;
    const card = this.getCurrentCard();
    if (!card) return false;
    const s = this.cardStates[card.id];
    s.totalGotIt += 1;
    s.roundGotIt += 1;
    s.nextRate =
      s.totalGotIt >= GOT_IT_MASTER_COUNT ? RATE_MASTERED : RATE_GOT_IT;
    this.advanceAfterRating();
    return true;
  }

  rateNext() {
    if (this.phase !== "study") return;
    const card = this.getCurrentCard();
    if (card && this.flipped) {
      this.cardStates[card.id].nextRate = RATE_NEUTRAL;
      this.cardStates[card.id].roundNeutral += 1;
      this.advanceAfterRating();
      return;
    }
    this.nextNavigate();
  }

  nextRound() {
    this.roundNumber += 1;
    this.startRound();
  }

  getSubtopics() {
    return [...new Set(this.fullDeck.map((c) => c.subtopic))];
  }

  getSummaryLists() {
    const keep = [];
    const confident = [];
    for (const card of this.activeDeck) {
      const s = this.cardStates[card.id];
      if (s.roundAgain > 0) keep.push(card);
      else if (s.roundGotIt > 0) confident.push(card);
    }
    return { keep, confident };
  }

  getRoundCardCount() {
    return this.roundCopyPlan.reduce((sum, p) => sum + p.count, 0);
  }
}
