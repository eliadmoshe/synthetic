# Synthetic

**Synthetic** is an open-source JavaScript framework designed for genetic engineering. Write genetic constructs using a clean DSL, resolve iGEM BioBrick parts and PDB proteins automatically, and generate optimized DNA sequences — all from Javascript.

## ✨ Features

- 📦 **Available as an npm package**  
  Easily install and integrate with your JavaScript or Node.js projects.

- 🧬 **Fully open-source — MIT licensed**  
  Use, modify, and distribute freely under the permissive MIT license.

- 🧭 **Follows standard iGEM notations**  
  Compatible with iGEM BioBrick part IDs (e.g. `BBa_C0040`) and plasmid backbone names (e.g. `pSB1C3`).

- 🧪 **Built-in codon usage optimization**  
  Automatically optimize DNA/amino-acid sequences for any target organism using the [Kazusa Codon Usage Database](http://www.kazusa.or.jp/codon/).

- 🔗 **Seamless integration with iGEM and the Protein Data Bank (PDB)**  
  Fetch and resolve genetic parts and protein structure sequences effortlessly at compile time.

- 🧠 **Supports combinatorial design**  
  Describe multiple variants of a genetic construct in a single expression and compile all combinations at once.

---

## 📦 Installation

```bash
npm install synthetic
```

---

## 🚀 Quick Start

```js
require("synthetic");

// Simple genetic construct: promoter → RBS → CDS → terminator
compile(
  promoter("BBa_J23100") +
  rbs("BBa_B0034") +
  cds("atgaaagcaattttcgtactg") +
  terminator("BBa_B0015")
).then(variants => {
  console.log(variants); // Array of compiled DNA sequences
});
```

---

## 📖 API Reference

### `compile(construct, [onDrawPlasmid])`

Compiles a construct string into an array of DNA sequences. Returns a `Promise<string[]>`.

- **`construct`** — A string built by concatenating part helper calls (see Part Helpers below).
- **`onDrawPlasmid`** *(optional)* — A callback invoked for each compiled variant: `(plasmidId, featureTypes, variantParts) => void`.

Each element in the resolved array is a fully assembled, codon-optimized DNA sequence string.

```js
const variants = await compile(
  promoter("BBa_J23100") + rbs("BBa_B0034") + cds("atgaaa") + terminator("BBa_B0015")
);
// variants[0] → "ATGAAAGCA..."
```

---

### Part Helpers

All part helpers accept either a single string or an array of strings. Using an array enables **combinatorial design** — every combination across all array positions is compiled as a separate variant.

| Helper | iGEM Part Type | Description |
|---|---|---|
| `promoter(seq)` | Promoter | Drives transcription |
| `rbs(seq)` | RBS | Ribosome binding site |
| `cds(seq)` | CDS | Protein-coding sequence |
| `terminator(seq)` | Terminator | Ends transcription |
| `proteinDomain(seq)` | Protein Domain | Functional protein region |
| `translationalUnit(seq)` | Translational Unit | Full expression cassette |
| `dna(seq)` | DNA | Raw DNA sequence |
| `composite(seq)` | Composite | Multi-part composite device |
| `proteinGenerator(seq)` | Protein Generator | RBS + CDS + terminator combination |
| `restrictionSite(seq)` | Restriction Site | Restriction enzyme recognition sequence |
| `reporter(seq)` | Reporter | Reporter gene (e.g. GFP) |
| `inverter(seq)` | Inverter | NOT-gate logic element |
| `receiver(seq)` | Receiver | Signal receiver part |
| `sender(seq)` | Sender | Signal sender part |
| `measurement(seq)` | Measurement | Measurement/characterization part |
| `primerBindingSite(seq)` | Primer Binding Site | PCR primer binding region |

Each `seq` argument can be:
- A **raw DNA sequence** string (e.g. `"atgaaacgt"`)
- An **amino-acid sequence** string (uppercase single-letter codes, e.g. `"MKAIF"`) — optimized to codons at compile time
- An **iGEM BioBrick ID** (e.g. `"BBa_C0040"`) — fetched from the iGEM Parts Registry
- A **PDB entry ID** (4-character, e.g. `"7BKX"`) — protein sequence fetched from RCSB PDB and codon-optimized
- An **array** of any of the above for combinatorial variants

---

### Codon Usage Optimization

The default codon table targets *Escherichia coli* O157:H7. Use the functions below to switch organisms.

#### `searchCodonUsageTable(query)`

Searches the Kazusa database for organisms by name. Returns `Promise<Array<{id, name, type, division, geneCount}>>`.

```js
const results = await searchCodonUsageTable("Saccharomyces");
// [{ id: "4932", name: "Saccharomyces cerevisiae [gbpln]", division: "Plant", geneCount: 10359 }, ...]
```

#### `getCodonUsageTable(id)`

Fetches the codon usage table for a Kazusa organism ID. Returns a parsed table object (cached after first call).

```js
const table = await getCodonUsageTable("4932"); // S. cerevisiae
// table.dnaTripletFrequencies → Array of 64 codon entries
// table.aminoAcidFrequencies  → Most-frequent codon per amino acid
```

#### `setCodonUsageTable(id)`

Fetches the codon usage table for the given organism ID and sets it as the globally active table used by `compile`.

```js
await setCodonUsageTable("4932"); // Switch to S. cerevisiae
```

#### `optimizeSequence(aaSequence)`

Converts a single-letter amino-acid string into a codon-optimized DNA string using the currently active codon usage table.

```js
const dna = optimizeSequence("MKAIF");
// → "atgaaagcaattttt"
```

---

## 🧪 Examples

### Simple construct with raw sequences

```js
require("synthetic");

compile(
  promoter("tataaa") +
  rbs("aggagg") +
  cds("atgaaagcaattttcgtactg") +
  terminator("tgcatggc")
).then(variants => console.log(variants));
```

### Using iGEM BioBrick parts

Parts matching the pattern `BBa_*` or `pSB*` are automatically fetched from the [iGEM Parts Registry](https://parts.igem.org).

```js
require("synthetic");

compile(
  promoter("BBa_J23100") +
  rbs("BBa_B0034") +
  cds("BBa_E0040") +   // GFP
  terminator("BBa_B0015")
).then(variants => console.log(variants));
```

### Using a PDB protein sequence

Parts matching a 4-character alphanumeric ID (e.g. `7BKX`) are fetched from [RCSB PDB](https://www.rcsb.org) and codon-optimized.

```js
require("synthetic");

compile(
  promoter("BBa_J23100") +
  rbs("BBa_B0034") +
  cds("7BKX") +          // Fetches protein from PDB and optimizes codons
  terminator("BBa_B0015")
).then(variants => console.log(variants));
```

### Combinatorial design

Pass an array to any part helper to generate all variant combinations automatically.

```js
require("synthetic");

// Generates 2×2 = 4 variants: all combinations of 2 promoters × 2 RBS sequences
compile(
  promoter(["BBa_J23100", "BBa_J23119"]) +
  rbs(["BBa_B0034", "BBa_B0032"]) +
  cds("BBa_E0040") +
  terminator("BBa_B0015")
).then(variants => {
  console.log(`Generated ${variants.length} variants`);
  variants.forEach((seq, i) => console.log(`Variant ${i + 1}: ${seq.slice(0, 40)}...`));
});
```

### Switching codon usage tables

```js
require("synthetic");

// Use S. cerevisiae codon frequencies instead of the default E. coli
await setCodonUsageTable("4932");

compile(
  promoter("tataaa") +
  rbs("aggagg") +
  cds("MKAIFVL") +    // Amino acids → optimized for yeast
  terminator("tgcatggc")
).then(variants => console.log(variants));
```

### Plasmid visualization callback

```js
require("synthetic");

compile(
  promoter("BBa_J23100") + rbs("BBa_B0034") + cds("BBa_E0040") + terminator("BBa_B0015"),
  (plasmidId, featureTypes, parts) => {
    console.log(`Plasmid ${plasmidId} features:`, featureTypes);
    console.log(`Parts:`, parts);
  }
);
```

---

## 🔖 Naming Conventions

### iGEM BioBrick IDs
- Format: `BBa_XXXXXXX` (e.g. `BBa_J23100`, `BBa_E0040`)
- Plasmid backbones: `pSBXXX` (e.g. `pSB1C3`)
- Reference: [iGEM Part Names](https://parts.igem.org/Help:BioBrick_Part_Names)

### PDB Entry IDs
- Format: 4-character alphanumeric (e.g. `7BKX`, `1ABC`)
- Reference: [RCSB PDB](https://www.rcsb.org)

### Raw DNA sequences
- Only characters `a`, `c`, `g`, `t` (case-insensitive) are treated as raw DNA.

### Amino-acid sequences
- Uppercase single-letter codes (e.g. `MKAIFVL`) are codon-optimized using the active codon usage table.

---

## 📄 License

MIT © [Eliad Moshe](https://github.com/eliadmoshe)
