#!/usr/bin/env python3
"""Export the ASGSR result tables into compact JSON for the explorer.

Source paths can be overridden with environment variables:
  VIRALL_RESULTS   (default: /mnt/ADdrive/Virall_results_ASGSR)
  VIRALL_VALIDATION (default: /home/bruno/analysis/paper/competitors/results)
"""

from __future__ import annotations

import glob
import hashlib
import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

RESULTS = Path(os.environ.get("VIRALL_RESULTS", "/mnt/ADdrive/Virall_results_ASGSR"))
VALIDATION = Path(
    os.environ.get("VIRALL_VALIDATION", "/home/bruno/analysis/paper/competitors/results")
)
OUT = Path(__file__).resolve().parent.parent / "src" / "data"

FLIGHT_ORDER = {"F9": 0, "F10": 1, "F11": 2}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def clean_number(value):
    if value is None:
        return None
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    return value


def round_sig(value: float, digits: int = 4) -> float:
    if value == 0 or not math.isfinite(value):
        return 0.0
    return float(f"{value:.{digits}g}")


def parse_taxonomy() -> dict[str, dict[str, str | None]]:
    """Species name -> class/family/order from the Kaiju results."""
    files = glob.glob(str(RESULTS / "*/02_viral_contigs/kaiju_dir/kaiju_results_with_names.tsv"))
    taxonomy: dict[str, dict[str, str | None]] = {}
    for path in files:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                parts = line.rstrip("\n").split("\t")
                if len(parts) < 4 or parts[0] != "C":
                    continue
                taxa = [
                    item.strip()
                    for item in parts[3].strip().strip(";").split(";")
                    if item.strip() and item.strip() != "NA"
                ]
                if not taxa:
                    continue
                species = taxa[-1]
                candidate = taxa[-2] if len(taxa) > 1 else None
                is_rank = candidate is not None and candidate.endswith(
                    ("viricetes", "viricota", "virales", "viridae", "virinae")
                )
                taxonomy[species] = {
                    "kingdom": taxa[0] if taxa[0] in ("Viruses", "Bacteria", "Archaea") else None,
                    "genus": candidate if candidate and not is_rank else None,
                    "class": next((t for t in reversed(taxa) if t.endswith("viricetes")), None),
                    "family": next((t for t in reversed(taxa) if t.endswith("viridae")), None),
                    "order": next((t for t in reversed(taxa) if t.endswith("virales")), None),
                    "phylum": next((t for t in reversed(taxa) if t.endswith("viricota")), None),
                }
    return taxonomy


def build_samples() -> tuple[list[dict], dict[str, str]]:
    alpha = pd.read_csv(RESULTS / "analysis/alpha_diversity.tsv", sep="\t")
    alpha = alpha.sort_values(
        by=["Flight", "Replicate", "PMA_status"],
        key=lambda col: col.map(FLIGHT_ORDER) if col.name == "Flight" else col,
    )
    samples = []
    run_to_sample: dict[str, str] = {}
    for row in alpha.to_dict("records"):
        sample = {
            "run": row["Run"],
            "id": row["SampleID"],
            "name": row["SampleName"],
            "flight": row["Flight"],
            "replicate": row["Replicate"],
            "pma": row["PMA_status"] == "PMA",
            "pair": row["PairID"],
            "richness": clean_number(row["Richness"]),
            "shannon": (
                round_sig(float(row["Shannon"])) if not pd.isna(row["Shannon"]) else None
            ),
            "spots": int(row["spots"]),
            "bases": int(row["bases"]),
        }
        samples.append(sample)
        run_to_sample[row["Run"]] = row["SampleID"]
    return samples, run_to_sample


def build_species(run_to_sample: dict[str, str], taxonomy: dict) -> dict:
    matrix = pd.read_csv(
        RESULTS / "analysis/species_tpm_matrix.tsv", sep="\t", index_col=0
    )
    columns = [run_to_sample.get(c) for c in matrix.columns]
    if any(c is None for c in columns):
        missing = [c for c, s in zip(matrix.columns, columns) if s is None]
        raise SystemExit(f"Matrix columns missing sample metadata: {missing}")

    species = []
    for name, row in matrix.iterrows():
        values = [
            [idx, round_sig(float(value))] for idx, value in enumerate(row.tolist()) if value > 0
        ]
        taxonomy_info = taxonomy.get(name, {})
        klass = taxonomy_info.get("class")
        kingdom = taxonomy_info.get("kingdom")
        group = "other"
        if kingdom is not None and kingdom != "Viruses":
            group = "nonviral"
        elif klass == "Caudoviricetes":
            group = "phage"
        elif klass == "Megaviricetes":
            group = "giant"
        species.append(
            {
                "name": name,
                "kingdom": kingdom,
                "class": klass,
                "family": taxonomy_info.get("family"),
                "genus": taxonomy_info.get("genus"),
                "order": taxonomy_info.get("order"),
                "phylum": taxonomy_info.get("phylum"),
                "group": group,
                "prevalence": len(values),
                "total": round_sig(float(row.sum())),
                "values": values,
            }
        )

    species.sort(key=lambda s: (-s["prevalence"], s["name"]))
    return {"samples": columns, "species": species}


