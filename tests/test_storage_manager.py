"""
Unit Tests for Storage Tank State and Mass-Balance Accounting
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Test Coverage:
1. StorageTank initialization (valid bounds, state defaults)
2. Valid inflow (level increase, batch addition)
3. Valid outflow (FIFO drainage, level decrease)
4. Invalid negative volume rejection
5. Overflow prevention
6. Underflow prevention
7. Fill percentage and available capacity calculation
8. Storage age tracking (weighted average, oldest batch, empty reset)
"""

from datetime import datetime, timezone, timedelta
import pytest

from storage.storage_manager import StorageTank, StorageBatch


def test_01_tank_initialization():
    """Verify that a storage tank initializes correctly with valid attributes."""
    tank = StorageTank(
        tank_id="TEST_TANK_01",
        capacity_liters=1000.0,
        initial_level_liters=250.0,
        initial_temperature_C=22.0
    )
    assert tank.tank_id == "TEST_TANK_01"
    assert tank.get_level() == 250.0
    assert tank.get_fill_percentage() == 25.0
    assert tank.get_available_capacity() == 750.0
    assert tank.storage_temperature_C == 22.0
    assert tank.validate_state() is True

    # Invalid initialization
    with pytest.raises(ValueError, match="strictly positive"):
        StorageTank(capacity_liters=-500.0)

    with pytest.raises(ValueError, match="cannot be negative"):
        StorageTank(capacity_liters=1000.0, initial_level_liters=-10.0)

    with pytest.raises(ValueError, match="exceeds capacity"):
        StorageTank(capacity_liters=1000.0, initial_level_liters=1200.0)


def test_02_valid_inflow():
    """Verify that inflow increases tank level and adds a tracked batch."""
    tank = StorageTank(capacity_liters=1000.0, initial_level_liters=200.0)
    now_str = "2026-10-02 08:00:00 UTC"
    
    new_level = tank.add_inflow(
        volume=150.0,
        timestamp=now_str,
        source="Bathroom",
        quality_data={"BOD_mg_L": 65.0, "TUR_NTU": 15.0}
    )
    assert new_level == 350.0
    assert tank.get_level() == 350.0
    assert tank.get_fill_percentage() == 35.0
    assert len(tank.batches) == 2
    assert tank.batches[-1].source == "Bathroom"


def test_03_valid_outflow_fifo():
    """Verify that outflow reduces tank volume via FIFO drainage."""
    t0 = datetime(2026, 10, 2, 8, 0, 0, tzinfo=timezone.utc)
    tank = StorageTank(capacity_liters=1000.0, initial_level_liters=200.0, initial_timestamp=t0)
    
    # Add second batch of 100L at t = +1hr
    t1 = t0 + timedelta(hours=1)
    tank.add_inflow(volume=100.0, timestamp=t1, source="Kitchen")
    assert tank.get_level() == 300.0
    assert len(tank.batches) == 2

    # Withdraw 250L at t = +2hr
    t2 = t0 + timedelta(hours=2)
    new_level = tank.remove_outflow(volume=250.0, timestamp=t2)
    assert new_level == 50.0
    assert tank.get_level() == 50.0
    # First batch (200L) should be completely drained; remaining 50L belongs to second batch
    assert len(tank.batches) == 1
    assert tank.batches[0].volume_liters == 50.0
    assert tank.batches[0].source == "Kitchen"


def test_04_invalid_negative_volume():
    """Verify that negative or zero inflow/outflow is strictly rejected."""
    tank = StorageTank(capacity_liters=1000.0, initial_level_liters=200.0)
    now_str = "2026-10-02 08:00:00 UTC"

    with pytest.raises(ValueError, match="strictly positive"):
        tank.add_inflow(volume=-50.0, timestamp=now_str)

    with pytest.raises(ValueError, match="strictly positive"):
        tank.add_inflow(volume=0.0, timestamp=now_str)

    with pytest.raises(ValueError, match="strictly positive"):
        tank.remove_outflow(volume=-20.0, timestamp=now_str)

    with pytest.raises(ValueError, match="strictly positive"):
        tank.remove_outflow(volume=0.0, timestamp=now_str)


def test_05_overflow_prevention():
    """Verify that inflow exceeding available capacity is prevented with clear error."""
    tank = StorageTank(capacity_liters=500.0, initial_level_liters=400.0)
    now_str = "2026-10-02 08:00:00 UTC"

    # Available capacity is 100L. Trying to add 101L should raise ValueError.
    with pytest.raises(ValueError, match="Overflow prevention"):
        tank.add_inflow(volume=101.0, timestamp=now_str)

    # Tank level should remain untouched
    assert tank.get_level() == 400.0


def test_06_underflow_prevention():
    """Verify that outflow exceeding current fluid volume is prevented."""
    tank = StorageTank(capacity_liters=500.0, initial_level_liters=150.0)
    now_str = "2026-10-02 08:00:00 UTC"

    with pytest.raises(ValueError, match="Underflow prevention"):
        tank.remove_outflow(volume=151.0, timestamp=now_str)

    # Tank level should remain untouched
    assert tank.get_level() == 150.0


def test_07_fill_percentage():
    """Verify exact calculation of fill percentage and empty/full states."""
    tank = StorageTank(capacity_liters=800.0, initial_level_liters=0.0)
    assert tank.get_fill_percentage() == 0.0
    assert tank.get_available_capacity() == 800.0

    tank.add_inflow(volume=400.0, timestamp="2026-10-02 08:00:00 UTC")
    assert tank.get_fill_percentage() == 50.0

    tank.add_inflow(volume=400.0, timestamp="2026-10-02 08:30:00 UTC")
    assert tank.get_fill_percentage() == 100.0
    assert tank.get_available_capacity() == 0.0


def test_08_storage_age():
    """Verify storage age tracking across batches and after complete drainage."""
    t0 = datetime(2026, 10, 2, 8, 0, 0, tzinfo=timezone.utc)
    tank = StorageTank(capacity_liters=1000.0, initial_level_liters=100.0, initial_timestamp=t0)

    # At t = 2 hours, batch 1 is 2 hours old
    t_eval = t0 + timedelta(hours=2)
    assert round(tank.get_storage_age_hours(t_eval), 1) == 2.0

    # Add 100L fresh batch at t = 2 hours
    tank.add_inflow(volume=100.0, timestamp=t_eval)

    # At t = 4 hours:
    # Batch 1 (100L) is 4 hours old.
    # Batch 2 (100L) is 2 hours old.
    # Weighted average age = (100*4 + 100*2) / 200 = 3.0 hours.
    t_eval2 = t0 + timedelta(hours=4)
    avg_age = tank.get_storage_age_hours(t_eval2, mode="batch_fifo")
    assert round(avg_age, 2) == 3.0
    
    # Oldest age mode
    oldest_age = tank.get_storage_age_hours(t_eval2, mode="oldest")
    assert round(oldest_age, 2) == 4.0

    # Completely drain tank
    tank.remove_outflow(volume=200.0, timestamp=t_eval2)
    assert tank.get_level() == 0.0
    # Empty tank age should reset to 0.0
    assert tank.get_storage_age_hours(t_eval2) == 0.0
