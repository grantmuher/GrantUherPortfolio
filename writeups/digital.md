---
title: Digital Board — High-Speed Data Acquisition & Telemetry System
subtitle: Custom telemetry processing PCB featuring STM32H5, dual-band GNSS, and 100-BaseTX Ethernet
project: digital
badge: DAQ & High-Speed
badgeClass: badge-daq
schematic: assets/docs/digital-board-schematic.pdf
model3d: projects.html#project-card-1
topView: assets/PCB3d_Models/Digital_TopView.png
date: May 2026 - Present
tech:
  - Altium Designer
  - STM32H5 MCU (Arm Cortex-M33)
  - 100-BaseTX Ethernet (MDI/RMII)
  - Dual-Band L1/L5 GNSS
  - Discrete Termination
  - Controlled Impedance Routing
  - High-Speed Differential Pairs
---
## 1. Objective

Digital Board is apart of an data acquisition system for MF14 & EMF1 cars (Formula SAE). Its goal is to collect all digital sensors on the car and provide GPS data for the car. It includes a STM32H563, a NEO-MAX-F10S GNSS module, LAN8742AI Ethernet PHY (for 100-BaseTDX ethernet), and discrete magnetics for the ethernet interfaces. 

## 2. Requirements

As all boards start, I created requirements for the PCB. 
|Requirement ID|Obligation Level|Requirement|Justification|Validation Plan|
|:-----|:-----|:----------|:----------|:----------|
|REQ-DIG-001|Shall|The GPS module shall support a minimum of update rate of 10 Hz|At 10Hz we would sample every 3m at 30m/s, giving an semi-accurate positional update.|Stream the incoming data and verify time stamps meet the specification.|
|REQ-DIG-002|Shall|The GPS module shall support multi-constellation tracking (GPS, GLONAS, Galileo, etc.)|Multi-constellation support allows for greater robustness decreasing the chance of a poor connection.|Review the GPS datasheet to verify it meets the requirement.|
|REQ-DIG-003|Shall|The GPS module shall achieve a horizontal position accuracy of less than 2.5 meters (Circular Error Probable) under open-sky conditions.|At 2.5m CEP, the module can accurately track the car within the cars bounding box.|Review the GPS modules datasheet to verify it meets the requirement.|
|REQ-DIG-004|Shall|Time-To-First-Fix (TTFF) shall be < 35 seconds for Cold start and < 2 seconds for Hot start. This can be void depending on rules regarding vehicle batteries.|Ensures the DAQ system is ready to record by the time the vehicle leaves the pit lane without long idling periods.|Time the signal acquisition from both a completely discharged state and immediately after a brief power cycle.|
|REQ-DIG-005|Should|Antenna connection should utilize an SMA connector.|SMA provides a secure, vibration-resistant RF connection. In previous years, the UHF Connector has been difficult to work with||
|REQ-DIG-006|Should|Backup power source should provide enough energy to maintain orbit data for at least 24 hours to ensure Hot Start performance.|Prevents the system from having to cold-start on the second day of a competition weekend.|Remove main power for 24 hours, reapply power, and verify the TTFF is under the 2-second Hot Start threshold.|
|REQ-DIG-007|Shall|Digital Board shall sample digital sensors via I2C at a minimum frequency of 10Hz per sensor across at least 2 I2C buses.|Provides sufficient resolution for telemetry while multiple buses prevent address collisions and bandwidth bottlenecks.|Connect multiple I2C sensors, poll them simultaneously, and verify data timestamps match a 10Hz or greater frequency.|
|REQ-DIG-008|Should|Digital Board should implement a local hardware buffer capable of logging 30 minutes of data on a removable MicroSD card if the network link fails.|Prevents total data loss during race/testing if the Ethernet goes down.|Disconnect the Ethernet link during operation, allow the system to run for 30 minutes, and verify data integrity on the local hardware buffer.|
|REQ-DIG-009|Should|MicroSD should interface with the STM32 via the SDIO peripheral in 4-bit mode.|4-bit SDIO provides significantly higher data throughput compared to standard SPI, preventing write bottlenecks.|Probe the SD interface lines to verify 4-bit communication protocols are active.|
|REQ-DIG-010|Shall|Digital board shall support up to 10 5V tolerant DI/O pins.|Allows the 3.3V microcontroller to safely interface with standard 5V automotive signals, and allows flexibilty when different sensors are integrated|Apply 5V to designated pins and verify correct logic-high readings without hardware damage.|
|REQ-DIG-011|Shall|Digital board shall be accessible via Ethernet (100BaseTX, 100Mb/s) using the STM32 internal MAC and an external PHY via RMII.|Establishes a reliable, high-bandwidth network backbone for data collection.|Perform an network throughput test to confirm speeds approach the 100Mb/s theoretical limit.|
|REQ-DIG-012|Should|Digital board should implement programming over Ethernet and debugging, with a JTAG port via tag-connect and header pins as backup.|Allows for OTA firmware flashes in the pit, while JTAG provides a fail-safe.|Flash a new firmware over the Ethernet connection, then separately verify connection via the JTAG header.|
|REQ-DIG-013|Should|Digital board should have a processor clock speed >= 80MHz and shall support all necessary communication protocols.|Ensures enough processing overhead to juggle high-speed networking, SD card writing, and I2C polling simultaneously.|Monitor CPU utilization during full-load bench testing (I2C reading + SD writing + Ethernet transmitting).|
|REQ-DIG-014|Shall|Digital board shall operate with external input voltage of 14V (13.2V nominal) , minimizing inefficient losses.|Matches standard automotive LV system voltages while preventing excess heat generation.|Supply 14V, measure current draw, and calculate total thermal dissipation under load.|
|REQ-DIG-015|Should|Digital board should include reverse polarity/ESD protection , a TVS diode on the power input , and back-powering protection.|Protects sensitive downstream components from user wiring errors, static shocks, and transient voltage spikes.|Apply reversed 14V power (verify no current flow) and use an ESD spike to test transient suppression.|
|REQ-DIG-016|Shall|Digital board shall have status indicators present for all system voltage levelsAllows immediate visual confirmation that internal power regulation is functioning.|Power the board and visually confirm the 12V, 5V, and 3.3V indicator LEDs are illuminated.|
|REQ-DIG-017|Shall|Digital board shall include a manual reset, bootloader trigger; all must be accessible.|Simplifies manual troubleshooting, flashing, and provides an input for custom user functions.|Actuate each button manually and observe the expected hardware/software response.|
|REQ-DIG-018|Should|Digital board should include status lights for GPS Lock/Time-pulse and Ethernet Link/Activity must be visible on top of the board.|Crucial for diagnostic checks.|Assemble and verify a clear line-of-sight to the indicator LEDs.|
|REQ-DIG-019|Shall|Digital board shall utilize ethernet interface uses a vibration-resistant connector or RJ45 with a locking mechanical shroud.|Prevents the network cable from backing out due to high-frequency engine/chassis vibrations.|Perform a mechanical pull-test and shaker-table vibration test on the mated connection.|
|REQ-DIG-020|Should|Digital board Should provide a physical switch to completely isolate the backup power source.|Prevents battery drain during off-season storage and allows engineers to force a memory wipe.|Toggle the switch to "off" and measure the voltage at the RTC battery pin to confirm it drops to 0V.|
|REQ-DIG-021|Should|Digital board should prioritize JLCPCB basic and economic assembly components from their standard parts library.|Keeps manufacturing costs low and speeds up the assembly turnaround time.|Review the generated BOM against the JLCPCB SMT parts library prior to ordering.|
|REQ-DIG-022|Should|Specialized or expensive parts unavailable through JLCPCB should be assembled in-house.|Avoids sourcing fees for low-volume or highly specialized silicon.|Separate the BOM into "Turnkey" and "In-House" lists during the design review.|
|REQ-DIG-023|May|System may be mountable in an enclosure , with indicators visible when mounted.|Protects the PCB while ensuring diagnostic lights remain useful.|

