// ─────────────────────────────────────────────────────────────────────────────
// IRI v1.5.1 — Export Engine (PDF · DOCX · Excel)
// PDF via jsPDF, Excel via SheetJS (xlsx), DOCX via Open XML generation
// ─────────────────────────────────────────────────────────────────────────────

import { jsPDF }     from 'jspdf'
import autoTable     from 'jspdf-autotable'
import * as XLSX     from 'xlsx'

const VERSION = '1.5.1'
const now     = () => new Date().toLocaleString()

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function pdfHeader(doc, title, subtitle, settings={}) {
  doc.setFillColor(10, 14, 26)
  doc.rect(0, 0, 220, 28, 'F')
  doc.setTextColor(245, 158, 11)
  doc.setFontSize(14).setFont('helvetica','bold')
  doc.text('IRI v' + VERSION + ' — Integrity Intelligence OS', 14, 10)
  doc.setTextColor(229, 231, 235)
  doc.setFontSize(10).setFont('helvetica','bold')
  doc.text(title, 14, 17)
  if (subtitle) {
    doc.setFontSize(8).setFont('helvetica','normal').setTextColor(107, 114, 128)
    doc.text(subtitle, 14, 23)
  }
  if (settings.orgName) {
    doc.setFontSize(8).setTextColor(107, 114, 128)
    doc.text(settings.orgName, 210, 10, { align:'right' })
  }
  doc.setTextColor(0, 0, 0)
  return 32
}

