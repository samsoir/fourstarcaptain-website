+++
title = "FlightFactor 777 v2 on Linux: forcing the right libc++ at runtime"
date = 2026-05-05
summary = "The FlightFactor 777 v2 ships with its own libc++ runtime. On some Linux distros the system's libc++ resolves first at dlopen time and the plugin crashes or hangs. An LD_PRELOAD wrapper biases the resolution back to the bundled copy."
tags = ["x-plane", "linux", "flightfactor", "b777"]
draft = false
+++

The FlightFactor 777 v2 ships its `stsff_aircraft_performance_lua` plugin module with a bundled copy of `libc++.so.1` and `libc++abi.so.1` (LLVM's C++ runtime) under the aircraft folder. On some Linux distributions the dynamic linker resolves the system-installed `libc++` ahead of the bundled copy. The ABI doesn't match, and the plugin fails to initialise. An `LD_PRELOAD` wrapper script forces the bundled libraries to be loaded first.

## Symptoms

Triggered on Linux by selecting a FF 777v2 variant, one of two things happens:

1. **X-Plane crashes to desktop.** The simulator process exits while the aircraft is loading, with no graceful error.
2. **The aircraft initialization screen hangs indefinitely.** The progress indicator stops advancing and the sim never reaches the cockpit. Killing the process is the only way out.

Either failure mode usually leaves something in `Log.txt` referencing `stsff_aircraft_performance_lua` or `libc++` / `libc++abi`. To check:

```sh
grep -E 'stsff_aircraft_performance_lua|libc\+\+' "/path/to/X-Plane 12/Log.txt"
```

Hits with missing-symbol or version-mismatch lines indicate this issue.

## Mechanism

The bundled libraries live at `Aircraft/FlightFactor777_200ER/modules/cpp-libs/stsff_aircraft_performance_lua/bundle/`. The plugin is built against the ABI of that specific runtime.

`dlopen()` resolves shared library names through the dynamic linker, which searches in a fixed order: `LD_LIBRARY_PATH`, the `RPATH` / `RUNPATH` baked into the binary, `/etc/ld.so.conf` and its includes, then the standard system directories. On distros that ship a recent system `libc++` of their own, the system copy is found before the bundled directory. The plugin's `RPATH` doesn't reliably point at the bundle on every distro, so the resolution silently falls back to the system runtime. ABI mismatches between versions surface as crashes, or as hangs while the plugin spins on initialisation.

## Fix

`LD_PRELOAD` instructs the dynamic linker to load the listed libraries before resolving the binary's own dependencies. Subsequent symbol lookups find those libraries first regardless of search-path order. Preloading the bundle's `libc++abi.so.1` and `libc++.so.1` ensures the plugin sees the runtime it was built against.

A ready-to-use wrapper script lives in the [samsoir/xplane-on-linux](https://github.com/samsoir/xplane-on-linux) repository at [`scripts/run_X-Plane-12.sh`](https://github.com/samsoir/xplane-on-linux/blob/main/scripts/run_X-Plane-12.sh). Use that copy rather than writing your own. The full contents:

```bash
#!/usr/bin/env bash

bundle="./Aircraft/FlightFactor777_200ER/modules/cpp-libs/stsff_aircraft_performance_lua/bundle"

LD_PRELOAD="${bundle}/libc++abi.so.1:${bundle}/libc++.so.1" exec "$@"
```

Three details worth knowing before running it:

- **Order matters.** `libc++abi` precedes `libc++` in the colon-separated list because `libc++` depends on it. Reversed, `libc++` resolves `libc++abi` symbols against whatever the linker finds elsewhere.
- **`exec "$@"`** replaces the shell with the command passed in, so X-Plane runs in the wrapper's process slot. Arguments pass through.
- **Relative paths.** The `bundle=` line uses `./Aircraft/...`, so the script must be invoked with the X-Plane root as the current working directory. Run via an absolute path from elsewhere and the preload silently does nothing. There is no error, just no preload.

## Installation

Clone the repository (or download `scripts/run_X-Plane-12.sh` directly), copy the script into the X-Plane root (the directory containing `X-Plane-x86_64`), make it executable, and launch through it instead of running the binary directly:

```sh
git clone https://github.com/samsoir/xplane-on-linux.git
cp xplane-on-linux/scripts/run_X-Plane-12.sh "/path/to/X-Plane 12/"
chmod +x "/path/to/X-Plane 12/run_X-Plane-12.sh"

cd "/path/to/X-Plane 12"
./run_X-Plane-12.sh ./X-Plane-x86_64
```

For `.desktop` files, Steam shortcuts, or other launchers, point the `Exec=` line (or equivalent) at the wrapper. Arguments after the binary path are forwarded: `./run_X-Plane-12.sh ./X-Plane-x86_64 --foo --bar` is equivalent to `./X-Plane-x86_64 --foo --bar`.

## Caveats

- If the `bundle/` directory doesn't exist (FF 777 not installed), the linker prints a warning and X-Plane launches anyway. Non-fatal but noisy.
- The script only addresses this aircraft. If another addon ships its own bundled C++ runtime with the same problem, either extend the `LD_PRELOAD` list or write a separate wrapper.
- New FF variants with their own `bundle/` paths require updating the `bundle=` line.

## Why this is a workaround

A correct fix lives upstream. The plugin's `RPATH` (or `RUNPATH`) would point at the bundled directory so the linker resolves to the right runtime without environment-variable intervention. Static linking of the C++ runtime would avoid the resolution question entirely. Neither is something the user can change from outside the addon.
