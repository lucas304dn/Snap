// Shared points store — persists across renders/components within a session.
// SnapLeaderboard subscribes; GuessThePrice writes via addPoints().

let _pts = 980  // starting score matching MOCK_LEADERBOARD "You" entry

const _subs = new Set()

export function addPoints(n) {
  _pts += n
  _subs.forEach(fn => fn(_pts))
  return _pts
}

export function getPoints() {
  return _pts
}

export function subscribe(fn) {
  _subs.add(fn)
  return () => _subs.delete(fn)
}
