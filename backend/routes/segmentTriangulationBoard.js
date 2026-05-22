const express = require('express');

const router = express.Router();

function triangulate(input = {}) {
  const matches = input.matches || [
    { match: 'Cousin A', chromosome: 7, start_cm: 44, end_cm: 72, shared_cm: 38, tree_hint: 'maternal Howard line' },
    { match: 'Cousin B', chromosome: 7, start_cm: 51, end_cm: 69, shared_cm: 24, tree_hint: 'maternal Howard line' },
    { match: 'Cousin C', chromosome: 12, start_cm: 11, end_cm: 31, shared_cm: 18, tree_hint: 'unknown' },
  ];
  const groups = matches.reduce((acc, m) => {
    const key = `${m.chromosome}:${Math.round(Number(m.start_cm) / 10) * 10}`;
    acc[key] = acc[key] || [];
    acc[key].push(m);
    return acc;
  }, {});
  return {
    clusters: Object.entries(groups).map(([key, members]) => ({
      segment: key,
      members,
      confidence: members.length >= 2 ? 'triangulated' : 'needs_more_matches',
      hypothesis: members[0].tree_hint || 'unknown line',
    })),
  };
}

router.get('/', (req, res) => res.json(triangulate()));
router.post('/triangulate', (req, res) => res.json(triangulate(req.body || {})));

module.exports = router;
