const state = {
  stage: "t3",
  focus: "Europe",
  title: "Regional revenue performance",
  reference: null,
  comparisonMode: "comparison",
  chartType: "line",
  t1Gallery: false,
  t1Selections: { comparison: 0, view: 0 },
  style: {
    color: "professional_cool",
    emphasis: "moderate",
    annotation: "key_callouts",
    density: "balanced",
    message: "takeaway_framing",
    ordering: "natural_chronological",
    category: "color+subtle_shape"
  }
};

const data = {
  NorthAmerica: [46, 53, 57, 64],
  Europe: [42, 48, 52, 61],
  APAC: [30, 39, 46, 58],
  LATAM: [24, 29, 33, 38]
};

const colors = { NorthAmerica: "#255fdd", Europe: "#18a29a", APAC: "#f0ba3f", LATAM: "#9aa6ad" };
const pretty = { NorthAmerica: "North America", Europe: "Europe", APAC: "APAC", LATAM: "LATAM" };
const el = id => document.getElementById(id);

function linePath(values, w = 720, h = 270) {
  const x = i => 55 + i * ((w - 100) / 3);
  const y = v => h - 30 - ((v - 20) / 50) * (h - 55);
  return values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
}

function mainChart(kind = state.chartType) {
  const focus = state.focus;
  const ordered = Object.keys(data).sort(k => k === focus ? 1 : -1);
  const w = 760, h = 310;
  const x = i => 58 + i * ((w - 118) / 3);
  const y = v => h - 36 - ((v - 20) / 50) * (h - 70);
  const grid = [20, 30, 40, 50, 60, 70].map(v => `<line class="grid" x1="55" y1="${y(v)}" x2="720" y2="${y(v)}"/><text class="axis-label" x="44" y="${y(v)+3}" text-anchor="end">$${v}M</text>`).join("");
  const quarters = ["Q1", "Q2", "Q3", "Q4"].map((q,i)=>`<text class="axis-label" x="${x(i)}" y="296" text-anchor="middle">${q}</text>`).join("");
  const paths = ordered.map(k => {
    const active = k === focus;
    const pts = data[k].map((v,i)=>`<circle class="mark" data-focus="${k}" cx="${x(i)}" cy="${y(v)}" r="${active?4.6:3}" fill="${colors[k]}" opacity="${active?1:.72}"/>`).join("");
    return `<path class="line ${active?"focus-line":""}" d="${linePath(data[k], w, h)}" stroke="${colors[k]}" opacity="${active?1:.62}"/><path class="hit-line" data-focus="${k}" d="${linePath(data[k], w, h)}"/>${pts}<text class="focus-label" x="728" y="${y(data[k][3])+3}" fill="${colors[k]}">${pretty[k]}</text>${active?`<text class="value-label" x="${x(3)-8}" y="${y(data[k][3])-12}" text-anchor="middle" fill="${colors[k]}">$${data[k][3]}M</text>`:""}`;
  }).join("");
  const ref = state.reference ? `<line class="reference-line" x1="55" y1="${y(state.reference)}" x2="720" y2="${y(state.reference)}"/><rect x="58" y="${y(state.reference)-18}" width="101" height="15" rx="4" fill="#fff3ef"/><text class="reference-label" x="64" y="${y(state.reference)-7}">REFERENCE · $${state.reference}M</text>` : "";
  const groups = Object.keys(data);
  let plot = `${grid}${quarters}${ref}${paths}`;
  let description = "Quarterly regional revenue line chart";
  let subtitle = "Net revenue ($M) · FY26 quarterly result";

  if (kind === "area") {
    plot = `${grid}${quarters}${ref}${ordered.map(k => {
      const base = y(20);
      const points = data[k].map((v,i)=>`${x(i)},${y(v)}`).join(" ");
      return `<path d="M${x(0)},${base} L${points.replaceAll(" ", " L")} L${x(3)},${base} Z" fill="${colors[k]}" opacity="${k===focus?.18:.07}" stroke="none"/><path class="line ${k===focus?'focus-line':''}" d="${linePath(data[k],w,h)}" stroke="${colors[k]}" opacity="${k===focus?1:.6}"/><text class="focus-label" x="728" y="${y(data[k][3])+3}" fill="${colors[k]}">${pretty[k]}</text>`;
    }).join("")}`;
    description = "Quarterly regional revenue area chart";
  }

  if (kind === "bar" || kind === "stacked") {
    const barW = kind === "stacked" ? 58 : 24;
    plot = `${grid}${quarters}${ref}${[0,1,2,3].map((qi) => {
      if (kind === "stacked") {
        let cursor = y(20);
        return groups.map(k => {
          const segment = (data[k][qi] / 210) * 170;
          cursor -= segment;
          return `<rect class="mark" data-focus="${k}" x="${x(qi)-barW/2}" y="${cursor}" width="${barW}" height="${segment}" rx="2" fill="${colors[k]}" opacity="${k===focus?1:.68}"/>`;
        }).join("");
      }
      return groups.map((k,ki) => {
        const bx = x(qi) - 50 + ki * 26;
        return `<rect class="mark" data-focus="${k}" x="${bx}" y="${y(data[k][qi])}" width="${barW}" height="${y(20)-y(data[k][qi])}" rx="3" fill="${colors[k]}" opacity="${k===focus?1:.62}"/>`;
      }).join("");
    }).join("")}`;
    description = kind === "stacked" ? "Stacked quarterly regional revenue chart" : "Grouped quarterly regional revenue bar chart";
  }

  if (kind === "dot") {
    const targets = [60, 58, 55, 42];
    const rowY = i => 58 + i * 58;
    const valueX = v => 190 + ((v - 20) / 50) * 500;
    plot = `${groups.map((k,i)=>`<text class="axis-label" x="174" y="${rowY(i)+3}" text-anchor="end">${pretty[k]}</text><line class="grid" x1="190" y1="${rowY(i)}" x2="690" y2="${rowY(i)}"/><line x1="${valueX(targets[i])}" y1="${rowY(i)}" x2="${valueX(data[k][3])}" y2="${rowY(i)}" stroke="${colors[k]}" stroke-width="3" opacity=".5"/><circle cx="${valueX(targets[i])}" cy="${rowY(i)}" r="6" fill="white" stroke="#7e8990" stroke-width="2"/><circle class="mark" data-focus="${k}" cx="${valueX(data[k][3])}" cy="${rowY(i)}" r="7" fill="${colors[k]}"/><text class="value-label" x="${valueX(data[k][3])+12}" y="${rowY(i)+3}" fill="${colors[k]}">$${data[k][3]}M</text>`).join("")}<text class="axis-label" x="190" y="292">$20M</text><text class="axis-label" x="690" y="292" text-anchor="end">$70M</text>`;
    description = "Regional actual versus target dot plot";
    subtitle = "Q4 actual versus target · Net revenue ($M)";
  }

  if (kind === "slope") {
    const leftX = 210, rightX = 610;
    plot = `<line class="grid" x1="${leftX}" y1="38" x2="${leftX}" y2="270"/><line class="grid" x1="${rightX}" y1="38" x2="${rightX}" y2="270"/><text class="axis-label" x="${leftX}" y="294" text-anchor="middle">Q1</text><text class="axis-label" x="${rightX}" y="294" text-anchor="middle">Q4</text>${ordered.map(k=>`<path class="line ${k===focus?'focus-line':''}" d="M${leftX},${y(data[k][0])} L${rightX},${y(data[k][3])}" stroke="${colors[k]}" opacity="${k===focus?1:.62}"/><circle class="mark" data-focus="${k}" cx="${leftX}" cy="${y(data[k][0])}" r="4" fill="${colors[k]}"/><circle class="mark" data-focus="${k}" cx="${rightX}" cy="${y(data[k][3])}" r="4" fill="${colors[k]}"/><text class="focus-label" x="${rightX+12}" y="${y(data[k][3])+3}" fill="${colors[k]}">${pretty[k]} · $${data[k][3]}M</text>`).join("")}`;
    description = "Q1 to Q4 regional revenue slope chart";
  }

  return `
    <div class="chart-head">
      <div><h2>${state.title}<button id="editTitle" title="Choose a takeaway title"><svg viewBox="0 0 24 24"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Zm10-12 3 3"/></svg></button></h2><p>${subtitle}</p></div>
      <div class="legend">${Object.keys(data).map(k=>`<span><i style="background:${colors[k]}"></i>${pretty[k]}</span>`).join("")}</div>
    </div>
    <svg class="plot" viewBox="0 0 ${w} ${h}" role="img" aria-label="${description}">
      ${plot}
      <text class="axis-title" x="55" y="13">NET REVENUE</text>
    </svg>`;
}

