---
title: BSPD Relay — Solid State Power Interfacing & Shutdown Module
subtitle: High-current bi-directional Solid State Relay (SSR) engineered for Formula SAE shutdown circuits
project: relay
badge: Power & SSR
badgeClass: badge-power
schematic: assets/docs/bspd-relay-schematic.pdf
model3d: projects.html#project-card-3
topView: assets/PCB3d_Models/Relay_Top.png
date: 2024 - 2025
tech:
  - Altium Designer
  - High Current (7A Continuous)
  - Bi-Directional Power MOSFETs
  - Solid State Relay (SSR)
  - Thermal Management & Copper Pour
  - Galvanic Isolation
  - Fast Overcurrent Protection
---

The **BSPD Relay** is a custom power electronics board designed to interface with the Brake System Plausibility Device (BSPD) to reliably interrupt the vehicle's Shutdown Circuit (SDC). Engineered to replace bulky electromechanical relays with a fast, vibration-proof **bi-directional MOSFET Solid State Relay (SSR)**, it handles up to **7A continuous current** with minimal voltage drop and rapid response time.

---

## 1. Electrical Specifications

| Parameter | Value | Details |
| :--- | :--- | :--- |
| **Continuous Current Rating** | 7.0 A | Supported continuously across operating temperature range |
| **Peak Inrush Current** | 20.0 A | Pulse handling for capacitive load charging |
| **On-State Resistance ($R_{DS(on)}$)** | < 12 m$\Omega$ | Ultra-low loss to eliminate excessive heat buildup |
| **Breakdown Voltage ($V_{DS}$)** | 60 V | High margin over 12V/24V nominal vehicle bus |
| **Turn-Off Latency** | < 15 $\mu$s | Fast interruption upon BSPD or SDC safety fault |
| **Galvanic Isolation** | 2.5 kV RMS | Optical / magnetic gate driver isolation between control and load |

---

## 2. Solid State Relay Architecture

Electromechanical relays on race cars suffer from contact bouncing, vibration wear, and sluggish opening times (>10 ms). The BSPD Relay uses back-to-back N-channel power MOSFETs with isolated gate drives:

### Key Design Highlights:
- **Back-to-Back Bi-Directional Topology:** Connects two power MOSFETs in common-source configuration with intrinsic body diodes in opposition, preventing reverse current conduction regardless of line polarity.
- **Isolated Gate Drive:** An isolated photovoltaic / charge-pump gate driver provides the required $V_{GS}$ gate-to-source bias voltage without requiring an external bootstrap power supply.
- **Active Gate Pull-Down:** Rapid discharge circuit ensures sub-$15\,\mu\text{s}$ turn-off when the BSPD de-energizes the enable signal.

---

## 3. PCB Layout & Thermal Dissipation

1. **High-Copper Pour Stackup:** Heavy 2 oz copper outer layers with broad polygonal pours and multiple thermal via matrices under the MOSFET drain tabs.
2. **Creepage and Clearance:** Strict adherence to high-voltage clearance spacing around the galvanic isolation barrier.
3. **Transient Suppression:** High-energy bidirectional TVS diode clamp across the power terminals to absorb inductive flyback spikes generated during emergency contactor coil disconnects.
