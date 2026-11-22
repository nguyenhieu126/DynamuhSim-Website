# PBL6 — Autonomous Mobile Robot Control & Monitoring System

Website điều khiển và giám sát robot tự hành bốn bánh Mecanum của đồ án PBL6. Giao diện được chuyển từ sáu bản xuất Stitch sang React/TypeScript; backend FastAPI chạy độc lập. Mặc định **DEMO**, hoạt động khi không có robot và không gửi lệnh đến động cơ.

## 1. Tổng quan và phần cứng

| Thành phần | Vai trò dự kiến | Trạng thái tích hợp website |
| --- | --- | --- |
| Jetson Orin Nano | ROS 2, SLAM, Nav2, AI | Chưa kết nối |
| ESP32-S3 | Điều khiển thấp tầng, encoder, micro-ROS | Chưa xác minh giao thức |
| Khung Mecanum, 4 DC motor + encoder | Di chuyển đa hướng | Chỉ mô phỏng UI |
| LiDAR | Bản đồ và tránh vật cản | Dữ liệu demo |
| Depth Camera | Khoảng cách và ảnh độ sâu | Ảnh minh họa; RGB được xác nhận riêng |
| ICM-20948 IMU | Gia tốc, vận tốc góc, hướng | Dữ liệu demo |

Không có firmware ESP32 hoặc ROS node trong checkout ban đầu; không có tích hợp phần cứng hiện hữu bị thay đổi.

## 2. Kiến trúc và công nghệ

```text
Browser: React + TypeScript + Vite + React Router
  ├─ DemoProvider: dữ liệu cục bộ, không gọi API điều khiển
  └─ LiveProvider: REST bootstrap + WebSocket, kiểm tra schema và độ mới
       ↓ /api, /ws qua Nginx (production) hoặc Vite proxy (development)
FastAPI + Pydantic + Uvicorn
  ├─ health, status, telemetry, demo settings
  └─ ROSBridge protocol: ranh giới đọc dữ liệu, chưa có adapter thật
Jetson / ROS 2 Jazzy / ESP32: hệ thống bên ngoài, chưa tích hợp
```

Frontend dùng Tailwind CSS cùng CSS variables theo token Stitch, Lucide React, Recharts và font Inter/JetBrains Mono lưu trong bundle. Các primitive Button/Card/Badge được viết nhỏ, tái sử dụng; không thêm shadcn/ui vì chưa cần các widget phức tạp. Không dùng iframe hay nhúng nguyên HTML.

## 3. Cấu trúc repository

```text
frontend/
  src/
    assets/                 # SVG tách từ Stitch và 3 ảnh tham chiếu đã tải về
    components/             # common, robot, charts, camera, mapping
    contexts/               # nguồn dữ liệu, ownership, theme, watchdog UI
    data/                   # demo fixture, settings defaults/validation
    hooks/                  # điều khiển giữ phím/nút và release
    layouts/                # sidebar/header/STOP chung
    pages/                  # sáu trang
    services/               # DemoProvider, LiveProvider, kiểm tra payload
    types/                  # giao diện dữ liệu dùng chung
    styles/                 # token sáng/tối và responsive
  tests/                    # Playwright smoke/safety checks
  Dockerfile, nginx.conf
backend/
  app/{api,core,schemas,services,websocket}/
  tests/
  requirements.txt, requirements-dev.txt, Dockerfile
pbl6-ui-reference/          # Bản gốc được giữ nguyên
docs/                      # architecture.md, api.md, verification.md
compose.yaml, .env.example, run.sh
```

Các thư mục rỗng không được tạo module giả. `dist/`, `.venv/`, `node_modules/`, `.env`, kết quả kiểm thử và dữ liệu chạy được ignore.

## 4. Sáu trang

| Route | Nội dung và tương tác |
| --- | --- |
| `/` | KPI robot, pin, tốc độ, mode; RGB/Depth; SLAM; LiDAR/IMU/encoder; cảnh báo |
| `/manual-control` | Giữ W/S tiến/lùi, A/D strafe trái/phải, Q/E quay; speed slider; RPM; watchdog; STOP |
| `/mapping-navigation` | Occupancy grid, pose, đường minh họa, goal preview, zoom/fullscreen, lưu/tải lựa chọn map demo |
| `/ai-monitoring` | Bounding box demo, chọn track, confidence/khoảng cách, depth, risk/trajectory, lọc timeline |
| `/sensors-telemetry` | Biểu đồ IMU, encoder, command/feedback; LiDAR; depth; filter thời gian/topic; device/ROS status |
| `/settings` | General, Connections, Motion/Mecanum, Sensors, AI, Safety, Advanced; Save/Cancel/Reset; cảnh báo chưa lưu |

