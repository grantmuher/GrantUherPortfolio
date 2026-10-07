---
title: BSPD Relay — Solid State Power Interfacing & Shutdown Module
subtitle: High-current bi-directional Solid State Relay (SSR) engineered for Formula SAE shutdown circuits
project: relay
badge: Power & SSR
badgeClass: badge-power
schematic: assets/docs/bspd-relay-schematic.pdf
model3d: projects.html#project-card-3
topView: assets/PCB3d_Models/Relay_Top.png
date: July 2026 - Present
tech:
  - Altium Designer
  - High Current (7A Continuous)
  - Bi-Directional Power MOSFETs
  - Solid State Relay (SSR)
  - Thermal Management & Copper Pour
  - Galvanic Isolation
  - Fast Overcurrent Protection
---

## Summary 

During the 2025–2026 Formula SAE competition season (MF13), the team's Electronic Throttle Control (ETC) compliance form was denied because the Brake System Plausibility Device (BSPD) fault shutdown was routed through the Power Distribution Module (PDM), which judges classified as a prohibited software-controlled shutdown. The initial hardware workaround—interrupting the BOTS relay—subsequently tripped the master relay. This severed power to the Engine Control Unit (ECU), resulting in a complete loss of vehicle telemetry and data logging during safety events.

FSAE rules only mandate the direct shutdown of the fuel pump(s), ignition, and electronic throttle. To solve the telemetry loss, this Solid State Relay (SSR) board was engineered to interface directly with the BSPD. It selectively cuts power to these three subsystems during a fault state while preserving continuous power to the ECU and data acquisition systems.

## System Requirements

| Name | Item ID | Requirement Type | Obligation Level | Justification | Validation Plan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BSPD Relay shall provide a method to disconnect power to Fuel Pump(s), Ignition, and Electronic Throttle. | ELEC-272 | Functional | Shall | Compliance with FSAE rule IC.9.2.2. | Simulate a shutdown and verify using a DMM that no power can be supplied to the Fuel Pump, Ignition, and Electronic Throttle. |
| BSPD Relay shall switch on the High Side for the respective items. | ELEC-273 | Functional | Shall | ECU controls on the low side for the respective items, preventing any possible interference. | Confirm through harness connection that BSPD Relay is before the respective items (Fuel Pumps, Ignition, Electronic Throttle). |
| BSPD Relay shall interface with a High-Z shutdown. | ELEC-274 | Functional | Shall | All safety-critical faults are High-Z to detect an open circuit in the event of a severed wire. | Verify through fault LED or DMM that a lack of connection on the fault signal results in a Faulted State. |
| BSPD Relay shall be nominally open. | ELEC-275 | Functional | Shall | Prevents a situation where an unpowered BSPD relay results in improper fault handling. | Verify using a DMM that no power is delivered when the BSPD Relay is unpowered. |
| BSPD Relay should provide LED indication for Faulted State and Powered States. | ELEC-276 | Interface | Should | LED indication accelerates physical validation and board bring-up. | Visual inspection of power and fault indicators. |
| BSPD Relay shall handle at least 6A continuous current on Fuel Pump traces. | ELEC-277 | Functional | Shall | Grafana telemetry indicates this is the nominal continuous load during an endurance event. | Power the current lines with 6A for at least 30 seconds. Verify that traces continue to conduct without thermal failure using a DMM. |
| BSPD Relay shall have a current rating up to 1A for the remaining items. | ELEC-278 | Functional | Shall | Grafana telemetry indicates this is the nominal current seen during endurance runs. | Power the current lines with 1A for at least 30 seconds. Verify stable conduction at 1A. |
| BSPD Relay shall provide bi-directional switching on throttle motor lines. | ELEC-279 | Functional | Shall | The throttle motor is driven by an H-Bridge controller; bi-directional switching guarantees expected motor functionality. | Provide forward and reverse current. Verify conduction in both directions using a DMM, and verify isolation when in a faulted state. |
| BSPD Relay should minimize capacitance and inductance on all switches. | ELEC-280 | Performance | Should | Guarantees the ECU's internal simulation matches physical hardware. Prevents slow switching that degrades vehicle drivability. | |
| BSPD Relay shall handle an input voltage range of 10V–16V. | ELEC-281 | Functional | Shall | The vehicle battery supply ranges from 10V to 16V. | Provide power at 10V and 16V. Verify the BPSD Relay remains fully functional. |

## Implementation

### Bi-Directional MOSFET Switch Architecture
To securely interrupt the H-Bridge driven electronic throttle, the design utilizes a bi-directional MOSFET switch operating with a virtual ground. A photovoltaic driver is used to supply a gate-to-source threshold voltage referenced above this virtual ground node, which acts as the unified source for the MOSFETs. This topology isolates the control signal and requires designing around a floating reference rather than a standard ground. 

### PCB Return Path & Loop Area Optimization
Trace routing was heavily dictated by REQ-ELEC-280 to minimize parasitic inductance and capacitance across the switching elements. 

![fuel-high.png](images/fuel-high.png)
![fuel-low.png](images/fuel-low.png)

As shown in the layout above, there is no ground (GND) copper pour routed directly beneath the high-current switch lines. While omitting a reference plane beneath a trace is typically a severe design flaw, the return path in this specific subsystem is *not* ground. The return current flows explicitly through the load switch via the "Fuel Pump Out" line. To maintain the tightest possible current loop and minimize trace inductance, the return line is routed directly beneath the input line on the adjacent internal layer. This deliberate Z-axis stacking tightly couples the forward and return paths without relying on a traditional continuous ground plane. 

## Testing & Validation
Validation ongoing