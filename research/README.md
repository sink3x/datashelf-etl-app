# research

Exploratory notebooks behind the ETL analytics:

| Notebook                      | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `analytics-retail.ipynb`      | Exploratory analysis of the retail dataset, chart prototypes |
| `generate-fake-dataset.ipynb` | Synthetic retail data generation                             |
| `trim-dataset.ipynb`          | Cut a large dataset down to a small sample                   |

Datasets live in `data/` and are not committed (`data/*.csv` is ignored). For a quick deterministic sample
use `services/etl/scripts/generate_sample_dataset.py`.

## Environment

The notebooks use a conda environment from conda-forge:

```sh
conda env create -f environment.yml
conda activate datashelf-research
jupyter lab
```

After changing `environment.yml`, update the environment with
`conda env update -f environment.yml --prune`.
