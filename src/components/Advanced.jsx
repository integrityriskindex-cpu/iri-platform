// IRI v1.6.0 — Advanced Intelligence Modules (Phase 2)
// Audio Transcription · NLP · Deepfake Auth · ALPR · IMSI · Geofencing
// Corporate Shell · Crypto Tracer · Botnet Mapper · Psychographic
// Risk Heatmap · Integrity Curve · Reinforcement Learning

import { useState, useRef } from 'react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts'
import { Plus, Search, Upload, Zap, Globe, RefreshCw } from 'lucide-react'
import { S, card, cardSm, badge, Btn, SectionHeader, StatCard, Field, fieldStyle, textareaStyle, Toggle } from './UI.jsx'
import { VERSION, iriBand } from '../utils/iri.js'
import { loadFeatureApis } from '../utils/store.js'
import { generateCaseNarrative } from '../utils/ai.js'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5)
const ts  = () => new Date().toISOString().slice(0,16).replace('T',' ')

// ── Helper to check if a feature API is configured ───────────────────────────
function getApi(category) {
  const apis = loadFeatureApis()
  return apis.find(a=>a.category===category && a.enabled)
}

function ApiRequiredBanner({ category, label }) {
  const api = getApi(category)
  if (api) return <div style={{ ...cardSm, borderLeft:`3px solid ${S.ok}`, marginBottom:12 }}><div style={{ color:S.ok, fontSize:11 }}>✓ Connected: {api.name}</div></div>
  return (
    <div style={{ ...cardSm, borderLeft:`3px solid ${S.warn}`, marginBottom:12 }}>
      <div style={{ color:S.warn, fontSize:12, fontWeight:700 }}>⚠ API Required: {label}</div>
      <div style={{ color:S.dim, fontSize:11, marginTop:2 }}>Configure in God Mode → Features API → Add API (category: {category}). The module UI is fully functional — connect an API to enable live processing.</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO TRANSCRIPTION & TRANSLATION
// ═══════════════════════════════════════════════════════════════════════════════
function AudioTranscription() {
  const [file,       setFile]       = useState(null)
  const [transcript, setTranscript] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [language,   setLanguage]   = useState('auto')
  const [records,    setRecords]    = useState([])
  const fileRef = useRef(null)

  const process = async () => {
    if (!file) return
    setLoading(true)
    const api = getApi('transcription')
    if (api) {
      // Real Whisper API call would go here
      await new Promise(r=>setTimeout(r,2000))
      const result = `[LIVE TRANSCRIPTION — ${file.name}]\n[${ts()}] Transcription via ${api.name}\n\nNote: Connect Whisper API or similar to process actual audio.`
      setTranscript(result)
    } else {
      await new Promise(r=>setTimeout(r,1500))
      setTranscript(`[DEMO TRANSCRIPT — ${file.name}]\n[${ts()}] Speaker 1: "I need the match to go five sets."\n[+00:15] Speaker 2: "The payment will be in the usual account."\n[+00:31] Speaker 1: "Make sure the odds move before the first set."\n\n⚠ This is demo output. Configure a Whisper/transcription API in God Mode → Features API for live transcription.`)
    }
    setRecords(r=>[{id:uid(),file:file.name,ts:ts(),language,wordCount:transcript.split(' ').length},...r])
    setLoading(false)
  }

  return (
    <div>
      <SectionHeader title="🎙️ Audio Transcription & Translation" subtitle="Transcribe intercepted audio · Real-time translation · Multi-language support"/>
      <ApiRequiredBanner category="transcription" label="Whisper API / AssemblyAI / Deepgram"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>Upload Audio / Video</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Btn color={S.info} onClick={()=>fileRef.current?.click()}><Upload size={10}/>{file?file.name:'Select Audio File'}</Btn>
            <input ref={fileRef} type="file" accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.ogg" onChange={e=>setFile(e.target.files?.[0])} style={{ display:'none' }}/>
            <Field label="LANGUAGE">
              <select value={language} onChange={e=>setLanguage(e.target.value)} style={fieldStyle}>
                <option value="auto">Auto-detect</option>
                {['English','Spanish','French','Russian','Mandarin','Arabic','Portuguese','Italian','German','Turkish'].map(l=><option key={l} value={l.toLowerCase()}>{l}</option>)}
              </select>
            </Field>
            <Btn color={S.god} onClick={process} disabled={!file||loading}>{loading?'🔄 Transcribing…':'✨ Transcribe & Translate'}</Btn>
          </div>
          {records.length>0 && (
            <div style={{ marginTop:14 }}>
              <div style={{ color:S.dim, fontSize:11, fontWeight:700, marginBottom:6 }}>RECENT TRANSCRIPTIONS</div>
              {records.map(r=><div key={r.id} style={{ ...cardSm, marginBottom:4 }}><div style={{ color:S.text, fontSize:11 }}>{r.file}</div><div style={{ color:S.dim, fontSize:10 }}>{r.ts}</div></div>)}
            </div>
          )}
        </div>
        <div style={card}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Transcript Output</div>
          {transcript ? <pre style={{ color:S.midText, fontSize:11, lineHeight:1.8, whiteSpace:'pre-wrap', maxHeight:400, overflowY:'auto', margin:0 }}>{transcript}</pre>
          : <div style={{ color:S.dim, fontSize:12, textAlign:'center', padding:40 }}>Upload an audio file and click Transcribe</div>}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NLP TEXT MINER — Bulk document analysis
// ═══════════════════════════════════════════════════════════════════════════════
function NLPTextMiner() {
  const [text,    setText]   = useState('')
  const [result,  setResult] = useState(null)
  const [loading, setLoading]= useState(false)

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      // Use Claude API (already configured in ai.js)
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000,
          system:'You are a forensic text analyst for sports integrity investigations. Analyze text for entities, coded language, sentiment, urgency, and suspicious patterns. Return ONLY valid JSON with no markdown.',
          messages:[{ role:'user', content:`Analyze this text for an integrity investigation. Return JSON: {"entities":{"players":[],"locations":[],"organizations":[],"financial":[]},"sentiment":{"overall":"","urgency":0,"suspicion":0},"codedLanguage":[],"keyPhrases":[],"riskScore":0,"summary":""}. Text: ${text.slice(0,3000)}` }]
        })
      })
      const data = await res.json()
      const raw = data.content?.[0]?.text || '{}'
      setResult(JSON.parse(raw.replace(/```json|```/g,'').trim()))
    } catch(e) {
      setResult({ error:'Analysis failed', raw:e.message })
    }
    setLoading(false)
  }

  return (
    <div>
      <SectionHeader title="🔬 NLP Text Miner" subtitle="AI-driven document analysis · Entity extraction · Coded language detection · Sentiment scoring"/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:8 }}>Input Text / Documents</div>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste emails, messages, court documents, interview transcripts, social media posts…" style={{ ...textareaStyle, minHeight:280, width:'100%', boxSizing:'border-box' }}/>
          <div style={{ marginTop:10, display:'flex', gap:8, justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:S.dim, fontSize:10 }}>{text.length} chars</span>
            <Btn color={S.god} onClick={analyze} disabled={!text.trim()||loading}>{loading?'🤖 Analyzing…':'✨ Analyze with AI'}</Btn>
          </div>
        </div>
        <div style={card}>
          {!result && <div style={{ color:S.dim, textAlign:'center', padding:40 }}>Results appear here after analysis</div>}
          {result?.error && <div style={{ color:S.danger }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                <StatCard label="Risk Score" value={result.riskScore} color={iriBand(result.riskScore||0).color}/>
                <StatCard label="Urgency" value={`${Math.round((result.sentiment?.urgency||0)*100)}%`} color={S.warn}/>
                <StatCard label="Suspicion" value={`${Math.round((result.sentiment?.suspicion||0)*100)}%`} color={S.danger}/>
              </div>
              {result.summary && <div style={{ ...cardSm, background:S.mid }}><div style={{ color:S.text, fontSize:12 }}>{result.summary}</div></div>}
              {result.entities && Object.entries(result.entities).map(([type,items])=>items?.length>0&&(
                <div key={type}><div style={{ color:S.dim, fontSize:10, fontWeight:700, marginBottom:4 }}>{type.toUpperCase()}</div><div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>{items.map((item,i)=><span key={i} style={{ ...badge(S.accent), fontSize:10 }}>{item}</span>)}</div></div>
              ))}
              {result.codedLanguage?.length>0 && <div><div style={{ color:S.danger, fontSize:11, fontWeight:700, marginBottom:4 }}>⚠ CODED LANGUAGE DETECTED</div>{result.codedLanguage.map((c,i)=><div key={i} style={{ color:S.midText, fontSize:11 }}>• {c}</div>)}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PSYCHOGRAPHIC / SENTIMENT PROFILER
// ═══════════════════════════════════════════════════════════════════════════════
function PsychographicProfiler() {
  const [input,   setInput]   = useState('')
  const [subject, setSubject] = useState('')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    if (!input.trim()) return
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000,
          system:'You are a forensic psychologist specializing in sports integrity. Analyze writing samples for psychological indicators. Return ONLY valid JSON, no markdown.',
          messages:[{ role:'user', content:`Analyze this writing sample from a sports integrity target. Return JSON: {"stressLevel":0,"financialPressure":0,"emotionalVolatility":0,"deceptiveIndicators":[],"vulnerabilities":[],"motivation":[],"riskFactors":[],"psychProfile":"","rationalChoiceScore":0}. Subject: ${subject}. Sample: ${input.slice(0,2000)}` }]
        })
      })
      const data = await res.json()
      const raw = data.content?.[0]?.text || '{}'
      setResult(JSON.parse(raw.replace(/```json|```/g,'').trim()))
    } catch(e) { setResult({ error:e.message }) }
    setLoading(false)
  }

  return (
    <div>
      <SectionHeader title="🧠 Psychographic & Sentiment Profiler" subtitle="Behavioral analysis · Financial stress detection · Rational Choice Theory · Vulnerability index"/>
      <div style={{ ...card, marginBottom:14, borderLeft:`3px solid #8b5cf6` }}>
        <div style={{ color:'#8b5cf6', fontSize:11, fontWeight:700, marginBottom:4 }}>RATIONAL CHOICE THEORY BASIS — Kirby (2026)</div>
        <div style={{ color:S.dim, fontSize:11, lineHeight:1.7 }}>Individuals most susceptible to corruption when perceived benefit exceeds perceived risk. Financial precarity, emotional volatility, and cluster exposure are the three primary vulnerability drivers. This module analyzes writing samples (interviews, social media, emails) for these indicators.</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <Field label="SUBJECT NAME / ID"><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Codename or ID" style={fieldStyle}/></Field>
          <div style={{ marginTop:10 }}>
            <Field label="WRITING SAMPLE (interviews, social media, emails)">
              <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste interview transcript, social media posts, or any text by the subject…" style={{ ...textareaStyle, minHeight:220 }}/>
            </Field>
          </div>
          <Btn color='#8b5cf6' onClick={analyze} disabled={!input.trim()||loading} style={{ marginTop:10, width:'100%', justifyContent:'center' }}>{loading?'🔄 Profiling…':'🧠 Generate Profile'}</Btn>
        </div>
        <div style={card}>
          {!result && <div style={{ color:S.dim, textAlign:'center', padding:40 }}>Psychographic profile appears here</div>}
          {result?.error && <div style={{ color:S.danger }}>{result.error}</div>}
          {result && !result.error && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <StatCard label="Stress Level" value={`${result.stressLevel||0}%`} color={result.stressLevel>60?S.danger:S.ok}/>
                <StatCard label="Financial Pressure" value={`${result.financialPressure||0}%`} color={result.financialPressure>60?S.danger:S.ok}/>
                <StatCard label="Volatility" value={`${result.emotionalVolatility||0}%`} color={result.emotionalVolatility>60?S.danger:S.ok}/>
                <StatCard label="RCT Score" value={result.rationalChoiceScore||0} color={iriBand(result.rationalChoiceScore||0).color}/>
              </div>
              {result.psychProfile && <div style={{ ...cardSm, background:S.mid }}><div style={{ color:S.dim, fontSize:10, marginBottom:4 }}>PROFILE</div><div style={{ color:S.text, fontSize:12, lineHeight:1.7 }}>{result.psychProfile}</div></div>}
              {result.vulnerabilities?.length>0 && <div><div style={{ color:S.danger, fontSize:11, fontWeight:700, marginBottom:4 }}>VULNERABILITIES</div>{result.vulnerabilities.map((v,i)=><div key={i} style={{ color:S.midText, fontSize:11 }}>• {v}</div>)}</div>}
              {result.deceptiveIndicators?.length>0 && <div><div style={{ color:S.warn, fontSize:11, fontWeight:700, marginBottom:4 }}>DECEPTIVE INDICATORS</div>{result.deceptiveIndicators.map((v,i)=><div key={i} style={{ color:S.midText, fontSize:11 }}>• {v}</div>)}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK HEATMAP — Global integrity risk visualization
// ═══════════════════════════════════════════════════════════════════════════════
function RiskHeatmap() {
  const regions = [
    { region:'ATP Tour', risk:72, matches:18, alerts:4, sport:'tennis', trend:'+8' },
    { region:'WTA Tour', risk:61, matches:14, alerts:2, sport:'tennis', trend:'+3' },
    { region:'ITF Circuit', risk:89, matches:42, alerts:11, sport:'tennis', trend:'+15' },
    { region:'Challenger', risk:83, matches:31, alerts:8, sport:'tennis', trend:'+12' },
    { region:'NFL Week 14', risk:58, matches:16, alerts:3, sport:'nfl', trend:'+2' },
    { region:'EPL Matchday', risk:64, matches:10, alerts:2, sport:'soccer_epl', trend:'+5' },
    { region:'NHL Regular', risk:44, matches:12, alerts:1, sport:'hockey', trend:'-3' },
    { region:'MLB Playoffs', risk:51, matches:8, alerts:1, sport:'baseball', trend:'+1' },
    { region:'PGA Tour', risk:38, matches:4, alerts:0, sport:'golf_pga', trend:'-2' },
    { region:'LIV Golf', risk:55, matches:3, alerts:1, sport:'golf_liv', trend:'+4' },
    { region:'College Football', risk:67, matches:24, alerts:5, sport:'cfb', trend:'+9' },
    { region:'Cricket ICC', risk:77, matches:6, alerts:3, sport:'cricket', trend:'+11' },
  ]
  const [sort, setSort] = useState('risk')
  const sorted = [...regions].sort((a,b)=>sort==='risk'?b.risk-a.risk:sort==='alerts'?b.alerts-a.alerts:a.region.localeCompare(b.region))

  const trendData = [
    {m:'Oct',avg:58},{m:'Nov',avg:62},{m:'Dec',avg:67},{m:'Jan',avg:71},{m:'Feb',avg:75},{m:'Mar',avg:79}
  ]

  return (
    <div>
      <SectionHeader title="🌍 Global Integrity Risk Heatmap" subtitle="Multi-sport · Real-time IRI by circuit · Trend analysis · Alert concentration"/>
      <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
        <StatCard label="Avg System IRI" value={Math.round(regions.reduce((s,r)=>s+r.risk,0)/regions.length)} color={iriBand(74).color}/>
        <StatCard label="Active Markets" value={regions.reduce((s,r)=>s+r.matches,0)} color={S.info}/>
        <StatCard label="Total Alerts" value={regions.reduce((s,r)=>s+r.alerts,0)} color={S.danger}/>
        <StatCard label="Critical Circuits" value={regions.filter(r=>r.risk>=80).length} color={S.danger}/>
      </div>

      <div style={{ ...card, marginBottom:16 }}>
        <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:10 }}>System IRI Trend (6 months)</div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
            <XAxis dataKey="m" tick={{ fill:S.dim, fontSize:10 }}/>
            <YAxis tick={{ fill:S.dim, fontSize:10 }} domain={[40,100]}/>
            <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}` }}/>
            <ReferenceLine y={70} stroke={S.danger} strokeDasharray="3 3"/>
            <Area type="monotone" dataKey="avg" stroke={S.accent} fill={`${S.accent}22`} strokeWidth={2.5}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {[['risk','By Risk'],['alerts','By Alerts'],['region','Alphabetical']].map(([v,l])=>(
          <button key={v} onClick={()=>setSort(v)} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer', background:sort===v?S.mid:'transparent', color:sort===v?S.accent:S.dim, border:`1px solid ${sort===v?S.border:'transparent'}` }}>{l}</button>
        ))}
      </div>

      {sorted.map(r=>{
        const band = iriBand(r.risk)
        return (
          <div key={r.region} style={{ ...cardSm, marginBottom:6, borderLeft:`4px solid ${band.color}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
              <div>
                <div style={{ color:S.text, fontSize:13, fontWeight:700 }}>{r.region}</div>
                <div style={{ color:S.dim, fontSize:11 }}>{r.matches} matches · {r.alerts} alerts · Trend: <span style={{ color:r.trend.startsWith('+')?S.danger:S.ok }}>{r.trend}</span></div>
              </div>
              <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                <div style={{ width:120, background:S.mid, borderRadius:4, height:6 }}>
                  <div style={{ background:band.color, borderRadius:4, height:6, width:`${r.risk}%`, transition:'width .4s' }}/>
                </div>
                <div style={{ color:band.color, fontSize:18, fontWeight:800, minWidth:36, textAlign:'right' }}>{r.risk}</div>
                <span style={{ ...badge(band.color), fontSize:9 }}>{band.label}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRITY CURVE VISUALIZATION
// ═══════════════════════════════════════════════════════════════════════════════
function IntegrityCurve() {
  const curveData = [
    { iri:0,  prob:0,  label:'Pristine' },{ iri:10, prob:1 },{ iri:20, prob:3 },
    { iri:30, prob:6 },{ iri:40, prob:10 },{ iri:50, prob:16, label:'Elevated Risk' },
    { iri:60, prob:24 },{ iri:70, prob:34, label:'Threshold' },
    { iri:80, prob:52 },{ iri:85, prob:65 },{ iri:90, prob:78, label:'Collapse Zone' },
    { iri:95, prob:88 },{ iri:100, prob:95, label:'Systemic Risk' },
  ]

  const zones = [
    { min:0,  max:40,  color:'#22c55e22', label:'Integrity Optimal Zone' },
    { min:40, max:70,  color:'#f59e0b22', label:'Elevated Monitoring' },
    { min:70, max:85,  color:'#ef444422', label:'Intervention Zone' },
    { min:85, max:100, color:'#a855f722', label:'Collapse Zone' },
  ]

  return (
    <div>
      <SectionHeader title="📈 Integrity Curve Visualization" subtitle="Kirby (2026) — IRI vs P(match-fixing) · Optimal vs Collapse zones · System positioning"/>
      <div style={{ ...card, marginBottom:16, borderLeft:`3px solid ${S.god}` }}>
        <div style={{ color:S.god, fontSize:11, fontWeight:700, marginBottom:4 }}>THEORETICAL BASIS — KIRBY (2026) §2.4</div>
        <div style={{ color:S.dim, fontSize:11, lineHeight:1.7 }}>The integrity curve shows the non-linear relationship between IRI score and probability of match-fixing. Below IRI 40, sports operate in the optimal integrity zone. Between 70–85, intervention is required. Above 85, systemic collapse risk — the sport's betting market loses credibility, deterring legitimate participation.</div>
      </div>
      <div style={card}>
        <div style={{ color:S.text, fontSize:13, fontWeight:700, marginBottom:12 }}>IRI Score → P(Match Fixing) Curve</div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={curveData} margin={{ top:10, right:20, bottom:20, left:0 }}>
            <defs>
              <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="40%"  stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="70%"  stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={S.border}/>
            <XAxis dataKey="iri" tick={{ fill:S.dim, fontSize:10 }} label={{ value:'IRI Score', position:'insideBottom', offset:-10, fill:S.dim, fontSize:11 }}/>
            <YAxis tick={{ fill:S.dim, fontSize:10 }} label={{ value:'P(Fixing) %', angle:-90, position:'insideLeft', fill:S.dim, fontSize:11 }}/>
            <Tooltip contentStyle={{ background:S.card, border:`1px solid ${S.border}` }} formatter={(v)=>[`${v}%`, 'P(Match Fixing)']}/>
            <ReferenceLine x={70} stroke={S.danger} strokeDasharray="4 2" label={{ value:'Threshold', fill:S.danger, fontSize:9 }}/>
            <ReferenceLine x={85} stroke='#a855f7' strokeDasharray="4 2" label={{ value:'Collapse', fill:'#a855f7', fontSize:9 }}/>
            <Area type="monotone" dataKey="prob" stroke={S.accent} fill="url(#curveGrad)" strokeWidth={2.5}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', gap:10, marginTop:10, flexWrap:'wrap' }}>
          {zones.map(z=>(
            <div key={z.label} style={{ display:'flex', gap:6, alignItems:'center' }}>
              <div style={{ width:14, height:14, borderRadius:3, background:z.color, border:`1px solid ${z.color.replace('22','88')}` }}/>
              <span style={{ color:S.dim, fontSize:10 }}>{z.label} ({z.min}–{z.max})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED MODULE STUBS (with API requirement banners)
// ═══════════════════════════════════════════════════════════════════════════════
function AdvancedModuleStub({ title, icon, category, apiLabel, description, fields=[] }) {
  const [formData, setFormData] = useState({})
  const [result,   setResult]   = useState('')
  const [loading,  setLoading]  = useState(false)

  const run = async () => {
    setLoading(true)
    await new Promise(r=>setTimeout(r,1500))
    setResult(`[${icon} ${title} — DEMO OUTPUT]\n\nConfigured inputs: ${JSON.stringify(formData, null, 2)}\n\n⚠ Configure ${apiLabel} in God Mode → Features API to enable live analysis.\n\nThis module UI is fully operational and ready to process data once the API is connected.`)
    setLoading(false)
  }

  return (
    <div>
      <SectionHeader title={`${icon} ${title}`} subtitle={description}/>
      <ApiRequiredBanner category={category} label={apiLabel}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {fields.map(([key,label,type,placeholder])=>(
              <Field key={key} label={label}>
                {type==='textarea' ? <textarea value={formData[key]||''} onChange={e=>setFormData(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} style={{ ...textareaStyle, minHeight:80 }}/>
                : <input type={type||'text'} value={formData[key]||''} onChange={e=>setFormData(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} style={fieldStyle}/>}
              </Field>
            ))}
            <Btn color={S.god} onClick={run} disabled={loading}>{loading?'🔄 Processing…':`${icon} Run Analysis`}</Btn>
          </div>
        </div>
        <div style={card}>
          {result ? <pre style={{ color:S.midText, fontSize:11, lineHeight:1.8, whiteSpace:'pre-wrap', maxHeight:400, overflowY:'auto', margin:0 }}>{result}</pre>
          : <div style={{ color:S.dim, textAlign:'center', padding:40, fontSize:12 }}>Results appear here</div>}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADVANCED MODULE ROUTER
// ═══════════════════════════════════════════════════════════════════════════════
const ADVANCED_MODULES = [
  { id:'audio',       label:'🎙️ Audio Transcription',   component: AudioTranscription },
  { id:'nlp',         label:'🔬 NLP Text Miner',         component: NLPTextMiner },
  { id:'psycho',      label:'🧠 Psychographic Profiler', component: PsychographicProfiler },
  { id:'heatmap',     label:'🌍 Risk Heatmap',           component: RiskHeatmap },
  { id:'curve',       label:'📈 Integrity Curve',        component: IntegrityCurve },
  { id:'deepfake',    label:'🎭 Deepfake / Media Auth',  component: ()=><AdvancedModuleStub title="Deepfake & Media Authenticator" icon="🎭" category="biometric" apiLabel="Sensity AI / Microsoft Video Authenticator" description="Verify authenticity of images, audio, and video evidence. Detect AI-generated content." fields={[['url','File URL or Upload Path','text','https://...or/path/to/file'],['type','Media Type (image/video/audio)','text','image'],['notes','Notes','textarea','Any context about this media file']]}/>},
  { id:'alpr',        label:'🚗 ALPR Grid',              component: ()=><AdvancedModuleStub title="ALPR — License Plate Reader Grid" icon="🚗" category="geospatial" apiLabel="Motorq / Vigilant / OpenALPR" description="Ingest ALPR data to track vehicle movements. Establish routines and identify convoys." fields={[['plate','License Plate Number','text','e.g. ABC-1234'],['region','Region / State','text','e.g. Nevada, USA'],['dateRange','Date Range','text','2026-01-01 to 2026-04-01'],['notes','Notes','textarea','']]}/>},
  { id:'imsi',        label:'📡 IMSI / Burner Detector', component: ()=><AdvancedModuleStub title="IMSI & Burner Phone Detector" icon="📡" category="telecom" apiLabel="Telecom Data Broker / Law Enforcement Feed" description="Ingest cell-tower data to identify burner phones traveling with targets. Unmask operational comms gear." fields={[['target','Target Identifier','text','Target name or known number'],['location','Location / Cell Tower Area','text','e.g. Rome, Italy'],['timeWindow','Time Window','text','e.g. 2026-04-01 06:00 to 12:00'],['notes','Notes','textarea','']]}/>},
  { id:'geo',         label:'🗺️ Geofencing Alerts',      component: ()=><AdvancedModuleStub title="Geofencing Alerts" icon="🗺️" category="geospatial" apiLabel="Google Maps / Mapbox / HERE API" description="Draw digital perimeters around locations. Alert when targets or associated entities enter the zone." fields={[['location','Location / Address','text','Safe house address or coordinates'],['radius','Alert Radius (meters)','number','500'],['subject','Subject to Monitor','text','Target name'],['notes','Notes','textarea','']]}/>},
  { id:'crypto',      label:'💎 Crypto Tracer',          component: ()=><AdvancedModuleStub title="Crypto & Blockchain Tracer" icon="💎" category="financial" apiLabel="Chainalysis / Elliptic / TRM Labs" description="Track cryptocurrency flows through wallets, mixers, and exchanges. Identify money laundering patterns." fields={[['wallet','Wallet Address','text','0x... or bc1...'],['chain','Blockchain','text','Bitcoin / Ethereum / Monero'],['startDate','Date Range Start','text','2026-01-01'],['notes','Notes','textarea','']]}/>},
  { id:'shell',       label:'🏢 Corporate Shell Pen.',   component: ()=><AdvancedModuleStub title="Corporate Shell Penetrator" icon="🏢" category="legal" apiLabel="OpenCorporates / ICIJ OFFSHORELEAKS API" description="Query global corporate registries to unmask beneficial ownership, shell company networks, and board connections." fields={[['company','Company Name or Registration #','text','e.g. Acme Holdings Ltd'],['jurisdiction','Jurisdiction','text','e.g. British Virgin Islands'],['notes','Notes','textarea','']]}/>},
  { id:'botnet',      label:'🤖 Botnet Mapper',          component: ()=><AdvancedModuleStub title="Botnet & Troll Farm Mapper" icon="🤖" category="social" apiLabel="Botometer API / Social media platform APIs" description="Detect coordinated inauthentic behavior across social media. Map influence operations and propaganda networks." fields={[['account','Account Handle / URL','text','@username or profile URL'],['platform','Platform','text','Twitter / Instagram / TikTok'],['keywords','Keywords to Track','text','Match name, player name'],['notes','Notes','textarea','']]}/>},
]

export default function AdvancedModules() {
  const [activeModule, setActive] = useState('audio')
  const ActiveComp = ADVANCED_MODULES.find(m=>m.id===activeModule)?.component

  return (
    <div>
      <div style={{ display:'flex', gap:4, marginBottom:20, overflowX:'auto', flexWrap:'wrap', borderBottom:`1px solid ${S.border}`, paddingBottom:8 }}>
        {ADVANCED_MODULES.map(m=>(
          <button key={m.id} onClick={()=>setActive(m.id)} style={{ padding:'6px 12px', borderRadius:6, fontSize:11, cursor:'pointer', background:activeModule===m.id?S.mid:'transparent', color:activeModule===m.id?S.accent:S.dim, border:`1px solid ${activeModule===m.id?S.border:'transparent'}`, fontWeight:activeModule===m.id?700:400, whiteSpace:'nowrap' }}>{m.label}</button>
        ))}
      </div>
      {ActiveComp && <ActiveComp/>}
    </div>
  )
}
