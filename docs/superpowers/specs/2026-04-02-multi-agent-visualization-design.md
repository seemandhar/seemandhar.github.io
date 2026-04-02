# Multi-Agent Visualization Design

## Overview
Add an interactive "Multi-Agent Research" section to seemandhar.github.io, placed after "Research Interests" and before "News". Three tabbed visualizations let visitors explore how multi-agent systems collaborate, with playful/bouncy physics and full drag interactivity.

## Agents (shared across all 3 options)
- Planner — decomposes tasks
- Coder — writes code
- Reviewer — reviews output
- Debugger — finds/fixes issues
- Executor — runs code
- Researcher — gathers information

## Option 1 — Network Diagram
- 6 nodes in circular layout on HTML5 canvas
- Colored circles with emoji icons and labels
- Edges connect collaborating agents
- Animated particles travel along edges (message passing)
- Drag nodes — edges/particles follow in real-time
- Hover highlights connections, dims others
- Bouncy snap-back on release

## Option 2 — Pipeline Flow
- Horizontal left-to-right: Researcher → Planner → Coder → Reviewer → Debugger → Executor
- Rounded cards with icon, name, short description
- Animated dashed arrows with pulsing dots between stages
- Drag cards — spring physics snap-back
- Click to activate with glow/pulse
- Looping "task token" animation through full pipeline

## Option 3 — Force Graph
- Force-directed physics: repulsion + spring edges
- Nodes bounce off canvas walls
- Drag any node — whole graph reacts with springy physics
- Double-click empty space to add temporary "Task" node
- Colorful nodes with idle bobbing animation
- Edge thickness pulses for "communication intensity"
- Collision detection prevents overlap

## Shared Requirements
- Tab bar to switch between three options
- HTML5 canvas, ~600x400px, responsive
- Dark/light mode (reads minimal-light theme CSS variables)
- Zero external dependencies, all JS inline
- Title: "How Multi-Agent Systems Collaborate"
- Playful/animated style: vibrant colors, bouncy physics, game-like feel

## Tech
- Pure HTML + CSS + JS embedded in index.md
- Canvas API for rendering
- requestAnimationFrame for animation loop
- Pointer events for drag interaction