def build_class_composition(samples: list[dict]) -> list[dict]:
    frame = pd.read_csv(RESULTS / "analysis/class_level_abundance.tsv", sep="\t")
    by_sample = {}
    for sample in samples:
        by_sample[sample["id"]] = {
            "id": sample["id"],
            "flight": sample["flight"],
            "pma": sample["pma"],
            "Caudoviricetes": 0.0,
            "Megaviricetes": 0.0,
            "Other": 0.0,
        }
    for row in frame.to_dict("records"):
        target = by_sample.get(row["SampleID"])
        if target is None:
            continue
        group = row["class_plot"]
        key = group if group in ("Caudoviricetes", "Megaviricetes") else "Other"
        target[key] += float(row["total_tpm"])
    for target in by_sample.values():
        total = sum(target[k] for k in ("Caudoviricetes", "Megaviricetes", "Other"))
        target["total"] = round_sig(total)
        for key in ("Caudoviricetes", "Megaviricetes", "Other"):
            target[key] = round_sig(target[key])
    return [by_sample[s["id"]] for s in samples]


def build_genomes(run_to_sample: dict[str, str]) -> list[dict]:
    frame = pd.read_csv(RESULTS / "analysis/high_quality_genomes.tsv", sep="\t")
    frame = frame.sort_values("completeness", ascending=False).drop_duplicates("contig_id")
    genomes = []
    for row in frame.to_dict("records"):
        genomes.append(
            {
                "contig": row["contig_id"],
                "sample": run_to_sample.get(row["sample_id"], row["sample_id"]),
                "completeness": round_sig(float(row["completeness"])),
                "contamination": round_sig(float(row["contamination"])),
                "length": int(row["contig_length"]),
                "viralGenes": int(row["viral_genes"]),
                "hostGenes": int(row["host_genes"]),
                "flight": row["Flight"],
                "pma": row["PMA_status"] == "PMA",
            }
        )
    genomes.sort(key=lambda g: (-g["completeness"], -g["length"]))
    return genomes


def build_core(samples: list[dict], species: dict) -> dict:
    pma_runs = {s["id"] for s in samples if s["pma"]}
    untreated_runs = {s["id"] for s in samples if not s["pma"]}
    flight_of = {s["id"]: s["flight"] for s in samples}
    sample_index = {sample_id: i for i, sample_id in enumerate(species["samples"])}

    pma_species = 0
    core = 0
    by_flights = {1: 0, 2: 0, 3: 0}
    for entry in species["species"]:
        present = {species["samples"][idx] for idx, _ in entry["values"]}
        in_pma = present & pma_runs
        in_untreated = present & untreated_runs
        if in_pma:
            pma_species += 1
        if in_pma and in_untreated:
            core += 1
            flights = {flight_of[run] for run in in_pma if run in sample_index}
            by_flights[len(flights)] += 1

    return {
        "pmaSpecies": pma_species,
        "coreSpecies": core,
        "byFlights": by_flights,
    }


def build_viability(samples: list[dict]) -> dict:
    untreated = [s["richness"] for s in samples if not s["pma"] and s["richness"] is not None]
    pma = [s["richness"] for s in samples if s["pma"]]
    pma_known = [v for v in pma if v is not None]
    no_detection = sum(1 for v in pma if v is None)
    return {
        "untreatedMin": int(min(untreated)),
        "untreatedMax": int(max(untreated)),
        "pmaMin": 0 if no_detection else int(min(pma_known)),
        "pmaMax": int(max(pma_known)),
        "pmaNoDetection": sum(1 for v in pma if v is None),
        "pairs": sum(1 for s in samples if not s["pma"]),
    }