Các trang có cùng sidebar, header, theme toggle, notification và nút STOP. Responsive có thanh điều hướng thu gọn/tablet và menu mobile. Refresh hoặc mở trực tiếp route hoạt động qua SPA fallback Nginx.

## 5. Yêu cầu môi trường

- Ubuntu với Docker Engine và **Docker Compose v2** (`docker compose`). Docker daemon phải chạy và tài khoản cần có quyền truy cập.
- `bash`, `python3`, `curl` cho tiện ích `run.sh` và smoke checks.
- Chạy frontend ngoài Docker: Node.js 20.19+ hoặc 22+, npm.
- Chạy backend ngoài Docker: Python 3.12+, gói `python3-venv`.
- Lần build đầu cần Internet để tải npm/pip và base images. DEMO sau khi build không cần Internet.
- Cổng mặc định: frontend **8080**, backend **8000**, Vite **5173**.

## 6. Khởi chạy bằng Docker

Từ thư mục dự án:

```bash
cp .env.example .env
chmod +x run.sh
./run.sh
# Chọn 1, hoặc nhấn Enter
```

Tương đương không tương tác:

```bash
./run.sh --build
# Hoặc:
docker compose up -d --build --wait
```

- Website: <http://localhost:8080>
- Swagger/OpenAPI: <http://localhost:8000/docs>
- API health: <http://localhost:8000/api/health>

Chỉ bind loopback theo mặc định. Nginx proxy bằng tên service `backend:8000`; không hardcode IP Jetson/container. Backend chạy user riêng. Volume `demo-settings` chỉ lưu cấu hình demo của API.

## 7. Sử dụng run.sh

Script tự xác định project root nên có thể gọi từ thư mục khác. `bash run.sh` cũng hoạt động. Nếu chưa có `.env`, các thao tác Docker tạo từ cấu hình mẫu an toàn.

| Mục | Hành động |
| --- | --- |
| 1 / `--build` | Build và khởi động full stack, đợi healthcheck |
| 2 / `--quick` | Dùng image hiện có, không build/pull |
| 3 / `--frontend` | Vite frontend-only, ép DEMO, cài dependency nếu thiếu |
| 4 / `--backend` | FastAPI demo-only, venv riêng, reload để debug |
| 5 / `--recreate` | Tạo lại container từ image hiện có; áp dụng backend `.env`, giữ volume |
| 6 / `--status` | Container status và API health |
| 7 | Chọn frontend/backend/all logs |
| 8 | Mở website hoặc docs bằng xdg-open nếu có desktop |
| 9 / `--check` | Health/API proxy, sáu direct routes, không có movement endpoint |
| 10 / `--stop` | Dừng service, giữ container và dữ liệu |
| 11 | Yêu cầu gõ `CLEAN`, chỉ xóa container/network của dự án, giữ image/volume |
| 0 | Thoát menu |

`./run.sh --help` liệt kê CLI. Ctrl+C ngắt tác vụ hiện hành; không xóa dữ liệu. Không dùng `docker system prune` hay `down -v`. Sau khi thay biến **VITE_** dùng mục 1 để build lại vì biến này được nhúng lúc build; mục 5 đủ cho biến runtime backend.

## 8. Development độc lập

Terminal backend:

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
PBL6_DATA_MODE=demo .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal frontend:

```bash
cd frontend
npm ci
npm run dev
```

Vite proxy `/api` và `/ws` đến `127.0.0.1:8000`. UI DEMO không cần backend. Khi đổi cổng backend cho development, cập nhật target trong `frontend/vite.config.ts` hoặc đặt `VITE_API_BASE_URL` và `VITE_WS_URL` trong `frontend/.env.local`. Backend cũng có thể đọc biến môi trường hoặc `.env` trong working directory của nó; root `.env` được Docker Compose nạp.

## 9. Biến môi trường

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `FRONTEND_PORT` | 8080 | Cổng Nginx trên host |
| `BACKEND_PORT` | 8000 | Cổng backend trên host |
| `DEV_FRONTEND_PORT` | 5173 | Cổng Vite dùng bởi run.sh |
| `VITE_DATA_MODE` | demo | Chế độ ban đầu, build-time |
| `VITE_API_BASE_URL` | rỗng | Same-origin hoặc URL backend đã xác minh; dùng khi chạy riêng |
| `VITE_WS_URL` | suy ra từ API/origin | URL WebSocket, tự chọn ws/wss |
| `PBL6_DATA_MODE` | demo | Backend demo hoặc live; live hiện trả unavailable |
| `PBL6_ROBOT_NAME` | PBL6-01 | ID hiển thị trong status backend |
| `PBL6_CORS_ORIGINS` | JSON danh sách localhost | HTTP CORS và kiểm tra Origin WebSocket |
| `PBL6_SETTINGS_FILE` | data/demo-settings.json | File demo settings; Compose đặt trong volume |

