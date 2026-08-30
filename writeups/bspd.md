---
title: Formula SAE Brake System Plausibility Device (BSPD v3.0)
subtitle: Custom safety circuit engineered to comply with FSAE rules
project: bspd
badge: Safety Circuit
badgeClass: badge-safety
schematic: assets/docs/bspd-schematic.pdf
model3d: projects.html#project-card-2
topView: assets/PCB3d_Models/BSPD_TopView.png
date: May 2026 - Present
tech:
  - Altium Designer
  - Analog Design
  - Discrete Digital Logic
  - LTSpice Simulation
  - FSAE Rules Compliant
  - Latching Shutdown
---
## 1. Objective

FSAE Rules Mandate that for Electronic Throttle Control (ETC) a BSPD cirucit must be present. The primary function is to shut down the vehicle in the event of simultaneous hard breaking and above 10% throttle while also detecting for open circuits.

## 2. Requirements

For the first step in the design process, I defined the requirements for the circuit. For BSPD, this is reletively easy because it comes from FSAE rules. I drafted two sets of requirements, one for EV and another for BSPD. 
### IC BSPD Requirements

| Requirement ID| Obligation Level| Requirement| Justification| Validation Plan |
|:-----------------|:-------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| REQ-ICBSPD-001| Shall| BSPD shall be non-programmable.| Compliance with FSAE Rule IC.4.8.2.| Review the Bill of Materials (BOM) and Altium Schematics to verifty that all integrated circuits are analog.|
| REQ-ICBSPD-002   | Shall | BSPD shall latch within 1s when both of the following conditions are met simultaneously: 1.Brake pressure > the defined "Hard Braking" 2. Throttle > 10% TPS| Compliance with FSAE Rule IC.4.8.4.a| Use an oscilloscope to measure the delay between threshold crossing and SDC relay opening.|
| REQ-ICBSPD-003| Should| BSPD should incorporate a tuning mechanism to calibrate the "Demand for Hard Braking" threshold between 20% and 80% of the Brake System Encoder (BSE) output.| To allow for adjustments based on driver driving style or preferences without violating the non-programmable constraint of Rule IC.4.8.2     | Power BSPD with a stabilized LV supply, then use a multimeter to measure the Reference Node of BSE. Adjust the mechanism from the minimum to maximum setting.|
| REQ-ICBSPD-004|Should| BSPD should incorporate a calibration mechanism capable of adjusting the TPS Threshold by at least +/- 20% of its nomial 10% calculated setpoint.| To provide means of nulling the DC current sensor's idle offset voltage. This ensures the system triggers at the true 10% throttle position. | Power BSPD with a stabilized LV supply, then use a multimeter to measure the Reference Node of TPS. Adjust the mechanism from the minimum to maximum setting.|
| REQ-ICBSPD-005| Shall| BSPD shall latch within 100ms if an Open Circuit or Short Circuit fault is detected on BSE or TPS.| Compliance with FSAE Rule IC.4.8.4.b & IC.4.8.4.c| Disconnect sensor leads during operation and verify SDC opens within the 100ms window on a scope.|
| REQ-ICBSPD-006|Shall| BSPD shall monitor raw sensor signals from TPS and BSE directly| Compliance with FSAE Rule IC.4.8.3| Verify wiring harness schematic shows direct taps from sensors to BSPD input pins without passing through the ECU.|
| REQ-ICBSPD-007| Shall| BSPD shall latch the fault state such that the SDC remains open until the primary master switch is cycled| Compliance with FSAE Rule IC.4.8.6| Trigger a fault, then return sensors to normal range. Verify SDC stays open until the main power is cut.|
| REQ-ICBSPD-008| Shall| BSPD shall maintain a fault state even if Cockpit Master Switch is cycled OFF and ON| Compliance with FSAE Rule IC.4.8.7| Trigger a fault, toggle the cockpit switch, and verify the BSPD remains latched in the fault state.|
| REQ-ICBSPD-009| Shall| BSPD shall open the SDC immediately upon removal of power to the BSPD circuit.| Compliance with FSAE Rule IC.4.8.8| Pull the BSPD power fuse/connector and verify the SDC opens.|
| REQ-ICBSPD-010| Shall| BSPD shall provide a method (connectors or breakout box) to allow inspectors to disconnect signals individually.| Compliance with FSAE Rule IC.4.8.9 | Demonstrate the use of the breakout box or detachable connectors during a mock Tech Inspection.|
| REQ-ICBSPD-011| Should| BSPD should include status LEDs for power, fault, latched fault.| Facilitates rapid debugging during trackside failures or tech inspection.| Visual confirmation during bench testing. |
| REQ-ICBSPD-012| Should| BSPD should provide a discrete signal to indicate the status of the fault latch to an external monitoring system.  | Necessary to distinguish a BSPD trip from other engine management or fuel system failures. | Trigger a BSPD fault and verify that the external system records a state transition  |
| REQ-ICBSPD-013 | Shall| The status signal interface shall be electrically buffered or isolated to prevent an external failure (e.g., a shorted DAQ input) from compromising the BSPD’s safety function. | Rule IC.4.8.2: Hardware independence is required to ensure the safety circuit remains a "standalone" device.                                 | Demonstrate that a short-to-ground or short-to-VCC on the status output line does not prevent the BSPD from opening the SDC.|