def build_validation() -> dict:
    points = pd.read_csv(VALIDATION / "all_datapoints_48.tsv", sep="\t")
    points = points[points["tool"] == "Virall"].copy()
    points["mock"] = points["condition"].str.split("_").str[0]
    points["tech"] = points["condition"].str.split("_").str[1]
    points["sample"] = points["condition"].str.split("_").str[2]

    point_rows = [
        {
            "condition": row["condition"],
            "mock": row["mock"],
            "tech": row["tech"],
            "sample": row["sample"],
            "measured": round_sig(float(row["relative_abundance"])),
            "true": round_sig(float(row["true_rel_abund"])),
            "detected": bool(row["detected"]),
        }
        for row in points.to_dict("records")
    ]

    summary = pd.read_csv(VALIDATION / "comparison_summary_48.tsv", sep="\t")
    summary = summary[summary["tool"] == "Virall"].copy()
    summary_rows = []
    for row in summary.to_dict("records"):
        summary_rows.append(
            {
                "condition": f"{row['mock']}_{row['tech']}_{row['sample']}",
                "mock": row["mock"],
                "tech": row["tech"],
                "sample": row["sample"],
                "recall": round_sig(float(row["detection_recall"])),
                "detected": int(row["n_detected"]),
                "expected": int(row["n_expected"]),
                "r2": (
                    round_sig(float(row["abundance_r2"]))
                    if not pd.isna(row["abundance_r2"])
                    else None
                ),
                "mae": (
                    round_sig(float(row["abundance_mae"]))
                    if not pd.isna(row["abundance_mae"])
                    else None
                ),
            }
        )

    platforms = ["illumina", "iontorrent", "nanopore", "pacbio"]
    return {
        "points": point_rows,
        "summary": summary_rows,
        "platforms": platforms,
        "mockTypes": ["DNA", "RNA"],
        "sampleTypes": sorted({r["sample"] for r in summary_rows}),
    }


def build_highlights(species: dict) -> dict:
    def top(group: str, limit: int = 8):
        rows = [entry for entry in species["species"] if entry["group"] == group]
        rows.sort(key=lambda entry: (-entry["prevalence"], -entry["total"], entry["name"]))
        return [
            {
                "name": entry["name"],
                "prevalence": entry["prevalence"],
                "total": entry["total"],
                "family": entry["family"],
            }
            for entry in rows[:limit]
        ]

    return {"topPhages": top("phage"), "topGiants": top("giant")}


def build_meta(samples, species, genomes, validation) -> dict:
    sources = [
        RESULTS / "analysis/alpha_diversity.tsv",
        RESULTS / "analysis/species_tpm_matrix.tsv",
        RESULTS / "analysis/class_level_abundance.tsv",
        RESULTS / "analysis/high_quality_genomes.tsv",
        VALIDATION / "all_datapoints_48.tsv",
        VALIDATION / "comparison_summary_48.tsv",
    ]
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "counts": {
            "samples": len(samples),
            "flights": len({s["flight"] for s in samples}),
            "species": len(species["species"]),
            "viralSpecies": sum(1 for entry in species["species"] if entry["group"] != "nonviral"),
            "nonViralTaxa": sum(1 for entry in species["species"] if entry["group"] == "nonviral"),
            "genomes": len(genomes),
            "validationConditions": len(validation["summary"]),
            "validationPoints": len(validation["points"]),
        },
        "sources": [
            {"file": str(path), "sha256": sha256(path)} for path in sources
        ],
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    taxonomy = parse_taxonomy()
    samples, run_to_sample = build_samples()
    species = build_species(run_to_sample, taxonomy)
    composition = build_class_composition(samples)
    genomes = build_genomes(run_to_sample)
    core = build_core(samples, species)
    viability = build_viability(samples)
    validation = build_validation()
    highlights = build_highlights(species)
    meta = build_meta(samples, species, genomes, validation)

    payloads = {
        "samples.json": samples,
        "species.json": species,
        "composition.json": composition,
        "genomes.json": genomes,
        "core.json": core,
        "viability.json": viability,
        "validation.json": validation,
        "highlights.json": highlights,
        "meta.json": meta,
    }
    for filename, payload in payloads.items():
        path = OUT / filename
        path.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
        print(f"{filename:22} {path.stat().st_size / 1024:7.1f} KB")

    print("\nCounts:", json.dumps(meta["counts"], indent=2))
    print("Core:", core)
    print("Viability:", viability)


if __name__ == "__main__":
    main()
