import React, { useEffect, useState } from 'react';

export default function SegmentTriangulationBoard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/segment-triangulation-board').then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  return (
    <div className="page">
      <h1>Segment Triangulation Board</h1>
      <p>Groups overlapping DNA segments and labels ancestor-line hypotheses for match review.</p>
      {data?.clusters?.map((cluster) => (
        <section key={cluster.segment} className="card">
          <h2>{cluster.segment} - {cluster.confidence}</h2>
          <p>{cluster.hypothesis}</p>
          <ul>{cluster.members.map((m) => <li key={m.match}>{m.match}: {m.shared_cm} cM</li>)}</ul>
        </section>
      ))}
    </div>
  );
}
