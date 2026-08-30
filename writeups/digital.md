---
title: Digital Board — High-Speed Data Acquisition & Telemetry System
subtitle: Custom telemetry processing PCB featuring STM32H5, dual-band GNSS, and 100-BaseTX Ethernet
project: digital
badge: DAQ & High-Speed
badgeClass: badge-daq
schematic: assets/docs/digital-board-schematic.pdf
model3d: projects.html#project-card-1
topView: assets/PCB3d_Models/Digital_TopView.png
date: 2024 - 2025
tech:
  - Altium Designer
  - STM32H5 MCU (Arm Cortex-M33)
  - 100-BaseTX Ethernet (MDI/RMII)
  - Dual-Band L1/L5 GNSS
  - Discrete Termination
  - Controlled Impedance Routing
  - High-Speed Differential Pairs
---

The **Digital Board** is a custom high-performance Printed Circuit Board engineered for Mines Formula SAE's vehicle data acquisition and telemetry subsystem. It integrates an **Arm Cortex-M33 (STM32H5)** processor running at up to 250 MHz, precision **dual-band L1/L5 GNSS** positioning, and high-speed **100-BaseTX Ethernet** with discrete magnetic termination to aggregate sensor streams, compute vehicle dynamics metrics, and stream telemetry data reliably.

---

## 1. System Specifications & Features

| Subsystem | Specification | Hardware Implementation |
| :--- | :--- | :--- |
| **Microcontroller (MCU)** | STM32H563 (Arm Cortex-M33 @ 250MHz, TrustZone, FPU) | High-speed processing, hardware DSP instructions, DMA-backed peripherals |
| **Ethernet Physical Layer** | 100-BaseTX Fast Ethernet via RMII | Discrete transformer/magnetics with controlled $100\,\Omega$ differential routing |
| **GNSS Positioning** | Concurrent Dual-Band L1/L5 Reception | Sub-meter position accuracy, multi-path rejection for track telemetry |
| **Storage & Logging** | High-speed MicroSD (SDMMC interface, 4-bit bus) | FATFS logging of full vehicle state at up to 1 kHz sample rates |
| **CAN Bus Interface** | Isolated CAN FD Transceiver | Communicates with ECU, inverter, BMS, and wheel-speed nodes |
| **Power Architecture** | Wide-input buck regulation (6V–36V to 3.3V / 1.8V) | High efficiency switching regulator with LC EMI filter |

---

## 2. High-Speed Routing & Signal Integrity

### 2.1 100-BaseTX Ethernet MDI & RMII Design
- **RMII Interface:** $50\,\text{MHz}$ reference clock with tightly length-matched TXD[1:0], RXD[1:0], and control lines routed with $50\,\Omega$ single-ended characteristic impedance.
- **MDI Differential Pairs:** 100-BaseTX TX± and RX± pairs routed with continuous $100\,\Omega$ differential impedance reference over an unbroken internal ground plane.
- **Discrete Magnetics & ESD:** Pulse transformer with integrated common-mode chokes and low-capacitance TVS diode arrays placed directly adjacent to the RJ45 port to protect against chassis ESD strikes.

### 2.2 Dual-Band GNSS RF Frontend
- **L1/L5 Antenna Feedline:** $50\,\Omega$ coplanar waveguide with ground (CPWG) with stitching vias along the RF trace boundary to minimize return path discontinuities and suppress cross-coupling from high-speed digital clocks.
- **Active Antenna Bias-Tee:** Filtered low-noise DC phantom power injection circuitry supporting external high-gain active patch antennas.

---

## 3. Schematics & Layer Stackup

- **Layer Count:** 4-Layer controlled-impedance stackup (Signal - GND Plane - Power Plane - Signal).
- **Core Thickness:** FR4 standard high-Tg substrate with impedance calculations verified in Altium Layer Stack Manager.
- **Power Distribution Network (PDN):** Dedicated low-ESR ceramic decoupling arrays located at each MCU power pin group with low-inductance via placement.

---

## 4. Software & Firmware Integration

1. **FreeRTOS Real-Time Kernel:** Multi-threaded architecture dividing Ethernet socket communication, CAN bus processing, and SDMMC disk writes into deterministic priority tasks.
2. **Ring Buffer DMA:** Zero-copy DMA buffers handling incoming CAN FD packets and raw NMEA/UBX GNSS sentences.
3. **Telemetry Streaming:** Lightweight UDP packet telemetry broadcasting live wheel speeds, brake pressures, and suspension travel metrics to the trackside pit wall.
