import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api';

/**
 * Apply pass 5 frontend: Family Tree closure (people, edges, relationship lookup)
 * + Community threads. Mirrors AIStructuredTools.jsx layout conventions.
 */

export default function FamilyTreeAndCommunity() {
  const [tab, setTab] = useState('tree');
  return (
    <div style={{ padding: 16 }}>
      <h1>Family Tree & Community</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={tab === 'tree' ? 'btn-primary' : 'btn'} onClick={() => setTab('tree')}>Family Tree</button>
        <button className={tab === 'community' ? 'btn-primary' : 'btn'} onClick={() => setTab('community')}>Community</button>
      </div>
      {tab === 'tree' ? <Tree /> : <Community />}
    </div>
  );
}

function Tree() {
  const [people, setPeople] = useState([]);
  const [edges, setEdges] = useState([]);
  const [pf, setPf] = useState({ name: '', birth_year: '', death_year: '', sex: '', notes: '' });
  const [ef, setEf] = useState({ relation_type: 'parent_of', person_a: '', person_b: '' });
  const [rel, setRel] = useState({ a: '', b: '' });
  const [relRes, setRelRes] = useState(null);
  const [error, setError] = useState(null);
  const refresh = async () => {
    try { setPeople(await apiGet('/family-tree/people')); setEdges(await apiGet('/family-tree/edges')); } catch (err) { setError(err.message); }
  };
  useEffect(() => { refresh(); }, []);
  const addPerson = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/family-tree/people', { ...pf, birth_year: pf.birth_year ? Number(pf.birth_year) : null, death_year: pf.death_year ? Number(pf.death_year) : null });
      setPf({ name: '', birth_year: '', death_year: '', sex: '', notes: '' }); refresh();
    } catch (err) { setError(err.message); }
  };
  const addEdge = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/family-tree/edges', { ...ef, person_a: Number(ef.person_a), person_b: Number(ef.person_b) });
      setEf({ relation_type: 'parent_of', person_a: '', person_b: '' }); refresh();
    } catch (err) { setError(err.message); }
  };
  const lookupRel = async () => {
    try { setRelRes(await apiGet(`/family-tree/relationship?a=${rel.a}&b=${rel.b}`)); } catch (err) { setError(err.message); }
  };
  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h3>People</h3>
      <form onSubmit={addPerson} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <input placeholder="name" value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} required />
        <input type="number" placeholder="birth year" value={pf.birth_year} onChange={(e) => setPf({ ...pf, birth_year: e.target.value })} />
        <input type="number" placeholder="death year" value={pf.death_year} onChange={(e) => setPf({ ...pf, death_year: e.target.value })} />
        <input placeholder="sex" value={pf.sex} onChange={(e) => setPf({ ...pf, sex: e.target.value })} />
        <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }}>Add person</button>
      </form>
      <ul>{people.map((p) => (<li key={p.id}>#{p.id} · {p.name} ({p.birth_year || '?'}–{p.death_year || ''})</li>))}</ul>

      <h3>Edges</h3>
      <form onSubmit={addEdge} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select value={ef.relation_type} onChange={(e) => setEf({ ...ef, relation_type: e.target.value })}>
          <option value="parent_of">parent_of (a is parent of b)</option>
          <option value="spouse_of">spouse_of</option>
        </select>
        <input type="number" placeholder="person_a id" value={ef.person_a} onChange={(e) => setEf({ ...ef, person_a: e.target.value })} required />
        <input type="number" placeholder="person_b id" value={ef.person_b} onChange={(e) => setEf({ ...ef, person_b: e.target.value })} required />
        <button type="submit" className="btn-primary">Add edge</button>
      </form>
      <ul>{edges.map((e) => (<li key={e.id}>{e.relation_type}: #{e.person_a} → #{e.person_b}</li>))}</ul>

      <h3>Relationship lookup</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="number" placeholder="a" value={rel.a} onChange={(e) => setRel({ ...rel, a: e.target.value })} />
        <input type="number" placeholder="b" value={rel.b} onChange={(e) => setRel({ ...rel, b: e.target.value })} />
        <button className="btn" onClick={lookupRel}>Compute</button>
      </div>
      {relRes && <pre>{JSON.stringify(relRes, null, 2)}</pre>}
    </div>
  );
}

function Community() {
  const [threads, setThreads] = useState([]);
  const [tf, setTf] = useState({ title: '', body: '', surname_tag: '', location_tag: '', haplogroup_tag: '' });
  const [error, setError] = useState(null);
  const refresh = async () => { try { setThreads(await apiGet('/community/threads')); } catch (err) { setError(err.message); } };
  useEffect(() => { refresh(); }, []);
  const create = async (e) => {
    e.preventDefault();
    try { await apiPost('/community/threads', tf); setTf({ title: '', body: '', surname_tag: '', location_tag: '', haplogroup_tag: '' }); refresh(); } catch (err) { setError(err.message); }
  };
  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <input placeholder="title" value={tf.title} onChange={(e) => setTf({ ...tf, title: e.target.value })} required />
        <input placeholder="surname tag" value={tf.surname_tag} onChange={(e) => setTf({ ...tf, surname_tag: e.target.value })} />
        <input placeholder="location tag" value={tf.location_tag} onChange={(e) => setTf({ ...tf, location_tag: e.target.value })} />
        <textarea placeholder="body" value={tf.body} onChange={(e) => setTf({ ...tf, body: e.target.value })} required style={{ gridColumn: '1 / -1' }} />
        <input placeholder="haplogroup tag" value={tf.haplogroup_tag} onChange={(e) => setTf({ ...tf, haplogroup_tag: e.target.value })} />
        <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }}>Post thread</button>
      </form>
      <ul>{threads.map((t) => (<li key={t.id}><strong>{t.title}</strong> {t.surname_tag && `· ${t.surname_tag}`} {t.location_tag && `· ${t.location_tag}`}<br />{t.body}</li>))}</ul>
    </div>
  );
}
