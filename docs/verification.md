# Báo cáo kiểm chứng triển khai

Ngày: 21/11/2026, múi giờ Asia/Ho_Chi_Minh. Thực hiện trên Ubuntu, Node 20.20.2, Python 3.12.3, Docker 29.1.3, Compose 2.40.3 và Chrome có sẵn.

## Phạm vi và thay đổi

Checkout ban đầu chỉ có `pbl6-ui-reference/`. Không tìm thấy frontend, FastAPI, firmware hoặc ROS node hiện hữu. `.git` của môi trường không phải Git repository sử dụng được; không tạo commit, branch hoặc push.

Đã tạo:

- `frontend/`: Vite/React/TypeScript, Tailwind/token CSS, sáu pages, shared layout/components, context/hooks, demo/live services, types, fixtures, local font/reference assets, unit và browser tests, production Nginx/Dockerfile.
- `backend/`: FastAPI/Pydantic application, status/telemetry/settings routes, WebSocket, safe RobotService, ROSBridge interface, atomic demo settings store, Dockerfile và API tests.
- `compose.yaml`, `.env.example`, `.gitignore`, executable `run.sh`, README tiếng Việt và tài liệu kiến trúc/API/verification.
- `.env` local được tạo từ mẫu DEMO; không có secrets. Dependencies/build/test artifacts nằm trong các đường dẫn được ignore.

13 file reference (DESIGN.md, sáu HTML, sáu PNG) có SHA-256 trùng manifest trước triển khai. Không sửa bản gốc.

## Kiểm thử

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript `npm run typecheck` | PASS |
| Vite production build, bao gồm trong multi-stage Docker | PASS |
| Vitest | 7 tests PASS: validation telemetry, no false STOP ack, safety settings invariants |
| FastAPI pytest | 12 tests PASS: status/demo/live, không có endpoint movement, WS read-only/Origin, settings validation/lock/persistence |
| Playwright | 7 test groups PASS; sáu direct routes + refresh, light/dark, demo không POST control, manual ownership/release/blur/route cleanup, settings persistence/Cancel/unsaved dialog/validation, Live rejects demo, STOP unacknowledged, map ownership, mobile overflow, stale Live data và independent depth/RGB |
| Docker Compose build | Cả frontend/backend PASS |
| Containers health | Cả frontend/backend healthy |
| `./run.sh --check` | API health, Nginx REST proxy, sáu SPA routes, absence of physical movement endpoint PASS |
| Nginx WS proxy | Handshake và nhận demo Snapshot qua port8080 PASS |
| Runner từ working directory `/tmp` | `--help`, frontend-only5173 và backend-only18000 PASS |
| Ctrl+C dev runners | Thoát sạch, giữ dữ liệu; đã dừng hai dev runner sau kiểm chứng |
| Menu và Bash syntax | Menu1–11/0 hiển thị, `bash -n run.sh` PASS |
| Visual inspection | Kiểm tra ảnh của sáu trang và ảnh dark; sửa camera nesting, blueprint color, SVG gradient casing và dark text/canvas contrast |

Chạy backend pytest với `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1` để tránh plugin ROS từ shell máy chủ. TestClient hiện có một warning deprecation từ Starlette về httpx; không có test failure. Docker báo buildx/Bake chưa cài và dùng builder hiện có thành công.

Browser test artifacts được tạo trong `frontend/test-results/` và không được đưa vào source control. Các test Live có fixture được intercept trong browser để kiểm tra freshness; đây không phải chứng nhận tích hợp robot thật. Cặp service Docker được để chạy ở `http://localhost:8080` và `http://localhost:8000/docs`.

## Khác biệt với ảnh tham chiếu

Theo yêu cầu, ưu tiên HTML hơn screenshot. Các ảnh camera từ URL của HTML khác screenshot: AI là ảnh camera, dashboard là hành lang không có người; overlay vẫn được gắn nhãn DEMO. URL manual trả cả screenshot; chỉ vùng ảnh robot được hiển thị bằng SVG viewport, phần UI xung quanh là React thật. Bản đồ/depth dùng SVG của HTML nên đơn giản hơn ảnh screenshot. Status mẫu “Online/Running/Calibrated” được thay bằng demo/unavailable. Tên IMU theo hardware dự án ICM-20948. Data source, STOP feedback và unsaved warning được bổ sung để đáp ứng yêu cầu.

## Checklist bàn giao

- [x] Frontend React/TypeScript/Vite; sáu routes có refresh và shared sidebar/header.
- [x] Light/Dark, responsive, demo không cần robot.
- [x] Frontend demo/live providers tách biệt, nguồn và độ mới hiển thị rõ.
- [x] Không có real motor command từ DEMO; physical control vẫn disabled trong LIVE.
- [x] STOP phân biệt local demo stop và physical acknowledgment; LIVE hiện báo critical warning.
- [x] FastAPI safe foundation, schema và ROS adapter boundary.
- [x] Docker/Nginx/Compose build và start thành công.
- [x] run.sh management menu, standalone modes và smoke checks.
- [x] README tiếng Việt, tài liệu API/architecture, original references giữ nguyên.
- [ ] ROS 2/Jetson/ESP32/micro-ROS thật và per-device health đã xác minh.
- [ ] LiDAR/occupancy-grid/Nav2/path thật, camera RGB/depth thật và AI inference thật.
- [ ] Live manual/autonomous control, physical STOP ack, backend/device watchdog, authentication và authorization.
- [ ] Hardware acceptance test và deployment ngoài localhost/TLS.

Settings UI và map management hiện lưu demo configuration trong browser; backend demo settings có JSON store riêng. Saved motion/safety values không điều chỉnh phần cứng hoặc watchdog UI cố định. Không tuyên bố bất kỳ tích hợp pending nào đã hoàn thành.
