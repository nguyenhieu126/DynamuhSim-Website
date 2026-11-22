# Kiến trúc PBL6 Console

Frontend và backend là hai ứng dụng độc lập. Nginx chỉ phục vụ production assets, SPA fallback và reverse proxy; không có kết nối trực tiếp browser → motor/ESP32.

## Nguồn dữ liệu

`RobotDataProvider` có subscribe/unsubscribe và requestStop. DemoProvider tạo local Snapshot. RobotContext giữ lịch sử tối đa 7.200 mẫu (một giờ ở 2 Hz), command state, mode và ownership. Chuỗi IMU/chart dùng dữ liệu đã nhận; time-range filter không tạo lịch sử giả. Đơn vị và ngữ nghĩa measured/commanded/estimated được hiển thị ở UI.

LiveProvider kiểm tra schema runtime, nguồn, timestamp, REST HTTP failure, timeout và WebSocket disconnect. Khi dữ liệu không còn tin cậy, context xóa snapshot và lịch sử; panel hiển thị N/A/empty. Tự reconnect chỉ phục hồi đọc dữ liệu. Không có movement/STOP endpoint xác minh nên UI không giành quyền điều khiển live.

## State và quyền điều khiển

- DEMO: nguồn local simulation; ownership có thể là manual, autonomous hoặc null.
- CONNECTING/OFFLINE: lifecycle của nguồn LIVE.
- STOPPED/MANUAL/AUTONOMOUS/FAULT: có thể nhận từ RobotStatus backend thật trong tương lai.
- `owner` là một giá trị duy nhất, không có hai boolean cho manual/autonomous. Đổi quyền luôn xóa demo command.
- Manual demo giữ phím tạo heartbeat 100 ms, watchdog 500 ms. Route cleanup, blur/visibility/release đều xóa command. Kinematics Mecanum dùng r=0.048 m, (L+W)/2=0.31 m. RPM hiển thị là simulated feedback, không phải đo thực tế.
- Goal demo được staged cục bộ và gắn nhãn minh họa; map path static tách từ Stitch, không tuyên bố path planner đang chạy.
- STOP requested và physical acknowledgment tách riêng. Provider LIVE luôn reject STOP khi chưa có endpoint; demo chỉ xác nhận thay đổi UI.

## Backend và settings

`create_app(Settings(...))` cho phép test/config độc lập. API và WS dùng cùng RobotService/snapshot schema. RobotService hiện không import ROS hoặc driver. Chế độ live trả `source=unavailable`, telemetry null và motion unknown. `ROSBridge` là Protocol đọc dữ liệu chưa nối vào service; thay adapter sau khi đã xác minh.

DemoSettings có validation khoảng giá trị và invariant: autoStop=true, command timeout < watchdog, safety speed ≤ max speed. SettingsStore dùng tempfile + fsync + atomic replace, giữ file lỗi để chẩn đoán. Chỉ demo API có thể ghi; live/moving/unknown bị khóa. UI settings là localStorage, độc lập API store; các tham số không truyền đến robot hoặc thay đổi watchdog UI hiện tại.

## Giao diện và bảo trì

Các primitive common dùng chung; page chỉ ghép camera/map/chart/table/robot cards. CSS variables điều khiển sáng/tối; không copy full HTML, không iframe. SVG asset tách từ Stitch có normalize SVG attribute casing để dùng như XML. Font và ảnh được bundle nên DEMO sau build dùng offline.

Các adapter tương lai cần bổ sung: occupancy-grid/path thật, stream ownership, device health, per-topic freshness; hiện LIVE map cố ý unavailable. Nếu telemetry không đầy đủ, adapter phải trả unavailable thay vì bù bằng dữ liệu mô phỏng.

## Docker

Build frontend bằng Node → Nginx, backend Python slim chạy non-root. Service networking `backend:8000`, loopback host bindings, healthcheck cả hai service, named volume demo settings. Build context chỉ từng ứng dụng, không gồm screenshot/reference, dataset, ROS bag hay model. Runner không prune và không xóa volume.

Trước deployment ngoài localhost cần thiết kế authentication, authorization, HTTPS/WSS, rate limiting, command audit và threat model theo deployment thực tế. Các điều này chưa được tuyên bố hoàn thành.
