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
- PowerShell sẵn trên máy (Windows)
- Để chạy bash script (Linux/macOS): `curl`, `jq` hoặc `PowerShell`

#### Cài đặt dependencies
```bash
   cd next-js-forms #Optional nếu chưa vào root folder
   npm i
```

#### Cài đặt dependencies cho bash script (Linux/macOS)
```bash
   # Ubuntu/Debian
   sudo apt-get install curl jq powershell
   
   # macOS (cần Homebrew)
   brew install curl jq
   brew install --cask powershell
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
- PowerShell available on the machine (Windows)
- For bash script (Linux/macOS): `curl`, `jq`

#### Install dependencies
```bash
cd next-js-forms # Optional if not already in the root folder
npm install
```

#### Install dependencies for bash script (Linux/macOS)
```bash
   # Ubuntu/Debian
   sudo apt-get install curl jq powershell
   
   # macOS (requires Homebrew)
   brew install curl jq
   brew install --cask powershell
```

#### Using ETL config generation script

**PowerShell (Windows)**:
```powershell
   .\scripts\generate-etl-configs.ps1 -TableName "MY_TABLE" -registryUrl "http://localhost:8081"
```

**Bash (Linux/macOS)**:
```bash
   chmod +x scripts/generate-etl-configs.sh
   ./scripts/generate-etl-configs.sh "MY_TABLE" "http://localhost:8081"
   
   # With debug mode
   VERBOSE=1 ./scripts/generate-etl-configs.sh "MY_TABLE"
```

#### Protocol Notes
- **Local**: Use HTTP
- **Remote/Public**: Use HTTPS