Thay cổng browser phải thêm origin tương ứng vào `PBL6_CORS_ORIGINS`. Không đặt secret vào biến `VITE_` vì nội dung có trong bundle. Không có thông tin đăng nhập hoặc IP thiết bị được hardcode.

## 10. DEMO và LIVE

**DEMO:** local fixture cập nhật mỗi 500 ms, tất cả panel có ngữ cảnh DEMO chung. Ảnh camera là tài sản Stitch, không phải video stream. Jetson/ESP32/ROS/AI vẫn ghi unavailable. Điều khiển chỉ cập nhật commanded velocity và phản hồi mô phỏng cục bộ; không có POST điều khiển. Dữ liệu demo frontend độc lập với demo API.

**LIVE:** chọn “Live API” trong data source. Provider lấy snapshot REST, sau đó subscribe WS, retry sau 3 giây. Payload sai, nguồn demo/unavailable hoặc dữ liệu cũ hơn 5 giây sẽ xóa telemetry và hiển thị N/A/offline. Sai lệch đồng hồ quá 5 giây cũng bị từ chối. Không tự chèn fixture demo. Chế độ này hiện **read-only**; status API hoạt động không đồng nghĩa robot được kết nối.

Settings UI demo lưu trong `localStorage`; không tự đồng bộ sang backend. API demo settings có lưu JSON riêng để kiểm thử nền tảng backend. Các giá trị motion/safety đã lưu là cấu hình xem trước; watchdog UI cố định 0.5 s và demo kinematics dùng giá trị mặc định đã ghi trong code. Live settings và calibration bị khóa. Không thay đổi tham số vật lý.

## 11. API và WebSocket

| Endpoint | Chức năng |
| --- | --- |
| `GET /api/health` | Tình trạng ứng dụng, mode, kết nối và physical-control capability |
| `GET /api/robot/status` | RobotStatus; giá trị thiếu là null |
| `GET /api/robot/telemetry` | Snapshot có source, timestamp, status, telemetry, events |
| `WS /ws/telemetry` | Snapshot cùng schema, khoảng 2 Hz; read-only |
| `GET /api/settings` | Demo settings đã lưu hoặc mặc định |
| `PUT /api/settings` | Validate và lưu demo-only; live hoặc motion unknown trả 423 |

Không có `/api/robot/move`, `/api/robot/stop` hay publisher `/cmd_vel`. Xem [docs/api.md](docs/api.md) và Swagger để biết schema.

## 12. An toàn

- UI model: DEMO, OFFLINE, CONNECTING, STOPPED, MANUAL, AUTONOMOUS, FAULT. Status vật lý chỉ nhận từ backend. Ownership manual/autonomous loại trừ lẫn nhau.
- Demo yêu cầu acquire manual ownership trước khi di chuyển. Giữ phím/nút mới có heartbeat; thả, blur, hidden, pointer cancel, đổi ownership hoặc rời route đều stop. Watchdog UI 0.5 s.
- STOP toàn cục xóa command/ownership demo. Thông báo nêu rõ **không gửi hoặc xác nhận physical stop**.
- STOP trong LIVE báo **STOP NOT ACKNOWLEDGED** vì endpoint thật chưa được xác minh; không báo thành công vật lý.
- Không tự resume sau reconnect. Settings quan trọng khóa khi di chuyển; backend khóa khi trạng thái moving không xác nhận false.
- Browser, Wi-Fi và watchdog UI **không thay thế mạch emergency-stop vật lý**.
- Trước khi mở điều khiển thật cần authentication/authorization, command ownership có expiry, heartbeat/dead-man, watchdog backend/ESP32, STOP ack, timeout, giới hạn động học và thử nghiệm có người giám sát.

## 13. Kiểm thử

```bash
cd frontend
npm run build
npm run typecheck
npm test
# Stack Docker phải đang chạy. Dùng Chrome có sẵn trên Ubuntu:
PBL6_BROWSER_PATH=/opt/google/chrome/chrome npm run test:e2e
# Hoặc cài Chromium test browser một lần: npx playwright install chromium

cd ../backend
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python -m pytest -q
cd ..
./run.sh --check
```

