"""Generate a small, deterministic retail CSV for local smoke tests of the ETL.

Usage: uv run python scripts/generate_sample_dataset.py --rows 500 --output data/retail_sample.csv
"""

from __future__ import annotations

import argparse
import random
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd

PRODUCTS = ("Milk", "Bread", "Butter", "Cheese", "Eggs", "Soap", "Shampoo", "Soda", "Water", "Honey")
PAYMENT_METHODS = ("Cash", "Credit Card", "Debit Card", "Mobile Payment")
CITIES = ("New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Francisco", "Boston")
STORE_TYPES = ("Supermarket", "Convenience Store", "Specialty Store")
CUSTOMER_CATEGORIES = ("Student", "Young Adult", "Professional", "Retiree")
PROMOTIONS = ("BOGO (Buy One Get One)", "Discount on Selected Items", "Free Gift", "None")
FIRST_NAMES = ("Alex", "Taylor", "Jordan", "Morgan", "Casey", "Jamie", "Riley", "Chris")
LAST_NAMES = ("Smith", "Johnson", "Brown", "Garcia", "Miller", "Davis")
SEASON_BY_MONTH = {12: "Winter", 1: "Winter", 2: "Winter", 3: "Spring", 4: "Spring", 5: "Spring"}
START = datetime(2023, 1, 1)
SPAN_SECONDS = int(timedelta(days=730).total_seconds())


def season(month: int) -> str:
    return SEASON_BY_MONTH.get(month, "Summer" if month in (6, 7, 8) else "Fall")


def generate(rows: int, seed: int) -> pd.DataFrame:
    rng = random.Random(seed)  # noqa: S311 - synthetic data, not security sensitive
    records = []
    for index in range(rows):
        date = START + timedelta(seconds=rng.randrange(SPAN_SECONDS))
        basket = rng.sample(PRODUCTS, rng.randint(1, 5))
        records.append(
            {
                "Transaction_ID": 1_000_000_000 + index,
                "Date": date.isoformat(sep=" "),
                "Customer_Name": f"{rng.choice(FIRST_NAMES)} {rng.choice(LAST_NAMES)}",
                "Product": str(basket),
                "Total_Items": rng.randint(1, 10),
                "Total_Cost": round(rng.uniform(5, 200), 2),
                "Payment_Method": rng.choice(PAYMENT_METHODS),
                "City": rng.choice(CITIES),
                "Store_Type": rng.choice(STORE_TYPES),
                "Discount_Applied": rng.random() < 0.4,
                "Customer_Category": rng.choice(CUSTOMER_CATEGORIES),
                "Season": season(date.month),
                "Promotion": rng.choice(PROMOTIONS),
            }
        )
    return pd.DataFrame.from_records(records)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0] if __doc__ else None)
    parser.add_argument("--rows", type=int, default=500)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", type=Path, default=Path("data/retail_sample.csv"))
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    generate(args.rows, args.seed).to_csv(args.output, index=False)
    print(f"Wrote {args.rows} rows to {args.output}")


if __name__ == "__main__":
    main()
