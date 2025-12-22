const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      return `${name.replace(/([A-Z])/g, " $1").trim()} is required`
    }

    switch (name) {
      case "schemaRegistryUrl":
        if (!patterns.schemaRegistryUrl.test(value)) {
          return "Enter a valid URL with port (e.g., localhost:8080 or 192.168.1.1:9092)"
        }
        break
      case "tableName":
        if (!patterns.tableName.test(value)) {
          return "Table name must start with a letter or underscore and contain only alphanumeric characters and underscores"
        }
        break
    }
    return ""
}

export default validateField

  const patterns = {
    schemaRegistryUrl:
      /^(https?:\/\/)?(localhost|[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}|[a-zA-Z0-9.-]+)(:\d{1,5})$/,
    tableName: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  }