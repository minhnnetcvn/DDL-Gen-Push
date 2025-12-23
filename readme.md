# Hướng dẫn sử dụng

## B1. Cài đặt
### Yêu cầu tối thiểu
- Node.js phiên bản 24.12 LTS trở lên

### Cài đặt dependencies
```bash
   cd next-js-forms #Optional nếu chưa vào root folder
   npm i
```

### Chú ý về giao thức
- **Local**: Sử dụng HTTP
- **Remote/Public**: Sử dụng HTTPS

## B2. Cách để thêm cấu hình

### 1. Tạo DDL
1. Truy cập trang tạo DDL
2. Nhập **Schema URL**
3. Nhập tên bảng, tên bảng cần trùng với Schema URL và không phải bảng đã có sẵn trong DDL.
4. Nhấn **Generate**

### 2. Chỉnh sửa cấu hình
- Chỉnh sửa **tên cột**, **kiểu dữ liệu** và **kiểu aggregate**
- **Lưu ý**: Các dữ liệu dimension phải giữ nguyên, **Aggregate Type phải để là None**

### 3. Cấu hình DB
1. Mặc định hệ thống sử dụng cấu hình của máy Tech Lead hoặc ứng với Postgres SQL đang sử dụng tại máy
2. Nếu cần thay đổi, nhập các thông tin sau:
   - **Host**: Địa chỉ server
   - **Cổng**: Port kết nối
   - **Username**: Tên đăng nhập
   - **Password**: Mật khẩu
   - **Database**: Tên cơ sở dữ liệu

3. Ấn Submit để đẩy cấu hình của gold & silver layer lên DB.

## B3. Cách để xem và xóa cấu hình

1. Chọn **Explorer**
2. Chọn phần **cấu hình**

### 1. Nhập cấu hình chứa table dữ liệu
- **Host**: Địa chỉ host DB
- **Port**: Cổng
- **Username**: Tên đăng nhập
- **Password**: Mật khẩu
- **DB**: Tên cơ sở dữ liệu
- **Table Name**: Tên bảng

### 2. Lọc cấu hình bảng
1. Nhập **table name**
2. Chọn **cấu hình layer** (Silver, Gold hoặc cả hai)
3. Ấn **Tìm kiếm**

### 3. Xóa cấu hình
1. Click vào **ID** của cấu hình cần xóa
2. Hệ thống hiển thị box xác nhận

## B4. Update Cấu hình bảng

### 1. Truy cập trang Update
1. Chọn **Explorer**
2. Chọn phần **cấu hình**
3. Tìm cấu hình bảng cần cập nhật

### 2. Chỉnh sửa thông tin
- Cập nhật các dữ liệu trong bảng

### 3. Lưu thay đổi
1. Ấn **Save Configuration** để lưu cấu hình
2. Hệ thống đẩy cấu hình cập nhật lên DB
3. Xác nhận hoàn tất cập nhật

