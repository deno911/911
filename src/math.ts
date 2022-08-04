/**
 * Produces a random number between the inclusive `lower` and `upper` bounds.
 */
export function randomInteger(lower: number, upper: number) {
  return lower + Math.floor(Math.random() * (upper - lower + 1));
}