## 3. Architecture & Trade Studies
### Ethernet Termination Method
The Major Trade Study completed regarded discrete magnetic termination vs a integrated RJ45 magjack.
|Criteria|RJ45|Discrete Termination|
|:----|:------------|:------------|
|Difficulity|No added difficulty| Requires managing Bob-Smith Termination, 2kV isolation requirement, and split ground architecture.|
|PCB Area|Seperate Connector required|Connector can interface through AMPSEAL|
|Wire Compatibility| Interfaces through CAT5/6 cable| Interfaces through crimps on AMPSEAL|
|Signal Integrity| Greater: Designed for 50 ohm impedance matching|Goes through AMPSEAL not designed for strict impedance matching|
|Vibration Resistance|Requires external locking mechanism|AMPSEAL is an automotive grade connector|

Decision: Discrete termination would be a better design decision for due to vibration resistance, but the added difficulty is unlike anything Mines Formula has done before. 

This hesitation of around if we could do discrete termination motivated the decision to make a Development Board "CoreWorks" to see if discrete termiation could be accomplished. I led the design on that discrete termination and it was successfull leading to the decision to go with discrete termination.

### Block Diagram
These decisions lead to this block diagram.
![Digital_Block_Diagram](images/Digital_BlockDia.png)


## 4. Implementation
### Ethernet
![Digital Split Ground](images/Digital_Split_Gnd.png)
Routing ethernet required learning about Bob Smith Termination, High Speed Digital Design Practices including length matching and impedance matching. The most difficult part was the grounding concepts used in ethernet with a split Chassis GND from Board GND. The routing of this is seen above. 

### Bias Tee Circuit
![Digital Bias TEE](images/Digital_BIAS_TEE.png)
Designing the Bias Tee increased my understanding of frequency-domain impedance, requiring me to evaluate how the network behaves across distinct frequency bands, a low resistance path for DC power while isolating the L1 (1575.42 MHz) and L5 (1176.45 MHz) GNSS frequencies. The primary challenge was selecting an RF choke capable of covering both GPS bands without suffering performance loss from its Self Resonant Frequency (SRF). Using Murata’s SimSurfing tool, I looked at component impedance curves to select an inductor that sustained greater than $500\,\Omega$ of isolation across both L1 and L5 bands.

### Buck Converter Layout
![Digital Bias TEE](images/Digital_Buck.png)
Designing the buck converter layout was critical to the board’s power delivery performance and overall efficiency. Minimizing parasitic loop inductance in the high-$\text{d}i/\text{d}t$ input switching loop was essential to reduce switching losses, and prevent radiated noise. I maintained a compact switch node, tightly coupled the power components to a solid reference ground return, and implemented ground via stitching around the power stage to isolate switching EMI from sensitive circuitry.


## 5. Testing / Validation
The board is currently being manufactured. Bring up will begin September 2026.