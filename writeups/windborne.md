---
title: Digital Board — High-Speed Data Acquisition & Telemetry System
subtitle: Custom telemetry processing PCB featuring STM32H5, dual-band GNSS, and 100-BaseTX Ethernet. 
project: windborne
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
## A little about Digital Board
Here are the schematics, pcb files, and my resume. 

[Resume](assets/resume.pdf)
[Schematic](assets/docs/digital-board-schematic.pdf)
[PCB Prints](assets/docs/digital_layer_prints.pdf)
[Top View 3D Rendering](assets/PCB3d_Models/Digital_TopView.png)


### Background on Digital Board
Here, I am going to talk about why we needed this PCB and its function. If you want to skip straight to the things that make me the most excited about this board (p.s. it's Ethernet), scroll down to the "Cool Things" section.

#### Why did we need digital board?

Digital Board is a core part of our DAQ (data acquisition) system on the Mines Formula car. The goal of this system is to provide fast and reliable data so the other subsystems can validate their designs and make data-driven decisions.

Historically, we used CAN for our DAQ system, but last year we started to saturate our CAN bus due to the high volume of sensors on the car and the speeds we wanted to sample at. This motivated the switch to 100-BaseTX Ethernet, giving us a 100x increase in bandwidth from the previous year's 1 Mbps.

Another motivation was fixing our physical DAQ architecture. Last year, we used M.2 sub-boards connecting to one main DAQ board, and we really struggled with the M.2 cycle count on those daughter boards. The solution was to separate out the functionality and decentralize our architecture into different "nodes" connected via Ethernet.

#### What does digital board do?

Digital Board collects all the I2C sensors on the car. It also handles our GPS data, with a hot-start coin cell backup. I designed it to take all this data and transmit it over Ethernet to another node that broadcasts the telemetry over cellular.

## The Cool Things
Implementing Ethernet is a challenge unlike anything Mines Formula has done before with our DAQ system, and that challenge is why it is so cool.

Since the Ethernet architecture is common across our new DAQ nodes, I took on the role of doing the schematic capture and layout for the Ethernet PHY, MCU interface, and discrete termination. To make sure we could actually pull this off before committing it to all of our DAQ Boards (including Digital Board), I first designed and routed the discrete termination ethernet interface in a smaller development board called CoreWorks to validate my Ethernet layout. The reason we wanted to use discrete termination is that RJ45 magjacks are not automotive grade connectors and could shake loose while the car is running.

### Discrete Termination
Part of the CoreWorks testing was proving I could terminate the Ethernet magnetics discretely on the board. The simple answer is yes, we can. Now onto how I implemented it on the Digital Board.

With Ethernet termination, you are dealing with two main struggles: high-frequency common-mode noise, and different ground potentials between boards that cause ground loops.

![Digital Split Ground](images/Digital_Split_Gnd.png)
*Figure 1: Split GND Architecture*

The figure above shows the GND architecture I decided to go with. My solution to the ground loops was a split-ground architecture. I separated the chassis ground (CGND) from the digital ground (DGND) after the transformer so there’s no return path to create a DC ground loop. However, you can't just leave AC noise with nowhere to go, or it will wreak havoc on the system as EMI.

To fix that, I connected the grounds again, but smarter. I used a Bob Smith termination with a 1nF capacitor to AC-couple the high-frequency noise to CGND while still blocking DC offsets. Then, I routed that ground through a 0-ohm resistor back to the main board GND. I placed that 0-ohm resistor close to the main power connector. This deliberately funnels the noise safely out of the system, keeping it far away from the clean return paths of my sensitive digital signals.
