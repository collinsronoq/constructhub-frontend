from __future__ import annotations

import sys
from pathlib import Path
import unittest


sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.ai.tools.tools import _build_phase_insights


class AIToolsTests(unittest.TestCase):
    def test_build_phase_insights_sorted_by_share_desc(self):
        breakdown = [
            {
                "phase": "site_survey",
                "materials": [],
                "labour": [{"role": "Surveyor", "total": 10000}],
                "totals": {"phase_total": 10000},
            },
            {
                "phase": "finishes",
                "materials": [{"name": "Tiles", "total": 500000}],
                "labour": [{"role": "Tiler", "total": 100000}],
                "totals": {"phase_total": 600000},
            },
            {
                "phase": "foundation",
                "materials": [{"name": "Cement", "total": 200000}],
                "labour": [{"role": "Mason", "total": 90000}],
                "totals": {"phase_total": 290000},
            },
        ]
        total_cost = 900000

        insights = _build_phase_insights(breakdown, total_cost)
        self.assertEqual([i["phase"] for i in insights[:3]], ["finishes", "foundation", "site_survey"])
        shares = [i["share_of_total"] for i in insights]
        self.assertEqual(shares, sorted(shares, reverse=True))


if __name__ == "__main__":
    unittest.main()
