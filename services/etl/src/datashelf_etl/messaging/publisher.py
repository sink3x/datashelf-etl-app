"""RabbitMQ publisher for contract events (topology is owned by the API consumer except the exchange)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Protocol

import pika
from pika.exceptions import NackError, UnroutableError

from datashelf_etl.contracts import CHARTS_COMPUTED_EVENT_TYPE

if TYPE_CHECKING:
    from types import TracebackType

    from datashelf_etl.contracts import ChartsComputedEvent

PERSISTENT_DELIVERY_MODE = 2


class PublishError(RuntimeError):
    """The broker did not confirm the message; the caller should retry."""


class Channel(Protocol):
    def exchange_declare(self, exchange: str, exchange_type: str, durable: bool) -> Any: ...

    def confirm_delivery(self) -> Any: ...

    def basic_publish(
        self, exchange: str, routing_key: str, body: bytes, properties: Any, mandatory: bool
    ) -> Any: ...


class EventPublisher:
    def __init__(self, channel: Channel, exchange: str) -> None:
        self._channel = channel
        self._exchange = exchange
        channel.exchange_declare(exchange=exchange, exchange_type="topic", durable=True)
        channel.confirm_delivery()

    def publish(self, event: ChartsComputedEvent) -> None:
        properties = pika.BasicProperties(
            content_type="application/json",
            delivery_mode=PERSISTENT_DELIVERY_MODE,
            message_id=str(event.event_id),
            type=CHARTS_COMPUTED_EVENT_TYPE,
        )
        try:
            self._channel.basic_publish(
                exchange=self._exchange,
                routing_key=event.event_type,
                body=event.model_dump_json().encode("utf-8"),
                properties=properties,
                mandatory=True,
            )
        except UnroutableError as exc:
            raise PublishError(
                f"Event {event.event_id} is unroutable on exchange {self._exchange!r} "
                f"with key {event.event_type!r}; is the consumer queue bound?"
            ) from exc
        except NackError as exc:
            raise PublishError(f"Broker rejected event {event.event_id}") from exc


class RabbitMQConnection:
    """Context manager owning a blocking connection and yielding a publisher."""

    def __init__(self, url: str, exchange: str) -> None:
        self._parameters = pika.URLParameters(url)
        self._exchange = exchange
        self._connection: pika.BlockingConnection | None = None

    def __enter__(self) -> EventPublisher:
        self._connection = pika.BlockingConnection(self._parameters)
        return EventPublisher(self._connection.channel(), self._exchange)

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        if self._connection is not None and self._connection.is_open:
            self._connection.close()
        self._connection = None
