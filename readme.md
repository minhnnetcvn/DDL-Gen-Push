# Hướng dẫn sử dụng - Manual
- [Vietnamese](#cài-đặt)
- [English](#installation)


## Cài đặt
### Chạy bằng Docker (Khuyến nghị)
#### Yêu cầu
- Docker Desktop

#### Cài đặt
- Tải file [docker-compose](https://github.com/minhnnetcvn/DDL-Gen-Push/blob/main/docker-compose.yml) về máy

```bash
   # Cần chắc chắc là bạn đang ở cùng folder với file docker-compose-yml
   docker-compose up
```

Truy cập địa chỉ `localhost:3000` và sử dụng

### Local (Không khuyến nghị)
#### Yêu cầu
- Node.js phiên bản 24.12 LTS trở lên
- Powershell sẵn trên máy

#### Cài đặt dependencies
```bash
   cd next-js-forms #Optional nếu chưa vào root folder
   npm i
```

#### Chú ý về giao thức
- **Local**: Sử dụng HTTP
- **Remote/Public**: Sử dụng HTTPS

---

## Installation

### Run with Docker (Recommended)

#### Requirements
- Docker Desktop

#### Setup
- Download the [docker-compose file](https://github.com/minhnnetcvn/DDL-Gen-Push/blob/main/docker-compose.yml)

```bash
# Make sure you are in the same directory as the docker-compose.yml file
docker-compose up
```

Access the application at `http://localhost:3000` and start using it.

---

### Local (Not Recommended)

#### Requirements
- Node.js version **24.12 LTS or higher**
- PowerShell available on the machine

#### Install dependencies
```bash
cd next-js-forms # Optional if not already in the root folder
npm install
```

#### Protocol Notes
- **Local**: Use HTTP
- **Remote/Public**: Use HTTPS