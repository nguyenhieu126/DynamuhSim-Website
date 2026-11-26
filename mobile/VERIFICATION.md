# Mobile UI verification

Implemented and checked on 2026-11-26. Only the new `mobile/` directory is delivered.
No commit/push, APK build, publishing, backend connection, or robot command occurred.

## Automated results

| Check | Result |
| --- | --- |
| TypeScript strict check | PASS |
| Expo/React hooks lint | PASS |
| Expo dependency alignment | PASS |
| Expo Doctor | 20/20 PASS |
| Safety/validation tests | 8/8 PASS |
| Android JS/Hermes export | PASS, native bundle generated; not an APK |
| Expo start | PASS, Metro and app preview started |
| Six screens + More, 360×800 / 390×844 / 412×915 | PASS in Expo browser preview; no horizontal page overflow |
| One shared bottom bar | PASS, five equal-width tabs within viewport |
| Hold/release, joystick watchdog, STOP | PASS in preview; local velocity returns to zero |
| Route change / no auto-resume / Live lockout | PASS in preview and reducer tests |
| Theme and local settings restored after reload | PASS in preview |
| System theme follows light/dark device preference | PASS in delivered app preview |
| Android launch manifest from delivered mobile/ directory | HTTP 200, SDK 58, launch asset present |
| Track selection and map goal preview | PASS in preview |
| Backend API / telemetry socket requests | None observed; no adapter implementation exists |

Screenshots of the six implemented screens were visually reviewed against the six
Stitch references. The supplied spelling `telematry` was respected when reading
references. See README for image differences, touch-target adjustments and the
navigation normalization required by the task.

## Acceptance checklist

- [x] Expo app and TypeScript configuration in `mobile/`.
- [x] Expo Router routes, tabs and native stack structure.
- [x] Six screens, shared components, More menu.
- [x] Shared design tokens and bundled Inter / JetBrains Mono fonts.
- [x] Light, Dark, System theme choices and device-local preference storage.
- [x] Existing PBL6 branding and local DEMO image assets.
- [x] Clearly labeled local fixtures, unavailable hardware values marked N/A.
- [x] DEMO controls, slider, track selection, filters, maps and settings.
- [x] Live motor control disabled; no physical STOP acknowledgment claimed.
- [x] No unintended backend API calls.
- [x] Preview phone-size checks and Android bundle compilation.
- [x] Existing website, backend, Docker, run script and Stitch references untouched.
- [ ] Verify on an actual Android device/emulator: native touch cancellation,
  system safe areas, Android Back, backgrounding and font-scale behavior.
- [ ] Future authenticated FastAPI/WebSocket adapter and hardware safety validation.

Browser checks exercise React Native's Expo preview renderer. They cannot prove
native Android runtime behavior. No Android emulator binary or connected device
was available in this environment. All app components use native primitives; the
preview adapters are development dependencies only.
