# Hướng dẫn sử dụng - Manual
- [Vietnamese](#cài-đặt)
- [English](#installation)


## Cài đặt
### Chạy bằng Docker
#### Yêu cầu
- Docker Desktop

#### Cài đặt
- Tải file [docker-compose](https://github.com/minhnnetcvn/DDL-Gen-Push/blob/main/docker-compose.yml) về máy

```bash
   # Cần chắc chắc là bạn đang ở cùng folder với file docker-compose-yml
   docker-compose up
```

Truy cập địa chỉ `localhost:3000` và sử dụng

### Local
#### Yêu cầu
- Node.js phiên bản 24.12 LTS trở lên
- PowerShell sẵn trên máy (Windows)
- Để chạy script trên (Linux/macOS): `curl`, `jq` hoặc `PowerShell`

#### Cài đặt dependencies
```bash
   cd next-js-forms #Optional nếu chưa vào root folder
   npm i
```

#### Build project
```bash
   npm run build
```

#### Cài đặt dependencies cho bash script (Linux/macOS)
```bash
   # Ubuntu/Debian
   sudo apt-get install curl jq powershell
   
   # macOS (cần Homebrew)
   brew install curl jq
   brew install --cask powershell
```

#### Cấu hình ENV
Tạo file `.env.local` dựa trên template `env template.txt` tại thư mục gốc của project:

```env
DEFAULT_IP_ADDRESS_KAFKA="10.8.75.69"
DEFAULT_DB_HOST="10.8.75.82"
DEFAULT_DB_PORT="5432"
DEFAULT_DB_USER="postgres"
DEFAULT_DB_PASSWORD="postgres"
DEFAULT_DB_NAME="postgres"
DEFAULT_DB_TABLE="etl_table_config"
DEFAULT_DB_SCHEMA="public"
SHELL_USED="powershell"
```

**Giải thích các biến:**
- `DEFAULT_IP_ADDRESS_KAFKA`: Địa chỉ IP của server Kafka
- `DEFAULT_DB_HOST`: Địa chỉ host của database PostgreSQL
- `DEFAULT_DB_PORT`: Cổng kết nối database (mặc định: 5432)
- `DEFAULT_DB_USER`: Tên user đăng nhập database
- `DEFAULT_DB_PASSWORD`: Mật khẩu đăng nhập database
- `DEFAULT_DB_NAME`: Tên database cần kết nối
- `DEFAULT_DB_TABLE`: Tên bảng lưu trữ cấu hình ETL
- `DEFAULT_DB_SCHEMA`: Schema của database (mặc định: public)
- `SHELL_USED`: Shell được sử dụng cho script (`powershell` hoặc `bash`)

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

#### Build project
```bash
npm run build
```

#### Install dependencies for bash script (Linux/macOS)
```bash
   # Ubuntu/Debian
   sudo apt-get install curl jq powershell
   
   # macOS (requires Homebrew)
   brew install curl jq
   brew install --cask powershell
```

#### Environment Configuration
Create a `.env.local` file based on the `env template.txt` template in the project root directory:

```env
DEFAULT_IP_ADDRESS_KAFKA="10.8.75.69"
DEFAULT_DB_HOST="10.8.75.82"
DEFAULT_DB_PORT="5432"
DEFAULT_DB_USER="postgres"
DEFAULT_DB_PASSWORD="postgres"
DEFAULT_DB_NAME="postgres"
DEFAULT_DB_TABLE="etl_table_config"
DEFAULT_DB_SCHEMA="public"
SHELL_USED="powershell"
```

**Variable Descriptions:**
- `DEFAULT_IP_ADDRESS_KAFKA`: IP address of the Kafka server
- `DEFAULT_DB_HOST`: Host address of PostgreSQL database
- `DEFAULT_DB_PORT`: Database connection port (default: 5432)
- `DEFAULT_DB_USER`: Database login username
- `DEFAULT_DB_PASSWORD`: Database login password
- `DEFAULT_DB_NAME`: Database name to connect
- `DEFAULT_DB_TABLE`: Table name for storing ETL configuration
- `DEFAULT_DB_SCHEMA`: Database schema (default: public)
- `SHELL_USED`: Shell used for scripts (`powershell` or `bash`)

---

## Usage Notes

#### Protocol Considerations
- **Local**: Use HTTP
- **Remote/Public**: Use HTTPS

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