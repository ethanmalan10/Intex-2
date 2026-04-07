"""Reusable utilities for data cleaning and univariate analysis.

This module is intentionally dataset-agnostic so multiple ML pipelines can
reuse the same preparation and EDA helpers.
"""

from __future__ import annotations

from typing import Dict, Iterable, Optional, Tuple

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns


def standardize_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """Return a copy with consistent snake_case column names."""
    out = df.copy()
    out.columns = (
        out.columns.str.strip()
        .str.lower()
        .str.replace(r"[^a-z0-9]+", "_", regex=True)
        .str.replace(r"_+", "_", regex=True)
        .str.strip("_")
    )
    return out


def basic_cleaning(
    df: pd.DataFrame,
    *,
    date_columns: Optional[Iterable[str]] = None,
    numeric_columns: Optional[Iterable[str]] = None,
    categorical_columns: Optional[Iterable[str]] = None,
    drop_duplicates: bool = True,
    trim_strings: bool = True,
) -> pd.DataFrame:
    """Perform generic, safe data cleaning for many dataset shapes."""
    out = standardize_column_names(df)

    if trim_strings:
        object_cols = out.select_dtypes(include=["object"]).columns
        for col in object_cols:
            out[col] = out[col].astype("string").str.strip()

    if drop_duplicates:
        out = out.drop_duplicates().reset_index(drop=True)

    for col in date_columns or []:
        if col in out.columns:
            out[col] = pd.to_datetime(out[col], errors="coerce")

    for col in numeric_columns or []:
        if col in out.columns:
            out[col] = pd.to_numeric(out[col], errors="coerce")

    for col in categorical_columns or []:
        if col in out.columns:
            out[col] = out[col].astype("category")

    return out


def missing_value_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Summarize missing values by column."""
    total = df.isna().sum()
    pct = (total / len(df) * 100).round(2) if len(df) else 0
    summary = pd.DataFrame(
        {"missing_count": total, "missing_pct": pct}
    ).sort_values("missing_count", ascending=False)
    return summary[summary["missing_count"] > 0]


def numeric_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Describe numeric columns with common summary stats."""
    numeric_df = df.select_dtypes(include=["number"])
    if numeric_df.empty:
        return pd.DataFrame()
    return numeric_df.describe().T


def categorical_summary(df: pd.DataFrame, top_n: int = 10) -> Dict[str, pd.DataFrame]:
    """Return value-count summaries for categorical-like columns."""
    summaries: Dict[str, pd.DataFrame] = {}
    cat_cols = list(df.select_dtypes(include=["object", "category", "string"]).columns)
    for col in cat_cols:
        counts = (
            df[col]
            .astype("string")
            .fillna("<<MISSING>>")
            .value_counts(dropna=False)
            .head(top_n)
            .rename_axis(col)
            .reset_index(name="count")
        )
        counts["pct"] = (counts["count"] / len(df) * 100).round(2) if len(df) else 0
        summaries[col] = counts
    return summaries


def cap_outliers_iqr(df: pd.DataFrame, columns: Optional[Iterable[str]] = None) -> pd.DataFrame:
    """Winsorize numeric columns using the IQR rule."""
    out = df.copy()
    target_cols = list(columns) if columns else list(out.select_dtypes(include=["number"]).columns)
    for col in target_cols:
        if col not in out.columns:
            continue
        series = pd.to_numeric(out[col], errors="coerce")
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        if pd.isna(iqr) or iqr == 0:
            continue
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        out[col] = series.clip(lower=lower, upper=upper)
    return out


def plot_univariate_numeric(
    df: pd.DataFrame,
    columns: Optional[Iterable[str]] = None,
    bins: int = 30,
    figsize: Tuple[int, int] = (7, 4),
) -> None:
    """Plot histogram + KDE for numeric columns."""
    target_cols = list(columns) if columns else list(df.select_dtypes(include=["number"]).columns)
    for col in target_cols:
        if col not in df.columns:
            continue
        plt.figure(figsize=figsize)
        sns.histplot(df[col].dropna(), bins=bins, kde=True)
        plt.title(f"Distribution: {col}")
        plt.xlabel(col)
        plt.ylabel("Count")
        plt.tight_layout()
        plt.show()


def plot_univariate_categorical(
    df: pd.DataFrame,
    columns: Optional[Iterable[str]] = None,
    top_n: int = 10,
    figsize: Tuple[int, int] = (8, 4),
) -> None:
    """Plot top category counts for categorical columns."""
    target_cols = list(columns) if columns else list(
        df.select_dtypes(include=["object", "category", "string"]).columns
    )
    for col in target_cols:
        if col not in df.columns:
            continue
        counts = df[col].astype("string").fillna("<<MISSING>>").value_counts().head(top_n)
        plt.figure(figsize=figsize)
        sns.barplot(x=counts.values, y=counts.index, orient="h")
        plt.title(f"Top {top_n} Categories: {col}")
        plt.xlabel("Count")
        plt.ylabel(col)
        plt.tight_layout()
        plt.show()


def correlation_matrix(df: pd.DataFrame, figsize: Tuple[int, int] = (8, 6)) -> pd.DataFrame:
    """Return and plot numeric correlation matrix."""
    numeric_df = df.select_dtypes(include=["number"])
    if numeric_df.empty:
        return pd.DataFrame()
    corr = numeric_df.corr(numeric_only=True)
    plt.figure(figsize=figsize)
    sns.heatmap(corr, annot=False, cmap="coolwarm", center=0)
    plt.title("Correlation Matrix")
    plt.tight_layout()
    plt.show()
    return corr

