// ===== FRAMEWORK LIBRARY CONTENT =====
const VAULT_CONTENT={
v1:`<h3>Fellowship Readiness Calculator</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:20px">Rate yourself honestly in each category. Your scores update in real-time.</p>
<div id="frc-calc" style="font-size:13px">

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>1. Research & Scholarly Activity</strong><span id="frc-s1" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Publications, abstracts, presentations. For competitive subspecialties: 2-3 first-author papers expected.</span>
<input type="range" min="0" max="5" value="0" id="frc-r1" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>None</span><span>1 abstract</span><span>1-2 pubs</span><span>3+ pubs</span><span>4+ first-author</span><span>5+ w/ impact</span></div>
<div id="frc-f1" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>2. Letters of Recommendation</strong><span id="frc-s2" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Specialty-specific, from physicians who know your work deeply.</span>
<input type="range" min="0" max="5" value="0" id="frc-r2" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>No writers</span><span>Generic only</span><span>1 strong</span><span>2 strong</span><span>3 specialty</span><span>3+ w/ names</span></div>
<div id="frc-f2" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>3. Clinical Performance</strong><span id="frc-s3" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Evaluations, rotation feedback, procedural skills, clinical judgment.</span>
<input type="range" min="0" max="5" value="0" id="frc-r3" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>Below avg</span><span>Average</span><span>Good</span><span>Very good</span><span>Outstanding</span><span>Top of class</span></div>
<div id="frc-f3" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>4. Board Scores / ITE</strong><span id="frc-s4" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Screening tool — above the cutoff matters more than the exact number.</span>
<input type="range" min="0" max="5" value="0" id="frc-r4" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>Failed/low</span><span>Below avg</span><span>Average</span><span>Above avg</span><span>High</span><span>Top decile</span></div>
<div id="frc-f4" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>5. Leadership & Service</strong><span id="frc-s5" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Chief resident, committee roles, QI projects, teaching awards.</span>
<input type="range" min="0" max="5" value="0" id="frc-r5" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>None</span><span>Minor role</span><span>1 meaningful</span><span>2+ roles</span><span>Chief/lead</span><span>Multiple chief</span></div>
<div id="frc-f5" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0;border-bottom:1px solid var(--border)">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>6. Networking & Away Rotations</strong><span id="frc-s6" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Program visits, conference attendance, faculty connections at target programs.</span>
<input type="range" min="0" max="5" value="0" id="frc-r6" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>None</span><span>1 conference</span><span>1 away</span><span>2 aways</span><span>2+ w/ contacts</span><span>Strong network</span></div>
<div id="frc-f6" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

<div style="padding:14px 0">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong>7. Personal Statement</strong><span id="frc-s7" style="font-weight:600;color:var(--accent)">0/5</span></div>
<span style="color:var(--text3);font-size:11px;display:block;margin-bottom:10px">Clear, specific story. Why this specialty? Why you? Polished through multiple drafts.</span>
<input type="range" min="0" max="5" value="0" id="frc-r7" oninput="frcUpdate()" style="width:100%;accent-color:var(--accent)">
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)"><span>Not started</span><span>First draft</span><span>Reviewed 1x</span><span>Multiple drafts</span><span>Polished</span><span>Exceptional</span></div>
<div id="frc-f7" style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:var(--bg2);border-radius:6px"></div>
</div>

</div>

<div id="frc-result" style="padding:20px;background:var(--bg2);border-radius:12px;margin-top:20px;text-align:center">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:8px">Overall Readiness Score</div>
<div id="frc-total" style="font-size:48px;font-weight:700;font-family:'Cormorant Garamond',serif;color:var(--accent)">0</div>
<div id="frc-max" style="font-size:13px;color:var(--text3)">out of 35</div>
<div id="frc-grade" style="font-size:16px;font-weight:600;margin-top:8px"></div>
<div id="frc-interp" style="font-size:13px;color:var(--text2);margin-top:12px;line-height:1.7;text-align:left"></div>
</div>
<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Based on NRMP Charting Outcomes and program director surveys. Weighted scoring reflects relative importance per PD surveys.</p>`,

v2:`<h3>Contract Risk Scorecard</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">Red flags don't mean "don't sign." They mean "negotiate or get attorney clarification."</p>
<div style="font-size:13px">
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>1. Compensation Structure</strong><br><span style="color:var(--green);font-size:11px">✅ Clear base + defined RVU rate at/above MGMA median</span><br><span style="color:var(--red);font-size:11px">🚩 Vague "productivity bonus" without defined formula</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>2. Restrictive Covenant</strong><br><span style="color:var(--green);font-size:11px">✅ 10-15 mi radius, 1 year, waived if terminated without cause</span><br><span style="color:var(--red);font-size:11px">🚩 25+ miles, 2+ years, applies regardless of who terminates</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>3. Tail Insurance</strong><br><span style="color:var(--green);font-size:11px">✅ Employer pays tail, or occurrence-based policy</span><br><span style="color:var(--red);font-size:11px">🚩 You pay full tail ($20K-$50K+) regardless of circumstances</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>4. Termination Clauses</strong><br><span style="color:var(--green);font-size:11px">✅ 90-180 day notice, severance defined, narrow "cause"</span><br><span style="color:var(--red);font-size:11px">🚩 30-day notice, no severance, broad "cause" including "productivity"</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>5. Benefits & Call</strong><br><span style="color:var(--green);font-size:11px">✅ Full benefits in writing, $3K+ CME, 4%+ match, call compensated</span><br><span style="color:var(--red);font-size:11px">🚩 Benefits "available" without amounts, uncompensated call</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>6. Signing Bonus Clawback</strong><br><span style="color:var(--green);font-size:11px">✅ Pro-rated over 2-3 years</span><br><span style="color:var(--red);font-size:11px">🚩 Full repayment if you leave within 3 years for any reason</span></div>
<div style="padding:12px 0"><strong>7. Partnership Track</strong><br><span style="color:var(--green);font-size:11px">✅ Defined timeline, transparent buy-in, criteria in writing</span><br><span style="color:var(--red);font-size:11px">🚩 "Eligible after X years" with no defined process</span></div>
</div>
<div style="padding:16px;background:var(--bg2);border-radius:8px;margin-top:16px"><p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0"><strong>Rule of thumb:</strong> 3+ red flags = don't sign without attorney review ($2K-$3.5K). Attorney fees typically save $20K+ in negotiated improvements.</p></div>
<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Sources: MGMA 2024, AMA Practice Benchmark Survey 2023.</p>`,

v3:`<h3>Offer Comparison Matrix</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">Don't just compare salary — model total compensation over 3 years.</p>
<div style="font-size:12px">
<div style="font-weight:600;color:var(--accent);padding:8px 0">💰 Compensation</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• Base Salary — what's guaranteed regardless of volume?</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• RVU Rate & Threshold — per-unit rate, and when does bonus kick in?</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• Signing Bonus — amount and clawback terms?</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• Loan Repayment — amount, vesting, repayment if you leave?</div>
<div style="font-weight:600;color:var(--accent);padding:12px 0 8px">⚖️ Risk & Structure</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• Non-Compete — radius, duration, applies if they fire you?</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• Tail Coverage — who pays, and how much?</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• Termination — notice period, severance, "cause" definition?</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• Partnership/Equity — timeline, buy-in, criteria?</div>
<div style="font-weight:600;color:var(--accent);padding:12px 0 8px">🏥 Quality of Life</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• Call Frequency — how often, compensated?</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• PTO + CME Days — total days, CME budget?</div>
<div style="padding:6px 0;border-bottom:1px solid var(--border)">• Location — cost of living, family, preferences</div>
<div style="padding:6px 0">• Retirement — match %, plan type?</div>
</div>
<div style="padding:16px;background:var(--bg2);border-radius:8px;margin-top:16px"><p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0"><strong>Pro tip:</strong> A $30K higher salary with a 25-mile non-compete and no tail coverage may cost you more over 5 years than a slightly lower offer with better structure.</p></div>`,

v4:`<h3>RVU Modeling Sheet</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">Most new attendings sign contracts without ever modeling what their RVUs translate to.</p>
<div style="font-size:13px;margin-bottom:20px">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">How RVU Compensation Works</div>
<p style="color:var(--text2);line-height:1.7;font-size:12px"><strong>Pure Production:</strong> Total Pay = wRVUs × $/wRVU<br><strong>Salary + Bonus:</strong> Base + (wRVUs above threshold × bonus rate)<br><strong>Guarantee:</strong> Fixed salary regardless of volume (usually year 1 only)</p>
</div>
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">📊 MGMA Benchmarks (2024)</div>
<div style="font-size:12px;color:var(--text2);line-height:2">
General Cardiology — Median wRVUs: <strong>7,247</strong><br>
Interventional Cardiology — Median wRVUs: <strong>9,187</strong><br>
Electrophysiology — Median wRVUs: <strong>8,452</strong><br>
Median $/wRVU (Cardiology): <strong>$55-$75</strong><br>
Median Total Comp (IC): <strong>$600K-$750K</strong><br>
75th Percentile (IC): <strong>$850K+</strong>
</div>
<div style="padding:16px;background:var(--bg2);border-radius:8px;margin-top:16px"><p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0"><strong>Year 1 reality:</strong> Most new attendings don't hit median wRVUs in year 1. It takes 12-18 months to build a full panel. Make sure your guarantee period covers the ramp-up.</p></div>
<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Source: MGMA DataDive Provider Compensation 2024.</p>`,

v5:`<h3>3-Year Financial Leverage Planner</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">The first 3 years after training determine your financial trajectory for the next 20.</p>
<div style="font-size:12px">
<div style="padding:16px;background:var(--bg2);border-radius:8px;margin-bottom:12px">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">Year 1: Foundation</div>
<div style="color:var(--text2);line-height:1.8">• Maintain near-resident spending<br>• Build 6-month emergency fund<br>• Max employer retirement match<br>• Secure own-occupation disability insurance<br>• Make PSLF vs. refinance decision<br>• <span style="color:var(--red)">Avoid: car + house + lifestyle expansion simultaneously</span><br><strong>Target: Save 40-50% of gross</strong></div></div>
<div style="padding:16px;background:var(--bg2);border-radius:8px;margin-bottom:12px">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">Year 2: Acceleration</div>
<div style="color:var(--text2);line-height:1.8">• Max all tax-advantaged accounts<br>• Begin taxable index fund investing<br>• Consider home purchase if staying 5+ years<br>• Term life insurance if dependents<br>• Begin gradual, intentional lifestyle upgrade<br><strong>Target: Net worth positive</strong></div></div>
<div style="padding:16px;background:var(--bg2);border-radius:8px">
<div style="font-weight:600;color:var(--accent);margin-bottom:8px">Year 3: Leverage</div>
<div style="color:var(--text2);line-height:1.8">• Loans paid off or PSLF on track<br>• Portfolio growing with compound returns<br>• Evaluate contract renegotiation<br>• Consider practice ownership or side income<br><strong>Target: $200K-$500K net worth</strong></div></div>
</div>
<div style="padding:16px;background:var(--bg2);border-radius:8px;margin-top:12px"><p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0"><strong>The math:</strong> $400K income, $100K lifestyle = $300K/yr invested. At 8% returns, that's $1M+ in 3 years. Inflate to $300K lifestyle instead and it takes 10+ years.</p></div>
<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Sources: White Coat Investor, AAMC Debt Data 2024.</p>`,

v6:`<h3>Fellowship Positioning Roadmap</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">Month-by-month timeline. By the time ERAS opens, most of the work should already be done.</p>
<div style="font-size:12px">
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong style="color:var(--accent)">18-24 Months Before Match</strong><br><span style="color:var(--text2)">• Identify subspecialty with conviction<br>• Start first research project<br>• Build relationships with letter writers<br>• Attend first subspecialty conference</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong style="color:var(--accent)">12-18 Months Before</strong><br><span style="color:var(--text2)">• Submit first abstract<br>• Get informal feedback on application strength<br>• Build program list (15-20, tiered)<br>• Take on leadership role</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong style="color:var(--accent)">6-12 Months Before</strong><br><span style="color:var(--text2)">• Away rotations (1-2 target programs)<br>• Secure letter writers — ask early<br>• Manuscript submitted or in prep<br>• Draft personal statement</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong style="color:var(--accent)">3-6 Months Before</strong><br><span style="color:var(--text2)">• Finalize personal statement (5+ drafts)<br>• Confirm letters submitted<br>• Interview prep with attendings<br>• Research each program specifically</span></div>
<div style="padding:12px 0"><strong style="color:var(--accent)">0-3 Months Before</strong><br><span style="color:var(--text2)">• Interview season — thank-you notes within 24h<br>• Build rank list on fit, not just reputation<br>• Second-look visits for top 2-3<br>• Trust your gut on culture</span></div>
</div>
<p style="font-size:10px;color:var(--text3);margin-top:16px;font-style:italic">Based on NRMP data and program director input.</p>`,

v7:`<h3>Research ROI Calculator</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">Not all research is equal for your application. Evaluate by return on your scarcest resource: time.</p>
<div style="font-size:12px">
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>1. First-Author Original Research</strong> <span style="color:var(--green);font-size:11px">(Highest ROI)</span><br><span style="color:var(--text2)">6-18 months. One published first-author paper outweighs 5 middle-author papers.</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>2. Case Reports</strong> <span style="color:var(--green);font-size:11px">(High ROI / time)</span><br><span style="color:var(--text2)">2-4 months. Low barrier, demonstrates writing ability. Best for early trainees.</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>3. Conference Abstracts</strong> <span style="color:var(--accent);font-size:11px">(Good ROI)</span><br><span style="color:var(--text2)">1-3 months. Gets your name visible. ACC/AHA posters are noticed by PDs.</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>4. Review Articles</strong> <span style="color:var(--accent);font-size:11px">(Moderate ROI)</span><br><span style="color:var(--text2)">3-6 months. Shows expertise. Most useful in specialty-specific journals.</span></div>
<div style="padding:12px 0;border-bottom:1px solid var(--border)"><strong>5. Middle-Author Papers</strong> <span style="color:var(--text3);font-size:11px">(Low ROI per paper)</span><br><span style="color:var(--text2)">PDs know the difference between contributing and driving a project.</span></div>
<div style="padding:12px 0"><strong>6. QI Projects</strong> <span style="color:var(--text3);font-size:11px">(Low ROI for fellowship)</span><br><span style="color:var(--text2)">Valuable for career but rarely moves the needle for subspecialty matching.</span></div>
</div>
<div style="padding:16px;background:var(--bg2);border-radius:8px;margin-top:16px"><p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0"><strong>Optimal portfolio:</strong> 1-2 first-author papers + 2-3 abstracts + 1 case report. Start with the case report (quick win), then pursue original research (high impact).</p></div>`,

v8:`<h3>Income Leverage Playbook</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">Five financial decisions with the biggest long-term impact on physician wealth.</p>
<div style="font-size:12px">
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">1. PSLF vs. Refinance</strong><br><span style="color:var(--text2);line-height:1.7">Potentially a $50K-$200K decision. Qualifying employer for 10 years → PSLF almost always wins. Private practice → refinance to lowest rate. <span style="color:var(--red)">Do NOT refinance federal loans before ruling out PSLF. Irreversible.</span></span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">2. Disability Insurance</strong><br><span style="color:var(--text2);line-height:1.7">Own-occupation, specialty-specific. Buy during training when premiums are lowest. 25% chance of 90+ day disability before 65.</span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">3. Lifestyle Inflation Timing</strong><br><span style="color:var(--text2);line-height:1.7">Live on $100K vs $300K on a $400K salary = $200K/yr investing capacity. Over 3 years at 8% = $650K+ difference. Gradual upgrade year 3-4.</span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">4. Tax-Advantaged Accounts</strong><br><span style="color:var(--text2);line-height:1.7">Max in order: Employer match → Backdoor Roth ($7K) → Max 401k ($23.5K) → HSA ($4,150) → Mega backdoor Roth if available.</span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px">
<strong style="color:var(--accent)">5. Advisor Selection</strong><br><span style="color:var(--text2);line-height:1.7">Fee-only fiduciary. Not "fee-based" (can earn commissions). Check NAPFA.org for vetted advisors. 0.5-1% AUM or flat fee.</span></div>
</div>
<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Sources: White Coat Investor, Council for Disability Awareness 2023, IRS 2024 limits.</p>`,

v9:`<h3>Strategic Audit Template</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">The exact intake framework used in Private Strategy sessions. Complete this before any major career decision.</p>
<div style="font-size:12px">
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">Part 1: Current Position</strong><br><span style="color:var(--text2);line-height:1.8">• Current training level / position?<br>• Institution strengths and limitations?<br>• Financial situation (debt, savings, obligations)?<br>• CV snapshot (publications, scores, leadership)?<br>• What are you known for?</span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">Part 2: The Decision</strong><br><span style="color:var(--text2);line-height:1.8">• What specific decision are you facing?<br>• What are all options (including "do nothing")?<br>• What is the timeline?<br>• What have you already tried?<br>• What's holding you back?</span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">Part 3: Constraints & Priorities</strong><br><span style="color:var(--text2);line-height:1.8">• Non-negotiables (location, income, lifestyle)?<br>• What are you willing to sacrifice?<br>• Who else is affected?<br>• What does success look like in 1 year? 5 years?<br>• What would you regret not doing?</span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px">
<strong style="color:var(--accent)">Part 4: Information Gaps</strong><br><span style="color:var(--text2);line-height:1.8">• What info would make this easier?<br>• Who have you talked to?<br>• Worst realistic outcome of each option?<br>• Best realistic outcome?<br>• Is this decision reversible?</span></div>
</div>
<p style="font-size:10px;color:var(--text3);margin-top:12px;font-style:italic">Complete this before requesting a Private Strategy session.</p>`,

v10:`<h3>Career Pivot Decision Engine</h3>
<p style="color:var(--text3);font-size:12px;margin-bottom:16px">Structured framework for evaluating specialty switches, practice model changes, or non-clinical transitions.</p>
<div style="font-size:12px">
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">Step 1: Diagnose the Dissatisfaction</strong><br><span style="color:var(--text2);line-height:1.8">Before pivoting, identify what's actually wrong. Is it the specialty, the practice setting, the specific job, or burnout? Changing specialties when the real problem is a toxic workplace is expensive and unnecessary.<br>• What specifically do you dislike?<br>• Would the same specialty in a different setting fix it?<br>• Are you burned out (temporary) or misaligned (structural)?</span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">Step 2: Map the Options</strong><br><span style="color:var(--text2);line-height:1.8">• Stay + modify (different role, different employer, part-time)<br>• Adjacent pivot (same training, different practice model)<br>• Full pivot (new specialty, non-clinical, industry, consulting)<br>• Hybrid (clinical + non-clinical income streams)<br>Rate each on: feasibility, financial impact, timeline, satisfaction potential</span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px;margin-bottom:10px">
<strong style="color:var(--accent)">Step 3: Financial Reality Check</strong><br><span style="color:var(--text2);line-height:1.8">• What's your current debt load and monthly obligations?<br>• How long can you sustain reduced income during transition?<br>• Does the new path have comparable earning potential long-term?<br>• What's the cost of additional training (time + money)?<br>• Do you have 6-12 months of expenses saved?</span></div>
<div style="padding:14px;background:var(--bg2);border-radius:8px">
<strong style="color:var(--accent)">Step 4: Test Before Committing</strong><br><span style="color:var(--text2);line-height:1.8">• Shadow someone in the new role for a week<br>• Do informational interviews with 3+ people who made a similar pivot<br>• Try a side project or moonlighting in the new area<br>• Set a decision deadline — analysis paralysis is its own trap<br>• <strong>Key question: In 5 years, will you regret not trying?</strong></span></div>
</div>
<div style="padding:16px;background:var(--bg2);border-radius:8px;margin-top:12px"><p style="font-size:12px;color:var(--text2);line-height:1.6;margin:0"><strong>Important:</strong> Do not make major career pivots while actively burned out. Stabilize first (therapy, time off, boundary changes), then evaluate with a clear mind. Burnout distorts decision-making.</p></div>`
};
