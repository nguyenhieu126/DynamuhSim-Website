# API và WebSocket

Mặc định `http://localhost:8000`; frontend production proxy cùng origin qua `/api` và `/ws`. Swagger `/docs`, schema `/openapi.json`. API không điều khiển phần cứng.

## Health

`GET /api/health` → 200:

```json
{"status":"ok","mode":"demo","hardware_connected":false,"ros_connected":false,"physical_control_enabled":false}
```

`status=ok` chỉ xác nhận FastAPI đang chạy. Không xác nhận Jetson/ESP32/ROS/AI.

## Status

`GET /api/robot/status` → RobotStatus, camelCase để trùng frontend:

```json
{"state":"OFFLINE","robot":"PBL6-01","hardwareConnected":false,"rosConnected":false,"ownership":null,"battery":null,"voltage":null,"temperature":null,"moving":null,"controlVerified":false}
```

`moving=null` là chưa biết, không được hiểu là stopped. Ownership: null/manual/autonomous. State: DEMO/OFFLINE/CONNECTING/STOPPED/MANUAL/AUTONOMOUS/FAULT.

## Telemetry

`GET /api/robot/telemetry` và `WS /ws/telemetry` dùng cùng envelope:

```text
Snapshot
  source: demo | live | unavailable
  timestamp: ISO-8601 UTC
  status: RobotStatus
  telemetry: Telemetry | null
  events: RobotEvent[]
```

Trong demo: các giá trị mẫu có `source=demo`, hardware/ROS/camera/nav2 false. Trong live chưa có bridge: source unavailable, telemetry null, battery/voltage/temp/moving null. Không có nguồn live giả.

| Telemetry field | Đơn vị / ý nghĩa |
| --- | --- |
| velocity, commanded | vx/vy m/s, wz rad/s; feedback vs command |
| pose | x/y m, yaw °, frame map; ước lượng |
| wheels[] | wheel FL/FR/RL/RR, rpm, velocity m/s |
| imu | acceleration[3] m/s², angular[3] rad/s, orientation[3] ° |
| lidar | ranges[] m, rate Hz, min/max/nearest m |
| camera | rgb/depth capabilities độc lập, fps, rgbUrl/depthUrl nullable |
| tracks[] | id, label, confidence, distance m, velocity m/s, risk, box phần trăm [x,y,w,h], position [x,y] m nullable, predicted [x,y][] m |
| navigation | mapping/localized/nav2, status, goal nullable |

Camera URL dùng cùng origin absolute path hoặc HTTP(S); không chấp nhận script URL. Dùng stream URL không có embedded secrets. LIVE provider không dùng camera capability của depth để suy ra RGB. Frame live phải còn mới ≤5 s, sai lệch đồng hồ ±5 s; mất WS/error sẽ xóa dữ liệu UI.

Top view chỉ vẽ track có `position` trong robot frame. Không suy ra bearing từ khoảng cách hoặc ID. Đường dự đoán dùng đúng tọa độ `predicted`; không tạo trajectory cho track thiếu dữ liệu.

WebSocket phát khoảng 2 Hz, kiểm tra Origin theo CORS allowlist. CLI client không có Origin được phép đọc. Incoming text được bỏ qua, không phải lệnh. Binary frame không được hỗ trợ. Retry frontend 3 s, không tự resume motion.

## Demo settings

`GET /api/settings` → DemoSettings, `PUT /api/settings` nhận cùng object hoặc các default hợp lệ. Xem schema đầy đủ trên Swagger.

```bash
curl http://localhost:8000/api/settings
curl -X PUT http://localhost:8000/api/settings \
  -H 'Content-Type: application/json' \
  -d '{"robotName":"Lab Demo","maxSpeed":0.8,"safetySpeed":0.8,"commandTimeout":0.5,"watchdogTimeout":1.0}'
```

PUT thành công: `{"saved":true,"scope":"demo_only","hardware_changed":false}`. Lỗi validation trả 422, mode live hoặc motion không chắc stopped trả 423, lỗi lưu/đọc file trả 503. Named volume giữ dữ liệu khi recreate/down thông thường. UI demo không tự gọi API settings; nó lưu độc lập trong browser.

## Điều khiển chưa triển khai

POST `/api/robot/move`, `/api/robot/stop`, `/api/cmd_vel`, `/api/navigation/goal` trả 404. Không có physical STOP acknowledgment. Không tích hợp ESP32, micro-ROS, SLAM, Nav2 hay AI inference. Bổ sung endpoint điều khiển cần review giao thức an toàn riêng và test hardware; không nối trực tiếp browser vào motor driver.
