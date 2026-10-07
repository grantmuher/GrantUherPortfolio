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
# Purpose 
In 2025/2026 competition year (MF13), electronic throttle control (ETC) form was denied due to performing a BSPD Fault shutdown through PDM, as it was deemed to be a software controlled shutdown. We fixed by interuptting the BOTS relay, but that caused the master relay to switch off, interuppting power to ECU, so we lost data logging.

Rules only mandates that we shutdown Fuel Pump(s), Ignition, and Electronic Throttle. This board is designed to interface with BSPD and shutdown these signals so we do not lose datalogging in the event of a BSPD fault. 

# Requirements

| Name | Item ID | Requirement Type | Obligation Level | Justification | Validation Plan |
|:---|:---|:---|:---|:---|:---|
| BSPD Relay shall provide a method to disconnect power to Fuel Pump(s), Ignition, and Electronic Throttle. | ELEC-272 | Functional | Shall | Compliance with FSAE rule IC.9.2.2 | Simulate a shutdown and verify using a DMM that no power can be supplied to the Fuel Pump, Ignition, and Electronic Throttle. |
| BSPD Relay shall switch on the High Side for the respective items. | ELEC-273 | Functional | Shall | ECU controls on the low side for the respective items so this prevents any possible interference. | Confirm through harness connection that BSPD Relay is before the respective items (Fuel Pumps, Ingnition, Electronic Throttle). |
| BSPD Relay shall interface with a High-Z shutdown. | ELEC-274 | Functional | Shall | All safety critical faults are High-Z to detect a open circuit in case of a cut wire. | Verify through fault LED or DMM that a no connection on the fault signal results in a Faulted State. |
| BSPD Relay shall be nominally open | ELEC-275 | Functional | Shall | This prevents a situation where BSPD relay is not powered from resulting in improper fault handling. | Verifying using a DMM that no power is delivered when BSPD Relay is not powered. |
| BSPD Relay should provide LED indication for Faulted State, and Powered States. | ELEC-276 | Interface | Should | LED Indication is helpful for validation and bring up for the board. | Visual Inspection on power and fault. |
| BSPD Relay shall handle at least 6A continuous current on Fuel Pump traces. | ELEC-277 | Functional | Shall | Grafana Data indicates that this is the nominal continuous loads during a endurance run. | Power the current lines with 6A for at least 30 seconds. Verify that traces will still conduct current using a DMM. |
| BSPD Relay shall have current rating up to 1A for the rest of the items. | ELEC-278 | Functional | Shall | Grafana Data indicates that this is the nominal current seen during endurance runs. | Power the current lines with 1A for at least 30 seconds. Verify that traces will still conduct at 1A. |
| BSPD Relay shall provide bi-directional switching on throttle motor lines. | ELEC-279 | Functional | Shall | The throttle motor is driven by a H-Bridge controller. This guarantees that the throttle motor will function as expected. | Provide forward and reverse current. Verify that it conducts in both directions using a DMM. Verify it does not supply current when BSPD Relay is in a faulted state using a DMM. |
| BSPD Relay should minimize capacitance and inductance on all of switches. | ELEC-280 | Performance | Should | This guarantees that ECU's internal simulation matches what is actually happening. Prevents slower switching and costing car drivability or performance. | |
| BSPD Relay shall handle an input voltage in the range of 10V-16V | ELEC-281 | Functional | Shall | The battery supply can range from 10V-16V | Provide power at 10V and at 16V. Verify that BPSD Relay is still functional. |


# Overview of Board

## Bi-Directional MOSFET Switch
I want to highlight the Bi-Dirctional MOSFET switch as it uses a virtual ground. The design uses a photovoltaic driver to provide a $V_{gs}(th)$ above the virtual ground node which is the sources for the MOSFETs. Designing this circuit, increased my knowledge around ground as just a reference. The same is true for below with return paths.

## PCB Return Path Considerations

As previously mentioned, the routing of the switches was done in a way to consider return paths and meet REQ-ELC-280 to reduce inductance and capacitance on switching elements.
z
![fuel-high.png](images/fuel-high.png)
![fuel-low.png](images/fuel-low.png)
As shown in the images above, there is no ground (GND) copper pour routed directly beneath these lines. In a standard layout, omitting a ground plane under a trace is a major design flaw for return currents. 

However, in this specific case, the return path is *not* ground. The return current actually flows through the load switch via the "Fuel Pump Out" line. To maintain the tightest possible current loop and minimize trace inductance, the return line is routed directly beneath the input line on the adjacent layer. This deliberate stacking couples the forward and return paths without relying on a traditional ground plane. 
# Testing & Validation