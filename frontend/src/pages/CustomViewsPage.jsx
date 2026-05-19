import React from 'react';
import EthnicityDonut from '../components/customViews/EthnicityDonut';
import RelationshipHeatmap from '../components/customViews/RelationshipHeatmap';
import AncestryPdfPanel from '../components/customViews/AncestryPdfPanel';
import MatchingRulesEditor from '../components/customViews/MatchingRulesEditor';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>DNA Views</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
          Custom DNA / genealogy insight views — visualizations and editors.
        </p>
      </div>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
        <EthnicityDonut />
        <RelationshipHeatmap />
        <AncestryPdfPanel />
        <MatchingRulesEditor />
      </div>
    </div>
  );
}
