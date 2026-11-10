from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Any
from unittest.mock import MagicMock

import pytest
from pika.exceptions import NackError, UnroutableError

from datashelf_etl.contracts import MetricChart
from datashelf_etl.messaging import publisher as publisher_module
from datashelf_etl.messaging.publisher import EventPublisher, PublishError, RabbitMQConnection
from datashelf_etl.pipeline import AnalyticsResult, build_event

EXCHANGE = "datashelf.events"


class FakeChannel:
    def __init__(self, error: Exception | None = None) -> None:
        self.error = error
        self.declared: list[dict[str, Any]] = []
        self.confirms = False
        self.published: list[dict[str, Any]] = []

    def exchange_declare(self, exchange: str, exchange_type: str, durable: bool) -> None:
        self.declared.append({"exchange": exchange, "exchange_type": exchange_type, "durable": durable})

    def confirm_delivery(self) -> None:
        self.confirms = True

    def basic_publish(
        self, exchange: str, routing_key: str, body: bytes, properties: Any, mandatory: bool
    ) -> None:
        if self.error is not None:
            raise self.error
        self.published.append(
            {
                "exchange": exchange,
                "routing_key": routing_key,
                "body": body,
                "properties": properties,
                "mandatory": mandatory,
            }
        )


def make_event() -> Any:
    return build_event(
        job="retail_metrics",
        run_id="manual__1",
        object_key="raw-data/a.csv",
        result=AnalyticsResult(charts=[MetricChart(name="total_sales", title="T", description="", value=1)]),
        processing_time_sec=0.5,
        occurred_at=datetime(2025, 1, 1, tzinfo=UTC),
    )


def test_declares_topic_exchange_and_enables_confirms() -> None:
    channel = FakeChannel()
    EventPublisher(channel, EXCHANGE)

    assert channel.declared == [{"exchange": EXCHANGE, "exchange_type": "topic", "durable": True}]
    assert channel.confirms


def test_publishes_persistent_json_with_mandatory_flag() -> None:
    channel = FakeChannel()
    event = make_event()

    EventPublisher(channel, EXCHANGE).publish(event)

    [message] = channel.published
    assert message["exchange"] == EXCHANGE
    assert message["routing_key"] == "dataset.charts.computed"
    assert message["mandatory"] is True
    assert message["properties"].delivery_mode == 2
    assert message["properties"].content_type == "application/json"
    assert message["properties"].message_id == str(event.event_id)
    body = json.loads(message["body"])
    assert body["run_id"] == "manual__1"
    assert body["charts"][0] == {
        "name": "total_sales",
        "title": "T",
        "description": "",
        "type": "metric",
        "value": 1,
    }


@pytest.mark.parametrize(
    ("error", "message"),
    [(UnroutableError([]), "unroutable"), (NackError([]), "rejected")],
)
def test_raises_when_broker_does_not_confirm(error: Exception, message: str) -> None:
    with pytest.raises(PublishError, match=message):
        EventPublisher(FakeChannel(error), EXCHANGE).publish(make_event())


def test_connection_context_manager(monkeypatch: pytest.MonkeyPatch) -> None:
    channel = FakeChannel()
    connection = MagicMock()
    connection.channel.return_value = channel
    connection.is_open = True
    factory = MagicMock(return_value=connection)
    monkeypatch.setattr(publisher_module.pika, "BlockingConnection", factory)

    with RabbitMQConnection("amqp://guest:guest@localhost:5672/", EXCHANGE) as publisher:
        publisher.publish(make_event())

    factory.assert_called_once()
    connection.close.assert_called_once()
    assert len(channel.published) == 1
