const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/export/gedcom
router.get('/gedcom', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ancestors WHERE user_id = $1 ORDER BY id',
      [req.user.id]
    );
    const ancestors = result.rows;

    const lines = [];
    lines.push('0 HEAD');
    lines.push('1 SOUR AI-Genealogy-DNA-Insight-Analyzer');
    lines.push('2 VERS 1.0');
    lines.push('1 GEDC');
    lines.push('2 VERS 5.5');
    lines.push('2 FORM LINEAGE-LINKED');
    lines.push('1 CHAR UTF-8');
    lines.push('1 SUBM @SUBM1@');
    lines.push('0 @SUBM1@ SUBM');
    lines.push('1 NAME AI Genealogy Researcher');

    ancestors.forEach((anc, idx) => {
      const indTag = `@I${idx + 1}@`;
      lines.push(`0 ${indTag} INDI`);

      if (anc.name) {
        const parts = anc.name.trim().split(' ');
        const surname = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        const given = parts.length > 1 ? parts.slice(0, -1).join(' ') : '';
        lines.push(`1 NAME ${given} /${surname}/`);
        if (given) lines.push(`2 GIVN ${given}`);
        lines.push(`2 SURN ${surname}`);
      }

      if (anc.birth_year || anc.birth_place) {
        lines.push('1 BIRT');
        if (anc.birth_year) lines.push(`2 DATE ${anc.birth_year}`);
        if (anc.birth_place) lines.push(`2 PLAC ${anc.birth_place}`);
      }

      if (anc.death_year || anc.death_place) {
        lines.push('1 DEAT');
        if (anc.death_year) lines.push(`2 DATE ${anc.death_year}`);
        if (anc.death_place) lines.push(`2 PLAC ${anc.death_place}`);
      }

      if (anc.occupation) lines.push(`1 OCCU ${anc.occupation}`);
      if (anc.notes) lines.push(`1 NOTE ${anc.notes.replace(/\n/g, ' ')}`);
    });

    lines.push('0 TRLR');

    const gedcomContent = lines.join('\n');
    res.setHeader('Content-Type', 'application/x-gedcom');
    res.setHeader('Content-Disposition', 'attachment; filename=family-tree.ged');
    res.send(gedcomContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