function chartThumb(kind, color = "#255fdd") {
  if (kind === "bar") return `<svg viewBox="0 0 120 70"><path d="M15 60h95M15 12v48" stroke="#d8dfe2"/><rect x="25" y="34" width="12" height="26" rx="2" fill="${color}" stroke="none"/><rect x="46" y="22" width="12" height="38" rx="2" fill="#18a29a" stroke="none"/><rect x="67" y="29" width="12" height="31" rx="2" fill="#f0ba3f" stroke="none"/><rect x="88" y="15" width="12" height="45" rx="2" fill="#93a0a8" stroke="none"/></svg>`;
  if (kind === "area") return `<svg viewBox="0 0 120 70"><path d="M12 58h100M12 10v48" stroke="#d8dfe2"/><path d="M14 54 37 41 60 44 83 24 108 16v42H14Z" fill="#dfe8ff" stroke="none"/><path d="M14 54 37 41 60 44 83 24 108 16" stroke="${color}" stroke-width="2"/></svg>`;
  if (kind === "dot") return `<svg viewBox="0 0 120 70"><path d="M14 58h98" stroke="#d8dfe2"/>${[23,45,68,92].map((x,i)=>`<line x1="${x}" y1="18" x2="${x}" y2="58" stroke="#edf0f1"/><circle cx="${x}" cy="${[45,30,38,18][i]}" r="5" fill="${[color,"#18a29a","#f0ba3f","#93a0a8"][i]}" stroke="none"/>`).join("")}</svg>`;
  return `<svg viewBox="0 0 120 70"><path d="M12 58h100M12 10v48" stroke="#d8dfe2"/><path d="M14 50 39 42 64 31 108 17" stroke="${color}" stroke-width="2.3"/>${[[14,50],[39,42],[64,31],[108,17]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="white" stroke="${color}" stroke-width="2"/>`).join("")}</svg>`;
}

function galleryView(title, subtitle, candidates) {
  return `<div class="gallery-view"><div class="gallery-heading"><span class="eyebrow">T1 · ANALYSIS A/B</span><h2>${title}</h2><p>${subtitle}</p></div><div class="candidate-grid">${candidates.map((c,i)=>`<button class="candidate-large" data-candidate="${i}"><div class="candidate-label"><span>${i?"B":"A"}</span><small>${c.tag}</small></div>${chartThumb(c.kind,c.color)}<h3>${c.name}</h3><p>${c.desc}</p></button>`).join("")}</div><div class="gallery-note"><span>↗</span> Select one analysis to continue with it as the main view.</div></div>`;
}

function renderMain() {
  if (state.stage === "t1" && state.t1Gallery) {
    const isView = state.comparisonMode === "view";
    el("mainView").innerHTML = galleryView(
      isView ? "Choose a new analytical view" : "Choose the comparison that matters",
      isView ? "The dataset stays fixed; only the analytical lens changes." : "A and B are generated from the same current perspective.",
      isView ? [
        {kind:"area", color:"#255fdd", tag:"ANALYSIS A", name:"Growth momentum", desc:"Emphasize the pace and continuity of change."},
        {kind:"bar", color:"#18a29a", tag:"ANALYSIS B", name:"Regional contribution", desc:"Compare each region’s share of total revenue."}
      ] : [
        {kind:"line", color:"#255fdd", tag:"ANALYSIS A", name:"Region vs. region", desc:"Compare all four regions over the same quarters."},
        {kind:"dot", color:"#ea725e", tag:"ANALYSIS B", name:"Actual vs. target", desc:"Compare each regional result against plan."}
      ]
    );
    bindGalleryInteractions();
    return;
  }
  let previewType = state.chartType;
  if (state.stage === "t1") {
    const choice = state.t1Selections[state.comparisonMode];
    previewType = state.comparisonMode === "view" ? (choice ? "bar" : "area") : (choice ? "dot" : "line");
  }
  el("mainView").innerHTML = mainChart(previewType);
  bindChartInteractions();
}

function bindGalleryInteractions() {
  document.querySelectorAll(".candidate-large[data-candidate]").forEach(btn => btn.addEventListener("click", () => {
    const choice = Number(btn.dataset.candidate);
    state.t1Selections[state.comparisonMode] = choice;
    const titles = state.comparisonMode === "view" ? ["Regional growth momentum", "Regional contribution to total"] : ["Regional revenue performance", "Actual revenue against target"];
    state.title = titles[choice];
    state.t1Gallery = false;
    el("workspaceTitle").textContent = state.title;
    el("lastChange").textContent = `T1 · ${state.comparisonMode === 'view' ? 'analytical view' : 'comparison'} ${choice ? 'B' : 'A'}`;
    renderStage();
    renderMain();
    toast(`Analysis ${choice ? "B" : "A"} selected`, "The selected analysis is now the main view.");
  }));
}

function bindChartInteractions() {
  document.querySelectorAll("[data-focus]").forEach(node => node.addEventListener("click", () => {
    state.focus = node.dataset.focus;
    el("lastChange").textContent = `T3 · ${pretty[state.focus]} focus`;
    renderMain(); renderStage();
  }));
  el("editTitle")?.addEventListener("click", openTitleModal);
}

const stages = {
  t1: {
    title: "Reframe the analysis", desc: "Change the comparison group or switch to another analytical view.", prompt: "Tell me what you want to compare, or describe a different analytical angle.", chips: ["Compare against target", "Show growth drivers"]
  },
  t2: {
    title: "Choose the encoding", desc: "Select one of the chart forms supported by this result.", prompt: "Choose a chart type below, or describe how you want the result encoded.", chips: ["Try a bar chart", "Keep time on the x-axis"]
  },
  t3: {
    title: "Set the narrative focus", desc: "Pick a mark, title framing, or an existing result value as reference.", prompt: "You can click a mark to change the focus, edit the title, or add an existing value as a reference line.", chips: ["Focus on APAC", "Make the takeaway clearer"]
  },
  t4: {
    title: "Tune the visual style", desc: "Adjust the seven V2.0 preference dimensions without changing the result.", prompt: "Describe a visual preference in your own words—I’ll map it to the available style dimensions.", chips: ["Make it more editorial", "Reduce visual density"]
  }
};

function t1Content() {
  return `<div class="stage-intro"><div><h3>${stages.t1.title}</h3><p>${stages.t1.desc}</p></div><span class="stage-number">01</span></div>
    <div class="analysis-actions">
      <button data-mode="comparison" class="analysis-action ${state.comparisonMode==='comparison'?'active':''}"><span class="action-symbol">⇄</span><span><b>Change comparison</b><small>Choose another counterpart</small></span><span>›</span></button>
      <button data-mode="view" class="analysis-action ${state.comparisonMode==='view'?'active':''}"><span class="action-symbol">◫</span><span><b>Change analytical view</b><small>Choose another analytical lens</small></span><span>›</span></button>
    </div>
    <div class="canvas-prompt"><span>✦</span><p>${state.t1Gallery ? "Analysis A and B are ready in the central canvas." : "Choose an action to generate Analysis A and B in the central canvas."}</p></div>`;
}

function typeIcon(kind) {
  if(kind==='bar') return `<svg viewBox="0 0 40 30"><rect x="3" y="16" width="7" height="11" fill="currentColor" stroke="none"/><rect x="14" y="8" width="7" height="19" fill="currentColor" stroke="none" opacity=".72"/><rect x="25" y="12" width="7" height="15" fill="currentColor" stroke="none" opacity=".48"/></svg>`;
  if(kind==='area') return `<svg viewBox="0 0 40 30"><path d="M2 25 11 16l8 4 9-13 9 5v14H2Z" fill="currentColor" opacity=".2" stroke="none"/><path d="M2 25 11 16l8 4 9-13 9 5"/></svg>`;
  if(kind==='dot') return `<svg viewBox="0 0 40 30"><path d="M5 6v20h32" opacity=".4"/>${[[10,20],[18,15],[26,19],[34,8]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.8" fill="currentColor" stroke="none"/>`).join('')}</svg>`;
  if(kind==='stacked') return `<svg viewBox="0 0 40 30"><rect x="4" y="7" width="7" height="20" fill="currentColor" stroke="none"/><rect x="15" y="12" width="7" height="15" fill="currentColor" stroke="none" opacity=".6"/><rect x="26" y="4" width="7" height="23" fill="currentColor" stroke="none" opacity=".3"/></svg>`;
  if(kind==='slope') return `<svg viewBox="0 0 40 30"><path d="m4 22 31-14M4 12l31 9"/><circle cx="4" cy="22" r="2" fill="currentColor"/><circle cx="35" cy="8" r="2" fill="currentColor"/></svg>`;
  return `<svg viewBox="0 0 40 30"><path d="M3 24 12 19l8-7 8 4 9-11"/><circle cx="3" cy="24" r="2" fill="currentColor"/><circle cx="37" cy="5" r="2" fill="currentColor"/></svg>`;
}

function t2Content() {
  const types = [["line","Line"],["bar","Bar"],["area","Area"],["dot","Dot plot"],["stacked","Stacked"],["slope","Slope"]];
  return `<div class="stage-intro"><div><h3>${stages.t2.title}</h3><p>${stages.t2.desc}</p></div><span class="stage-number">02</span></div><div class="setting-label"><b>Supported chart types</b><span>6 available</span></div><div class="chart-type-grid">${types.map(([id,name])=>`<button class="type-card ${state.chartType===id?'active':''}" data-type="${id}">${typeIcon(id)}<span>${name}</span></button>`).join('')}</div>`;
}

function t3Content() {
  return `<div class="stage-intro"><div><h3>${stages.t3.title}</h3><p>${stages.t3.desc}</p></div><span class="stage-number">03</span></div><div class="instruction-list">
    <button class="instruction" data-action="focus"><span class="instruction-icon">◎</span><span><b>Pick a focus target</b><small>Click a mark or semantic label on the chart</small></span><span>↗</span></button>
    <button class="instruction" data-action="title"><span class="instruction-icon">✎</span><span><b>Choose a takeaway title</b><small>Select one of 4 supported framings</small></span><span>›</span></button>
    <button class="instruction" data-action="reference"><span class="instruction-icon">⊣</span><span><b>${state.reference?'Remove reference line':'Add existing value as reference'}</b><small>${state.reference?`Currently $${state.reference}M`:'Use Q4 APAC result · $58M'}</small></span><span>›</span></button>
    </div><div class="active-focus"><span>ACTIVE FOCUS</span><b>${pretty[state.focus]} · Q4 $${data[state.focus][3]}M</b></div>`;
}

const dims = [
  ["Color style", "color", ["neutral_minimal","soft_pastel","professional_cool","balanced_vibrant","warm_editorial","dark_monitoring"]],
  ["Emphasis strength", "emphasis", ["uniform","subtle","moderate","strong","narrative"]],
  ["Annotation depth", "annotation", ["structural","labeled","key_callouts","interpretive","explanatory"]],
  ["Display density", "density", ["clean","balanced","detailed"]],
  ["Message structure", "message", ["overview_framing","takeaway_framing","exception_framing","evidence_framing","guided_framing"]],
  ["Ordering bias", "ordering", ["leave_default","value_desc","value_asc","alphabetical","natural_chronological"]],
  ["Category encoding", "category", ["color_only","color+subtle_shape","color+clear_shape","multi_channel_robust"]]
];

function t4Content() {
  return `<div class="stage-intro"><div><h3>${stages.t4.title}</h3><p>${stages.t4.desc}</p></div><span class="stage-number">04</span></div><div class="dimension-list">${dims.map(([label,key,values],i)=>`<div class="dimension-row"><div class="dimension-top"><span>${label}</span><small>${i===0?'<span class="palette-dots"><i style="background:#255fdd"></i><i style="background:#18a29a"></i><i style="background:#f0ba3f"></i></span>':values.length+' levels'}</small></div><div class="choice-row">${values.map(v=>`<button data-dimension="${key}" data-value="${v}" class="${state.style[key]===v?'active':''}">${v.replaceAll('_',' ')}</button>`).join('')}</div></div>`).join('')}</div>`;
}

function renderStage() {
  document.querySelectorAll(".stage-tab").forEach(b => b.classList.toggle("active", b.dataset.stage === state.stage));
  el("stageContent").innerHTML = state.stage === "t1" ? t1Content() : state.stage === "t2" ? t2Content() : state.stage === "t3" ? t3Content() : t4Content();
  el("assistantPrompt").textContent = stages[state.stage].prompt;
  el("suggestionChips").innerHTML = stages[state.stage].chips.map(c=>`<button>${c}</button>`).join('');
  el("modeIndicator").textContent = state.stage === "t1" ? (state.t1Gallery ? "ANALYSIS A/B" : "ANALYSIS VIEW") : state.stage === "t2" ? "ENCODING PREVIEW" : state.stage === "t3" ? "FOCUS VIEW" : "STYLE PREVIEW";
  el("chartRationale").textContent = state.stage === "t1" ? (state.t1Gallery ? "Choose one of the two generated analyses to make it the main view." : "Click a T1 action on the right to generate two analyses in the canvas.") : state.stage === "t2" ? "The selected encoding is applied directly to the current T1 result." : state.stage === "t3" ? "The selected target is emphasized without changing the underlying result." : "Style adjustments update in place and preserve every encoded value.";
  bindStageInteractions(); bindSuggestionChips();
}

function bindStageInteractions() {
  document.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { state.comparisonMode = b.dataset.mode; state.t1Gallery = true; renderStage(); renderMain(); }));
  document.querySelectorAll("[data-type]").forEach(b => b.addEventListener("click", () => { state.chartType=b.dataset.type; el("lastChange").textContent=`T2 · ${state.chartType} chart`; renderStage(); renderMain(); }));
  document.querySelector('[data-action="title"]')?.addEventListener("click", openTitleModal);
  document.querySelector('[data-action="focus"]')?.addEventListener("click", () => toast("Focus picker is active", "Click any mark or series label on the chart."));
  document.querySelector('[data-action="reference"]')?.addEventListener("click", () => { state.reference = state.reference ? null : 58; el("lastChange").textContent = `T3 · ${state.reference?'reference $58M':'reference removed'}`; renderMain(); renderStage(); });
  document.querySelectorAll("[data-dimension]").forEach(b => b.addEventListener("click", () => { state.style[b.dataset.dimension]=b.dataset.value; el("lastChange").textContent=`T4 · ${b.dataset.value.replaceAll('_',' ')}`; renderStage(); applyStylePreview(); }));
}

