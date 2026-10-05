# Storage Tank Monitoring and Biochemical Deterioration Subsystem

## Overview
This module models the temporal, fluid, and biochemical deterioration dynamics of stored greywater within an intelligent greywater reclamation facility.

---

### Core Scientific Limitation & Disclaimer
> **"The current dataset does not contain longitudinal storage experiments. Therefore, this module provides a configurable mechanistic/operational deterioration estimate rather than an empirically validated prediction of exact greywater shelf life."**
>
> All kinetic degradation constants ($k_{ref}$), Arrhenius activation energies ($E_a$), and temperature coefficients ($\theta$) are unvalidated operational parameters. They must not be claimed as ground-truth biological laws without pilot-scale longitudinal assays.

---

## Architecture and Core Components

1. **`storage_manager.py`**:
   - `StorageTank`: Physical mass-balance accounting ($V_{t} = V_{t-1} + V_{in} - V_{out}$).
   - `StorageBatch`: Discrete inflow tracking supporting FIFO drain and volume-weighted composite age calculation.
   - Non-negative volume clamping and strict overflow prevention.

2. **`decay_model.py`**:
   - First-order kinetic model: $C(t) = C_0 \cdot \exp(-k(T) \cdot t)$.
   - Temperature dependence: Arrhenius $k(T) = k_{ref} \cdot \exp\left[-\frac{E_a}{R}\left(\frac{1}{T} - \frac{1}{T_{ref}}\right)\right]$ or Streeter-Phelps $\theta$.
   - Categorization:
     - `SUPPORTED_KINETIC_MODEL`: BOD, COD.
     - `RELATIVE_RISK_PROXY`: DO, Turbidity.
     - `NOT_MODELED`: $E. coli$ (`microbial_risk_status = "NOT_EMPIRICALLY_VALIDATED"`).

3. **`shelf_life.py`**:
   - Composite Multi-Factor Deterioration Index $[0.0, 1.0]$.
   - Operational Stagnation Detection (`NORMAL`, `LOW_TURNOVER`, `STAGNANT`, `HIGH_STAGNATION_RISK`).
   - Operational Shelf-Life Categorization (`FRESH`, `MONITOR`, `AGING`, `HIGH_RISK_REVIEW`).
   - Exact shelf life: `estimated_remaining_time_hours = null` (not experimentally validated).
