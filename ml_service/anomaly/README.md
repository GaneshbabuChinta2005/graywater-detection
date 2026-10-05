# Anomaly Detection Module

## Overview
This module will provide unsupervised anomaly detection mechanisms to identify outliers, sensor telemetry failures, and chemical spikes before water reaches treatment or routing stages.

## Planned Capabilities (Future Phases)
1. **Isolation Forest Pipeline**:
   - Trains an unsupervised Isolation Forest model on nominal greywater physicochemical parameter ranges.
   - Computes anomaly scores for streaming telemetry samples.

2. **Fault Identification & Safety Failsafe**:
   - Flags sudden non-physical sensor drift (e.g., negative readings, stuck values, extreme turbidity spikes).
   - Detects dangerous chemical discharges (e.g., concentrated bleach, industrial solvents, petroleum products).
   - Triggers an immediate fail-safe diversion to `Sewer Bypass` to safeguard downstream bio-filters and indoor plumbing.
