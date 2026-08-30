---
title: Formula SAE Brake System Plausibility Device (BSPD v3.0)
subtitle: Custom safety circuit engineered to comply with FSAE rules
project: bspd
badge: Safety Circuit
badgeClass: badge-safety
schematic: assets/docs/bspd-schematic.pdf
model3d: projects.html#project-card-2
topView: assets/PCB3d_Models/BSPD_TopView.png
date: 2024 - 2025
tech:
  - Altium Designer
  - Analog Design
  - Discrete Digital Logic
  - LTSpice Simulation
  - FSAE Rules Compliant
  - Latching Shutdown
---

A custom, safety circuit engineered to comply with both IC and EV BSPD Formula SAE rules. The circuit monitors throttle position (or current in EV configuration) and brake pedal position sensors, causing shutdown when simultaneous hard braking and high throttle/power demand is detected, or upon a sensor Loss of Signal (LOS) fault.

---

## 1. System Requirements & Verification Matrix

| Requirement ID | Requirement | Justification | Validation Plan |
| :--- | :--- | :--- | :--- |
| **REQ-ICBSPD-001** | BSPD shall be non-programmable. | Compliance with FSAE Rule IC.4.8.2. | Review the Bill of Materials (BOM) and Altium Schematics to verify that all integrated circuits are pure analog/discrete logic. |
| **REQ-ICBSPD-002** | BSPD shall latch within 1s when both of the following conditions are met simultaneously:<br>1. Brake pressure > the defined "Hard Braking" threshold (see REQ-ICBSPD-003).<br>2. Throttle > 10% TPS signal. | Compliance with FSAE Rule IC.4.8.4.a | Use an oscilloscope to measure the delay between threshold crossing and SDC relay opening. |
| **REQ-ICBSPD-003** | BSPD should incorporate a tuning mechanism to calibrate the "Demand for Hard Braking" threshold between 20% and 80% of the Brake System Encoder (BSE) output. | To allow for adjustments based on driver driving style or preferences without violating the non-programmable constraint of Rule IC.4.8.2. | Power BSPD with a stabilized LV supply, then use a multimeter to measure the Reference Node of BSE. Adjust the mechanism from minimum to maximum setting. |
| **REQ-ICBSPD-004** | BSPD should incorporate a calibration mechanism capable of adjusting the TPS Threshold by at least ±20% of its nominal 10% calculated setpoint. | To provide means of nulling the DC current sensor's idle offset voltage. This ensures the system triggers at the true 10% throttle position. | Power BSPD with a stabilized LV supply, then use a multimeter to measure the Reference Node of TPS. Adjust the mechanism from minimum to maximum setting. |
| **REQ-ICBSPD-005** | BSPD shall latch within 100ms if an Open Circuit or Short Circuit fault is detected on BSE or TPS. | Compliance with FSAE Rule IC.4.8.4.b & IC.4.8.4.c | Disconnect sensor leads during operation and verify SDC opens within the 100ms window on a scope. |
| **REQ-ICBSPD-006** | BSPD shall monitor raw sensor signals from TPS and BSE directly. | Compliance with FSAE Rule IC.4.8.3 | Verify wiring harness schematic shows direct taps from sensors to BSPD input pins without passing through the ECU. |
| **REQ-ICBSPD-007** | BSPD shall latch the fault state such that the SDC remains open until the primary master switch is cycled. | Compliance with FSAE Rule IC.4.8.6 | Trigger a fault, then return sensors to normal range. Verify SDC stays open until the main power is cut. |
| **REQ-ICBSPD-008** | BSPD shall maintain a fault state even if Cockpit Master Switch is cycled OFF and ON. | Compliance with FSAE Rule IC.4.8.7 | Trigger a fault, toggle the cockpit switch, and verify the BSPD remains latched in the fault state. |
| **REQ-ICBSPD-009** | BSPD shall open the SDC immediately upon removal of power to the BSPD circuit. | Compliance with FSAE Rule IC.4.8.8 | Pull the BSPD power fuse/connector and verify the SDC opens. |
| **REQ-ICBSPD-010** | BSPD shall provide a method (connectors or breakout box) to allow inspectors to disconnect signals individually. | Compliance with FSAE Rule IC.4.8.9 | Demonstrate the use of the breakout box or detachable connectors during a mock Tech Inspection. |
| **REQ-ICBSPD-011** | BSPD should include status LEDs for power, fault, latched fault. | Facilitates rapid debugging during trackside failures or tech inspection. | Visual confirmation during bench testing. |
| **REQ-ICBSPD-012** | BSPD should provide a discrete signal to indicate the status of the fault latch to an external monitoring system. | Necessary to distinguish a BSPD trip from other engine management or fuel system failures. | Trigger a BSPD fault and verify that the external system records a state transition. |
| **REQ-ICBSPD-013** | The status signal interface shall be electrically buffered or isolated to prevent an external failure (e.g., a shorted DAQ input) from compromising the BSPD’s safety function. | Rule IC.4.8.2: Hardware independence is required to ensure the safety circuit remains a "standalone" device. | Demonstrate that a short-to-ground or short-to-VCC on the status output line does not prevent the BSPD from opening the SDC. |

