const nav = document.querySelector('nav');
window.addEventListener('scroll', () => nav.style.boxShadow =
window.scrollY > 10 ? '0 4px 24px rgba(11,15,26,.45)' : 'none');
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('on'); });
}, {threshold:.12});
reveals.forEach(r => observer.observe(r));
(function(){
var DETAILS={
wearable:{t:"Wearable sensors",b:"ECG and PPG sensors &rarr; <code>heart_rate_bpm</code>. Skin thermistors &rarr; <code>core_temp_C</code> / <code>skin_temp_C</code>. Accelerometers/IMU &rarr; <code>acceleration_m_s2</code>, <code>activity_counts</code>. Respiratory belt &rarr; <code>respiratory_rate_bpm</code>. GPS collar &rarr; <code>activity_counts</code>. Pulse oximeter &rarr; <code>spo2_pct</code>. Use <code>wearable_cattle_manifest()</code> for a pre-built collar suite."},
implanted:{t:"Implanted / ingested sensors",b:"Rumen bolus &rarr; <code>core_temp_C</code>, rumen pH, motility. CGM probe &rarr; <code>blood_glucose_mmol_L</code> (auto-converts mg/dL &rarr; mmol/L). Intravascular pressure catheter &rarr; <code>systolic_bp_mmHg</code> (kPa &rarr; mmHg auto-converted). Acoustic depth tag (aquatic) &rarr; depth, temperature, location."},
remote:{t:"Remote sensing",b:"Thermal IR camera &rarr; <code>skin_temp_C</code> surface maps. Drone / aerial EO &rarr; population-scale wildlife survey. Video pose estimation &rarr; gait analysis, body condition scoring. Microphone arrays &rarr; vocalisation analysis, cough detection."},
lab:{t:"Lab assay streams",b:"Blood panel &rarr; <code>haematocrit_pct</code>, <code>haemoglobin_g_dL</code>, <code>wbc_10e9_L</code>, <code>creatinine_umol_L</code>. Glucose (mg/dL &rarr; mmol/L auto-converted). Cortisol (&mu;g/dL &rarr; nmol/L auto-converted). eDNA / microbiome &rarr; diversity indices. All lab streams use the same six-field manifest contract."},
manual:{t:"Manual / custom entry",b:"Field observations, clinical examination records, custom calibration functions. Any Python callable can be registered as a custom conversion via <code>SensorManifestEntry(conversion_fn=...)</code>. Manual entries follow the same manifest contract and ontology normalisation path as automated sensor streams."},
onl:{t:"Ontology &amp; normalisation layer",b:"<code>canonical_key(alias)</code> resolves any vendor alias to its canonical key in O(1). <code>normalise_dict(d)</code> rewrites all keys in one pass. <code>to_jsonld(state)</code> exports a self-describing JSON-LD document. 44 canonical properties anchored to Uberon (anatomy), SNOMED CT (clinical findings), VeDDRA (adverse events), NCBITaxon (species), UCUM (units), PATO (phenotype), HP/MP (mammalian phenotype)."},
atr:{t:"Animal Type Registry (ATR)",b:"Five built-in templates: <code>bovine_adult</code>, <code>ovine_adult</code>, <code>canine_adult</code>, <code>salmonid_adult</code>, <code>equine_adult</code>. Each carries taxa, NCBITaxon ID, body mass, normal HR/temp/RR, and system list. Custom species registered via <code>register_animal_type(name, config)</code> without modifying the codebase."},
anatomy:{t:"Anatomy map",b:"Hierarchical anatomical system registry using Uberon cross-species anatomy ontology and FMA (Foundational Model of Anatomy). Each <code>AnatomicalSystem</code> dataclass carries a system_id, Uberon URI, display name, canonical state variable list, and normal range dict. Supports livestock, companion animals, wildlife, and aquatic species."},
ranges:{t:"Normal physiological ranges",b:"Species-specific thresholds stored in the structural layer: normal HR (bovine 60 bpm, canine 90 bpm, equine 36 bpm), normal core temperature, normal respiratory rate. These feed both the Threshold Event System alarm boundaries and the neuroendocrine stress index calculation. Override at build time via <code>SomaConfig(alarm_thresholds=...)</code>."},
buildsoma:{t:"build_soma(config)",b:"<code>build_soma(SomaConfig(animal_type='bovine_adult', site_name='Farm A'))</code> &mdash; initialises the structural layer from the ATR template, sets species-specific solver parameters, configures threshold boundaries, and returns a fully parameterised digital twin ready for <code>update_sync()</code>. Zero field work required."},
kvs:{t:"Key-value store (KVS)",b:"O(1) current state access for all canonical physiological properties. Written on every <code>update_sync()</code> call with both the incoming sensor readings and all derived solver outputs. Structural layer constants (body_mass_kg, normal ranges) are never overwritten by sensor updates."},
tsl:{t:"Time-series log (TSL)",b:"Append-only archive of every state snapshot. Queried via <code>ds.query_history(key, since=t, limit=n)</code>. Each record carries a Unix timestamp and the full state dict at that moment. Enables retrospective analysis, trend detection, and export to CSV/JSON for downstream analytics or regulatory audit trails."},
tes:{t:"Threshold Event System (TES)",b:"Observer-pattern alarm system. Default alarms: hyperthermia/hypothermia (<code>core_temp_C</code>), tachycardia/bradycardia (<code>heart_rate_bpm</code>), hypoxaemia (<code>spo2_pct</code> &lt; 90%), hypoglycaemia/hyperglycaemia, HPA stress activation. Register callbacks: <code>ds._tes.register_handler(fn)</code>. Fires on every <code>update_sync()</code> cycle."},
updatesync:{t:"update_sync(readings)",b:"The core ingest method: (1) normalises incoming aliases, (2) writes to KV store, (3) builds merged state dict, (4) runs full solver DAG, (5) writes derived outputs back, (6) checks all TES thresholds, (7) appends snapshot to TSL. Returns the full state dict. Single synchronous call &mdash; edge-device friendly."},
builtins:{t:"Built-in solvers",b:"Six solvers in DAG order: <code>cardiovascular_baseline</code> (Fick cardiac output, MAP), <code>metabolic_rate</code> (Kleiber&rsquo;s law + Q10), <code>thermoregulation</code> (Newton&rsquo;s heat balance &rarr; thermal comfort index), <code>respiratory_gas_exchange</code> (RQ-based VO₂/VCO₂), <code>neuroendocrine_stress</code> (HPA composite stress index), <code>adverse_event_screen</code> (VeDDRA mapping)."},
veddra_solver:{t:"VeDDRA adverse event screen",b:"The <code>adverse_event_screen</code> solver maps six state variables to VeDDRA clinical sign term IDs on every update cycle: Hyperthermia [10020557], Hypothermia [10021113], Tachycardia [10043071], Bradycardia [10006093], Hypoxia [10021143], Distress [10013029]. Outputs <code>ae_flags</code> and <code>adverse_event_score</code> (0&ndash;1). Call <code>ds.veddra_report()</code> for a full EMA EVVET3-ready report."},
custom_solver:{t:"Custom solver via register_method()",b:"<code>ds.register_method('hrv_estimator', my_fn)</code> &mdash; adds any Python callable to the Model Zoo without modifying core code. Custom solvers execute after all built-ins in DAG order, so they can consume cardiovascular, metabolic, and stress outputs from the same update cycle. Built-ins can also be unregistered and replaced."},
dag:{t:"DAG execution",b:"Solvers execute in registration order. Each receives the params dict (structural constants) and the accumulated state dict (all previous solver outputs merged in). This forms a Directed Acyclic Graph: thermoregulation consumes <code>rmr_W</code> from metabolic_rate; neuroendocrine_stress consumes <code>cardiac_output_L_min</code> from cardiovascular_baseline; VeDDRA screen consumes <code>physiological_stress_index</code> from neuroendocrine_stress."},
byod:{t:"BYOD sensor manifest",b:"Six-field contract: <code>sensor_id &middot; canonical_key &middot; unit &middot; timestamp &middot; value &middot; quality_flag</code>. Any stream conforming to this contract is ingested without schema modification. 14 built-in unit conversions: &deg;F&rarr;&deg;C, K&rarr;&deg;C, kPa&rarr;mmHg, mg/dL&rarr;mmol/L, &mu;g/dL&rarr;nmol/L, lb&rarr;kg, Hz&rarr;/min. Three preset manifests: <code>wearable_cattle_manifest()</code>, <code>implant_bovine_manifest()</code>, <code>lab_panel_manifest()</code>."},
llm:{t:"LLM agentic interface layer",b:"<code>soma_agent.py</code> exposes the twin as 10 OpenAI-compatible tool schemas via <code>SomaDispatcher</code>: <code>ds_describe</code>, <code>ds_get_state</code>, <code>ds_update</code>, <code>ds_query_history</code>, <code>ds_list_solvers</code>, <code>ds_to_jsonld</code>, <code>ds_veddra_report</code>, <code>ds_alarm_status</code>, <code>ds_manifest_summary</code>, <code>ds_structural_layer</code>. Works with Claude, GPT-4, and Gemini."},
out_state:{t:"State snapshot",b:"Full dict of all canonical properties after every <code>update_sync()</code> call: sensor readings, structural constants, and all derived solver outputs (cardiac output, metabolic rate, thermal comfort index, stress index, VeDDRA flags, AE score)."},
out_ts:{t:"Time-series export",b:"Queryable via <code>ds.query_history(key, since=t, limit=n)</code>. Returns timestamped records for any canonical property. Exportable to CSV or JSON for downstream analytics, farm management systems, or regulatory audit trails."},
out_jsonld:{t:"JSON-LD export",b:"<code>ds.to_jsonld()</code> exports a self-describing linked-data document. Every canonical key carries its Uberon, SNOMED CT, or VeDDRA URI in the <code>@context</code> block. Compatible with veterinary health information exchanges and open linked-data platforms."},
out_veddra:{t:"VeDDRA adverse event report",b:"<code>ds.veddra_report()</code> serialises flagged clinical signs as a structured report: VeDDRA term IDs, values, taxa, report UUID, timestamp, and AE score. Reporting standard: VeDDRA v2.2. Suitable for direct submission to EMA EVVET3, UK VMD, and FDA Center for Veterinary Medicine pharmacovigilance systems."},
out_llm:{t:"LLM response",b:"Natural language answers to queries like &ldquo;Is this animal showing signs of heat stress?&rdquo; or &ldquo;What is the current physiological stress index?&rdquo;. The LLM agent calls the appropriate tool schemas and synthesises a clinically meaningful answer without the user writing any API code."}
};
var active=null;
document.querySelectorAll('[data-id]').forEach(function(el){
  el.addEventListener('click',function(){
    var id=el.dataset.id;
    var d=DETAILS[id];
    if(!d)return;
    var panel=document.getElementById('ds-detail');
    if(active===id){
      active=null;
      document.querySelectorAll('.node-active').forEach(function(e){e.classList.remove('node-active');});
      panel.style.display='none';
      return;
    }
    active=id;
    document.querySelectorAll('.node-active').forEach(function(e){e.classList.remove('node-active');});
    el.classList.add('node-active');
    document.getElementById('ds-detail-title').innerHTML=d.t;
    document.getElementById('ds-detail-body').innerHTML=d.b;
    panel.style.display='block';
    panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
});
})();

// Hamburger mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if(hamburger && mobileMenu){
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}
