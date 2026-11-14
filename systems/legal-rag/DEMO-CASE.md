# Populated demonstration: Northstar v. Meridian

All parties, documents and events are fictional. This is a teaching dataset, not a real legal matter.

Open `/ui/demo-case.html`. The original workspace also has a **Demo case** link. Six exhibits cover the purchase order, delivery, inspection, buyer notice, supplier response and loss schedule. Download each PDF or the combined packet. An optional image-only copy of Exhibit C is provided for testing OCR through Upload PDF. Seven question cards prefill the original chat; press **Send** to run the actual backend. Review hints are labelled prepared teaching notes, never fabricated AI results.

The case exercises document ingestion, source retrieval, English UCC retrieval, source comparison, chronology, calculations, drafting and missing-evidence checks. Retrieval/citation inspection work without credentials. Generated analysis, calculations and drafting require an OpenAI key. No key is included and generated answers have not been verified with a real provider account.

For a fresh installation, start the backend and run:

```bash
python scripts/seed_demo_case.py --url http://127.0.0.1:7860
```

This deliberately adds fictional material to the shared corpus. The script uploads the PDF through the real API and waits for FAISS, BM25, ColBERT and graph jobs. It writes an ingestion marker under `ui/demo-case`. If you seed a remote instance, copy that marker into its matching UI directory afterward. The script skips an already verified case when the running backend confirms its presence. A fresh or incomplete seed triggers a ColBERT rebuild even if dense indexing finds no new chunks. Do not repeatedly upload the packet to test the buttons.

Case checks: 60 laptops at USD 1,200 each; 18 failed (12 shutdowns and six charging failures); USD 21,600 affected-unit contract value; USD 3,300 documented additional outlays; USD 8,000 unsupported lost-profit allegation. Governing jurisdiction, root cause and legally recoverable damages are intentionally not established. Avoid treating any contractual or factual figure as a damages award.

The original application remains a shared retrieval workspace, not a full matter-management product. The case page makes its existing capabilities easier to explore without changing that scope.

Validation on 2026-11-14: all four indexing jobs completed with 11 new chunks. Live searches returned the inspection facts, UCC 2-314 and the documented USD 3,300 outlays. All seven question links, six exhibit downloads, OCR of the scanned inspection copy and mobile layout were verified. Re-seeding the completed case safely skipped a duplicate rebuild. See `evidence/demo-case-*`.
