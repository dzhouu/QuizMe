import {Request, Response} from "express";
import {ParamsDictionary} from "express-serve-static-core";

// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

export type QnA = {question: string, answer: string};  // Record type that holds Question and Answer

export type Score = {username: string, setName: string, percent: string} // Record type that holds the scores of the User

const flashCardSets: Map<string, Array<QnA>> = new Map<string, Array<QnA>>();  // Map of name of the set -> Flashcard Set

let savedScore: Score[] = []; // Array of type Score

/** Handles request for /saveScore by storing the given record of Score. */
export const saveScore = (req: SafeRequest, res: SafeResponse): void => {
  const username = req.body.username
  if (typeof username !== "string") {
    res.status(400).send("missing 'username' parameter");
    return;
  }

  const setName = req.body.setName;
  if (typeof setName !== 'string') {
    res.status(400).send("missing 'setName' parameter");
    return;
  }

  const correctness = req.body.percent
  if (typeof correctness !== "string") {
    res.status(400).send("missing 'percent' parameter");
    return;
  }

  const score: Score = {
    username: username,
    setName: setName,
    percent: correctness,
  }
  savedScore.push(score);

  res.send({savedscore: true});
};

/** Handles request for /listScore by sending the full list of Scores stored . */
export const listScores = (_req: SafeRequest, res: SafeResponse): void => {
  res.send({scores: savedScore});
};

/** Handles request for /save by storing the given name of the set. */
export const save = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  if (name === undefined || typeof name !== "string") {
    res.status(400).send('required argument "name" was missing');
    return;
  }

  const text = req.body.value;
  if (text === undefined) {
    res.status(400).send('required argument "text" was missing');
    return;
  }

  if (typeof text !== "string") {
    res.status(400).send('required argument "text" is not a string');
    return;
  }

  const splittedText = text.split('\n');
  const value: Array<QnA> = [];

  for (const line of splittedText) {
    const [q, a] = line.split("|").map((item) => item.trim());
    if (q === "" || a === "" || a === undefined || q === undefined) {
      res.status(400).send('Must have a question/answer or must have a "|" separating front and back');
      return;
    }
    const newQnA: QnA = {
      question: q,
      answer: a,
    };
    value.push(newQnA);
  }

  const check: boolean = flashCardSets.has(name);

  if (!check) {
    flashCardSets.set(name, value);
  } else {
    res.status(400).send("Name of the Set Already Exists");
    return;
  }

  res.send({ check: check });
};

/** Handles request for /lists by returning the names of the sets created and saved. */
export const lists = (_req: SafeRequest, res: SafeResponse): void => {
  const vals = Array.from(flashCardSets.keys());

  res.send({sets: vals})
};

/** Handles request for /load by loading the content of the flashcard set. */
export const load = (req: SafeRequest, res: SafeResponse): void => {
  const name = first(req.query.name);
  if (name === undefined) {
    res.status(400).send('required argument "name" was missing');
    return;
  }

  if (flashCardSets.get(name) === undefined) {
    res.status(404).send(`No file under the name ${name}`);
    return;
  }
  const set = flashCardSets.get(name);

  res.send({name: name, content: set});
}

/** Handles request for /clear by clearing the sets created. */
export const clear = (_req: SafeRequest, res: SafeResponse): void => {
  flashCardSets.clear();
  let check: boolean;
  check = flashCardSets.size === 0;

  res.send({cleared: check})
}

/** Handles request for /clearScores by clearing the list of scores historys */
export const clearScores = (_req: SafeRequest, res: SafeResponse): void => {
  savedScore = [];
  let check: boolean = savedScore.length === 0;

  res.send({cleared: check});
};


/** Used in tests to set the flashCardSets map and savedScore array back to empty. */
export const resetFilesForTesting = (): void => {
  // Do not use this function except in tests!
  flashCardSets.clear();
  savedScore = [];
};

// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string | undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};
