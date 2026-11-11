"""Pydantic mirror of packages/contracts/schemas/charts-computed.v1.schema.json."""

from __future__ import annotations

from typing import Annotated, Any, Final, Literal
from uuid import UUID

from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    SerializerFunctionWrapHandler,
    model_serializer,
)

CHARTS_COMPUTED_EVENT_TYPE: Final = "dataset.charts.computed"
CHARTS_COMPUTED_SCHEMA_VERSION: Final = 1

Number = int | float
ChartName = Annotated[str, Field(pattern=r"^[a-z0-9_]+$")]


class _LooseModel(BaseModel):
    model_config = ConfigDict(extra="allow", allow_inf_nan=False, revalidate_instances="always")


class Top(_LooseModel):
    label: str | None


class _ChartBase(_LooseModel):
    name: ChartName
    title: str
    description: str


class SeriesChart(_ChartBase):
    type: Literal["line", "bar", "pie", "area"]
    labels: list[str]
    values: list[Number]


class FrequencyChart(_ChartBase):
    type: Literal["frequency"] = "frequency"
    labels: list[str]
    values: list[Number]
    total: Number
    top: Top


class GroupedChart(_ChartBase):
    type: Literal["grouped"] = "grouped"
    labels: list[str]
    values_sum: list[Number]
    values_count: list[Number]
    top: Top


class MetricChart(_ChartBase):
    type: Literal["metric"] = "metric"
    value: Number | str
    unit_sign: str | None = None

    @model_serializer(mode="wrap")
    def _drop_missing_unit_sign(self, handler: SerializerFunctionWrapHandler) -> dict[str, Any]:
        data: dict[str, Any] = handler(self)
        if data.get("unit_sign") is None:
            data.pop("unit_sign", None)
        return data


Chart = Annotated[SeriesChart | FrequencyChart | GroupedChart | MetricChart, Field(discriminator="type")]


class Dataset(BaseModel):
    model_config = ConfigDict(extra="forbid")

    object_key: str = Field(min_length=1)
    filename: str = Field(min_length=1)


class ChartsComputedEvent(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

    event_id: UUID
    event_type: Literal["dataset.charts.computed"] = CHARTS_COMPUTED_EVENT_TYPE
    schema_version: Literal[1] = CHARTS_COMPUTED_SCHEMA_VERSION
    occurred_at: AwareDatetime
    run_id: str = Field(min_length=1, max_length=250)
    job: str = Field(pattern=r"^[a-z][a-z0-9_]{1,63}$")
    dataset: Dataset
    processing_time_sec: float = Field(ge=0)
    meta: dict[str, Any]
    charts: list[Chart] = Field(min_length=1)
