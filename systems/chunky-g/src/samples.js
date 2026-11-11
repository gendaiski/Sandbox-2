// Two original sample documents (written for Chunky G) so every screen works on first open.
(function () {
  const CG = globalThis.CG;
  const beekeeping = `<!-- page 1 -->
# Urban Beekeeping Field Guide

Urban beekeeping has grown quickly in European and North American cities. Rooftops, allotments and community gardens now host thousands of colonies. This guide covers hive choice, seasonal care, swarm control and honey yield, and it closes with the legal duties of a city keeper.

## 1. Choosing a hive

The two hive designs most often used in cities are the Langstroth hive and the top-bar hive. The Langstroth hive uses stacked boxes with removable frames, so inspections are quick and honey is easy to extract. The top-bar hive is a single long box with wooden bars; bees build comb hanging from each bar, which suits keepers who want minimal equipment.

| Hive type | Frames | Typical colony size | Honey per year | Best for |
|---|---|---|---|---|
| Langstroth | 10 per box | 40,000–60,000 bees | 25–45 kg | Production, quick inspections |
| Top-bar | 24–30 bars | 20,000–40,000 bees | 8–15 kg | Low cost, natural comb |
| Warré | 8 bars per box | 20,000–35,000 bees | 10–20 kg | Low-intervention keeping |

Table 1: Common hive designs compared.

Weight matters on a rooftop. A full Langstroth hive with two supers can weigh more than 90 kg, so Maria Kovač of the Ljubljana Beekeepers Association advises checking the roof's load rating with the building owner before installing any hive.

## 2. The beekeeping year

### 2.1 Spring

In spring the queen lays up to 2,000 eggs a day and the colony expands fast. Inspect every 7 to 9 days for queen cells, which are the first sign of swarming. Add a super when bees cover seven of the ten frames in the brood box.

### 2.2 Summer

Summer is the main nectar flow. Lime trees, clover and bramble supply most city honey. Keep water within 50 metres of the hive: a colony can drink more than a litre a day in hot weather.

### 2.3 Autumn and winter

In autumn, remove the honey supers, treat for Varroa mites and leave the colony at least 18 kg of stores. In winter the bees form a cluster and keep its centre near 34 °C. Do not open the hive below 10 °C.

<!-- page 2 -->
## 3. Swarm control

A swarm is the colony's way of reproducing: the old queen leaves with about half of the workers. Swarms are harmless but alarm neighbours. The demaree method separates the queen from the brood to break the swarming impulse:

1. Move the brood frames to a new box above a queen excluder.
2. Leave the queen below with empty frames.
3. Remove any queen cells in the upper box after seven days.

Clipping one wing of the queen also stops her flying away, although the colony may still try to swarm with a new queen.

## 4. Estimating honey yield

Keepers often estimate the harvest before opening the supers. A simple model uses the number of capped frames and the average weight of honey per frame:

$$ Y = n_{capped} \\times w_{frame} \\times 0.85 $$

where Y is the expected extractable honey in kilograms, n is the number of fully capped frames and w is the average honey weight per frame (about 2.5 kg for a deep Langstroth frame). The factor 0.85 allows for wax and honey left on the comb.

Figure 1: A capped honey frame ready for extraction.

## 5. Legal duties

Most cities require hives to be registered with the national veterinary authority. In the United Kingdom, keepers are encouraged to register on BeeBase, run by the National Bee Unit. Many councils set a minimum distance of 5 metres between a hive and a public path, and some require a 2-metre fence or hedge so that bees fly upwards, above head height.

Keepers must report notifiable diseases such as American foulbrood and European foulbrood. In 2023 the National Bee Unit confirmed 54 cases of European foulbrood in England and Wales.

## 6. Quick reference

- Inspect every 7–9 days from April to July.
- Leave at least 18 kg of honey for winter.
- Treat for Varroa after the last harvest.
- Register every apiary with the veterinary authority.
`;

  const runbook = `<!-- page 1 -->
# Northwind Cloud: Incident Response Runbook

This runbook describes how the Northwind Cloud platform team detects, triages and resolves production incidents. It applies to every service behind the public API gateway. The on-call engineer owns an incident until it is handed over or closed.

## Severity levels

| Severity | Definition | First response | Update cadence |
|---|---|---|---|
| SEV1 | Full outage or data loss for many customers | 5 minutes | Every 30 minutes |
| SEV2 | Major feature degraded, workaround exists | 15 minutes | Every hour |
| SEV3 | Minor impact, single customer or internal tool | 1 business day | Daily |

A SEV1 is declared by anyone who sees one. Priya Natarajan, the head of reliability, must be paged for every SEV1 within ten minutes.

## Detection

Alerts come from three sources: Prometheus rules on latency and error rates, synthetic checks from the Frankfurt and Virginia regions, and customer reports through the support portal. The error-rate alert fires when more than 2% of requests return 5xx responses for five minutes.

## Triage

The first responder opens an incident channel and records the start time. Triage answers three questions: what is broken, who is affected and what changed recently. Most incidents at Northwind follow a deploy, so always check the deploy log first.

\`\`\`bash
# Show the last ten deploys for a service
nwctl deploys list --service payments-api --limit 10

# Roll back to the previous release
nwctl deploys rollback --service payments-api --to previous
\`\`\`

If a deploy happened within the last hour and the symptoms started after it, roll back before investigating further. Rolling back is cheap; a long outage is not.

<!-- page 2 -->
## Communication

The incident commander posts updates on the status page at the cadence for the severity. Each update states the impact, what the team is doing, and when the next update will come. Do not speculate about the cause in public updates.

## Resolution and review

An incident is resolved when the error rate stays below 0.5% for 30 minutes. Within five business days the team writes a blameless review covering the timeline, the root cause, what went well and the follow-up actions. Each follow-up gets an owner and a due date in the tracker.

### Example review timeline

| Time (UTC) | Event |
|---|---|
| 09:02 | Error-rate alert fires for payments-api |
| 09:06 | On-call engineer Tomás Ruiz acknowledges |
| 09:11 | Deploy 4821 identified as the trigger |
| 09:14 | Rollback started |
| 09:19 | Error rate back below 0.5% |

The review for this incident found that a database migration in deploy 4821 locked the invoices table. The follow-up action was to run migrations with a lock timeout of 3 seconds.
`;
  CG.SAMPLES = [
    { name: 'Urban Beekeeping Field Guide.md', kind: 'md', text: beekeeping },
    { name: 'Northwind Incident Runbook.md', kind: 'md', text: runbook },
  ];
})();