function applyStylePreview() {
  const c = state.style.color;
  const card = el("canvasCard");
  card.style.transition = "background .2s, color .2s";
  if (c === "dark_monitoring") { card.style.background="#102635"; card.style.color="#f2f6f7"; }
  else if (c === "warm_editorial") { card.style.background="#fffaf3"; card.style.color="#37231a"; }
  else { card.style.background="#fff"; card.style.color=""; }
  const plot = document.querySelector(".plot");
  if(plot) plot.style.opacity = state.style.emphasis === "uniform" ? .82 : 1;
}

function openTitleModal() {
  const titles = [
    ["OVERVIEW", "Regional revenue performance", "Neutral summary of the full result."],
    ["TAKEAWAY", "Europe closes the gap as every region grows", "Lead with the dominant pattern."],
    ["EXCEPTION", "APAC accelerates fastest into Q4", "Draw attention to an unusual trajectory."],
    ["EVIDENCE", "APAC gains $28M while Europe reaches $61M", "Anchor the claim in result values."]
  ];
  el("titleOptions").innerHTML = titles.map((t,i)=>`<button class="title-option" data-title="${t[1]}"><span>0${i+1}</span><b>${t[1]}</b><small>${t[0]} · ${t[2]}</small></button>`).join('');
  el("modalBackdrop").hidden=false;
  document.querySelectorAll("[data-title]").forEach(b=>b.addEventListener("click",()=>{ state.title=b.dataset.title; el("workspaceTitle").textContent=state.title; el("lastChange").textContent="T3 · takeaway title"; el("modalBackdrop").hidden=true; renderMain(); }));
}

