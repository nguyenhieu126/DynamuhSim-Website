# PBL6 Mobile — native DEMO UI

A standalone React Native + Expo Router application. All views use native primitives,
StyleSheet, SVG, and local assets. Existing `frontend/`, `backend/`, Docker and robot
integration are unchanged. There is no HTTP, WebSocket, ROS 2, or ESP32 implementation.

## Run on Android

Use **Node 22.13+** (the project includes `.nvmrc`) and npm:

```sh
cd mobile
nvm use # if nvm is installed; otherwise select Node 22.13+ yourself
npm ci
npx expo start
```

Open the QR code in a compatible Expo Go client on an Android device on the same
network. For a connected emulator/device with Expo Go, use `npm run android`.
An SDK 58-compatible client is required; Expo will report a mismatch if the phone
has a different SDK client. Installing/building a client or APK is outside this task.
Use `npx expo start --clear` if switching SDK/client versions.

This project is configured with Android package `com.pbl6.robotconsole`, icon,
version, app scheme and Expo config plugins. No EAS project is linked, no native
folders are checked in, and no APK is built or published. A later APK task can
configure EAS and verify the application on physical Android hardware first.

## Navigation

Home → Dashboard; Control → Manual Control; Map → Mapping & Navigation;
AI → AI Monitoring; More → Sensors & Telemetry / Settings.
There is one shared bottom bar on every route. Android stacks provide Back
navigation; tabs use history. More also includes a local state simulator for all
seven backend robot states. No selection grants physical control authority.

## DEMO interactions and safety

- Default source is DEMO; every camera, chart, map and fixture is labeled.
- Enable demo control before using the joystick/directional buttons. Motion is
  normalized and scaled by the speed slider. Rotate and strafe are supported.
- Release/cancel, route change, backgrounding, authority/source change, and a fixed
  500 ms local command watchdog clear motion. Leaving Control revokes authority;
  returning never automatically resumes. Holding a direction refreshes only local
  state. A stationary drag times out safely until another gesture update.
- STOP clears **local** motion and authority. The message states that no physical
  STOP was sent. There is no physical acknowledgment or automatic resume.
- Live is a disconnected preview state. Its physical controls are disabled.
- Map preview/save/load, tracks, camera modes and chart filters act locally.
- Camera depth and SVG maps are illustrative, not inferred from the RGB pictures.
- Local settings/theme persist using AsyncStorage. Unsupported calibration is
  disabled. Backend URL is blank by default, validated and stored locally;
  Test Connection explicitly reports that no network request was made.
- Safety/motion/AI values in Settings are preview preferences. Saving does not
  configure hardware or change the fixed local watchdog. Languages other than
  English are preferences for a future translation task, not translated UI.

Physical E-stop, motor watchdog, command arbitration and acknowledgment protocols
must be independently implemented and verified before allowing physical movement.

## Checks

```sh
npm run typecheck
npm test
npx expo install --check
npx expo-doctor
npm run export:android
```

`expo export --platform android` compiles a native JS/Hermes bundle; it does not
build an APK. `npm run preview:web` is an optional development-only visual preview
using Expo's RN renderer. The `react-dom` / `react-native-web` dev dependencies are
preview adapters only; application components never import DOM APIs or render HTML.
Android hardware acceptance remains necessary; browser preview cannot verify native
back dispatch, touch handling, system insets or background lifecycle behavior.

## Reference fidelity

References: `../pbl6_robot_control_app/DESIGN.md`, six HTML exports and six visually
inspected screenshots. Sensors is actually spelled `sensors-telematry.html` and
`04_sensor_telematry.png` in the supplied pack. Original references are untouched.

Tokens use DESIGN.md's exported dark palette, Inter and JetBrains Mono. The default
dark style follows Stitch; light tokens are an additional required mode. The shared
five-item navigation follows the task's Home/Control/Map/AI/More order, rather than
the inconsistent Sensors/Settings bars in individual screenshots. Touch targets
are at least 48 dp for primary controls and can make the page taller than tiny
Stitch buttons. Cards scroll instead of shrinking text to fit a screenshot.

Only local project logo and camera reference images are copied. The manual camera
reference supplied by the website is a screenshot of a whole website, so it is
not used as a native screen or camera panel. The existing corridor scene is used
as a labeled DEMO preview instead. AI likewise reuses the existing local camera
scene, which differs from the remote laboratory photograph in Stitch. No external
photos were downloaded and no artwork was generated. Maps/charts/depth are native
SVG visualizations based on the reference, not camera measurements.

## Files

- `app/`: Expo Router entry, five tab routes plus Sensors and Settings stack routes.
- `src/screens/`: six screens and the More navigation page.
- `src/components/`: reusable shell, cards, status, camera, map, chart, sensor,
  joystick, events and safety controls.
- `src/theme/`: shared palette, fonts, spacing, radii and typography.
- `src/contexts/`: persisted theme/settings and safe local control state.
- `src/services/`: pure control reducer, validation and future provider contract.
- `src/data/`: typed fixtures; `src/types/`: DTOs mirrored from existing schemas.
- `tests/`: command authority, release, STOP, reconnect, lifecycle, settings and
  fixture semantics checks.

## Remaining FastAPI work (separate task)

Implement a provider for `/api/health`, `/api/robot/status`,
`/api/robot/telemetry`, `/ws/telemetry`, and `/api/settings`. DTOs retain backend
field names (`vx/vy/wz`, `yaw` in radians, `FL/FR/RL/RR`, nullable camera URLs, etc.).
Add authentication, reconnect freshness handling, explicit ownership and stale
state handling. Keep unavailable values N/A and hardware controls disabled until
physical motion and STOP acknowledgment APIs are verified. Never assume an HTTP
response means a physical robot has stopped.

Detailed results and the acceptance checklist: [VERIFICATION.md](VERIFICATION.md).

Versioned framework references used during implementation:
[Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/) and
[Expo Router](https://docs.expo.dev/versions/v58.0.0/sdk/router/).