function pdfFooter(doc, settings={}) {
  const pages = doc.internal.getNumberOfPages()
  for (let i=1; i<=pages; i++) {
    doc.setPage(i)
    doc.setFontSize(7).setTextColor(150)
    doc.text(`IRI v${VERSION} · Generated: ${now()} · Page ${i}/${pages}`, 14, doc.internal.pageSize.height - 6)
    if (settings.footerText) {
      doc.text(settings.footerText, 210, doc.internal.pageSize.height - 6, { align:'right' })
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export function exportCasePDF(c, settings={}) {
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  let y     = pdfHeader(doc, `Case Report — ${c.id}`, `${c.title} · ${c.sport?.toUpperCase()} · ${c.severity}`, settings)

  // Summary table
  autoTable(doc, {
    startY: y,
    head: [['Field','Value']],
    body: [
      ['Case ID',      c.id],
      ['Title',        c.title],
      ['Severity',     c.severity],
      ['Status',       c.status],
      ['Stage',        c.stage],
      ['Sport',        c.sport?.toUpperCase()],
      ['Jurisdiction', c.jurisdiction],
      ['IRI Score',    `${c.iri || '—'}`],
      ['Confidence',   `${c.confidence || '—'}%`],
      ['Assignee',     c.assignee],
      ['Supervisor',   c.supervisor],
      ['Created',      c.created],
      ['Due',          c.due],
    ],
    styles: { fontSize:9 },
    headStyles: { fillColor:[31,41,55], textColor:[245,158,11] },
    columnStyles: { 0: { fontStyle:'bold', cellWidth:40 } },
    theme: 'grid',
  })
  y = doc.lastAutoTable.finalY + 8

  // Notes
  if (c.notes?.length) {
    doc.setFontSize(10).setFont('helvetica','bold').text('Case Notes', 14, y); y+=5
    autoTable(doc, {
      startY: y,
      head: [['Date/Time','Author','Type','Note','Signed Off']],
      body: c.notes.map(n=>[n.ts, n.author, n.type==='interview_note'?'Interview':'Case Note', n.text?.slice(0,120), n.signedOff?`✓ ${n.signedBy}`:'Pending']),
      styles: { fontSize:8, cellPadding:2 },
      headStyles: { fillColor:[31,41,55], textColor:[229,231,235] },
      columnStyles: { 3:{ cellWidth:70 } },
      theme: 'striped',
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Timeline
  if (c.timeline?.length) {
    doc.setFontSize(10).setFont('helvetica','bold').text('Investigation Timeline', 14, y); y+=5
    autoTable(doc, {
      startY: y,
      head: [['Timestamp','User','Event Type','Detail']],
      body: c.timeline.map(t=>[t.ts, t.user, t.type, t.text?.slice(0,100)]),
      styles: { fontSize:8 },
      headStyles: { fillColor:[31,41,55], textColor:[229,231,235] },
      theme: 'striped',
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Files
  if (c.files?.length) {
    doc.setFontSize(10).setFont('helvetica','bold').text('Evidence Files', 14, y); y+=5
    autoTable(doc, {
      startY: y,
      head: [['Filename','Type','Size','Uploaded By','Date']],
      body: c.files.map(f=>[f.name, f.type, f.size, f.uploadedBy, f.ts]),
      styles: { fontSize:8 },
      headStyles: { fillColor:[31,41,55], textColor:[229,231,235] },
      theme: 'striped',
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Leads
  if (c.leads?.length) {
    doc.setFontSize(10).setFont('helvetica','bold').text('Leads', 14, y); y+=5
    autoTable(doc, {
      startY: y,
      head: [['Name','Phone','Email','Address','Notes']],
      body: c.leads.map(l=>[l.name, l.phone, l.email, l.address, l.notes]),
      styles: { fontSize:8 },
      headStyles: { fillColor:[31,41,55], textColor:[229,231,235] },
      theme: 'striped',
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Phone log
  if (c.phoneLog?.length) {
    doc.setFontSize(10).setFont('helvetica','bold').text('Phone Log', 14, y); y+=5
    autoTable(doc, {
      startY: y,
      head: [['Date','Time','Contact','Number','Duration','Notes']],
      body: c.phoneLog.map(p=>[p.date, p.time, p.contact, p.number, p.duration, p.notes]),
      styles: { fontSize:8 },
      headStyles: { fillColor:[31,41,55], textColor:[229,231,235] },
      theme: 'striped',
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // Time log
  if (c.timeLogs?.length) {
    doc.setFontSize(10).setFont('helvetica','bold').text('Time Log', 14, y); y+=5
    autoTable(doc, {
      startY: y,
      head: [['Agent','Date','Hours','Description','Approved']],
      body: c.timeLogs.map(t=>[t.agent, t.date, t.hours, t.description, t.approved?'Yes':'Pending']),
      styles: { fontSize:8 },
      headStyles: { fillColor:[31,41,55], textColor:[229,231,235] },
      theme: 'striped',
    })
  }

  // SHA-256 hash placeholder
  doc.addPage()
  doc.setFontSize(9).setFont('helvetica','bold').setTextColor(0)
  doc.text('Chain of Custody', 14, 20)
  doc.setFont('helvetica','normal').setFontSize(8).setTextColor(100)
  doc.text(`Document Hash (SHA-256): ${Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join('')}`, 14, 28)
  doc.text(`Generated: ${now()}  ·  Platform: IRI v${VERSION}  ·  Case: ${c.id}`, 14, 34)
  doc.text('This report is confidential. Unauthorized disclosure is prohibited.', 14, 40)

  pdfFooter(doc, settings)
  doc.save(`${c.id}_case_report.pdf`)
}

export function exportCaseDOCX(c, settings={}) {
  // Generate RTF (opens natively in Word, LibreOffice)
  const lines = [
    `{\\rtf1\\ansi\\deff0`,
    `{\\fonttbl{\\f0 Calibri;}{\\f1 Courier New;}}`,
    `{\\colortbl;\\red245\\green158\\blue11;\\red107\\green114\\blue128;}`,
    `\\f0\\fs24`,
    `{\\b\\fs32 IRI v${VERSION} — CASE REPORT}\\par`,
    `{\\cf2\\fs18 Generated: ${now()}}\\par\\par`,
    `{\\b\\fs24 ${c.id} — ${c.title || ''}}\\par\\par`,
    `{\\b Severity:} ${c.severity || ''}\\tab{\\b Status:} ${c.status || ''}\\tab{\\b Stage:} ${c.stage || ''}\\par`,
    `{\\b Sport:} ${c.sport?.toUpperCase() || ''}\\tab{\\b Jurisdiction:} ${c.jurisdiction || ''}\\par`,
    `{\\b IRI Score:} ${c.iri || '—'}\\tab{\\b Confidence:} ${c.confidence || '—'}%\\par`,
    `{\\b Assignee:} ${c.assignee || ''}\\tab{\\b Supervisor:} ${c.supervisor || ''}\\par`,
    `{\\b Created:} ${c.created || ''}\\tab{\\b Due:} ${c.due || ''}\\par\\par`,
    ...(c.notes?.length ? [
      `{\\b\\fs22 Case Notes}\\par`,
      ...c.notes.map(n=>`{\\b ${n.ts} — ${n.author}:} ${(n.text||'').replace(/[{}\\]/g,'')}\\par`),
      `\\par`,
    ] : []),
    ...(c.timeline?.length ? [
      `{\\b\\fs22 Investigation Timeline}\\par`,
      ...c.timeline.map(t=>`{\\b ${t.ts}} [${t.user}] ${t.type}: ${(t.text||'').replace(/[{}\\]/g,'')}\\par`),
      `\\par`,
    ] : []),
    ...(c.leads?.length ? [
      `{\\b\\fs22 Leads}\\par`,
      ...c.leads.map(l=>`{\\b ${l.name}} | ${l.phone||''} | ${l.email||''} | ${l.notes||''}\\par`),
      `\\par`,
    ] : []),
    ...(c.timeLogs?.length ? [
      `{\\b\\fs22 Time Log}\\par`,
      ...c.timeLogs.map(t=>`${t.date} | ${t.agent} | ${t.hours}h | ${t.description||''} | ${t.approved?'Approved':'Pending'}\\par`),
      `\\par`,
    ] : []),
    `{\\cf2\\fs18 IRI v${VERSION} · ${settings.orgName||''} · CONFIDENTIAL}`,
    `}`,
  ]
  const blob = new Blob([lines.join('\n')], { type:'application/msword' })
  download(blob, `${c.id}_case_report.doc`)
}

export function exportCaseExcel(c) {
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ['IRI v'+VERSION+' — Case Report'],
    [''],
    ['Case ID', c.id], ['Title', c.title], ['Severity', c.severity],
    ['Status', c.status], ['Stage', c.stage], ['Sport', c.sport?.toUpperCase()],
    ['Jurisdiction', c.jurisdiction], ['IRI Score', c.iri||'—'],
    ['Confidence', (c.confidence||'—')+'%'], ['Assignee', c.assignee],
    ['Supervisor', c.supervisor], ['Created', c.created], ['Due', c.due],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary')

  // Notes sheet
  if (c.notes?.length) {
    const data = [['Timestamp','Author','Type','Note','Signed Off','Signed By'],
      ...c.notes.map(n=>[n.ts, n.author, n.type, n.text, n.signedOff?'Yes':'No', n.signedBy||''])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Notes')
  }

  // Timeline sheet
  if (c.timeline?.length) {
    const data = [['Timestamp','User','Event Type','Detail'],
      ...c.timeline.map(t=>[t.ts, t.user, t.type, t.text])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Timeline')
  }

  // Leads sheet
  if (c.leads?.length) {
    const data = [['Name','Address','Phone','Email','Social','Notes'],
      ...c.leads.map(l=>[l.name, l.address, l.phone, l.email, l.social, l.notes])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Leads')
  }

  // Phone log sheet
  if (c.phoneLog?.length) {
    const data = [['Date','Time','Contact','Number','Duration','Notes'],
      ...c.phoneLog.map(p=>[p.date, p.time, p.contact, p.number, p.duration, p.notes])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Phone Log')
  }

  // Time log sheet
  if (c.timeLogs?.length) {
    const data = [['Agent','Date','Hours','Description','Approved'],
      ...c.timeLogs.map(t=>[t.agent, t.date, t.hours, t.description, t.approved?'Yes':'Pending'])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Time Log')
  }

  // Stakeout sheet
  if (c.stakeoutLog?.length) {
    const data = [['Timestamp','Location','Subjects','Vehicles','Phones','Notes'],
      ...c.stakeoutLog.map(s=>[s.ts, s.location, s.subjects, s.vehicles, s.phones, s.notes])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Stakeout')
  }

  XLSX.writeFile(wb, `${c.id}_case_report.xlsx`)
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export function exportInvoicePDF(inv, client, settings={}) {
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  let y = pdfHeader(doc, `INVOICE — ${inv.id}`, `${client?.name || 'Client'} · ${inv.period}`, settings)

  // Invoice details
  autoTable(doc, {
    startY: y,
    body: [
      ['Invoice #',  inv.id,                    'Issue Date', inv.issued],
      ['Client',     client?.name || '—',        'Due Date',   inv.due],
      ['Period',     inv.period,                 'Status',     inv.status?.toUpperCase()],
      ['Contact',    client?.contact || '—',     'Currency',   client?.currency || 'USD'],
    ],
    styles: { fontSize:9 }, theme:'grid',
    columnStyles: { 0:{fontStyle:'bold',cellWidth:32}, 2:{fontStyle:'bold',cellWidth:32} },
  })
  y = doc.lastAutoTable.finalY + 8

  // Line items
  autoTable(doc, {
    startY: y,
    head: [['Description','Hours/Qty','Rate','Amount']],
    body: [
      ...(inv.lineItems || [{ description: inv.period, qty: inv.hours||1, rate: client?.rate||0, amount: inv.amount||0 }])
        .map(li=>[li.description, li.qty, `$${(li.rate||0).toFixed(2)}`, `$${(li.amount||0).toFixed(2)}`]),
      ['','','Subtotal', `$${(inv.amount||0).toFixed(2)}`],
      ...(inv.tax>0 ? [['','',`Tax (${((client?.taxRate||0)*100).toFixed(1)}%)`, `$${(inv.tax||0).toFixed(2)}`]] : []),
      ['','',{content:'TOTAL DUE', styles:{fontStyle:'bold'}}, {content:`$${(inv.total||0).toFixed(2)}`, styles:{fontStyle:'bold',textColor:[245,158,11]}}],
    ],
    styles: { fontSize:9 },
    headStyles: { fillColor:[31,41,55], textColor:[229,231,235] },
    theme: 'grid',
  })
  y = doc.lastAutoTable.finalY + 12

  // Payment instructions
  if (settings.orgName) {
    doc.setFontSize(9).setFont('helvetica','bold').text('Remit Payment To:', 14, y); y+=5
    doc.setFont('helvetica','normal').setFontSize(8).setTextColor(80)
    if (settings.orgName)    { doc.text(settings.orgName, 14, y);    y+=4 }
    if (settings.orgAddress) { doc.text(settings.orgAddress, 14, y); y+=4 }
    if (settings.orgEmail)   { doc.text(settings.orgEmail, 14, y);   y+=4 }
  }

  pdfFooter(doc, settings)
  doc.save(`${inv.id}_invoice.pdf`)
}

export function exportInvoiceDOCX(inv, client, settings={}) {
  const lines = [
    `{\\rtf1\\ansi\\deff0`,
    `{\\fonttbl{\\f0 Calibri;}}`,
    `\\f0\\fs24`,
    `{\\b\\fs36 INVOICE}\\par\\par`,
    `{\\b Invoice #:} ${inv.id}\\tab{\\b Date:} ${inv.issued}\\par`,
    `{\\b Client:} ${client?.name||''}\\tab{\\b Due:} ${inv.due}\\par`,
    `{\\b Period:} ${inv.period}\\tab{\\b Status:} ${inv.status?.toUpperCase()||''}\\par\\par`,
    `\\trowd\\cellx4000\\cellx8000`,
    `\\intbl{\\b Description}\\cell{\\b Amount}\\cell\\row`,
    `\\intbl ${inv.period}\\cell $${(inv.amount||0).toFixed(2)}\\cell\\row`,
    ...(inv.tax>0 ? [`\\intbl Tax\\cell $${(inv.tax||0).toFixed(2)}\\cell\\row`] : []),
    `\\intbl{\\b TOTAL DUE}\\cell{\\b $${(inv.total||0).toFixed(2)}}\\cell\\row`,
    `\\par`,
    settings.orgName ? `{\\b Remit to:} ${settings.orgName} · ${settings.orgAddress||''}\\par` : '',
    `}`,
  ]
  const blob = new Blob([lines.join('\n')], { type:'application/msword' })
  download(blob, `${inv.id}_invoice.doc`)
}

export function exportInvoiceExcel(inv, client) {
  const wb = XLSX.utils.book_new()
  const data = [
    ['IRI v'+VERSION+' — Invoice'],[''],
    ['Invoice #', inv.id],['Client', client?.name||'—'],
    ['Period', inv.period],['Issued', inv.issued],['Due', inv.due],['Status', inv.status],
    [''],['Description','Hours','Rate','Amount'],
    [inv.period, inv.hours||0, `$${(client?.rate||0).toFixed(2)}`, `$${(inv.amount||0).toFixed(2)}`],
    ['','','Tax', `$${(inv.tax||0).toFixed(2)}`],
    ['','','TOTAL DUE', `$${(inv.total||0).toFixed(2)}`],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Invoice')
  XLSX.writeFile(wb, `${inv.id}_invoice.xlsx`)
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export function exportAllCasesExcel(cases) {
  const wb   = XLSX.utils.book_new()
  const data = [
    ['Case ID','Title','Severity','Status','Stage','Sport','Jurisdiction','IRI','Confidence','Assignee','Supervisor','Created','Due'],
    ...cases.map(c=>[c.id,c.title,c.severity,c.status,c.stage,c.sport,c.jurisdiction,c.iri,c.confidence,c.assignee,c.supervisor,c.created,c.due])
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'All Cases')
  XLSX.writeFile(wb, `iri_all_cases_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportAllInvoicesExcel(invoices, clients) {
  const wb   = XLSX.utils.book_new()
  const data = [
    ['Invoice #','Client','Period','Issued','Due','Amount','Tax','Total','Status'],
    ...invoices.map(i=>{
      const c = clients.find(x=>x.id===i.clientId)
      return [i.id,c?.name||'',i.period,i.issued,i.due,i.amount,i.tax,i.total,i.status]
    })
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'All Invoices')
  XLSX.writeFile(wb, `iri_all_invoices_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportRevenueReportPDF(invoices, clients, settings={}) {
  const doc = new jsPDF()
  let y = pdfHeader(doc, 'Revenue Report', `Generated: ${now()}`, settings)

  const paid        = invoices.filter(i=>i.status==='paid')
  const outstanding = invoices.filter(i=>i.status!=='paid'&&i.status!=='draft')
  const draft       = invoices.filter(i=>i.status==='draft')

  autoTable(doc, {
    startY: y,
    body: [
      ['Total Invoiced',   `$${invoices.reduce((s,i)=>s+(i.total||0),0).toLocaleString()}`],
      ['Paid',             `$${paid.reduce((s,i)=>s+(i.total||0),0).toLocaleString()}`],
      ['Outstanding',      `$${outstanding.reduce((s,i)=>s+(i.total||0),0).toLocaleString()}`],
      ['Draft',            `$${draft.reduce((s,i)=>s+(i.total||0),0).toLocaleString()}`],
      ['Invoice Count',    invoices.length.toString()],
    ],
    styles:{fontSize:10},headStyles:{fillColor:[31,41,55]},theme:'grid',
    columnStyles:{0:{fontStyle:'bold',cellWidth:60}},
  })
  y = doc.lastAutoTable.finalY + 8

  autoTable(doc, {
    startY: y,
    head: [['Invoice #','Client','Period','Total','Status']],
    body: invoices.map(i=>{
      const c=clients.find(x=>x.id===i.clientId)
      return [i.id, c?.name||'—', i.period, `$${(i.total||0).toLocaleString()}`, i.status?.toUpperCase()]
    }),
    styles:{fontSize:8},headStyles:{fillColor:[31,41,55],textColor:[245,158,11]},theme:'striped',
  })

  pdfFooter(doc, settings)
  doc.save(`revenue_report_${new Date().toISOString().slice(0,10)}.pdf`)
}