function toast(title, message) {
  const t = el("toast"); t.querySelector("b").textContent=title; t.querySelector("small").textContent=message; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2400);
}

function bindSuggestionChips() {
  el("suggestionChips").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{ el("chatInput").value=b.textContent; el("chatInput").focus(); }));
}

document.querySelectorAll(".stage-tab").forEach(b => b.addEventListener("click", () => { state.stage=b.dataset.stage; state.t1Gallery = false; renderStage(); renderMain(); applyStylePreview(); }));

el("perspectiveButton").addEventListener("click", () => { const menu=el("perspectiveMenu"); menu.hidden=!menu.hidden; el("perspectiveButton").setAttribute("aria-expanded", String(!menu.hidden)); });
el("perspectiveMenu").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{ el("perspectiveName").textContent=b.dataset.name; el("perspectiveDesc").textContent=b.dataset.desc; el("perspectiveMenu").hidden=true; toast("Perspective updated",b.dataset.name); }));
document.addEventListener("click", e=>{ if(!e.target.closest(".perspective-control")) el("perspectiveMenu").hidden=true; });
el("closeModal").addEventListener("click",()=>el("modalBackdrop").hidden=true);
el("modalBackdrop").addEventListener("click",e=>{if(e.target===el("modalBackdrop")) el("modalBackdrop").hidden=true;});
el("acceptButton").addEventListener("click",()=>toast("Recommendation accepted","Your preference has been recorded."));
el("resetButton").addEventListener("click",()=>{ Object.assign(state,{stage:"t3",focus:"Europe",title:"Regional revenue performance",reference:null,comparisonMode:"comparison",chartType:"line",t1Gallery:false,t1Selections:{comparison:0,view:0}}); el("workspaceTitle").textContent=state.title; renderStage(); renderMain(); applyStylePreview(); toast("View reset","The initial recommendation has been restored."); });
el("whyButton").addEventListener("click",()=>{ el("chatInput").value="Why is this chart recommended?"; el("chatInput").focus(); });
el("chatForm").addEventListener("submit", e=>{ e.preventDefault(); const input=el("chatInput"); if(!input.value.trim())return; const msg=document.createElement("div"); msg.className="user-message"; msg.textContent=input.value.trim(); el("chatMessages").appendChild(msg); input.value=""; setTimeout(()=>{ const reply=document.createElement("div"); reply.className="assistant-message"; reply.innerHTML=`<span>✦</span><p>I’ve mapped that request to <b>${state.stage.toUpperCase()}</b>. This prototype records the intent without changing the underlying data.</p>`; el("chatMessages").appendChild(reply); el("chatMessages").scrollTop=el("chatMessages").scrollHeight; },350); });

renderStage();
renderMain();