---

## 2. Architectural Overview & Signal Flow

The BSPD safety circuit topology operates entirely in the analog domain with hardware discrete logic to fulfill all rules regarding non-programmability.

![BSPD v3.0 Topology Block Diagram](images/BSPD_Block_Diagram.png)

### Signal Path Summary:
1. **Sensor Conditioning & Window Comparators:** Raw Throttle Position Sensor (TPS) and Brake System Encoder (BSE) signals pass through high-impedance buffer amplifiers and precision window comparators to detect out-of-range Loss of Signal (LOS < 0.5V or > 4.5V).
2. **Plausibility Detection:** A dedicated comparator network monitors simultaneous occurrence of brake pressure exceeding the calibrated threshold and throttle opening > 10%.
3. **Deterministic Digital Timing Engine:** When either a plausibility violation or LOS event occurs, a binary counter starts incrementing synchronously with a calibrated silicon oscillator reference clock.
4. **Fault Latch & SDC De-energize:** If the counter reaches its terminal threshold (100ms for LOS, 500ms/1000ms for plausibility), a latch circuit triggers, cutting gate drive to the Shutdown Circuit (SDC) relay.

---

## 3. Engineering Design Decisions & Trade Studies

### 3.1 Timing: Deterministic Digital Counter vs. RC Timer

Other teams often use analog RC charging circuits with threshold comparators. BSPD v3.0 replaces RC timers with **binary counters driven by a silicon clock reference**.

| Evaluation Metric | Conventional Analog RC Timing | BSPD v3.0 Digital Counter Engine |
| :--- | :--- | :--- |
| **Timing Accuracy** | Poor (Heavily dependent on passive tolerances $C/R$ variation and thermal drift) | **High** (Governed directly by reference clock frequency stability sub-1%) |
| **Reset Dynamics** | Slow exponential decay ($5\tau$). Rapid intermittent pedal taps cause charge accumulation and premature false trips. | **Instantaneous** (Asynchronous clear resets counter to zero in nanoseconds when fault drops, with zero memory). |
| **BOM Cost & Complexity** | Very Low: Standard discrete passive components. | Moderate: Cost increase for dedicated logic ICs and oscillator. |
| **Track Reliability** | Vulnerable to temperature extremes and false triggering during aggressive trail-braking. | **Immune to thermal drift and charge pump false trips.** |

### 3.2 Clock Generation & Distribution Network

Generating timing for both the 100 ms LOS channel and the 500 ms / 1.0 s Plausibility channels required evaluating multiple clock topologies:

| Approach | BOM & Assembly Cost | Footprint | Thermal & Frequency Stability | Tradeoff Decision |
| :--- | :--- | :--- | :--- | :--- |
| **555 Timer RC Network** | Low IC cost; expensive precision C0G caps needed | Large | Poor (Significant drift over operating temperature range) | Rejected due to thermal drift risks |
| **Dual Silicon Oscillators (LTC6900 x 2)** | High (>$12.00 incremental BOM) | Compact | Excellent | Rejected due to unnecessary BOM cost |
| **Single LTC6900 + Logic Divider** | **Optimal BOM Balance** | **Moderate (2 ICs required)** | **Excellent (Sub-1% accuracy across -40°C to +85°C)** | **Selected Architecture** |

---

## 4. Hardware Layout & Thermal Management

- **Layer Stackup:** 2-Layer FR4 with unbroken ground plane on bottom layer for high EMI immunity in high-noise engine and inverter environments.
- **Connectors:** Automotive-grade TE Connectivity latching header to resist track vibrations up to 20G.
- **Diagnostic Testpoints:** Individual gold-plated test pads located at every comparator output and reference node for rapid bench verification and inspection.
