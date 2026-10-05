"""
Storage Tank State Management and Mass-Balance Accounting
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Implements physical storage tank accounting, batch-aware FIFO volume tracking,
non-negative fluid volume constraints, overflow prevention, and continuous storage
age calculation.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import uuid

from storage.config import (
    DEFAULT_TANK_ID,
    DEFAULT_TANK_CAPACITY_L,
    DEFAULT_INITIAL_LEVEL_L,
    MIN_TANK_LEVEL_L,
    DEFAULT_TRACKING_MODE,
    TEMP_SOURCE_SIMULATION_DEFAULT,
    TEMP_SOURCE_DIGITAL_TWIN,
    DEFAULT_REFERENCE_TEMP_C
)


def parse_timestamp(ts) -> datetime:
    """Safely parse string or datetime to timezone-aware UTC datetime."""
    if isinstance(ts, datetime):
        if ts.tzinfo is None:
            return ts.replace(tzinfo=timezone.utc)
        return ts
    elif isinstance(ts, str):
        # Support multiple standard formats
        for fmt in ("%Y-%m-%d %H:%M:%S UTC", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ"):
            try:
                dt = datetime.strptime(ts.strip(), fmt)
                return dt.replace(tzinfo=timezone.utc)
            except ValueError:
                continue
        # Fallback to ISO format
        return datetime.fromisoformat(ts).replace(tzinfo=timezone.utc)
    raise TypeError(f"Unsupported timestamp format: {type(ts)}")


@dataclass
class StorageBatch:
    """Represents a discrete inflow fluid batch in the tank."""
    batch_id: str
    volume_liters: float
    inflow_timestamp: datetime
    source: str
    quality_data: Dict[str, Any] = field(default_factory=dict)

    def age_hours(self, current_time: datetime) -> float:
        """Calculate age of this specific batch in decimal hours."""
        delta = current_time - self.inflow_timestamp
        return max(0.0, delta.total_seconds() / 3600.0)


class StorageTank:
    """
    Physical greywater storage tank managing volume conservation, batch tracking,
    age calculation, and sensor temperature integration.
    """
    def __init__(
        self,
        tank_id: str = DEFAULT_TANK_ID,
        capacity_liters: float = DEFAULT_TANK_CAPACITY_L,
        initial_level_liters: float = DEFAULT_INITIAL_LEVEL_L,
        initial_timestamp: Optional[Any] = None,
        initial_temperature_C: float = DEFAULT_REFERENCE_TEMP_C,
        temperature_source: str = TEMP_SOURCE_SIMULATION_DEFAULT,
        source: str = "Mixed",
        initial_quality_features: Optional[Dict[str, Any]] = None
    ):
        if capacity_liters <= 0:
            raise ValueError(f"Tank capacity must be strictly positive, got {capacity_liters}")
        if initial_level_liters < 0:
            raise ValueError(f"Initial tank level cannot be negative, got {initial_level_liters}")
        if initial_level_liters > capacity_liters:
            raise ValueError(f"Initial tank level ({initial_level_liters}) exceeds capacity ({capacity_liters})")

        self.tank_id = tank_id
        self.capacity_liters = float(capacity_liters)
        self.current_level_liters = float(initial_level_liters)
        
        parsed_init_time = parse_timestamp(initial_timestamp) if initial_timestamp else datetime.now(timezone.utc)
        self.fill_start_timestamp = parsed_init_time if self.current_level_liters > 0 else None
        self.last_inflow_timestamp = self.fill_start_timestamp
        self.last_outflow_timestamp = None
        
        self.storage_temperature_C = float(initial_temperature_C)
        self.temperature_source = temperature_source
        self.source = source
        
        self.initial_quality_features = dict(initial_quality_features) if initial_quality_features else {}
        self.current_quality_features = dict(self.initial_quality_features)
        self.status = "OPERATIONAL"
        
        # Batch Tracking
        self.batches: List[StorageBatch] = []
        if self.current_level_liters > 0:
            init_batch = StorageBatch(
                batch_id=f"INIT_{uuid.uuid4().hex[:6]}",
                volume_liters=self.current_level_liters,
                inflow_timestamp=parsed_init_time,
                source=self.source,
                quality_data=dict(self.initial_quality_features)
            )
            self.batches.append(init_batch)
            
        self.validate_state()

    def get_level(self) -> float:
        """Return current fluid level in liters."""
        return round(self.current_level_liters, 3)

    def get_fill_percentage(self) -> float:
        """Return tank fill percentage in [0, 100]."""
        return round((self.current_level_liters / self.capacity_liters) * 100.0, 2)

    def get_available_capacity(self) -> float:
        """Return remaining empty capacity in liters."""
        return round(max(0.0, self.capacity_liters - self.current_level_liters), 3)

    def get_storage_age_hours(self, current_timestamp: Any, mode: str = DEFAULT_TRACKING_MODE) -> float:
        """
        Calculate storage age of fluid in the tank in decimal hours.
        
        Parameters
        ----------
        current_timestamp : str or datetime
            The current reference observation timestamp.
        mode : str
            "batch_fifo" (volume-weighted batch average) or "oldest" (time since first retained drop).
            
        Returns
        -------
        float
            Storage age in decimal hours. Returns 0.0 if tank is empty.
        """
        if self.current_level_liters <= 0 or not self.batches:
            return 0.0

        current_dt = parse_timestamp(current_timestamp)

        if mode == "oldest":
            oldest_time = min(b.inflow_timestamp for b in self.batches)
            return max(0.0, (current_dt - oldest_time).total_seconds() / 3600.0)

        # Weighted-Average Batch Age (Default & most physically representative for mixed tanks)
        total_vol = sum(b.volume_liters for b in self.batches)
        if total_vol <= 0:
            return 0.0
            
        weighted_age_sum = sum(b.volume_liters * b.age_hours(current_dt) for b in self.batches)
        return round(weighted_age_sum / total_vol, 3)

    def add_inflow(
        self,
        volume: float,
        timestamp: Any,
        source: Optional[str] = None,
        quality_data: Optional[Dict[str, Any]] = None,
        temperature_C: Optional[float] = None,
        temperature_source: Optional[str] = None
    ) -> float:
        """
        Add incoming greywater fluid volume to the storage tank with mass-balance accounting.
        
        Raises
        ------
        ValueError if volume is non-positive or exceeds remaining capacity (overflow prevention).
        """
        if volume <= 0:
            raise ValueError(f"Inflow volume must be strictly positive (> 0), got {volume} L")

        avail = self.get_available_capacity()
        if volume > avail + 1e-6:
            raise ValueError(
                f"Overflow prevention: Inflow volume ({volume:.2f} L) exceeds available tank capacity ({avail:.2f} L)."
            )

        ts = parse_timestamp(timestamp)
        inflow_source = source if source else self.source
        quality = dict(quality_data) if quality_data else dict(self.current_quality_features)

        # Create new discrete batch
        batch = StorageBatch(
            batch_id=f"B_{uuid.uuid4().hex[:6]}",
            volume_liters=float(volume),
            inflow_timestamp=ts,
            source=inflow_source,
            quality_data=quality
        )
        self.batches.append(batch)

        # Update mass balance
        self.current_level_liters += float(volume)
        self.last_inflow_timestamp = ts
        if self.fill_start_timestamp is None:
            self.fill_start_timestamp = ts

        # Update dominant source & quality blending
        self.source = inflow_source
        if quality:
            self.current_quality_features.update(quality)

        # Update temperature if provided
        if temperature_C is not None:
            self.storage_temperature_C = float(temperature_C)
            if temperature_source:
                self.temperature_source = temperature_source

        self.validate_state()
        return self.get_level()

    def remove_outflow(self, volume: float, timestamp: Any) -> float:
        """
        Withdraw fluid volume from the tank using First-In, First-Out (FIFO) batch withdrawal.
        
        Raises
        ------
        ValueError if volume is non-positive or exceeds current tank level (underflow prevention).
        """
        if volume <= 0:
            raise ValueError(f"Outflow volume must be strictly positive (> 0), got {volume} L")

        if volume > self.current_level_liters + 1e-6:
            raise ValueError(
                f"Underflow prevention: Outflow volume ({volume:.2f} L) exceeds current tank volume ({self.current_level_liters:.2f} L)."
            )

        ts = parse_timestamp(timestamp)
        remaining_to_drain = float(volume)

        # FIFO withdrawal from oldest batches
        while self.batches and remaining_to_drain > 1e-6:
            oldest_batch = self.batches[0]
            if oldest_batch.volume_liters <= remaining_to_drain:
                remaining_to_drain -= oldest_batch.volume_liters
                self.batches.pop(0)
            else:
                oldest_batch.volume_liters -= remaining_to_drain
                remaining_to_drain = 0.0

        self.current_level_liters = max(0.0, self.current_level_liters - float(volume))
        self.last_outflow_timestamp = ts

        # Reset fill start timestamp if completely emptied
        if self.current_level_liters <= 1e-6:
            self.current_level_liters = 0.0
            self.fill_start_timestamp = None
            self.batches.clear()

        self.validate_state()
        return self.get_level()

    def update_temperature(self, temperature_C: float, source: str = TEMP_SOURCE_DIGITAL_TWIN):
        """Update measured or inferred tank temperature."""
        if not isinstance(temperature_C, (int, float)):
            raise TypeError("Temperature must be numeric.")
        self.storage_temperature_C = float(temperature_C)
        self.temperature_source = source

    def validate_state(self) -> bool:
        """Enforce physical volume bounds and mass balance integrity."""
        if self.current_level_liters < MIN_TANK_LEVEL_L - 1e-6:
            raise ValueError(f"Negative tank level detected: {self.current_level_liters} L")
        if self.current_level_liters > self.capacity_liters + 1e-6:
            raise ValueError(f"Tank overflow detected: {self.current_level_liters} L > {self.capacity_liters} L")

        batch_sum = sum(b.volume_liters for b in self.batches)
        if abs(batch_sum - self.current_level_liters) > 0.01:
            raise ValueError(f"Batch sum ({batch_sum:.2f} L) diverges from tank level ({self.current_level_liters:.2f} L)")
        return True

    def get_state(self, current_timestamp: Optional[Any] = None) -> Dict[str, Any]:
        """Return comprehensive snapshot of the storage tank state."""
        ref_time = parse_timestamp(current_timestamp) if current_timestamp else datetime.now(timezone.utc)
        age_h = self.get_storage_age_hours(ref_time)
        oldest_age_h = self.get_storage_age_hours(ref_time, mode="oldest")

        return {
            "tank_id": self.tank_id,
            "capacity_liters": self.capacity_liters,
            "current_level_liters": self.get_level(),
            "available_capacity_liters": self.get_available_capacity(),
            "fill_percentage": self.get_fill_percentage(),
            "storage_age_hours": age_h,
            "oldest_batch_age_hours": oldest_age_h,
            "fill_start_timestamp": str(self.fill_start_timestamp) if self.fill_start_timestamp else None,
            "last_inflow_timestamp": str(self.last_inflow_timestamp) if self.last_inflow_timestamp else None,
            "last_outflow_timestamp": str(self.last_outflow_timestamp) if self.last_outflow_timestamp else None,
            "storage_temperature_C": self.storage_temperature_C,
            "temperature_source": self.temperature_source,
            "source": self.source,
            "batch_count": len(self.batches),
            "status": self.status,
            "initial_quality_features": self.initial_quality_features,
            "current_quality_features": self.current_quality_features
        }
