# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Companion website for the "Four Star Captain" YouTube channel (https://www.youtube.com/@fourstarcaptain), hosting supplementary material that doesn't fit on YouTube.

License is closed — treat all content as proprietary.

## Current state

The repository is in an initial state: only `README.md` is staged and there are no commits yet. Hugo is the intended static-site generator (per README.md), but no Hugo site has been scaffolded (no `config.toml`/`hugo.toml`, `content/`, `layouts/`, `themes/`, etc.).

Before adding content or templates, scaffold the Hugo site (e.g. `hugo new site . --force`) and commit that baseline so subsequent work has a known-good starting point. Once scaffolded, update this file with the actual build/serve/test commands and the chosen theme's conventions.