## 3. Architecture & Trade Studies
It was decided early on that because the rules were very similar between IC and EV cars that only one board was to be created with 0 ohm configuration straps to switch between IC and EV Cars to reduce the cost of order multiple boards with very similar functions.

### Delay Method
The first trade study involved the timing mechanism for the latching fault. The Rules allow for up to 1s delay for IC and 0.5s delay for EV. An RC Timer with a comparator and a Binary Counter were compared.

| Criteria| RC Timer| Binary Counter|
|:-------|:-------------------|:-------------------|
|Precision|Low: Dependent on component tolerances and temperature dependence| High: Dependent on clock frequency stability.| 
|Reset Speed|Slow: Requires capacitor discharge through a resistor.|Near-Instantaneous: clear occurs within nanoseconds|
|Repeatability|Variable: Sensitive to supply voltage fluctuations, and temperature.| Absolute: Deterministic behavior based on discrete clock cycles.|
|Complexity| Minimal: Requires only a resistor, capacitor, and a comparator.| Moderate: Requires a counter IC and a stable clock source.|
|BOM Cost| Very Low: Uses basic passive components.|Moderate: Higher cost for the counter IC and clock generator.| 
|PCB Area| Small: Minimal footprint for passives.| Moderate: Requires an IC package and potentially more routing for the clock signal.| 

Decision: Binary Counters, temperature stability and reset speed lead to the benefits of a binary counter outweighing the cost offset, and added complexity. 

### Clock Generation
Once Binary Counters were decided on. Clock Generation then had to be evaluated. 3 solutions were evaluated: 555 Timer, Silicon Adjustable Clock w/o clock divider, Silicon Adjustable Clock w/ clock divider. 
| Criteria| 555 Timer| LTC6900 (or other comparable silicon adjustable clock) w/o clock divider |LTC6900 (or other comparable silicon adjustable clock) w/ clock divider|
|:-------|:-------------------|:-------------------|:-------------------|
|BOM Cost|Low*: The parts themselves are cheap with a 555 timer and added resistors and capacitors. But the capacitor could not be X7R due to heavy temperature dependence causing clock drift so would have to pay extended fee.| Highest: at 2 clocks @ $12 plus extended fee| Mid: Using a clock divider is cheaper than adding a second clock. Even with JLCPCB's ~$3 assembly fee on top of a $1 IC, it's still significantly cheaper than buying another $12 oscillator.| 
|Board Space|Largest Footprint: at least 2 caps and an added resistor.|Smallest: small package and single configuration resistor.|More than w/o clock (555 would have same added clock division)|
|Complexity|Mid-Highest: requires calculations of resistor and capacitor values|Easiest: two clocks that are set with configuration resistors|Mid: Adding a clock divider step.| 
|Frequency Stability|Lowest: Susceptible to variations in supply voltage and ambient temperature, even with good passives.| Best: high stability at variable temps and voltage variation. | Divider should not affect stability.|
|Signal Routing & Clock Skew| Mid-Risk: Single clock signal must route to divider then IC while other signal goes to other counter | Low Risk: Can place clock close to pin and reducing clock skew (through parasitic capacitance).| Mid-Risk: Single clock signal must route to divider then IC while other signal goes to other counter| 

Decision: LTC6900 (or other comparable silicon adjustable clock) w/ clock divider, for its cheaper BOM cost without sacrificing SI through temperature variation. At the relatively low frequencies of the clock signal clock skew is not a major factor.

### Latching Method
The final major trade study evaulated was for the latching method. Two solutions were evaluted. A D-Flip-Flop latch, compared with a comparator with positive feedback.  

| Criteria|Positive Feedback Comparator|D-Flip-Flop|
|:-------|:-------------------|:-------------------|
|BOM Cost|Basic JLC Part less than $1| Extended component $3 added fee|
|Complexity|More Complex with higher component count| Simpler with preset and clear for latch|

Decision: Comparator is cheaper with not much added complexity, and allows to use two channels for the startup interlock.

### Block Diagram
These decision resulted in this final block diagram
![BSPD Block Diagram](/images/BSPD_Block_Diagram.png)

## 4. Implementation 
### Current Sensor Amplification Circuit
![Current Sensor Amplification](/images/BSPD_Current_Sensor_Amp.png)
The current sensor amplification circuit was particularly challenging. I simulated it in LTSpice calulating the output with the equations that govern a differntial op amp and a non-inverting summing op amp. I was confused as my intial calculations, shown on the schematic did not line up with what was simulated. After some trial and error changing how inputs were created, I found my errror. The inputput impedance coming into the inverting side of U6A was incorrect. I found that my voltage dividers were adding impedance, which looking back at I should've seen, but through Thevinin Analysis I included the voltage divider into the calculatations giving the circuit seen above.

## 5. Testing / Validation
The board is currently being manufactured. Bring up will begin September 2026.
