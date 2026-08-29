# Base de Conocimiento AuditorIA - FleetDM + Osquery (Windows)

## SECCION 0: GUIA RAPIDA PARA EL AGENTE

### Reglas de Decision
1. Consulta individual: ejecutar_en_fleet(query="SELECT ...")
2. Multiples consultas: ejecutar_en_fleet(queries=[...], descriptions=[...]) - Maximo 4
3. Politica: crear_politicas(name, query, description, resolution, platform="windows")
4. NUNCA inventes tablas. Solo usa las de la SECCION B.
5. Si una consulta devuelve vacio, reporta inconsistencia.
6. Responde conciso: primero resultado, luego explicacion.

### QUERIES PARA REPORTE EJECUTIVO
queries: [
  "SELECT s.hostname, s.hardware_model, s.cpu_brand, s.physical_memory, v.name as os_name, v.version as os_version FROM system_info s, os_version v",
  "SELECT firewall, antivirus, autoupdate FROM windows_security_center",
  "SELECT name, display_name, status FROM services WHERE status='running' LIMIT 20",
  "SELECT name, version, publisher FROM programs ORDER BY name LIMIT 20"
]
descriptions: ["Hardware y SO", "Estado de seguridad", "Servicios activos", "Software instalado"]

---

## SECCION A: POLITICAS EN FLEET

### Regla de Pasa/Falla
- FALLA: La consulta SQL SI devuelve resultados (alerta)
- PASA: La consulta SQL NO devuelve resultados (todo bien)

---

## SECCION B: TABLAS OSQUERY DISPONIBLES

### HARDWARE E INVENTARIO

#### system_info (informacion del hardware)
```sql
SELECT hostname, computer_name, hardware_vendor, hardware_model, hardware_serial, hardware_version FROM system_info;
```

#### os_version (sistema operativo)
```sql
SELECT name, version, build, platform, platform_like FROM os_version;
```

#### cpu_info (procesador)
```sql
SELECT brand, brand_id, cores, logical_cores, physical_cores, speed FROM cpu_info;
```

#### memory_info (memoria RAM)
```sql
SELECT total, free FROM memory_info;
```

#### disk_info (discos)
```sql
SELECT device, name, type, size, model FROM disk_info;
```

#### battery (bateria laptops)
```sql
SELECT manufacturer, chemistry, designed_capacity, full_capacity, cycle_count, state, health FROM battery;
```

### SEGURIDAD

#### windows_security_center (estado de seguridad)
```sql
SELECT firewall, antivirus, autoupdate, user_accounts_control FROM windows_security_center;
```

#### windows_security_products (productos de seguridad instalados)
```sql
SELECT name, type, state, state_ex, signing_status FROM windows_security_products;
```

#### bitlocker_info (cifrado de disco)
```sql
SELECT device_id, protection_status, encryption_method, percentage_encrypted FROM bitlocker_info;
```

### REDES

#### listening_ports (puertos abiertos)
```sql
SELECT pid, port, protocol, address, family, socket FROM listening_ports WHERE pid != 0;
```

#### interface_addresses (interfaces de red)
```sql
interface, address, mask, broadcast, mac FROM interface_addresses;
```

#### routes (tabla de rutas)
```sql
SELECT destination, netmask, gateway, flags, interface FROM routes;
```

#### arp_cache (tabla ARP)
```sql
SELECT address, mac, interface FROM arp_cache;
```

### SOFTWARE

#### programs (software instalado)
```sql
SELECT name, version, install_location, publisher, uninstall_string FROM programs ORDER BY name;
```

#### chrome_extensions (extensiones Chrome)
```sql
SELECT name, version, profile, description, path FROM chrome_extensions;
```

#### firefox_addons (extensiones Firefox)
```sql
SELECT name, version, description, path FROM firefox_addons;
```

### PROCESOS Y SERVICIOS

#### processes (procesos en ejecucion)
```sql
SELECT pid, name, path, cmdline, user, resident_size, phys_footprint FROM processes ORDER BY phys_footprint DESC;
```

#### services (servicios Windows)
```sql
SELECT name, display_name, status, start_type, path, user_name FROM services;
```

#### scheduled_tasks (tareas programadas)
```sql
SELECT name, action, path, enabled, last_run_time FROM scheduled_tasks WHERE enabled=1;
```

### DISPOSITIVOS USB

#### usb_devices (dispositivos USB conectados)
```sql
SELECT name, vendor, model, serial, removable FROM usb_devices;
```

#### usb_device_options (opciones USB adicionales)
```sql
SELECT name, model, manufacturer, serial FROM usb_device_options;
```

### USUARIOS Y CUENTAS

#### users (usuarios del sistema)
```sql
SELECT uid, gid, uid_signed, username, description, directory, shell, uuid FROM users;
```

#### groups (grupos del sistema)
```sql
SELECT gid, gid_signed, name FROM groups;
```

#### logged_in_users (sesiones activas)
```sql
SELECT user, tty, pid, uid, host, time, type FROM logged_in_users;
```

### EVENTOS

#### windows_events (eventos de Windows)
```sql
SELECT time, channel, provider_name, event_id, data FROM windows_events WHERE channel='Security' LIMIT 50;
```

#### logged_in_user_sessions (sesiones detalladas)
```sql
SELECT user, type, uid, pid, tty, host, time, sid FROM logged_in_user_sessions;
```