`PBL6_TEST_URL` đổi base URL Playwright. Ảnh QA được tạo trong `frontend/test-results/`, được ignore. `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1` tránh plugin ROS từ môi trường shell can thiệp test Python; không sửa cài đặt ROS. Xem [docs/verification.md](docs/verification.md) cho kết quả triển khai.

## 14. Troubleshooting

- **Docker access denied/daemon unavailable:** kiểm tra `docker info`, service Docker và quyền tài khoản theo cấu hình máy. Script không tự cấp quyền hay chạy sudo.
- **Port occupied:** kiểm tra tiến trình bằng `ss -ltnp`, đổi `FRONTEND_PORT`/`BACKEND_PORT` hoặc dừng service đang dùng cổng. Không tự kill tiến trình khác.
- **Quick start thiếu image:** dùng `./run.sh --build` lần đầu.
- **LIVE không có dữ liệu:** đây là trạng thái đúng khi backend demo hoặc chưa có adapter. Quay về DEMO để xem UI; không đổi nhãn thành Online.
- **WS bị từ chối:** đối chiếu Origin browser với `PBL6_CORS_ORIGINS`; recreate backend sau khi sửa `.env`.
- **Refresh route 404:** dùng Nginx cấu hình đi kèm hoặc Vite; static hosting khác cần SPA fallback `/index.html`.
- **Chạy development trên cổng khác:** Vite proxy mặc định backend8000; cập nhật cấu hình hoặc VITE URLs.
- **Settings không lưu:** bật browser storage; API demo settings kiểm tra quyền thư mục/volume. File lỗi được giữ nguyên và GET trả 503.
- **Pytest load plugin ROS:** dùng lệnh có `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1` trong backend venv.
- **Không mở browser tự động:** copy URL do script in ra; xdg-open chỉ dùng khi có phiên desktop.

## 15. Độ trung thực thiết kế

Ưu tiên Stitch HTML và `DESIGN.md`. Sidebar navy 250 px trên desktop, primary #1769E0, canvas sáng, card viền mảnh, Inter và JetBrains Mono được giữ. Dark theme dùng cùng token semantic. Bố cục camera/map/sensor, manual pad, AI overlay, telemetry grid và settings hai cột theo HTML.

Screenshot gốc có artwork photorealistic/gradient và vị trí chi tiết khác HTML (đặc biệt SLAM và depth). Ứng dụng dùng SVG map/depth và ảnh đã có trong HTML, không chụp/cắt screenshot để giả giao diện. Badge “Online/Running/Calibrated” và tên IMU BMI088/BNO085 trong mẫu được đổi thành unavailable/demo và ICM-20948 đúng ngữ cảnh dự án. Thêm data-source bar, trạng thái STOP và unsaved dialog để đáp ứng yêu cầu vận hành.

URL ảnh manual trong HTML thực tế trả về một screenshot của toàn trang; SVG viewport chỉ hiển thị vùng ảnh robot bên trong asset đó. Các control, text và card đều là React thật. URL ảnh AI trong HTML trả về ảnh thiết bị camera, khác cảnh người đi bộ trong screenshot; bản triển khai ưu tiên asset HTML và gắn nhãn reference/demo rõ ràng.

## 16. Trạng thái triển khai

- [x] React/TypeScript/Vite, sáu routes và shared components.
- [x] Light/Dark, responsive, demo không cần thiết bị.
- [x] Tách demo/live providers, typed schema, freshness, trạng thái disconnected.
- [x] Manual preview, ownership, UI watchdog và STOP không giả ack.
- [x] Map/AI/telemetry UI, filters, settings validation và unsaved warning.
- [x] FastAPI status/telemetry/WS và demo settings persistence.
- [x] Docker Compose, Nginx API/WS proxy, runner menu, tài liệu.
- [ ] Jetson/ESP32/ROS 2/Nav2/micro-ROS thật.
- [ ] Camera RGB/depth streams và AI inference thật.
- [ ] Physical control, physical STOP acknowledgment, backend/device watchdog.
- [ ] Authentication/roles, deployment ngoài localhost và TLS.

## 17. Hướng tích hợp Jetson/ROS 2

Triển khai một adapter riêng theo `backend/app/services/ros_bridge.py`, ánh xạ topic/status vào schema đã có và chỉ gắn `source=live` khi đã xác minh dữ liệu. Bổ sung occupancy grid, path, stream capability và per-device health có timestamp thực. Sau đó thiết kế giao thức điều khiển riêng có ownership, heartbeat, watchdog, STOP acknowledgment và audit, kiểm thử trên hardware trước khi mở nút điều khiển LIVE. ROS 2 tiếp tục chạy ngoài Docker website cho tới khi có yêu cầu deployment đã xác minh.
