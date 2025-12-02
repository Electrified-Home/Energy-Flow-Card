## Purpose

We are developing a **Home Assistant Energy Flow Card**.
The goal is a single-file JavaScript custom card that is:

* easy to test
* easy to configure
* easy to understand
* elegant and robust
* and ultimately a meaningful improvement over existing energy-flow cards.

## Development Approach

We are **not** using HACS or a build pipeline.
For now, everything stays in **one JavaScript file** placed directly in `/config/www`.
We copy-paste that file during development.
Keep the structure simple and predictable so changes are easy to iterate.

## Card Behavior

The card must:

* register itself properly with Home Assistant
* expose a configuration editor so it’s fully usable through the UI
* provide a clean, intuitive config model
* support visual configuration without YAML

The editor does not need to be complex at first—just functional.
We incrementally refine it.

## Vision

This is a fresh take on an Energy Flow Card:
clean display, tasteful animations, smooth layout, accurate data flow, and clear states.
The design should feel more modern and more deliberate than existing solutions.

Focus on clarity, maintainability, and incremental enhancements.
