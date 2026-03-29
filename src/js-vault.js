// ===== FRAMEWORK LIBRARY CONTENT =====
const VAULT_CONTENT={
v1:`<h3 class="serif">Fellowship Readiness Assessment</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">A comprehensive evaluation of your fellowship application strength. Select your target specialty for benchmarked scoring, then rate yourself honestly in each category.</p>

<!-- Target Specialty Selection -->
<div style="padding:16px;background:var(--accent-dim);border:1px solid var(--border2);border-radius:12px;margin-bottom:20px">
<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Target Fellowship</div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Which fellowship are you targeting?</label>
<select id="frc-specialty" onchange="frcUpdate()" style="width:100%">
<option value="">Select target fellowship...</option>
<option value="cardiology">Cardiology</option>
<option value="gi">Gastroenterology</option>
<option value="pulm_crit">Pulmonary & Critical Care</option>
<option value="heme_onc">Hematology/Oncology</option>
<option value="endo">Endocrinology</option>
<option value="nephro">Nephrology</option>
<option value="rheum">Rheumatology</option>
<option value="id">Infectious Disease</option>
<option value="interventional">Interventional Cardiology</option>
<option value="electrophys">Electrophysiology</option>
<option value="sports">Sports Medicine</option>
<option value="geri">Geriatrics</option>
<option value="allergy">Allergy/Immunology</option>
<option value="other">Other Subspecialty</option>
</select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">How far are you from applying?</label>
<select id="frc-timeline" onchange="frcUpdate()" style="width:100%">
<option value="">Select timeline...</option>
<option value="applying">Applying this cycle</option>
<option value="1yr">~1 year out</option>
<option value="2yr">~2 years out</option>
<option value="3yr">3+ years out</option>
</select></div>
<div id="frc-spec-note" style="display:none;font-size:11px;color:var(--accent);margin-top:8px;padding:8px;background:var(--bg);border-radius:6px"></div>
</div>

<div id="frc-calc" style="font-size:13px">

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>1. Research & Scholarly Activity</strong><span id="frc-s1" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:4px">Publications, abstracts, presentations, case reports.</span>
<div id="frc-bench1" style="font-size:10px;color:var(--accent);margin-bottom:8px;display:none"></div>
<input type="range" min="0" max="5" value="0" id="frc-r1" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>None</span><span>1 abstract</span><span>1-2 pubs</span><span>3+ pubs</span><span>4+ first-author</span><span>5+ w/ impact</span></div>
<div id="frc-f1" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>2. Letters of Recommendation</strong><span id="frc-s2" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:4px">Specialty-specific, from physicians who know your clinical work deeply.</span>
<div id="frc-bench2" style="font-size:10px;color:var(--accent);margin-bottom:8px;display:none"></div>
<input type="range" min="0" max="5" value="0" id="frc-r2" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>No writers</span><span>Generic only</span><span>1 strong</span><span>2 strong</span><span>3 specialty</span><span>3+ w/ names</span></div>
<div id="frc-f2" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>3. Clinical Performance</strong><span id="frc-s3" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:4px">Evaluations, rotation feedback, procedural skills, clinical judgment.</span>
<div id="frc-bench3" style="font-size:10px;color:var(--accent);margin-bottom:8px;display:none"></div>
<input type="range" min="0" max="5" value="0" id="frc-r3" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>Below avg</span><span>Average</span><span>Good</span><span>Very good</span><span>Outstanding</span><span>Top of class</span></div>
<div id="frc-f3" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>4. Board Scores / ITE</strong><span id="frc-s4" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:4px">Screening tool — above the cutoff matters more than the exact number.</span>
<div id="frc-bench4" style="font-size:10px;color:var(--accent);margin-bottom:8px;display:none"></div>
<input type="range" min="0" max="5" value="0" id="frc-r4" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>Failed/low</span><span>Below avg</span><span>Average</span><span>Above avg</span><span>High</span><span>Top decile</span></div>
<div id="frc-f4" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>5. Leadership & Service</strong><span id="frc-s5" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:4px">Chief resident, committee roles, QI projects, teaching awards.</span>
<div id="frc-bench5" style="font-size:10px;color:var(--accent);margin-bottom:8px;display:none"></div>
<input type="range" min="0" max="5" value="0" id="frc-r5" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>None</span><span>Minor role</span><span>1 meaningful</span><span>2+ roles</span><span>Chief/lead</span><span>Multiple chief</span></div>
<div id="frc-f5" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>6. Networking & Away Rotations</strong><span id="frc-s6" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:4px">Program visits, conference attendance, faculty connections at target programs.</span>
<div id="frc-bench6" style="font-size:10px;color:var(--accent);margin-bottom:8px;display:none"></div>
<input type="range" min="0" max="5" value="0" id="frc-r6" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>None</span><span>1 conference</span><span>1 away</span><span>2 aways</span><span>2+ w/ contacts</span><span>Strong network</span></div>
<div id="frc-f6" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>7. Personal Statement</strong><span id="frc-s7" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:4px">Clear, specific story. Why this specialty? Why you? Polished through multiple drafts.</span>
<div id="frc-bench7" style="font-size:10px;color:var(--accent);margin-bottom:8px;display:none"></div>
<input type="range" min="0" max="5" value="0" id="frc-r7" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>Not started</span><span>First draft</span><span>Reviewed 1x</span><span>Multiple drafts</span><span>Polished</span><span>Exceptional</span></div>
<div id="frc-f7" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

</div>

<!-- Weighted Score + Radar-style breakdown -->
<div id="frc-result" style="padding:24px;background:var(--bg2);border-radius:12px;margin-top:20px">

<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
<!-- Score -->
<div style="text-align:center">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:8px">Weighted Readiness Score</div>
<div id="frc-total" style="font-size:48px;font-weight:700;font-family:'Cormorant Garamond',serif;color:var(--accent)">0</div>
<div id="frc-max" style="font-size:13px;color:var(--text3)">out of 100</div>
<div id="frc-grade" style="font-size:16px;font-weight:600;margin-top:8px"></div>
</div>
<!-- Bar breakdown -->
<div id="frc-bars" style="display:flex;flex-direction:column;gap:6px;justify-content:center">
<div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:2px">Category Breakdown</div>
<div id="frc-bar-1" class="frc-bar-row"></div>
<div id="frc-bar-2" class="frc-bar-row"></div>
<div id="frc-bar-3" class="frc-bar-row"></div>
<div id="frc-bar-4" class="frc-bar-row"></div>
<div id="frc-bar-5" class="frc-bar-row"></div>
<div id="frc-bar-6" class="frc-bar-row"></div>
<div id="frc-bar-7" class="frc-bar-row"></div>
</div>
</div>

<!-- Interpretation -->
<div id="frc-interp" style="font-size:13px;color:var(--text2);line-height:1.7;text-align:left"></div>

<!-- Gap Analysis -->
<div id="frc-gaps" style="display:none;margin-top:16px">
<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">⚡ Priority Gaps</div>
<div id="frc-gap-list" style="display:flex;flex-direction:column;gap:6px"></div>
</div>

<!-- Strengths -->
<div id="frc-strengths" style="display:none;margin-top:16px">
<div style="font-size:11px;font-weight:600;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">✓ Strengths</div>
<div id="frc-strength-list" style="display:flex;flex-direction:column;gap:6px"></div>
</div>

<!-- Action Plan -->
<div id="frc-actions" style="display:none;margin-top:16px;padding:16px;background:var(--bg);border:1px solid var(--border2);border-radius:10px">
<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">🎯 Recommended Next Steps</div>
<div id="frc-action-list" style="display:flex;flex-direction:column;gap:8px;font-size:12px;color:var(--text2);line-height:1.6"></div>
</div>

<!-- Timeline Warning -->
<div id="frc-timeline-warn" style="display:none;margin-top:16px;padding:12px 16px;background:var(--red-dim);border:1px solid rgba(196,77,86,.15);border-radius:8px">
<div id="frc-timeline-msg" style="font-size:12px;color:var(--red);line-height:1.6"></div>
</div>

<div id="frc-pathway"></div>

</div>

<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Weighted scoring based on NRMP Charting Outcomes and program director surveys. Category weights vary by specialty competitiveness. This is a self-assessment framework — not a match prediction.</p>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Fellowship Readiness Calculator')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>`,
v2:`<h3 class="serif">Contract Risk Assessment</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Answer these questions about your contract. You'll get a risk score and specific flags to address before signing.</p>

<div id="crs-tool" style="font-size:13px">

<!-- Overall Risk Score -->
<div id="crs-score-box" style="padding:24px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:20px;text-align:center">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:6px">Contract Risk Score</div>
<div id="crs-score" style="font-size:52px;font-weight:700;font-family:'Cormorant Garamond',serif;color:var(--text3)">—</div>
<div id="crs-grade" style="font-size:13px;font-weight:600;margin-top:4px;color:var(--text3)">Answer the questions below</div>
<div id="crs-bar-wrap" style="height:6px;background:var(--bg3);border-radius:3px;margin-top:12px;overflow:hidden"><div id="crs-bar" style="height:100%;width:0%;border-radius:3px;transition:width .4s,background .4s;background:var(--border)"></div></div>
</div>

<!-- 1. Compensation Structure -->
<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">1. Compensation Structure</div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Is the base salary clearly defined as a fixed dollar amount?</label>
<select id="crs-comp-base" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="yes">Yes — fixed base clearly stated</option><option value="partial">Partially — guarantee for first 1-2 years only</option><option value="no">No — it's all production/RVU-based from day 1</option></select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Is the RVU/bonus formula defined with specific numbers?</label>
<select id="crs-comp-rvu" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="yes">Yes — specific $/wRVU rate and threshold in writing</option><option value="partial">Partially — "productivity bonus" mentioned but formula vague</option><option value="no">No — no bonus structure defined, or "to be determined"</option></select></div>
</div>

<!-- 2. Restrictive Covenant / Non-Compete -->
<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">2. Restrictive Covenant (Non-Compete)</div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Non-compete radius</label>
<select id="crs-nc-radius" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="none">No non-compete</option><option value="small">10 miles or less</option><option value="medium">11-20 miles</option><option value="large">21-30 miles</option><option value="extreme">30+ miles</option></select></div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Non-compete duration</label>
<select id="crs-nc-dur" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="none">No non-compete</option><option value="1yr">1 year</option><option value="2yr">2 years</option><option value="3yr">3+ years</option></select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Does non-compete apply if YOU are terminated without cause?</label>
<select id="crs-nc-term" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="waived">Waived if terminated without cause</option><option value="always">Applies regardless of who terminates</option><option value="na">No non-compete</option></select></div>
</div>

<!-- 3. Tail Coverage -->
<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">3. Malpractice Tail Coverage</div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Policy type</label>
<select id="crs-mal-type" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="occurrence">Occurrence-based (no tail needed)</option><option value="claims">Claims-made</option><option value="unknown">Not specified / I don't know</option></select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Who pays tail if you leave?</label>
<select id="crs-tail-pay" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="employer">Employer pays</option><option value="shared">Shared / pro-rated</option><option value="you">You pay full tail</option><option value="na">Not applicable (occurrence policy)</option><option value="unknown">Not addressed in contract</option></select></div>
</div>

<!-- 4. Termination Clauses -->
<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">4. Termination Provisions</div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Without-cause termination notice period</label>
<select id="crs-term-notice" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="180">180 days (6 months)</option><option value="90">90 days</option><option value="60">60 days</option><option value="30">30 days or less</option></select></div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Is severance defined?</label>
<select id="crs-term-sev" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="yes">Yes — specific amount/duration in writing</option><option value="no">No severance mentioned</option></select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">How is "for cause" termination defined?</label>
<select id="crs-term-cause" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="narrow">Narrow — fraud, felony, license loss only</option><option value="broad">Broad — includes "failure to meet productivity," subjective criteria</option><option value="unclear">Not clearly defined</option></select></div>
</div>

<!-- 5. Benefits & Call -->
<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">5. Benefits & Call Schedule</div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Are benefits (health, disability, CME, retirement) specified with dollar amounts?</label>
<select id="crs-ben-detail" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="yes">Yes — amounts, match %, CME budget all in writing</option><option value="partial">Partially — says "benefits available" without specifics</option><option value="no">No — references a separate benefits handbook</option></select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Is call compensated?</label>
<select id="crs-ben-call" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="yes">Yes — paid per diem or reduced clinical load</option><option value="partial">Shared call pool, no extra compensation</option><option value="no">Uncompensated call</option><option value="na">No call requirement</option></select></div>
</div>

<!-- 6. Signing Bonus / Loan Repayment -->
<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">6. Signing Bonus & Loan Repayment</div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Signing bonus clawback terms</label>
<select id="crs-sign-claw" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="prorated">Pro-rated over 2-3 years</option><option value="full">Full repayment if you leave within X years</option><option value="na">No signing bonus</option></select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Loan repayment clawback</label>
<select id="crs-loan-claw" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="prorated">Pro-rated forgiveness over time</option><option value="full">Full repayment if you leave early</option><option value="na">No loan repayment offered</option></select></div>
</div>

<!-- 7. Partnership Track -->
<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">7. Partnership / Equity Track</div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Partnership terms</label>
<select id="crs-partner" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="defined">Defined timeline, buy-in, and criteria in writing</option><option value="vague">"Eligible after X years" with no defined process</option><option value="no">No partnership track</option><option value="na">N/A — employed position</option></select></div>
</div>

<!-- 8. Assignment & Duties -->
<div style="padding:14px 0">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">8. Scope of Duties</div>
<div class="fg" style="margin-bottom:8px"><label style="font-size:11px;color:var(--text3)">Are your clinical duties and practice scope clearly defined?</label>
<select id="crs-scope" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="yes">Yes — specific clinical responsibilities listed</option><option value="broad">Broad — "duties as assigned" or vague language</option></select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Can they reassign your location or duties without your consent?</label>
<select id="crs-reassign" onchange="crsCalc()" style="width:100%"><option value="">Select...</option><option value="no">No — location and scope are fixed in the contract</option><option value="yes">Yes — contract allows unilateral reassignment</option><option value="unclear">Not addressed</option></select></div>
</div>

<button onclick="crsCalc();document.getElementById('crs-results').scrollIntoView({behavior:'smooth',block:'start'})" class="btn btn-a" style="width:100%;padding:14px;margin-top:16px;margin-bottom:8px">Calculate Risk Score →</button>
<p style="font-size:10px;color:var(--text3);text-align:center;margin-bottom:20px">All data stays on your device. Nothing is sent to a server.</p>

<div id="crs-results"></div>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Contract Review Scorecard')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>
</div>`,

v3:`<h3 class="serif">Job Offer Comparison Tool</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Input your two offers. We'll compare them honestly — no sugarcoating, just the trade-offs you need to see.</p>

<div id="ocm-tool" style="font-size:13px">

<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">

<!-- OFFER A -->
<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:12px">
<div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:12px;text-align:center">Offer A</div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Employer / Label</label><input type="text" id="ocm-a-name" placeholder="e.g., Academic Medical Center" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Base Salary ($)</label><input type="number" id="ocm-a-salary" placeholder="350000" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Signing Bonus ($)</label><input type="number" id="ocm-a-sign" placeholder="0" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">RVU Rate ($/wRVU)</label><input type="number" id="ocm-a-rvu" placeholder="55" step="0.5" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Expected Annual wRVUs</label><input type="number" id="ocm-a-wrvus" placeholder="5000" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Loan Repayment ($)</label><input type="number" id="ocm-a-loan" placeholder="0" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Retirement Match (%)</label><input type="number" id="ocm-a-retire" placeholder="5" max="100" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Call Days / Month</label><input type="number" id="ocm-a-call" placeholder="4" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Call Type</label><select id="ocm-a-calltype" style="width:100%"><option value="none">No call</option><option value="phone">Phone only (home)</option><option value="home">Home call w/ occasional come-in</option><option value="home_backup">Home call + in-house backup</option><option value="inhouse">In-house (24hr)</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Weekly Schedule</label><select id="ocm-a-schedule" style="width:100%"><option value="5day">5 days/week</option><option value="4day">4 days/week</option><option value="4.5day">4.5 days/week</option><option value="7on7off">7-on / 7-off</option><option value="shift">Shift-based (variable)</option><option value="other">Other</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Avg Clinical Hours / Week</label><input type="number" id="ocm-a-hours" placeholder="45" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Weekend Rounding</label><select id="ocm-a-weekend" style="width:100%"><option value="none">None</option><option value="1-2">1-2x / month</option><option value="eow">Every other weekend</option><option value="every">Every weekend</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">PTO Days / Year</label><input type="number" id="ocm-a-pto" placeholder="20" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">CME Days / Year</label><input type="number" id="ocm-a-cme" placeholder="5" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Non-Compete (miles)</label><input type="number" id="ocm-a-noncomp" placeholder="0" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Tail Coverage</label><select id="ocm-a-tail" style="width:100%"><option value="employer">Employer pays</option><option value="shared">Shared</option><option value="you">You pay</option><option value="none">Not included</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Partnership Track?</label><select id="ocm-a-partner" style="width:100%"><option value="no">No</option><option value="yes">Yes</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">PSLF Eligible?</label><select id="ocm-a-pslf" style="width:100%"><option value="no">No</option><option value="yes">Yes</option></select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Location / Notes</label><input type="text" id="ocm-a-loc" placeholder="e.g., Houston, TX" style="width:100%;box-sizing:border-box"></div>
</div>

<!-- OFFER B -->
<div style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:12px">
<div style="font-size:13px;font-weight:600;color:var(--green);margin-bottom:12px;text-align:center">Offer B</div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Employer / Label</label><input type="text" id="ocm-b-name" placeholder="e.g., Private Group" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Base Salary ($)</label><input type="number" id="ocm-b-salary" placeholder="500000" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Signing Bonus ($)</label><input type="number" id="ocm-b-sign" placeholder="0" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">RVU Rate ($/wRVU)</label><input type="number" id="ocm-b-rvu" placeholder="60" step="0.5" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Expected Annual wRVUs</label><input type="number" id="ocm-b-wrvus" placeholder="6000" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Loan Repayment ($)</label><input type="number" id="ocm-b-loan" placeholder="0" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Retirement Match (%)</label><input type="number" id="ocm-b-retire" placeholder="3" max="100" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Call Days / Month</label><input type="number" id="ocm-b-call" placeholder="6" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Call Type</label><select id="ocm-b-calltype" style="width:100%"><option value="none">No call</option><option value="phone">Phone only (home)</option><option value="home">Home call w/ occasional come-in</option><option value="home_backup">Home call + in-house backup</option><option value="inhouse">In-house (24hr)</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Weekly Schedule</label><select id="ocm-b-schedule" style="width:100%"><option value="5day">5 days/week</option><option value="4day">4 days/week</option><option value="4.5day">4.5 days/week</option><option value="7on7off">7-on / 7-off</option><option value="shift">Shift-based (variable)</option><option value="other">Other</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Avg Clinical Hours / Week</label><input type="number" id="ocm-b-hours" placeholder="50" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Weekend Rounding</label><select id="ocm-b-weekend" style="width:100%"><option value="none">None</option><option value="1-2">1-2x / month</option><option value="eow">Every other weekend</option><option value="every">Every weekend</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">PTO Days / Year</label><input type="number" id="ocm-b-pto" placeholder="15" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">CME Days / Year</label><input type="number" id="ocm-b-cme" placeholder="5" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Non-Compete (miles)</label><input type="number" id="ocm-b-noncomp" placeholder="25" style="width:100%;box-sizing:border-box"></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Tail Coverage</label><select id="ocm-b-tail" style="width:100%"><option value="employer">Employer pays</option><option value="shared">Shared</option><option value="you">You pay</option><option value="none">Not included</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">Partnership Track?</label><select id="ocm-b-partner" style="width:100%"><option value="no">No</option><option value="yes">Yes</option></select></div>
<div class="fg" style="margin-bottom:10px"><label style="font-size:11px;color:var(--text3)">PSLF Eligible?</label><select id="ocm-b-pslf" style="width:100%"><option value="no">No</option><option value="yes">Yes</option></select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Location / Notes</label><input type="text" id="ocm-b-loc" placeholder="e.g., Dallas, TX" style="width:100%;box-sizing:border-box"></div>
</div>

</div>

<button onclick="ocmCompare()" class="btn btn-a" style="width:100%;padding:14px;margin-bottom:8px">Compare Offers →</button>
<p style="font-size:10px;color:var(--text3);text-align:center;margin-bottom:20px">All data stays on your device. Nothing is sent to a server.</p>

<div id="ocm-results"></div>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Job Offer Comparison Tool')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>
</div>`,

v4:`<h3>RVU Compensation Calculator</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Model your actual take-home based on your contract structure. Adjust the inputs to see how volume changes your pay.</p>

<div style="font-size:13px;margin-bottom:20px">
<div style="font-weight:600;color:var(--accent);margin-bottom:12px">Your Contract Details</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
<div class="fg"><label>Compensation Model</label>
<select id="rvu-model" onchange="rvuUpdate()" style="width:100%">
<option value="production">Pure Production (wRVU × rate)</option>
<option value="base_bonus">Base Salary + Bonus</option>
<option value="guarantee">Guarantee (fixed)</option>
</select></div>
<div class="fg"><label>Your Specialty</label>
<select id="rvu-spec" onchange="rvuFillBenchmark();rvuUpdate()" style="width:100%">
<option value="custom">Custom / Other</option>
<optgroup label="Primary Care">
<option value="fm">Family Medicine</option>
<option value="im">IM — Outpatient / Primary Care</option>
<option value="hosp">IM — Hospitalist</option>
<option value="peds">Pediatrics</option>
</optgroup>
<optgroup label="Medical Subspecialties">
<option value="gc">General Cardiology</option>
<option value="ic">Interventional Cardiology</option>
<option value="ep">Electrophysiology</option>
<option value="gi">Gastroenterology</option>
<option value="pulm">Pulmonology / Critical Care</option>
<option value="hemonc">Hematology / Oncology</option>
<option value="neph">Nephrology</option>
<option value="endo">Endocrinology</option>
<option value="rheum">Rheumatology</option>
<option value="id">Infectious Disease</option>
<option value="neuro">Neurology</option>
<option value="pmr">PM&R</option>
<option value="psych">Psychiatry</option>
<option value="derm">Dermatology</option>
</optgroup>
<optgroup label="Surgical Specialties">
<option value="gensurg">General Surgery</option>
<option value="ortho">Orthopedic Surgery</option>
<option value="nsurg">Neurosurgery</option>
<option value="ct_surg">Cardiothoracic Surgery</option>
<option value="vascular">Vascular Surgery</option>
<option value="uro">Urology</option>
<option value="ent">ENT</option>
<option value="plastics">Plastic Surgery</option>
<option value="obgyn">OB/GYN</option>
</optgroup>
<optgroup label="Other Specialties">
<option value="em">Emergency Medicine</option>
<option value="anes">Anesthesiology</option>
<option value="path">Pathology</option>
<option value="ophtho">Ophthalmology</option>
<option value="ir">Interventional Radiology</option>
<option value="radonc">Radiation Oncology</option>
</optgroup>
</select></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
<div class="fg"><label>Annual wRVUs</label><input type="number" id="rvu-vol" placeholder="e.g., 5000" oninput="rvuUpdate()"></div>
<div class="fg"><label>$/wRVU Rate</label><input type="number" id="rvu-rate" placeholder="e.g., 55" step="0.5" oninput="rvuUpdate()"></div>
</div>

<div id="rvu-base-fields" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
<div class="fg"><label>Base Salary ($)</label><input type="number" id="rvu-base" placeholder="e.g., 250000" oninput="rvuUpdate()"></div>
<div class="fg"><label>Bonus Threshold (wRVUs)</label><input type="number" id="rvu-thresh" placeholder="e.g., 4500" oninput="rvuUpdate()"></div>
</div>
</div>

<div id="rvu-result" style="padding:24px;background:var(--bg2);border-radius:12px;margin-bottom:20px;text-align:center">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:8px">Estimated Annual Compensation</div>
<div id="rvu-total-comp" style="font-size:42px;font-weight:700;font-family:'Cormorant Garamond',serif;color:var(--accent)">$0</div>
<div id="rvu-breakdown" style="font-size:12px;color:var(--text2);margin-top:8px;line-height:1.8"></div>
<div id="rvu-vs-mgma" style="font-size:12px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"></div>
</div>

<div style="margin-bottom:20px">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">What If? — Volume Scenarios</div>
<div id="rvu-scenarios" style="font-size:12px;color:var(--text2);line-height:1.8"></div>
</div>

<div style="font-weight:600;color:var(--accent);margin-bottom:12px">📊 MGMA Benchmarks by Specialty (2024)</div>
<div style="font-size:11px;overflow-x:auto">
<div style="display:grid;grid-template-columns:1fr 90px 80px 100px;gap:0;border:1px solid var(--border);border-radius:8px;overflow:hidden">
<div style="padding:8px 10px;font-weight:600;background:var(--bg2);border-bottom:1px solid var(--border)">Specialty</div>
<div style="padding:8px 10px;font-weight:600;background:var(--bg2);border-bottom:1px solid var(--border);text-align:right">Med wRVUs</div>
<div style="padding:8px 10px;font-weight:600;background:var(--bg2);border-bottom:1px solid var(--border);text-align:right">$/wRVU</div>
<div style="padding:8px 10px;font-weight:600;background:var(--bg2);border-bottom:1px solid var(--border);text-align:right">Med Comp</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Family Medicine</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">4,608</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$52</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$275K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Internal Medicine</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">4,824</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$55</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$300K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Hospitalist</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">4,252</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$65</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$335K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">General Cardiology</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">7,247</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$65</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$550K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Interventional Cardiology</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">9,187</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$70</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$700K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Gastroenterology</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">7,592</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$62</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$530K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Pulm / Critical Care</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">5,986</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$58</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$430K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Orthopedic Surgery</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">8,684</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$72</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$680K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">General Surgery</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">6,853</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$60</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$450K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Emergency Medicine</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">5,148</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$68</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$385K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Dermatology</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">6,378</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$68</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$500K</div>

<div style="padding:6px 10px;border-bottom:1px solid var(--border)">Psychiatry</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">3,824</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$72</div>
<div style="padding:6px 10px;border-bottom:1px solid var(--border);text-align:right">$310K</div>

<div style="padding:6px 10px">Anesthesiology</div>
<div style="padding:6px 10px;text-align:right">6,012</div>
<div style="padding:6px 10px;text-align:right">$70</div>
<div style="padding:6px 10px;text-align:right">$465K</div>
</div>
</div>

<div style="padding:16px;background:var(--bg2);border-radius:8px;margin-top:16px"><p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0"><strong>Year 1 reality:</strong> Most new attendings don't hit median wRVUs in year 1. It takes 12-18 months to build a full panel. Make sure your guarantee period covers the ramp-up.</p></div>
<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Source: MGMA DataDive Provider Compensation 2024. Figures are approximate medians and vary by region, practice type, and payer mix.</p>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('RVU Compensation Calculator')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>`,

v5:`<h3>Early Career Income Planner</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">The first 3 years after training determine your financial trajectory for the next 20. Enter your numbers for a personalized year-by-year plan.</p>

<div style="font-size:13px">
<div style="font-weight:600;color:var(--accent);margin-bottom:12px">Your Financial Details</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
<div class="fg"><label>Expected Attending Salary ($)</label><input type="number" id="fyp-salary" placeholder="e.g., 350000"></div>
<div class="fg"><label>Student Loan Debt ($)</label><input type="number" id="fyp-debt" placeholder="e.g., 250000"></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
<div class="fg"><label>Loan Interest Rate (%)</label><input type="number" id="fyp-rate" placeholder="e.g., 6.5" step="0.1"></div>
<div class="fg"><label>Year 1 Living Expenses ($)</label><input type="number" id="fyp-expenses" placeholder="e.g., 100000"></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
<div class="fg"><label>Annual Lifestyle Increase (%)</label><input type="number" id="fyp-inflate" placeholder="e.g., 10" step="1"></div>
<div class="fg"><label>Employer 401k Match (%)</label><input type="number" id="fyp-match" placeholder="e.g., 3" step="0.5"></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
<div class="fg"><label>PSLF Eligible?</label>
<select id="fyp-pslf" style="width:100%">
<option value="">Select...</option>
<option value="yes">Yes</option>
<option value="no">No</option>
<option value="unsure">Not Sure</option>
</select></div>
<div class="fg"><label>Has Dependents?</label>
<select id="fyp-dependents" style="width:100%">
<option value="">Select...</option>
<option value="yes">Yes</option>
<option value="no">No</option>
</select></div>
</div>

<button onclick="fypCalculate()" class="btn btn-a" style="width:100%;padding:14px;margin-bottom:8px">Calculate 3-Year Plan \u2192</button>
<p style="font-size:10px;color:var(--text3);text-align:center;margin-bottom:16px">All calculations are performed locally. Nothing is stored or sent externally.</p>
</div>

<div id="fyp-results"></div>
<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Sources: White Coat Investor, AAMC Debt Data 2024, IRS 2024 contribution limits.</p>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('3-Year Financial Planner')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>`,

v6:`<h3 class="serif">Fellowship Application Planner</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Your personalized timeline to match day. Check off milestones as you complete them — progress is saved automatically.</p>

<div id="fpr-tool" style="font-size:13px">

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
<div class="fg"><label style="font-size:11px;color:var(--text3)">Target Specialty</label>
<select id="fpr-spec" onchange="fprInit()" style="width:100%">
<option value="">Select specialty...</option>
<option value="cardiology">Cardiology</option>
<option value="interventional">Interventional Cardiology</option>
<option value="electrophysiology">Electrophysiology</option>
<option value="heart_failure">Advanced Heart Failure & Transplant</option>
<option value="gi">Gastroenterology</option>
<option value="advanced_endoscopy">Advanced Endoscopy</option>
<option value="transplant_hep">Transplant Hepatology</option>
<option value="pulm_crit">Pulmonology / Critical Care</option>
<option value="hemonc">Hematology / Oncology</option>
<option value="rheum">Rheumatology</option>
<option value="endo">Endocrinology</option>
<option value="neph">Nephrology</option>
<option value="id">Infectious Disease</option>
<option value="allergy">Allergy / Immunology</option>
<option value="sports">Sports Medicine</option>
<option value="geri">Geriatrics</option>
<option value="pain">Pain Medicine</option>
<option value="sleep">Sleep Medicine</option>
<option value="hospice">Hospice & Palliative Medicine</option>
<option value="neuro_phys">Clinical Neurophysiology</option>
<option value="neonatal">Neonatal-Perinatal Medicine</option>
<option value="mfm">Maternal-Fetal Medicine</option>
<option value="ortho">Orthopedic Surgery</option>
<option value="ctsx">Cardiothoracic Surgery</option>
<option value="vasc">Vascular Surgery</option>
<option value="surg_crit">Surgical Critical Care</option>
<option value="ped_surg">Pediatric Surgery</option>
<option value="surg_onc">Surgical Oncology</option>
<option value="trauma">Trauma & Acute Care Surgery</option>
<option value="colorectal">Colon & Rectal Surgery</option>
<option value="hand">Hand Surgery</option>
<option value="mis">Minimally Invasive Surgery</option>
<option value="transplant_surg">Transplant Surgery</option>
<option value="spine">Spine Surgery</option>
<option value="other">Other</option>
</select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Months Until Match</label>
<select id="fpr-months" onchange="fprInit()" style="width:100%">
<option value="">Select timeline...</option>
<option value="24">24+ months</option>
<option value="18">18 months</option>
<option value="12">12 months</option>
<option value="6">6 months</option>
<option value="3">3 months or less</option>
</select></div>
</div>

<!-- Progress bar -->
<div id="fpr-progress-wrap" style="display:none;margin-bottom:20px;padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:12px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Overall Progress</div>
<div id="fpr-pct" style="font-size:14px;font-weight:700;color:var(--accent)">0%</div>
</div>
<div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div id="fpr-bar" style="height:100%;width:0%;border-radius:3px;transition:width .4s;background:var(--accent)"></div></div>
<div id="fpr-stat" style="font-size:11px;color:var(--text3);margin-top:6px"></div>
</div>

<!-- Phases render here -->
<div id="fpr-phases"></div>

<!-- Interview Practice section renders here -->
<div id="fpr-mock"></div>

</div>`,

v7:`<h3>Research Impact Calculator</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Enter your current research portfolio. The calculator scores each item by application impact per time invested and shows how close you are to optimal.</p>

<div style="font-size:12px">

<div style="margin-bottom:16px">
<label style="display:block;font-weight:600;margin-bottom:6px">Target Specialty / Fellowship</label>
<select id="roi-spec" onchange="roiUpdate()" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;cursor:pointer">
<option value="">— Select Specialty —</option>
<option value="im">Internal Medicine</option>
<option value="fm">Family Medicine</option>
<option value="peds">Pediatrics</option>
<option value="em">Emergency Medicine</option>
<option value="psych">Psychiatry</option>
<option value="neuro">Neurology</option>
<option value="rads">Radiology</option>
<option value="anes">Anesthesiology</option>
<option value="path">Pathology</option>
<option value="gs">General Surgery</option>
<option value="ortho">Orthopedic Surgery</option>
<option value="nsurg">Neurosurgery</option>
<option value="derm">Dermatology</option>
<option value="ent">ENT</option>
<option value="uro">Urology</option>
<option value="ophtho">Ophthalmology</option>
<option value="plastics">Plastic Surgery</option>
<option value="ir">Interventional Radiology</option>
<option value="vascular">Vascular Surgery</option>
<option value="ct_surg">Cardiothoracic Surgery</option>
<option value="ct_integrated">Thoracic Surgery (Integrated)</option>
<option value="obgyn">OB/GYN</option>
<option value="pmr">PM&R</option>
<option value="radonc">Radiation Oncology</option>
<option value="cards">Cardiology (Fellowship)</option>
<option value="gi">GI (Fellowship)</option>
<option value="hemeonc">Heme/Onc (Fellowship)</option>
<option value="pulmcrit">Pulm/Crit (Fellowship)</option>
<option value="neph">Nephrology (Fellowship)</option>
<option value="rheum">Rheumatology (Fellowship)</option>
<option value="endo">Endocrinology (Fellowship)</option>
<option value="id">Infectious Disease (Fellowship)</option>
<option value="ic">Interventional Cardiology (Fellowship)</option>
<option value="ep">Electrophysiology (Fellowship)</option>
<option value="hf">Heart Failure & Transplant (Fellowship)</option>
<option value="advendo">Advanced Endoscopy (Fellowship)</option>
<option value="transphep">Transplant Hepatology (Fellowship)</option>
<option value="sportsmed">Sports Medicine (Fellowship)</option>
<option value="surgcrit">Surgical Critical Care (Fellowship)</option>
<option value="surgonc">Surgical Oncology (Fellowship)</option>
<option value="pedsurg">Pediatric Surgery (Fellowship)</option>
<option value="colorectal">Colon & Rectal Surgery (Fellowship)</option>
<option value="hand">Hand Surgery (Fellowship)</option>
<option value="spine">Spine Surgery (Fellowship)</option>
<option value="transplant">Transplant Surgery (Fellowship)</option>
<option value="mis">Minimally Invasive Surgery (Fellowship)</option>
<option value="trauma">Trauma Surgery (Fellowship)</option>
<option value="pain">Pain Medicine (Fellowship)</option>
<option value="sleep">Sleep Medicine (Fellowship)</option>
<option value="hospice">Hospice & Palliative (Fellowship)</option>
<option value="neurophysiology">Clinical Neurophysiology (Fellowship)</option>
<option value="neonatal">Neonatal-Perinatal Medicine (Fellowship)</option>
<option value="mfm">Maternal-Fetal Medicine (Fellowship)</option>
<option value="other">Other</option>
</select>
</div>

<div style="margin-bottom:18px">
<label style="display:block;font-weight:600;margin-bottom:6px">Months Until Application Deadline</label>
<input type="number" id="roi-months" min="1" max="36" placeholder="e.g., 12" oninput="roiUpdate()" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;box-sizing:border-box">
<div style="font-size:10px;color:var(--text3);margin-top:4px">Used to filter recommendations to what's achievable</div>
</div>

<div style="height:1px;background:var(--border);margin-bottom:16px"></div>

<div style="margin-bottom:14px">
<label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:600">First-Author Original Research</span><span style="color:var(--green);font-size:10px">15 pts each</span></label>
<div style="display:flex;align-items:center;gap:12px">
<input type="range" min="0" max="5" value="0" id="roi-first" oninput="roiUpdate()" style="flex:1">
<span id="roi-first-v" style="font-size:14px;font-weight:600;color:var(--accent);min-width:20px;text-align:center">0</span>
</div>
<div style="font-size:10px;color:var(--text3);margin-top:2px">6-18 months each. Highest impact per paper.</div>
</div>

<div style="margin-bottom:14px">
<label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:600">Case Reports / Series</span><span style="color:var(--green);font-size:10px">8 pts each</span></label>
<div style="display:flex;align-items:center;gap:12px">
<input type="range" min="0" max="8" value="0" id="roi-case" oninput="roiUpdate()" style="flex:1">
<span id="roi-case-v" style="font-size:14px;font-weight:600;color:var(--accent);min-width:20px;text-align:center">0</span>
</div>
<div style="font-size:10px;color:var(--text3);margin-top:2px">2-4 months. Low barrier, demonstrates writing ability.</div>
</div>

<div style="margin-bottom:14px">
<label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:600">Conference Abstracts / Posters</span><span style="color:var(--accent);font-size:10px">5 pts each</span></label>
<div style="display:flex;align-items:center;gap:12px">
<input type="range" min="0" max="10" value="0" id="roi-abstract" oninput="roiUpdate()" style="flex:1">
<span id="roi-abstract-v" style="font-size:14px;font-weight:600;color:var(--accent);min-width:20px;text-align:center">0</span>
</div>
<div style="font-size:10px;color:var(--text3);margin-top:2px">1-3 months. Gets your name visible at national meetings.</div>
</div>

<div style="margin-bottom:14px">
<label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:600">Review Articles</span><span style="color:var(--accent);font-size:10px">6 pts each</span></label>
<div style="display:flex;align-items:center;gap:12px">
<input type="range" min="0" max="5" value="0" id="roi-review" oninput="roiUpdate()" style="flex:1">
<span id="roi-review-v" style="font-size:14px;font-weight:600;color:var(--accent);min-width:20px;text-align:center">0</span>
</div>
<div style="font-size:10px;color:var(--text3);margin-top:2px">3-6 months. Shows domain expertise in specialty journals.</div>
</div>

<div style="margin-bottom:14px">
<label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:600">Middle-Author Papers</span><span style="color:var(--text3);font-size:10px">3 pts each</span></label>
<div style="display:flex;align-items:center;gap:12px">
<input type="range" min="0" max="10" value="0" id="roi-middle" oninput="roiUpdate()" style="flex:1">
<span id="roi-middle-v" style="font-size:14px;font-weight:600;color:var(--accent);min-width:20px;text-align:center">0</span>
</div>
<div style="font-size:10px;color:var(--text3);margin-top:2px">PDs know the difference. Counts, but at a discount.</div>
</div>

<div style="margin-bottom:14px">
<label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:600">QI / Other Projects</span><span style="color:var(--text3);font-size:10px">2 pts each</span></label>
<div style="display:flex;align-items:center;gap:12px">
<input type="range" min="0" max="5" value="0" id="roi-qi" oninput="roiUpdate()" style="flex:1">
<span id="roi-qi-v" style="font-size:14px;font-weight:600;color:var(--accent);min-width:20px;text-align:center">0</span>
</div>
<div style="font-size:10px;color:var(--text3);margin-top:2px">Valuable for career growth, rarely moves the fellowship needle.</div>
</div>

</div>

<!-- Results Panel -->
<div id="roi-results" style="margin-top:20px">
<div style="padding:20px;background:var(--bg2);border-radius:12px;border:1px solid var(--border)">

<div style="text-align:center;margin-bottom:16px">
<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Portfolio Strength</div>
<div id="roi-score" style="font-size:42px;font-weight:700;color:var(--accent)">0%</div>
<div id="roi-grade" style="font-size:13px;font-weight:500;margin-top:4px;color:var(--text3)">Add your research to begin</div>
</div>

<div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden;margin-bottom:16px">
<div id="roi-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--red),var(--accent),var(--green));border-radius:4px;transition:width .4s ease"></div>
</div>

<div id="roi-breakdown" style="font-size:12px;color:var(--text2);line-height:1.8"></div>

<div id="roi-advice" style="margin-top:14px;padding:14px;border-radius:8px;border-left:3px solid var(--accent);background:rgba(200,168,124,.04)">
<div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:6px">NEXT MOVE</div>
<p id="roi-next" style="font-size:12px;color:var(--text2);line-height:1.6;margin:0">Start by entering your current research.</p>
</div>

<div id="roi-next-moves" style="margin-top:14px"></div>

<div id="roi-efficiency" style="margin-top:14px"></div>

<div id="roi-needle" style="margin-top:14px;padding:14px;background:var(--bg2);border-radius:10px;border:1px solid var(--border)"></div>

</div>

<div style="margin-top:14px;padding:14px;background:var(--bg2);border-radius:8px">
<div style="font-size:11px;font-weight:600;color:var(--text3);margin-bottom:6px">OPTIMAL PORTFOLIO BENCHMARK</div>
<p id="roi-benchmark-text" style="font-size:12px;color:var(--text2);line-height:1.7;margin:0">1-2 first-author papers + 2-3 abstracts + 1 case report = competitive applicant. Based on NRMP Charting Outcomes data for subspecialty fellowship matching.</p>
</div>

<div id="roi-match-link" style="margin-top:14px"></div>

<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Research Impact Calculator')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>
</div>`,

v8:`<h3>Debt & Income Strategy Tool</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">Score yourself on the 5 financial decisions that matter most. Get personalized recommendations based on your actual situation.</p>
<div style="font-size:13px">
<div style="font-weight:600;color:var(--accent);margin-bottom:12px">Your Financial Situation</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
<div class="fg"><label>Annual Salary ($)</label><input type="number" id="ilp-salary" placeholder="e.g., 400000"></div>
<div class="fg"><label>Student Loan Debt ($)</label><input type="number" id="ilp-debt" placeholder="e.g., 250000"></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
<div class="fg"><label>Loan Interest Rate (%)</label><input type="number" id="ilp-rate" placeholder="6.5" step="0.1"></div>
<div class="fg"><label>Employer Type</label><select id="ilp-employer" style="width:100%"><option value="">Select...</option><option value="nonprofit">Nonprofit / Academic</option><option value="government">Government / VA</option><option value="private">Private Practice</option><option value="employed">Hospital Employed (for-profit)</option></select></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
<div class="fg"><label>Disability Insurance</label><select id="ilp-disability" style="width:100%"><option value="">Select...</option><option value="own_occ">Own-occupation, specialty-specific</option><option value="any_occ">Any-occupation policy</option><option value="none">None</option></select></div>
<div class="fg"><label>Annual Spending ($)</label><input type="number" id="ilp-spending" placeholder="e.g., 120000"></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
<div class="fg"><label>Tax-Advantaged Accounts</label><select id="ilp-401k" style="width:100%"><option value="">Select...</option><option value="maxed">Maxing 401k + Roth + HSA</option><option value="match">Only employer match</option><option value="none">Not contributing</option></select></div>
<div class="fg"><label>Financial Advisor</label><select id="ilp-advisor" style="width:100%"><option value="">Select...</option><option value="feeonly">Fee-only fiduciary</option><option value="feebased">Fee-based</option><option value="commission">Commission-based</option><option value="none">No advisor</option></select></div>
</div>
<button onclick="ilpCalculate()" class="btn btn-a" style="width:100%;padding:14px;margin-bottom:8px">Analyze My Financial Leverage →</button>
<p style="font-size:10px;color:var(--text3);text-align:center;margin-bottom:16px">All calculations are local. Nothing is stored or sent externally.</p>
</div>
<div id="ilp-results"></div>
<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Sources: White Coat Investor, Council for Disability Awareness 2023, IRS 2024 limits.</p>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Debt & Income Strategy Tool')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>`,

v16:`<h3 class="serif">Interview Practice Tool</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Real interview questions. Real feedback. No sugarcoating. Select your situation and answer each question like you\u2019re sitting across from the program director or hiring committee.</p>

<div id="mis-tool" style="font-size:13px">

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
<div class="fg"><label style="font-size:11px;color:var(--text3)">What are you interviewing for?</label>
<select id="mis-type" onchange="misUpdateSpec()" style="width:100%">
<option value="">Select interview type...</option>
<option value="medschool">Medical School Admissions</option>
<option value="residency">Residency Match</option>
<option value="fellowship">Fellowship Match</option>
<option value="academic">Academic Faculty Position</option>
<option value="private">Private Practice / Group</option>
<option value="employed">Hospital-Employed Position</option>
<option value="salary">Salary Renegotiation / Promotion</option>
</select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Specialty</label>
<select id="mis-spec" style="width:100%">
<option value="">Select specialty...</option>
<option value="im_outpatient">Internal Medicine — Outpatient / Primary Care</option>
<option value="im_hospitalist">Internal Medicine — Hospitalist</option>
<option value="fm">Family Medicine</option>
<option value="cards">Cardiology</option>
<option value="ic">Interventional Cardiology</option>
<option value="ep">Electrophysiology</option>
<option value="hf">Advanced Heart Failure & Transplant</option>
<option value="gi">Gastroenterology</option>
<option value="pulm">Pulmonology / Critical Care</option>
<option value="hemonc">Hematology / Oncology</option>
<option value="neph">Nephrology</option>
<option value="endo">Endocrinology</option>
<option value="rheum">Rheumatology</option>
<option value="id">Infectious Disease</option>
<option value="em">Emergency Medicine</option>
<option value="anes">Anesthesiology</option>
<option value="ortho">Orthopedic Surgery</option>
<option value="gensurg">General Surgery</option>
<option value="ctsx">Cardiothoracic Surgery</option>
<option value="vsurg">Vascular Surgery</option>
<option value="uro">Urology</option>
<option value="ent">ENT (Otolaryngology)</option>
<option value="ophtho">Ophthalmology</option>
<option value="nsurg">Neurosurgery</option>
<option value="plastics">Plastic Surgery</option>
<option value="psych">Psychiatry</option>
<option value="derm">Dermatology</option>
<option value="rads">Radiology</option>
<option value="ir">Interventional Radiology</option>
<option value="path">Pathology</option>
<option value="peds">Pediatrics</option>
<option value="obgyn">OB/GYN</option>
<option value="neuro">Neurology</option>
<option value="pmr">PM&R</option>
<option value="radonc">Radiation Oncology</option>
<option value="other">Other</option>
</select></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
<div class="fg"><label style="font-size:11px;color:var(--text3)">Setting</label>
<select id="mis-setting" style="width:100%">
<option value="academic">Academic Medical Center</option>
<option value="community">Community Hospital</option>
<option value="private">Private Group Practice</option>
<option value="va">VA / Government</option>
</select></div>
<div class="fg"><label style="font-size:11px;color:var(--text3)">Years Out of Training</label>
<select id="mis-years" style="width:100%">
<option value="student">Still in medical school</option>
<option value="pgy">In residency/fellowship</option>
<option value="0">First job out of training</option>
<option value="3">1-3 years out</option>
<option value="5">4-7 years out</option>
<option value="10">8+ years out</option>
</select></div>
</div>

<button onclick="misStart()" class="btn btn-a" style="width:100%;padding:14px;margin-bottom:8px">Start Interview Practice \u2192</button>
<p style="font-size:10px;color:var(--text3);text-align:center;margin-bottom:20px">Your answers are analyzed locally. Nothing is stored or sent to anyone.</p>

<div id="mis-interview" style="display:none">
<div id="mis-header" style="padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:16px"></div>
<div id="mis-questions"></div>
<button onclick="misGrade()" class="btn btn-a" style="width:100%;padding:14px;margin-top:8px;margin-bottom:8px">Get Interview Feedback \u2192</button>
<p id="mis-grade-hint" style="font-size:10px;color:var(--text3);text-align:center;margin-bottom:16px">Answer all questions before submitting for the best feedback.</p>
</div>

<div id="mis-feedback"></div>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Interview Practice Tool')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>
</div>`,

v9:`<h3>Application Review Tool</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Complete this intake form and submit it directly to Dr. Faroqui for review. Be thorough — the more detail you provide, the more targeted the strategic guidance.</p>

<div style="font-size:12px" id="audit-form">

<div style="margin-bottom:20px">
<div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:12px">Part 1: Current Position</div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Current training level / position</label><textarea id="audit-1a" rows="2" placeholder="e.g. PGY-3 IM Resident at..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Institution strengths and limitations</label><textarea id="audit-1b" rows="2" placeholder="What does your program do well? Where does it fall short?" style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Financial situation (debt, savings, obligations)</label><textarea id="audit-1c" rows="2" placeholder="Approximate loan balance, savings, dependents..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">CV snapshot (publications, scores, leadership)</label><textarea id="audit-1d" rows="2" placeholder="# of pubs, board scores, leadership roles..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What are you known for?</label><textarea id="audit-1e" rows="2" placeholder="Your reputation, differentiator, niche..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
</div>

<div style="margin-bottom:20px">
<div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:12px">Part 2: The Decision</div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What specific decision are you facing?</label><textarea id="audit-2a" rows="2" placeholder="The core question or crossroad..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What are all your options (including "do nothing")?</label><textarea id="audit-2b" rows="2" placeholder="List every option you're considering..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What is the timeline?</label><textarea id="audit-2c" rows="1" placeholder="When does this decision need to be made?" style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What have you already tried?</label><textarea id="audit-2d" rows="2" placeholder="Steps taken, people consulted..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What's holding you back?</label><textarea id="audit-2e" rows="2" placeholder="Fears, uncertainties, constraints..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
</div>

<div style="margin-bottom:20px">
<div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:12px">Part 3: Constraints & Priorities</div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Non-negotiables (location, income, lifestyle)</label><textarea id="audit-3a" rows="2" placeholder="What can't you compromise on?" style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What are you willing to sacrifice?</label><textarea id="audit-3b" rows="2" placeholder="Tradeoffs you'd accept..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Who else is affected by this decision?</label><textarea id="audit-3c" rows="1" placeholder="Family, partner, dependents..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What does success look like in 1 year? 5 years?</label><textarea id="audit-3d" rows="2" placeholder="Your vision for the outcome..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What would you regret not doing?</label><textarea id="audit-3e" rows="2" placeholder="The regret test..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
</div>

<div style="margin-bottom:20px">
<div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:12px">Part 4: Information Gaps</div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What information would make this decision easier?</label><textarea id="audit-4a" rows="2" placeholder="What do you wish you knew?" style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Who have you talked to about this?</label><textarea id="audit-4b" rows="2" placeholder="Mentors, colleagues, advisors..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Worst realistic outcome of each option?</label><textarea id="audit-4c" rows="2" placeholder="Be honest with the downside..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Best realistic outcome of each option?</label><textarea id="audit-4d" rows="2" placeholder="The upside if it works..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Is this decision reversible?</label><textarea id="audit-4e" rows="1" placeholder="Can you course-correct if needed?" style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
</div>

<div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
<button class="btn btn-a" onclick="submitAudit()" style="width:100%;padding:14px">Submit Audit to Dr. Faroqui →</button>
<p style="font-size:10px;color:var(--text3);margin-top:10px;text-align:center">Your responses will be sent directly to Dr. Faroqui for review. Expect a response within 7 business days.</p>
</div>

</div>

<div id="audit-success" class="hidden" style="text-align:center;padding:40px 20px">
<div style="font-size:48px;margin-bottom:16px">✓</div>
<h3 class="serif" style="font-size:20px;margin-bottom:8px">Audit Submitted</h3>
<p style="font-size:13px;color:var(--text2);line-height:1.6">Your strategic audit has been sent to Dr. Faroqui. You'll receive a response within 7 business days.</p>
</div>`,

v10:`<h3>Career Transition Planner</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Work through each step. Your answers are compiled into a report and sent directly to Dr. Faroqui for strategic review.</p>
<div style="font-size:12px" id="pivot-form">

<!-- STEP 1 -->
<div style="margin-bottom:24px">
<div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:4px">Step 1: Diagnose the Dissatisfaction</div>
<p style="font-size:11px;color:var(--text3);margin-bottom:14px;line-height:1.5">Before pivoting, identify what's actually wrong. Changing specialties when the real problem is a toxic workplace is expensive and unnecessary.</p>

<div style="margin-bottom:14px">
<label style="display:block;font-size:11px;color:var(--text3);margin-bottom:6px">What is the core issue?</label>
<div id="pivot-cause" style="display:flex;flex-direction:column;gap:6px">
<label style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="pivotSelect(this,'pivot-cause')"><input type="radio" name="pivot-cause" value="specialty" style="accent-color:var(--accent)"> <span>The specialty itself</span></label>
<label style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="pivotSelect(this,'pivot-cause')"><input type="radio" name="pivot-cause" value="setting" style="accent-color:var(--accent)"> <span>The practice setting</span></label>
<label style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="pivotSelect(this,'pivot-cause')"><input type="radio" name="pivot-cause" value="job" style="accent-color:var(--accent)"> <span>The specific job / employer</span></label>
<label style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="pivotSelect(this,'pivot-cause')"><input type="radio" name="pivot-cause" value="burnout" style="accent-color:var(--accent)"> <span>Burnout</span></label>
<label style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="pivotSelect(this,'pivot-cause')"><input type="radio" name="pivot-cause" value="other" style="accent-color:var(--accent)"> <span>Other</span></label>
<div id="pivot-cause-other" class="hidden" style="margin-top:6px"><textarea id="pivot-cause-other-text" rows="2" placeholder="Describe your situation..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
</div>
<div id="pivot-cause-feedback" style="margin-top:8px"></div>
</div>

<div style="margin-bottom:14px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What specifically do you dislike?</label><textarea id="pivot-1a" rows="3" placeholder="Be specific — what drains you, frustrates you, or feels wrong..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>

<div style="margin-bottom:14px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Would the same specialty in a different setting fix it?</label><textarea id="pivot-1b" rows="2" placeholder="Think about the specialty vs. the environment..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>

<div style="margin-bottom:14px">
<label style="display:block;font-size:11px;color:var(--text3);margin-bottom:6px">Are you burned out (temporary) or misaligned (structural)?</label>
<div id="pivot-burnout" style="display:flex;flex-direction:column;gap:6px">
<label style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="pivotSelect(this,'pivot-burnout')"><input type="radio" name="pivot-burnout" value="burnout" style="accent-color:var(--accent)"> <span>Burned out — I used to love this, now I'm exhausted</span></label>
<label style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="pivotSelect(this,'pivot-burnout')"><input type="radio" name="pivot-burnout" value="misaligned" style="accent-color:var(--accent)"> <span>Misaligned — this was never the right fit</span></label>
<label style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="pivotSelect(this,'pivot-burnout')"><input type="radio" name="pivot-burnout" value="unsure" style="accent-color:var(--accent)"> <span>Not sure — hard to tell right now</span></label>
</div>
<div id="pivot-burnout-feedback" style="margin-top:8px"></div>
</div>
</div>

<!-- STEP 2 -->
<div style="margin-bottom:24px">
<div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:4px">Step 2: Map the Options</div>
<p style="font-size:11px;color:var(--text3);margin-bottom:14px;line-height:1.5">Rate each option 1-5 across four dimensions. Higher = better.</p>
<div style="overflow-x:auto">
<table style="width:100%;border-collapse:collapse;font-size:11px;min-width:340px">
<thead><tr style="border-bottom:2px solid var(--border)">
<th style="text-align:left;padding:8px 6px;color:var(--text3)">Option</th>
<th style="text-align:center;padding:8px 4px;color:var(--text3);font-size:10px">Feasibility</th>
<th style="text-align:center;padding:8px 4px;color:var(--text3);font-size:10px">Financial</th>
<th style="text-align:center;padding:8px 4px;color:var(--text3);font-size:10px">Timeline</th>
<th style="text-align:center;padding:8px 4px;color:var(--text3);font-size:10px">Satisfaction</th>
<th style="text-align:center;padding:8px 4px;color:var(--accent);font-size:10px;font-weight:600">Avg</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 6px"><span style="font-weight:500">Stay + Modify</span><br><span style="font-size:10px;color:var(--text3)">e.g. Same specialty, but switch from academic to private practice</span></td><td style="text-align:center;padding:4px"><select id="pv-stay-f" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-stay-i" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-stay-t" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-stay-s" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px;font-weight:600;color:var(--accent)" id="pv-stay-avg">\u2014</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 6px"><span style="font-weight:500">Adjacent Pivot</span><br><span style="font-size:10px;color:var(--text3)">e.g. Cardiologist → interventional cardiology or cardiac imaging</span></td><td style="text-align:center;padding:4px"><select id="pv-adj-f" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-adj-i" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-adj-t" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-adj-s" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px;font-weight:600;color:var(--accent)" id="pv-adj-avg">\u2014</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 6px"><span style="font-weight:500">Full Pivot</span><br><span style="font-size:10px;color:var(--text3)">e.g. Internal medicine → dermatology or leaving clinical medicine entirely</span></td><td style="text-align:center;padding:4px"><select id="pv-full-f" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-full-i" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-full-t" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-full-s" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px;font-weight:600;color:var(--accent)" id="pv-full-avg">\u2014</td></tr>
<tr><td style="padding:8px 6px"><span style="font-weight:500">Hybrid</span><br><span style="font-size:10px;color:var(--text3)">e.g. Keep clinical 3 days/week + consulting, med-tech, or teaching on the side</span></td><td style="text-align:center;padding:4px"><select id="pv-hyb-f" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-hyb-i" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-hyb-t" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px"><select id="pv-hyb-s" onchange="pivotCalcAvg()" style="width:44px;font-size:11px;padding:4px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text)"><option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></td><td style="text-align:center;padding:4px;font-weight:600;color:var(--accent)" id="pv-hyb-avg">\u2014</td></tr>
</tbody></table></div>
<div id="pivot-recommendation" style="margin-top:10px"></div>
</div>

<!-- STEP 3 -->
<div style="margin-bottom:24px">
<div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:4px">Step 3: Financial Reality Check</div>
<p style="font-size:11px;color:var(--text3);margin-bottom:14px;line-height:1.5">Honest numbers only. This section protects you from emotional decisions.</p>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">What's your current debt load and monthly obligations?</label><textarea id="pivot-3a" rows="2" placeholder="e.g. $280K student loans, $3,200/mo minimum payments, $1,800 rent..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">How long can you sustain reduced income during transition?</label><textarea id="pivot-3b" rows="2" placeholder="e.g. 6 months with current savings, partner income covers basics..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Does the new path have comparable earning potential long-term?</label><textarea id="pivot-3c" rows="2" placeholder="Compare current vs. projected income at 5 and 10 years..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
<div style="margin-bottom:14px">
<label style="display:block;font-size:11px;color:var(--text3);margin-bottom:6px">Training Cost Calculator</label>
<div style="padding:14px;background:var(--bg2);border-radius:8px;border:1px solid var(--border)">
<div style="display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap">
<div style="flex:1;min-width:130px"><label style="font-size:10px;color:var(--text3)">Additional training (years)</label><input type="number" id="pivot-train-yrs" value="0" min="0" max="10" step="1" oninput="pivotCalcTraining()" style="width:100%;font-size:12px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);margin-top:4px"></div>
<div style="flex:1;min-width:130px"><label style="font-size:10px;color:var(--text3)">Tuition / fees per year ($)</label><input type="number" id="pivot-train-cost" value="0" min="0" step="1000" oninput="pivotCalcTraining()" style="width:100%;font-size:12px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);margin-top:4px"></div>
</div>
<div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap">
<div style="flex:1;min-width:130px"><label style="font-size:10px;color:var(--text3)">Lost salary per year ($)</label><input type="number" id="pivot-train-salary" value="0" min="0" step="5000" oninput="pivotCalcTraining()" style="width:100%;font-size:12px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);margin-top:4px"></div>
<div style="flex:1;min-width:130px"><label style="font-size:10px;color:var(--text3)">Stipend / income during ($)</label><input type="number" id="pivot-train-stipend" value="0" min="0" step="5000" oninput="pivotCalcTraining()" style="width:100%;font-size:12px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);margin-top:4px"></div>
</div>
<div id="pivot-train-result" style="padding:10px;background:var(--bg);border-radius:6px;text-align:center"><span style="font-size:12px;color:var(--text3)">Enter values above to calculate total cost</span></div>
</div></div>
<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text3);margin-bottom:4px">Do you have 6-12 months of expenses saved?</label><textarea id="pivot-3d" rows="2" placeholder="Current emergency fund status..." style="width:100%;font-family:inherit;font-size:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);resize:vertical"></textarea></div>
</div>

<!-- STEP 4 -->
<div style="margin-bottom:24px">
<div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:4px">Step 4: Test Before Committing</div>
<p style="font-size:11px;color:var(--text3);margin-bottom:14px;line-height:1.5">Check off the validation steps you've completed or plan to complete.</p>
<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer"><input type="checkbox" id="pv-check-1" style="accent-color:var(--accent)"> <span style="font-size:12px;color:var(--text2)">Shadow someone in the new role for a week</span></label>
<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer"><input type="checkbox" id="pv-check-2" style="accent-color:var(--accent)"> <span style="font-size:12px;color:var(--text2)">Informational interviews with 3+ people who made a similar pivot</span></label>
<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer"><input type="checkbox" id="pv-check-3" style="accent-color:var(--accent)"> <span style="font-size:12px;color:var(--text2)">Try a side project or moonlighting in the new area</span></label>
<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer"><input type="checkbox" id="pv-check-4" style="accent-color:var(--accent)"> <span style="font-size:12px;color:var(--text2)">Set a decision deadline (no analysis paralysis)</span></label>
</div>
<div style="margin-bottom:14px">
<label style="display:block;font-size:12px;font-weight:500;color:var(--text);margin-bottom:8px">Key question: In 5 years, will you regret not trying?</label>
<div style="display:flex;gap:8px">
<label style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer;text-align:center" onclick="pivotSelect(this,'pivot-regret')"><input type="radio" name="pivot-regret" value="yes" style="accent-color:var(--accent)"> <span style="font-size:13px;font-weight:500">Yes</span></label>
<label style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer;text-align:center" onclick="pivotSelect(this,'pivot-regret')"><input type="radio" name="pivot-regret" value="no" style="accent-color:var(--accent)"> <span style="font-size:13px;font-weight:500">No</span></label>
</div>
<div id="pivot-regret-feedback" style="margin-top:8px"></div>
</div>
</div>

<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:20px"><p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0"><strong>Important:</strong> Do not make major career pivots while actively burned out. Stabilize first (therapy, time off, boundary changes), then evaluate with a clear mind.</p></div>

<div style="padding-top:20px;border-top:1px solid var(--border)">
<button class="btn btn-a" onclick="submitPivot()" style="width:100%;padding:14px">Submit Decision Engine Report \u2192</button>
<p style="font-size:10px;color:var(--text3);margin-top:10px;text-align:center">Your complete report will be sent to Dr. Faroqui for strategic review.</p>
</div>
</div>

<div id="pivot-success" class="hidden" style="text-align:center;padding:40px 20px">
<div style="font-size:48px;margin-bottom:16px">\u2713</div>
<h3 class="serif" style="font-size:20px;margin-bottom:8px">Report Submitted</h3>
<p style="font-size:13px;color:var(--text2);line-height:1.6">Your Career Transition Planner report has been sent to Dr. Faroqui for review.</p>
</div>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Career Transition Planner')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>`,
v12:`<div style="text-align:center;padding:28px 20px;margin:-20px -20px 24px;background:linear-gradient(160deg,rgba(200,168,124,.1),rgba(200,168,124,.03));border-radius:12px 12px 0 0;border-bottom:1px solid rgba(200,168,124,.15)">
<div style="font-size:36px;margin-bottom:8px">\ud83d\udcdd</div>
<h3 class="serif" style="font-size:22px;margin-bottom:4px">Contract Review Tool</h3>
<p style="font-size:11px;color:var(--text3)">Input your offer details. Get a competitiveness score, risk analysis, and negotiation strategy.</p>
</div>

<div style="font-size:13px">
<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px">\ud83d\udccb Enter Your Contract Details</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Specialty</label>
<select id="ci-spec" onchange="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="im">IM — Outpatient / Primary Care</option><option value="hosp">IM — Hospitalist</option><option value="cards">General Cardiology</option><option value="ic" selected>Interventional Cardiology</option><option value="ep">Electrophysiology</option><option value="ct_surg">CT Surgery</option><option value="gi">GI</option><option value="pulm">Pulm/CC</option><option value="heme_onc">Heme/Onc</option><option value="nephro">Nephrology</option><option value="rheum">Rheumatology</option><option value="endo">Endocrinology</option><option value="id">Infectious Disease</option><option value="gen_surg">General Surgery</option><option value="ortho">Orthopedic Surgery</option><option value="uro">Urology</option><option value="ent">ENT</option><option value="derm">Dermatology</option><option value="rad">Radiology</option><option value="anes">Anesthesiology</option><option value="er">Emergency Medicine</option><option value="fm">Family Medicine</option><option value="psych">Psychiatry</option><option value="pm_r">PM&R</option><option value="neuro">Neurology</option><option value="path">Pathology</option><option value="ophtho">Ophthalmology</option><option value="peds">Pediatrics</option><option value="nsurg">Neurosurgery</option><option value="plastics">Plastic Surgery</option><option value="ir">Interventional Radiology</option><option value="vascular">Vascular Surgery</option><option value="obgyn">OB/GYN</option><option value="ct_integrated">Thoracic Surgery (Integrated)</option><option value="rad_onc">Radiation Oncology</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Base Salary ($K)</label>
<input id="ci-salary" type="number" value="425" onchange="ciCalc()" oninput="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);box-sizing:border-box" placeholder="e.g. 425"></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">RVU Rate ($)</label>
<input id="ci-rvu" type="number" value="52" onchange="ciCalc()" oninput="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);box-sizing:border-box" placeholder="0 if salary-only"></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Signing Bonus ($K)</label>
<input id="ci-signing" type="number" value="30" onchange="ciCalc()" oninput="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);box-sizing:border-box" placeholder="e.g. 30"></div>
</div>

<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.2px;margin:20px 0 14px">\u2696\ufe0f Risk & Structure</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Non-Compete Radius (mi)</label>
<input id="ci-nc-radius" type="number" value="15" onchange="ciCalc()" oninput="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);box-sizing:border-box" placeholder="0 if none"></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Non-Compete Years</label>
<input id="ci-nc-years" type="number" value="1" onchange="ciCalc()" oninput="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);box-sizing:border-box" placeholder="0 if none"></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Tail Coverage</label>
<select id="ci-tail" onchange="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="employer">Employer pays</option><option value="occurrence">Occurrence policy</option><option value="split">Split cost</option><option value="you">I pay full tail</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Termination Notice (days)</label>
<input id="ci-term-notice" type="number" value="90" onchange="ciCalc()" oninput="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);box-sizing:border-box" placeholder="e.g. 90"></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Clawback Period (yrs)</label>
<input id="ci-clawback" type="number" value="2" onchange="ciCalc()" oninput="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);box-sizing:border-box" placeholder="0 if none"></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Call Frequency</label>
<select id="ci-call" onchange="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="none">No call</option><option value="1in6" selected>1:6 or less</option><option value="1in4">1:4</option><option value="1in3">1:3 or more</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Call Compensated?</label>
<select id="ci-call-comp" onchange="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="yes" selected>Yes</option><option value="no">No</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Retirement Match (%)</label>
<input id="ci-ret" type="number" value="4" onchange="ciCalc()" oninput="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);box-sizing:border-box" placeholder="e.g. 4"></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">CME Allowance ($)</label>
<input id="ci-cme" type="number" value="3000" onchange="ciCalc()" oninput="ciCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);box-sizing:border-box" placeholder="e.g. 3000"></div>
</div>

<div id="ci-output" style="margin-top:24px"></div>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Contract Review Tool')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>
</div>`,

v11:`<div style="text-align:center;padding:28px 20px;margin:-20px -20px 24px;background:linear-gradient(160deg,rgba(200,168,124,.1),rgba(200,168,124,.03));border-radius:12px 12px 0 0;border-bottom:1px solid rgba(200,168,124,.15)">
<div style="font-size:36px;margin-bottom:8px">\ud83d\udcb0</div>
<h3 class="serif" style="font-size:22px;margin-bottom:4px">Financial Projection Tool</h3>
<p style="font-size:12px;color:var(--text3);margin-bottom:4px">The $10 Million Decision Calculator</p>
<p style="font-size:11px;color:var(--text3)">See how your specialty choice, fellowship, and practice type impact lifetime wealth.</p>
</div>

<div style="font-size:13px">
<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px">\ud83c\udfaf Build Your Scenarios</div>
<p style="font-size:12px;color:var(--text3);margin-bottom:18px">Configure up to 3 career paths. The graph updates instantly.</p>

<div id="ft-scenarios">
<div class="card" style="padding:16px;margin-bottom:10px;border-color:var(--accent)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font-size:12px;font-weight:600;color:var(--accent)">Scenario A</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Specialty</label>
<select id="ft-spec-a" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="im">IM — Outpatient / Primary Care</option>
<option value="hosp">IM — Hospitalist</option>
<option value="cards">General Cardiology</option>
<option value="ic" selected>Interventional Cardiology</option>
<option value="ep">Electrophysiology</option>
<option value="ct_surg">CT Surgery</option>
<option value="gi">Gastroenterology</option>
<option value="pulm">Pulm/Critical Care</option>
<option value="heme_onc">Heme/Onc</option>
<option value="nephro">Nephrology</option>
<option value="rheum">Rheumatology</option>
<option value="endo">Endocrinology</option>
<option value="id">Infectious Disease</option>
<option value="gen_surg">General Surgery</option>
<option value="ortho">Orthopedic Surgery</option>
<option value="uro">Urology</option>
<option value="ent">ENT</option>
<option value="derm">Dermatology</option>
<option value="rad">Radiology</option>
<option value="anes">Anesthesiology</option>
<option value="er">Emergency Medicine</option>
<option value="fm">Family Medicine</option>
<option value="psych">Psychiatry</option>
<option value="pm_r">PM&R</option>
<option value="neuro">Neurology</option>
<option value="path">Pathology</option>
<option value="ophtho">Ophthalmology</option>
<option value="peds">Pediatrics</option>
<option value="nsurg">Neurosurgery</option>
<option value="plastics">Plastic Surgery</option>
<option value="ir">Interventional Radiology</option>
<option value="vascular">Vascular Surgery</option>
<option value="obgyn">OB/GYN</option>
<option value="ct_integrated">Thoracic Surgery (Integrated)</option>
<option value="rad_onc">Radiation Oncology</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Practice Type</label>
<select id="ft-prac-a" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="academic">Academic</option>
<option value="employed" selected>Hospital Employed</option>
<option value="private">Private Practice</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Savings Rate</label>
<select id="ft-save-a" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="0.10">10%</option>
<option value="0.20" selected>20%</option>
<option value="0.30">30%</option>
<option value="0.40">40%</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Current Stage</label>
<select id="ft-stage-a" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="ms">Medical Student</option>
<option value="res" selected>Resident</option>
<option value="fellow">Fellow</option>
<option value="attending">Attending</option>
</select></div>
</div>
</div>

<div class="card" style="padding:16px;margin-bottom:10px;border-color:var(--blue)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font-size:12px;font-weight:600;color:var(--blue)">Scenario B</span><span id="ft-toggle-b" style="font-size:10px;color:var(--accent);cursor:pointer" onclick="document.getElementById('ft-fields-b').classList.toggle('hidden');ftCalc()">Show/Hide</span></div>
<div id="ft-fields-b">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Specialty</label>
<select id="ft-spec-b" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="im">IM — Outpatient / Primary Care</option>
<option value="hosp" selected>IM — Hospitalist</option>
<option value="cards">General Cardiology</option>
<option value="ic">Interventional Cardiology</option>
<option value="ep">Electrophysiology</option>
<option value="ct_surg">CT Surgery</option>
<option value="gi">Gastroenterology</option>
<option value="pulm">Pulm/Critical Care</option>
<option value="heme_onc">Heme/Onc</option>
<option value="nephro">Nephrology</option>
<option value="rheum">Rheumatology</option>
<option value="endo">Endocrinology</option>
<option value="id">Infectious Disease</option>
<option value="gen_surg">General Surgery</option>
<option value="ortho">Orthopedic Surgery</option>
<option value="nsurg">Neurosurgery</option>
<option value="uro">Urology</option>
<option value="ent">ENT</option>
<option value="derm">Dermatology</option>
<option value="plastics">Plastic Surgery</option>
<option value="rad">Radiology</option>
<option value="ir">Interventional Radiology</option>
<option value="anes">Anesthesiology</option>
<option value="er">Emergency Medicine</option>
<option value="fm">Family Medicine</option>
<option value="psych">Psychiatry</option>
<option value="pm_r">PM&R</option>
<option value="neuro">Neurology</option>
<option value="path">Pathology</option>
<option value="ophtho">Ophthalmology</option>
<option value="peds">Pediatrics</option>
<option value="obgyn">OB/GYN</option>
<option value="vascular">Vascular Surgery</option>
<option value="ct_integrated">Thoracic Surgery (Integrated)</option>
<option value="rad_onc">Radiation Oncology</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Practice Type</label>
<select id="ft-prac-b" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="academic">Academic</option>
<option value="employed" selected>Hospital Employed</option>
<option value="private">Private Practice</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Savings Rate</label>
<select id="ft-save-b" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="0.10">10%</option>
<option value="0.20" selected>20%</option>
<option value="0.30">30%</option>
<option value="0.40">40%</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Current Stage</label>
<select id="ft-stage-b" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="ms">Medical Student</option>
<option value="res" selected>Resident</option>
<option value="fellow">Fellow</option>
<option value="attending">Attending</option>
</select></div>
</div>
</div>
</div>

<div class="card" style="padding:16px;margin-bottom:10px;border-color:var(--green)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font-size:12px;font-weight:600;color:var(--green)">Scenario C</span><span style="font-size:10px;color:var(--accent);cursor:pointer" onclick="document.getElementById('ft-fields-c').classList.toggle('hidden');ftCalc()">Show/Hide</span></div>
<div id="ft-fields-c" class="hidden">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Specialty</label>
<select id="ft-spec-c" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="im">IM — Outpatient / Primary Care</option>
<option value="hosp">IM — Hospitalist</option>
<option value="cards" selected>General Cardiology</option>
<option value="ic">Interventional Cardiology</option>
<option value="ep">Electrophysiology</option>
<option value="ct_surg">CT Surgery</option>
<option value="gi">Gastroenterology</option>
<option value="pulm">Pulm/Critical Care</option>
<option value="heme_onc">Heme/Onc</option>
<option value="nephro">Nephrology</option>
<option value="rheum">Rheumatology</option>
<option value="endo">Endocrinology</option>
<option value="id">Infectious Disease</option>
<option value="gen_surg">General Surgery</option>
<option value="ortho">Orthopedic Surgery</option>
<option value="nsurg">Neurosurgery</option>
<option value="uro">Urology</option>
<option value="ent">ENT</option>
<option value="derm">Dermatology</option>
<option value="plastics">Plastic Surgery</option>
<option value="rad">Radiology</option>
<option value="ir">Interventional Radiology</option>
<option value="anes">Anesthesiology</option>
<option value="er">Emergency Medicine</option>
<option value="fm">Family Medicine</option>
<option value="psych">Psychiatry</option>
<option value="pm_r">PM&R</option>
<option value="neuro">Neurology</option>
<option value="path">Pathology</option>
<option value="ophtho">Ophthalmology</option>
<option value="peds">Pediatrics</option>
<option value="obgyn">OB/GYN</option>
<option value="vascular">Vascular Surgery</option>
<option value="ct_integrated">Thoracic Surgery (Integrated)</option>
<option value="rad_onc">Radiation Oncology</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Practice Type</label>
<select id="ft-prac-c" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="academic">Academic</option>
<option value="employed">Hospital Employed</option>
<option value="private" selected>Private Practice</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Savings Rate</label>
<select id="ft-save-c" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="0.10">10%</option>
<option value="0.20">20%</option>
<option value="0.30" selected>30%</option>
<option value="0.40">40%</option>
</select></div>
<div><label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Current Stage</label>
<select id="ft-stage-c" onchange="ftCalc()" style="width:100%;padding:8px;font-size:12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text)">
<option value="ms">Medical Student</option>
<option value="res" selected>Resident</option>
<option value="fellow">Fellow</option>
<option value="attending">Attending</option>
</select></div>
</div>
</div>
</div>
</div>

<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.2px;margin:28px 0 14px">\ud83d\udcc8 30-Year Wealth Trajectory</div>
<div style="position:relative;width:100%;height:280px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:8px">
<canvas id="ft-chart" style="width:100%;height:100%"></canvas>
</div>
<div id="ft-legend" style="display:flex;gap:16px;justify-content:center;font-size:11px;margin-bottom:24px"></div>

<div id="ft-summary" style="margin-bottom:20px"></div>

<div id="ft-insights" style="margin-bottom:20px"></div>

<p style="font-size:10px;color:var(--text3);line-height:1.6;font-style:italic;margin-top:16px">Based on MGMA 2024 compensation data. Assumes 7% annual investment return, 3% annual salary growth, and $250K starting student debt. This is a modeling tool \u2014 not financial advice. Consult a financial professional for personalized planning.</p>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Financial Projection Tool')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>
</div>`
,
v13:`<h3 class="serif">Specialty Fit Assessment</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Answer honestly — this tool helps you identify which specialties align with your personality, goals, and lifestyle preferences.</p>
<div id="sfa-tool" style="font-size:13px">

<!-- Mode Toggle: Specialty Fit vs Burnout Diagnostic -->
<div style="display:flex;gap:0;margin-bottom:20px;border:1px solid rgba(200,168,124,.25);border-radius:10px;overflow:hidden">
<button id="sfa-btn-fit" onclick="sfaToggleMode('fit')" style="flex:1;padding:12px;font-size:13px;font-weight:600;border:none;cursor:pointer;background:var(--accent);color:var(--bg);transition:all .2s">🧬 Find Your Specialty</button>
<button id="sfa-btn-burn" onclick="sfaToggleMode('burn')" style="flex:1;padding:12px;font-size:13px;font-weight:600;border:none;cursor:pointer;background:none;color:var(--accent);transition:all .2s">🔥 Burnout vs. Misfit</button>
</div>

<!-- ===== PANEL 1: Specialty Fit (existing) ===== -->
<div id="sfa-fit-panel">

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>1. Patient Interaction Style</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">What type of patient relationships do you prefer?</span>
<select id="sfa-q1" onchange="sfaUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="long">Long-term relationships (years)</option>
<option value="episode">Episodic but meaningful (weeks/months)</option>
<option value="acute">Acute, high-intensity encounters</option>
<option value="minimal">Minimal direct patient contact</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>2. Procedural Interest</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">How much do you want to work with your hands?</span>
<select id="sfa-q2" onchange="sfaUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="heavy">Heavily procedural — I love the cath lab / OR</option>
<option value="mix">Mix of procedures and clinic</option>
<option value="cognitive">Primarily cognitive / diagnostic</option>
<option value="none">No procedures preferred</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>3. Lifestyle Priority</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">How important is work-life balance vs. income?</span>
<select id="sfa-q3" onchange="sfaUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="lifestyle">Lifestyle is top priority — I want predictable hours</option>
<option value="balanced">Balanced — good income with reasonable hours</option>
<option value="income">Income-focused — I'll work hard for high compensation</option>
<option value="mission">Mission-driven — I'll sacrifice income/lifestyle for impact</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>4. Intellectual Style</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">What kind of thinking energizes you?</span>
<select id="sfa-q4" onchange="sfaUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="complex">Complex diagnostic puzzles</option>
<option value="systems">Systems thinking and management</option>
<option value="technical">Technical mastery and precision</option>
<option value="breadth">Broad knowledge across many areas</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>5. Practice Setting</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Where do you see yourself working?</span>
<select id="sfa-q5" onchange="sfaUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="academic">Academic medical center</option>
<option value="community">Community hospital</option>
<option value="private">Private practice / group</option>
<option value="flexible">Flexible — open to anything</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>6. Tolerance for Uncertainty</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">How comfortable are you with ambiguity and high-stakes decisions?</span>
<select id="sfa-q6" onchange="sfaUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="high">Thrive in uncertainty — EM, ICU, surgery</option>
<option value="moderate">Moderate — I like guidelines with room for judgment</option>
<option value="low">Prefer structured, predictable work</option>
</select>
</div>

<div id="sfa-results" style="margin-top:20px"></div>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Specialty Fit Assessment')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>

</div><!-- end sfa-fit-panel -->

<!-- ===== PANEL 2: Burnout vs Misfit Diagnostic ===== -->
<div id="sfa-burn-panel" style="display:none">

<div style="padding:10px 14px;background:rgba(200,168,124,.06);border:1px solid rgba(200,168,124,.12);border-radius:10px;margin-bottom:18px">
<div style="font-size:11px;color:var(--accent);font-weight:600;margin-bottom:4px">WHAT THIS DOES</div>
<div style="font-size:12px;color:var(--text2);line-height:1.6">50% of physicians report burnout. But burnout, specialty misfit, and practice model mismatch require completely different solutions. This 5-minute assessment tells you which one you are actually experiencing.</div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>1. How do you feel about the core clinical work of your specialty?</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Not your schedule, not your colleagues, not the paperwork. The actual medicine.</span>
<select id="bmd-q1" onchange="bmdUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="love">I still love the clinical work itself</option>
<option value="neutral">It is fine — neither energizing nor draining</option>
<option value="dread_parts">I dread significant parts of the daily work</option>
<option value="dread_all">I dread most of what this specialty requires day-to-day</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>2. What do you dread most about going to work?</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Pick the one that resonates most strongly.</span>
<select id="bmd-q2" onchange="bmdUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="clinical">The clinical work itself — patients, procedures, diagnoses</option>
<option value="admin">The administration — charting, prior auths, bureaucracy</option>
<option value="culture">The people and culture — toxic colleagues, poor leadership</option>
<option value="hours">The hours and call schedule</option>
<option value="comp">The compensation relative to what I sacrifice</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>3. After a day of mostly clinical work (not admin), how do you feel?</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Think about a day where you spent most of your time with patients or doing procedures.</span>
<select id="bmd-q3" onchange="bmdUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="energized">Tired but satisfied — I did meaningful work</option>
<option value="neutral">Neutral — it was fine</option>
<option value="drained">Drained — even good clinical days leave me depleted</option>
<option value="empty">Empty — I feel nothing or resentment</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>4. If you could do the same specialty at a completely different practice — new city, new employer, new team, better schedule — would you be excited?</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">This is the key differentiator between environment and specialty problems.</span>
<select id="bmd-q4" onchange="bmdUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="yes_excited">Yes — I would be genuinely excited to start fresh</option>
<option value="maybe">Maybe — it might help but I am not sure</option>
<option value="no_same">No — I think I would feel the same anywhere in this field</option>
<option value="no_done">No — I am done with this type of work entirely</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>5. How would you describe your current workplace autonomy and culture?</strong></div>
<select id="bmd-q5" onchange="bmdUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="great">Supportive environment with good autonomy</option>
<option value="ok">Acceptable — not great, not terrible</option>
<option value="poor">Poor — micromanaged, unsupportive, or disorganized</option>
<option value="toxic">Toxic — actively harmful to my wellbeing</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>6. How sustainable is your current schedule and workload?</strong></div>
<select id="bmd-q6" onchange="bmdUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="sustainable">Sustainable — I can maintain this long-term</option>
<option value="heavy">Heavy but manageable for now</option>
<option value="unsustainable">Unsustainable — I am running on fumes</option>
<option value="destroying">Destroying my health and relationships</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>7. How fairly compensated do you feel for what you sacrifice?</strong></div>
<select id="bmd-q7" onchange="bmdUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="fair">Fairly compensated for my work</option>
<option value="low">Somewhat underpaid but acceptable</option>
<option value="unfair">Significantly underpaid for what I do</option>
<option value="insulting">The compensation feels insulting relative to my sacrifice</option>
</select>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>8. When someone asks "what do you do?", do you feel pride in your specialty?</strong></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Not pride in being a doctor. Pride in your specific field.</span>
<select id="bmd-q8" onchange="bmdUpdate()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="yes">Yes — I am proud to do what I do</option>
<option value="sometimes">Sometimes — it depends on the day</option>
<option value="rarely">Rarely — I feel disconnected from the identity</option>
<option value="no">No — I do not identify with this specialty anymore</option>
</select>
</div>

<div id="bmd-results" style="margin-top:20px"></div>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Burnout vs Misfit Diagnostic')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>

</div><!-- end sfa-burn-panel -->

</div>`,

v14:`<h3 class="serif">Match Probability Calculator</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Comprehensive competitiveness analysis with match probability, pre-ERAS action plan, LOR strategy, and specialty-specific benchmarking.</p>
<div id="mcc-tool" style="font-size:13px">

<!-- Mode Toggle: Residency vs Fellowship -->
<input type="hidden" id="mcc-mode" value="residency">
<div style="display:flex;gap:0;margin-bottom:20px;border:1px solid rgba(200,168,124,.25);border-radius:10px;overflow:hidden">
<button id="mcc-btn-residency" onclick="mccToggleMode('residency')" style="flex:1;padding:12px;font-size:13px;font-weight:600;border:none;cursor:pointer;background:var(--accent);color:var(--bg);transition:all .2s">🎓 Residency Match</button>
<button id="mcc-btn-fellowship" onclick="mccToggleMode('fellowship')" style="flex:1;padding:12px;font-size:13px;font-weight:600;border:none;cursor:pointer;background:none;color:var(--accent);transition:all .2s">🏥 Fellowship Match</button>
</div>

<!-- Section 1: Academic Profile -->
<div style="margin-bottom:20px">
<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(200,168,124,.15)">📚 Academic Profile</div>

<div id="mcc-spec-wrap" style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Target Specialty</strong></div>
<select id="mcc-spec" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select specialty...</option>
<option value="im">Internal Medicine</option>
<option value="fm">Family Medicine</option>
<option value="peds">Pediatrics</option>
<option value="em">Emergency Medicine</option>
<option value="psych">Psychiatry</option>
<option value="neuro">Neurology</option>
<option value="rads">Radiology</option>
<option value="anes">Anesthesiology</option>
<option value="path">Pathology</option>
<option value="pmr">PM&R</option>
<option value="gen_surg">General Surgery</option>
<option value="ortho">Orthopedic Surgery</option>
<option value="uro">Urology</option>
<option value="ent">ENT</option>
<option value="ophtho">Ophthalmology</option>
<option value="derm">Dermatology</option>
<option value="plastics">Plastic Surgery</option>
<option value="nsurg">Neurosurgery</option>
<option value="ir">Interventional Radiology</option>
<option value="vascular">Vascular Surgery</option>
<option value="ct_surg">Cardiothoracic Surgery</option>
<option value="ct_integrated">Thoracic Surgery (Integrated)</option>
<option value="obgyn">OB/GYN</option>
<option value="radonc">Radiation Oncology</option>
</select>
</div>

<div id="mcc-fel-spec-wrap" style="padding:10px 0;border-bottom:1px solid var(--border);display:none">
<div style="margin-bottom:4px"><strong>Target Fellowship</strong></div>
<select id="mcc-fel-spec" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select fellowship...</option>
<optgroup label="Internal Medicine Subspecialties">
<option value="cardiology">Cardiovascular Disease</option>
<option value="gi">Gastroenterology</option>
<option value="pulm_crit">Pulmonary & Critical Care</option>
<option value="heme_onc">Hematology/Oncology</option>
<option value="nephrology">Nephrology</option>
<option value="rheumatology">Rheumatology</option>
<option value="endocrinology">Endocrinology</option>
<option value="id">Infectious Disease</option>
</optgroup>
<optgroup label="Cardiology Subspecialties">
<option value="interventional_cardio">Interventional Cardiology</option>
<option value="ep">Clinical Cardiac Electrophysiology</option>
<option value="advanced_hf">Advanced Heart Failure & Transplant</option>
</optgroup>
<optgroup label="GI Subspecialties">
<option value="transplant_hep">Transplant Hepatology</option>
</optgroup>
<optgroup label="Surgical Subspecialties">
<option value="sports_med">Sports Medicine</option>
<option value="critical_care_surg">Surgical Critical Care</option>
<option value="vascular_surg">Vascular Surgery (Fellowship)</option>
<option value="ct_surgery">Cardiothoracic Surgery</option>
<option value="pediatric_surg">Pediatric Surgery</option>
<option value="surgical_onc">Surgical Oncology / Complex General Surgical Oncology</option>
<option value="trauma_acute">Trauma & Acute Care Surgery</option>
<option value="colorectal">Colon & Rectal Surgery</option>
<option value="hand_surg">Hand Surgery</option>
<option value="mist">Minimally Invasive Surgery</option>
<option value="transplant_surg">Transplant Surgery</option>
<option value="spine_surg">Spine Surgery</option>
</optgroup>
</select>
</div>

<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Step 2 CK Score</strong></div>
<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Most competitive specialties have average scores between 235–260.</div>
<input type="number" id="mcc-step2" placeholder="e.g., 255" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px;box-sizing:border-box">
</div>

<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Step 3 Score</strong></div>
<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Required for fellowship applications. Leave blank if not yet taken.</div>
<input type="number" id="mcc-step3" placeholder="e.g., 230" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px;box-sizing:border-box">
</div>

<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Medical School Tier</strong></div>
<select id="mcc-school" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="top20">Top 20 (Harvard, Hopkins, UCSF, etc.)</option>
<option value="top50">Top 21-50</option>
<option value="mid">Mid-tier US MD</option>
<option value="do">DO school</option>
<option value="img">IMG / Caribbean</option>
</select>
</div>

<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Training Background</strong></div>
<select id="mcc-background" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="usmd">US MD</option>
<option value="usdo">US DO</option>
<option value="usimg">US IMG</option>
<option value="nonusimg">Non-US IMG</option>
</select>
</div>

<div id="mcc-residency-fields">
<div style="padding:10px 0">
<div style="margin-bottom:4px"><strong>AOA / Clerkship Performance</strong></div>
<select id="mcc-aoa" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="aoa">AOA member</option>
<option value="honors">Multiple Honors</option>
<option value="pass">Mostly High Pass / Pass</option>
</select>
</div>
</div>

<!-- Fellowship-specific fields -->
<div id="mcc-fellowship-fields" style="display:none">
<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Current Residency Year</strong></div>
<select id="mcc-fel-resyear" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="pgy2">PGY-2 (applying early)</option>
<option value="pgy3">PGY-3 (standard application year)</option>
<option value="chief">Chief Resident / PGY-4+</option>
<option value="fellow">Current Fellow (applying for advanced fellowship)</option>
<option value="attending">Attending (returning for fellowship)</option>
</select>
</div>

<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Residency Program Reputation</strong></div>
<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Your training institution influences fellowship directors' perception significantly</div>
<select id="mcc-fel-progrep" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="top10">Top 10 academic program (e.g., Mass General, Hopkins, UCSF)</option>
<option value="top30">Top 30 academic program</option>
<option value="academic">Academic program (university-affiliated)</option>
<option value="community_teach">Community program with teaching affiliation</option>
<option value="community">Community program</option>
</select>
</div>

<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>First-Author Publications</strong></div>
<div style="font-size:10px;color:var(--text3);margin-bottom:6px">First-author papers carry significantly more weight in fellowship applications</div>
<input type="number" id="mcc-fel-firstauthor" placeholder="e.g., 3" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px;box-sizing:border-box">
</div>

<div style="padding:10px 0">
<div style="margin-bottom:4px"><strong>Procedural Experience</strong></div>
<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Relevant for procedural fellowships (Cardiology, GI, Interventional, etc.)</div>
<select id="mcc-fel-procedural" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="extensive">Extensive — 50+ logged procedures relevant to fellowship</option>
<option value="moderate">Moderate — 20-50 procedures</option>
<option value="minimal">Minimal — fewer than 20 procedures</option>
</select>
</div>
</div>

</div>

<!-- Section 2: Application Strength -->
<div style="margin-bottom:20px">
<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(200,168,124,.15)">💪 Application Strength</div>

<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Total Research Publications / Abstracts</strong></div>
<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Include peer-reviewed papers, case reports, abstracts, and posters. Competitive fellowships often expect 8-15+.</div>
<select id="mcc-pubs" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="0">0 — None</option>
<option value="1">1-2 abstracts / posters</option>
<option value="2">3-5 publications</option>
<option value="3">6-10 publications</option>
<option value="4">10+ publications</option>
</select>
</div>

<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Letters of Recommendation</strong></div>
<div style="font-size:10px;color:var(--text3);margin-bottom:6px">See the LOR strategy in your results for tips on securing letters from subspecialty leaders</div>
<select id="mcc-lors" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="avg">Average — from attendings who know you</option>
<option value="strong">Strong — from recognized faculty in the field</option>
<option value="notable">From nationally recognized subspecialty leaders</option>
</select>
</div>

<div style="padding:10px 0">
<div style="margin-bottom:4px"><strong>Leadership / Extracurriculars</strong></div>
<select id="mcc-leadership" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option>
<option value="none">None / minimal involvement</option>
<option value="some">Some leadership roles</option>
<option value="significant">Significant leadership (chief, QI lead, national org, committee chair)</option>
</select>
</div>
</div>

<!-- Section 3: Application Strategy -->
<div style="margin-bottom:20px">
<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(200,168,124,.15)">🎯 Application Strategy</div>

<div style="padding:10px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:4px"><strong>Number of Programs Applying To</strong></div>
<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Competitive specialties/fellowships: 40–80+ programs. Less competitive: 10–30.</div>
<input type="number" id="mcc-programs" placeholder="e.g., 40" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px;box-sizing:border-box">
</div>

<div style="padding:10px 0">
<div style="margin-bottom:4px"><strong>Away Rotations at Target Programs</strong></div>
<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Away rotations are essentially month-long interviews. Critical for competitive specialties and fellowships.</div>
<select id="mcc-aways" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="0">None planned</option>
<option value="1">1 rotation</option>
<option value="2">2 rotations</option>
<option value="3">3+ rotations</option>
</select>
</div>
</div>

<button onclick="mccCalculate()" class="btn btn-a" style="width:100%;padding:14px;font-size:14px;font-weight:600">Analyze My Competitiveness →</button>

<div id="mcc-results" style="margin-top:20px"></div>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Match Probability Calculator')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>

</div>`,

v15:`<h3 class="serif">Career Roadmap Tool</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Build a detailed, personalized roadmap. The more you share, the more specific your plan.</p>
<div id="csb-tool" style="font-size:13px">

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="margin-bottom:6px"><strong>Where are you now?</strong></div>
<select id="csb-now" onchange="csbStageChange()" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select current stage...</option>
<option value="ms1">MS1-MS2 (Pre-clinical)</option>
<option value="ms3">MS3-MS4 (Clinical)</option>
<option value="intern">PGY-1 (Intern)</option>
<option value="resident">PGY-2/3 (Resident)</option>
<option value="senior">PGY-4+ (Senior Resident)</option>
<option value="fellow">Fellow</option>
<option value="attending">Attending</option>
</select>
</div>

<div id="csb-dynamic-fields"></div>

<button onclick="csbGenerate()" class="btn btn-a" style="width:100%;margin-top:16px;padding:14px">Build My Roadmap →</button>

<div id="csb-results" style="margin-top:20px"></div>
<div style="text-align:center;margin-top:8px"><button onclick="showSavedScenarios('Career Roadmap Tool')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>

</div>`,

v17:`<h3 class="serif">Observership Database</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:10px">65 verified US observership programs with match intelligence, filtering, and personalized recommendations for IMGs and US medical students.</p>
<div style="padding:8px 12px;background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.2);border-radius:8px;margin-bottom:16px;display:flex;align-items:center;gap:8px"><span style="font-size:14px">⚠️</span><span style="font-size:10px;color:var(--text2);line-height:1.4"><strong>Data freshness:</strong> Program details are verified monthly. Information may be up to 30 days old. Always confirm deadlines, fees, and availability directly with the program before applying.</span></div>

<!-- Tab Navigation -->
<div id="obs-tabs" style="display:flex;gap:0;margin-bottom:20px;border:1px solid rgba(200,168,124,.25);border-radius:10px;overflow:hidden">
<button id="obs-tab-find" onclick="obsTab('find')" style="flex:1;padding:10px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--accent);color:var(--bg);transition:all .2s">🔍 Find Programs</button>
<button id="obs-tab-plan" onclick="obsTab('plan')" style="flex:1;padding:10px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:none;color:var(--accent);transition:all .2s">🎯 Plan Builder</button>
<button id="obs-tab-compare" onclick="obsTab('compare')" style="flex:1;padding:10px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:none;color:var(--accent);transition:all .2s">⚖️ Compare</button>
</div>

<!-- ===== FIND TAB ===== -->
<div id="obs-find" style="">

<!-- Quick Stats -->
<div style="display:flex;gap:1px;margin-bottom:16px;border-radius:10px;overflow:hidden">
<div style="flex:1;background:var(--bg2);padding:10px;text-align:center"><div id="obs-stat-total" style="font-size:20px;font-weight:700;color:var(--accent)">65</div><div style="font-size:9px;color:var(--text3)">Programs</div></div>
<div style="flex:1;background:var(--bg2);padding:10px;text-align:center"><div id="obs-stat-free" style="font-size:20px;font-weight:700;color:var(--accent)">—</div><div style="font-size:9px;color:var(--text3)">Free</div></div>
<div style="flex:1;background:var(--bg2);padding:10px;text-align:center"><div id="obs-stat-visa" style="font-size:20px;font-weight:700;color:var(--accent)">—</div><div style="font-size:9px;color:var(--text3)">Visa Support</div></div>
<div style="flex:1;background:var(--bg2);padding:10px;text-align:center"><div id="obs-stat-hands" style="font-size:20px;font-weight:700;color:var(--accent)">—</div><div style="font-size:9px;color:var(--text3)">Hands-On</div></div>
</div>

<!-- Search Bar -->
<div style="position:relative;margin-bottom:12px">
<input id="obs-search" type="text" placeholder="Search by name, city, state, specialty..." oninput="obsFilter()" style="width:100%;padding:10px 12px 10px 36px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px;box-sizing:border-box">
<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.5">🔍</span>
</div>

<!-- Filters -->
<div style="margin-bottom:16px">
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
<select id="obs-f-spec" onchange="obsFilter()" style="flex:1;min-width:120px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">All Specialties</option></select>
<select id="obs-f-region" onchange="obsFilter()" style="flex:1;min-width:100px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">All Regions</option><option value="northeast">Northeast</option><option value="midwest">Midwest</option><option value="south">South</option><option value="west">West</option></select>
<select id="obs-f-state" onchange="obsFilter()" style="flex:1;min-width:80px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">All States</option></select>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap">
<select id="obs-f-cost" onchange="obsFilter()" style="flex:1;min-width:80px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">Any Cost</option><option value="free">Free Only</option><option value="low">Under $500</option><option value="mid">$500–$1000</option><option value="high">$1000+</option></select>
<select id="obs-f-img" onchange="obsFilter()" style="flex:1;min-width:100px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">IMG Friendliness</option><option value="5">★★★★★ Very Welcoming</option><option value="4">★★★★☆ Friendly</option><option value="3">★★★☆☆ Moderate</option></select>
<select id="obs-f-hands" onchange="obsFilter()" style="flex:1;min-width:100px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">Hands-On Level</option><option value="4">Hands-On (4-5★)</option><option value="3">Some Participation</option><option value="1">Observation OK</option></select>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
<select id="obs-f-lor" onchange="obsFilter()" style="flex:1;min-width:100px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">LOR Potential</option><option value="5">★★★★★ Excellent</option><option value="4">★★★★☆ Strong</option><option value="3">★★★☆☆ Possible</option></select>
<select id="obs-f-visa" onchange="obsFilter()" style="flex:1;min-width:100px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">Visa Support</option><option value="yes">Provides Visa Help</option><option value="no">No Visa Support</option></select>
<select id="obs-f-sort" onchange="obsFilter()" style="flex:1;min-width:100px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="roi">Sort: Best ROI</option><option value="prestige">Sort: Prestige</option><option value="img">Sort: IMG-Friendly</option><option value="cost-low">Sort: Cost (Low→High)</option><option value="cost-high">Sort: Cost (High→Low)</option><option value="hands">Sort: Most Hands-On</option><option value="lor">Sort: Best LOR Potential</option></select>
</div>
</div>

<!-- Results Count -->
<div id="obs-results-count" style="font-size:11px;color:var(--text3);margin-bottom:10px"></div>

<!-- Results -->
<div id="obs-results" style=""></div>

</div>

<!-- ===== PLAN BUILDER TAB ===== -->
<div id="obs-plan" style="display:none">

<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(200,168,124,.15)">📋 Your Profile</div>

<div style="margin-bottom:12px">
<label style="font-size:11px;color:var(--text3)">Are you an IMG or US student?</label>
<select id="obs-p-img" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option><option value="img">International Medical Graduate (IMG)</option><option value="us">US Medical Student/Graduate</option>
</select>
</div>

<div style="margin-bottom:12px">
<label style="font-size:11px;color:var(--text3)">Target Specialty</label>
<select id="obs-p-spec" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select specialty...</option>
</select>
</div>

<div style="margin-bottom:12px">
<label style="font-size:11px;color:var(--text3)">Step 2 CK Score (or expected)</label>
<input id="obs-p-step2" type="number" placeholder="e.g. 245" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px;box-sizing:border-box">
</div>

<div style="margin-bottom:12px">
<label style="font-size:11px;color:var(--text3)">Do you need visa sponsorship?</label>
<select id="obs-p-visa" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option><option value="yes">Yes — I need visa help</option><option value="no">No — I have a valid visa/US citizen</option>
</select>
</div>

<div style="margin-bottom:12px">
<label style="font-size:11px;color:var(--text3)">Budget for observership fees</label>
<select id="obs-p-budget" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option><option value="0">Free programs only</option><option value="500">Up to $500 total</option><option value="1000">Up to $1,000 total</option><option value="2000">Up to $2,000 total</option><option value="99999">Cost is not an issue</option>
</select>
</div>

<div style="margin-bottom:12px">
<label style="font-size:11px;color:var(--text3)">What do you need most?</label>
<select id="obs-p-priority" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option><option value="lor">Strong Letters of Recommendation</option><option value="hands">Hands-On Clinical Experience</option><option value="prestige">Name Recognition / Prestige</option><option value="pipeline">Best Chance of Matching at Program</option><option value="balanced">Balanced — All of the Above</option>
</select>
</div>

<div style="margin-bottom:12px">
<label style="font-size:11px;color:var(--text3)">Preferred Region (optional)</label>
<select id="obs-p-region" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">No preference</option><option value="northeast">Northeast</option><option value="midwest">Midwest</option><option value="south">South</option><option value="west">West</option>
</select>
</div>

<div style="margin-bottom:12px">
<label style="font-size:11px;color:var(--text3)">Timeline</label>
<select id="obs-p-timeline" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px">
<option value="">Select...</option><option value="3">Within 3 months</option><option value="6">Within 6 months</option><option value="12">Within 12 months</option><option value="flexible">Flexible — planning ahead</option>
</select>
</div>

<button onclick="obsPlanBuild()" class="btn btn-a" style="width:100%;padding:14px;margin-top:8px">Build My Observership Strategy →</button>

<div id="obs-plan-results" style="margin-top:20px"></div>

</div>

<!-- ===== COMPARE TAB ===== -->
<div id="obs-compare" style="display:none">

<div style="font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(200,168,124,.15)">⚖️ Side-by-Side Comparison</div>

<p style="font-size:12px;color:var(--text3);margin-bottom:12px">Select 2–3 programs to compare. Use the ⚖️ button on any program card to add it here.</p>

<div id="obs-compare-slots" style="display:flex;gap:8px;margin-bottom:16px">
<div style="flex:1"><select id="obs-cmp-1" onchange="obsCompare()" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">Program 1...</option></select></div>
<div style="flex:1"><select id="obs-cmp-2" onchange="obsCompare()" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">Program 2...</option></select></div>
<div style="flex:1"><select id="obs-cmp-3" onchange="obsCompare()" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);color:var(--text);font-size:11px"><option value="">Program 3...</option></select></div>
</div>

<div id="obs-compare-results" style=""></div>

</div>

<div style="text-align:center;margin-top:12px"><button onclick="showSavedScenarios('Observership Database')" style="background:none;border:none;color:var(--accent);font-size:11px;cursor:pointer;padding:6px 12px;opacity:.7;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.7'">📊 View Saved Scenarios</button></div>
`
};
