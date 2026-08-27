# Base de Conocimiento AuditorIA - FleetDM + Osquery (Windows)

## SECCION 0: GUIA RAPIDA PARA EL AGENTE

### Reglas de Decision (TRIAGE)

**OPCION A: CONSULTAS EN VIVO (Live Queries)**
- El usuario quiere saber el estado actual, buscar algo, listar procesos, ver puertos, etc.
- Accion: Ejecutar `ejecutar_en_fleet` con la SQL correspondiente.

**OPCION B: CREACION DE POLITICAS (Cumplimiento)**
- El usuario quiere crear una regla permanente, prohibir algo, auditar de forma continua.
- Accion: Ejecutar `crear_politica_fleet` con los 5 parametros obligatorios.

### Reglas Operativas Criticas
1. Para reportes ejecutivos, reutiliza resultados previos de la sesion antes de volver a consultar.
2. Si una consulta devuelve vacio, no asumas 0 hosts. Reporta la inconsistencia.
3. NUNCA inventes tablas o columnas. Usa solo las de la SECCION B.
4. Para listar hosts, usa: `SELECT hostname, hardware_model, cpu_brand, physical_memory FROM system_info;`
5. Si una herramienta falla, reporta el error claramente.

### Recetas Rapidas
| Tarea | SQL |
|-------|-----|
| Inventario de hosts | `SELECT hostname, hardware_model, cpu_brand, physical_memory FROM system_info;` |
| Version de Windows | `SELECT name, version, build, arch FROM os_version;` |
| BitLocker | `SELECT device_id, protection_status, encryption_method FROM bitlocker_info;` |
| Seguridad | `SELECT firewall, antivirus, autoupdate FROM windows_security_center;` |
| Productos seguridad | `SELECT type, name, state, signatures_up_to_date FROM windows_security_products;` |
| Servicios criticos | `SELECT name, display_name, status, start_type FROM services;` |
| Puertos escucha | `SELECT pid, port, protocol, address FROM listening_ports;` |
| Tareas programadas | `SELECT name, action, path, enabled, state FROM scheduled_tasks;` |
| Procesos activos | `SELECT pid, name, path, cmdline FROM processes;` |
| Usuarios | `SELECT uid, username, description, shell, directory FROM users;` |
| Software instalado | `SELECT name, version, install_time, uninstall_string FROM programs;` |
| Chrome | `SELECT name, version FROM programs WHERE name LIKE '%Chrome%';` |
| Firefox | `SELECT name, version FROM programs WHERE name LIKE '%Firefox%';` |
| Java | `SELECT name, version FROM programs WHERE name LIKE '%Java%';` |
| .NET | `SELECT name, version FROM programs WHERE name LIKE '%.NET%';` |

### Guia de Reportes Ejecutivos
1. Resume la evidencia confirmada primero.
2. Separa hallazgos, riesgos y recomendaciones.
3. Si faltan datos, dilo claramente.
4. Si ya hubo una consulta exitosa, no concluyas 0 hosts sin explicar.

---

## SECCION A: LOGICA DE POLITICAS EN FLEET (CUMPLIMIENTO)

### Regla de Pasa/Falla
- **FALLA**: La consulta SQL **SI** devuelve resultados (al menos 1 fila).
- **PASA**: La consulta SQL **NO** devuelve resultados (vacia).
- **ERROR**: La ejecucion falla.

### Ejemplo Correcto
Para prohibir el puerto 4444:
```sql
SELECT pid, port FROM listening_ports WHERE port = 4444;
```
Si devuelve datos = alguien usa el puerto = politica FALLA (alerta generada).

### Estructura Obligatoria de Politica
5 parametros:
1. `name`: Nombre descriptivo
2. `query`: SQL validada con tablas de la SECCION B
3. `description`: Explicacion del riesgo
4. `resolution`: Pasos para solucionar
5. `platform`: Siempre "windows"

---

## SECCION B: DICCIONARIO DE TABLAS OSQUERY (WINDOWS)

### 1. `os_version`
**Uso:** Version del SO.
**Columnas:** name, major, minor, build, platform, platform_like, codename, arch, kernel_version.
**Ejemplo:** `SELECT name, version, build, arch FROM os_version;`

### 2. `system_info`
**Uso:** Info del hardware.
**Columnas:** hostname, uuid, computer_name, hardware_model, hardware_vendor, hardware_serial, cpu_brand, cpu_physical_cores, cpu_logical_cores, physical_memory, hardware_tpu.
**Ejemplo:** `SELECT hostname, hardware_model, cpu_brand, physical_memory FROM system_info;`

### 3. `programs`
**Uso:** Software instalado (Windows).
**Columnas:** name, version, install_location, install_source, uninstall_string, language, publisher, registered_company, root, source, uid.
**Ejemplo:** `SELECT name, version, publisher FROM programs ORDER BY name;`
**Busqueda:** `SELECT name, version FROM programs WHERE name LIKE '%Chrome%';`

### 4. `services`
**Uso:** Servicios del sistema.
**Columnas:** name, display_name, status, start_type, username, pid, path, status_code.
**Valores status:** running, stopped, paused.
**Valores start_type:** auto_start, demand_start, disabled, boot_start, system_start.
**Ejemplo:** `SELECT name, display_name, status, start_type FROM services WHERE status='running';`
**Servicios criticos:** `SELECT name, status FROM services WHERE name IN ('WinDefend','MpsSvc','WSearch','Spooler');`

### 5. `listening_ports`
**Uso:** Puertos abiertos.
**Columnas:** pid, port, protocol, address, fd, socket, path.
**Ejemplo:** `SELECT pid, port, protocol, address FROM listening_ports;`
**Puerto especifico:** `SELECT pid, port, protocol FROM listening_ports WHERE port=443;`
**Filtrar sistema:** `SELECT pid, port, protocol, address FROM listening_ports WHERE pid != 0;`

### 6. `bitlocker_info`
**Uso:** Estado de cifrado BitLocker.
**Columnas:** device_id, protection_status, encryption_method, percentage_encrypted, volume_status.
**Ejemplo:** `SELECT device_id, protection_status, encryption_method, percentage_encrypted FROM bitlocker_info;`
**Deshabilitados:** `SELECT device_id, protection_status FROM bitlocker_info WHERE protection_status != 1;`

### 7. `windows_security_center`
**Uso:** Estado general de seguridad.
**Columnas:** firewall, autoupdate, antivirus, antispyware, user_accounts_control, security center settings.
**Ejemplo:** `SELECT firewall, antivirus, autoupdate FROM windows_security_center;`

### 8. `windows_security_products`
**Uso:** Productos de seguridad instalados.
**Columnas:** type, name, state, signatures_up_to_date, product_code.
**Valores type:** antivirus_spyware, firewall, web_protection.
**Ejemplo:** `SELECT type, name, state, signatures_up_to_date FROM windows_security_products;`
**Desactualizados:** `SELECT name, signatures_up_to_date FROM windows_security_products WHERE signatures_up_to_date != 1;`

### 9. `scheduled_tasks`
**Uso:** Tareas programadas.
**Columnas:** name, action, path, enabled, state, last_run_time, next_run_time, username.
**Ejemplo:** `SELECT name, action, path, enabled, state FROM scheduled_tasks;`
**Habilitadas:** `SELECT name, action, path FROM scheduled_tasks WHERE enabled=1 AND state='ready';`

### 10. `users`
**Uso:** Usuarios del sistema.
**Columnas:** uid, gid, uid_signed, gid_signed, username, description, directory, shell, uuid, user_hw_uuid.
**Ejemplo:** `SELECT uid, username, description, shell FROM users;`
**Sin shell:** `SELECT username, directory FROM users WHERE shell='';`

### 11. `processes`
**Uso:** Procesos activos.
**Columnas:** pid, name, path, cmdline, cwd, root, uid, gid, starttime.
**Ejemplo:** `SELECT pid, name, path, cmdline FROM processes;`
**Por nombre:** `SELECT pid, name, path FROM processes WHERE name='svchost.exe';`
**Consumo alto:** `SELECT pid, name, path, ROUND(rss/1024/1024,2) as rss_mb FROM processes ORDER BY rss DESC LIMIT 10;`

---

## SECCION C: FORMATO DE RESPUESTA FLEET

### Live Query (respuesta JSON)
```json
{
  "query": {"id": 1, "name": "query_name", "query": "SELECT..."},
  "results": [{"host": {"id": 1, "hostname": "LAPTOP-KEVIN"}, "rows": [{"col1": "val1"}]}],
  "stats": {"total": 1, "successful": 1, "failed": 0, "undetermined": 0}
}
```

### Politica (respuesta JSON)
```json
{
  "policy": {"id": 1, "name": "Politica Name", "query": "SELECT...", "resolution": "...", "platform": "windows", "passing_host_count": 5, "failing_host_count": 2}
}
```

---

## SECCION D: ENDPOINTS FLEET (via n8n)

### Autenticacion
```
Authorization: Bearer <FLEET_API_TOKEN>
Content-Type: application/json
```

### Endpoints Clave
| Operacion | Metodo | Endpoint |
|-----------|--------|----------|
| Live Query | POST | /api/v1/fleet/queries/run |
| Listar policies | GET | /api/v1/fleet/policies |
| Crear policy | POST | /api/v1/fleet/policies |
| Resultado policy | GET | /api/v1/fleet/policies/{id}/report |
| Listar hosts | GET | /api/v1/fleet/hosts |
| Detalle host | GET | /api/v1/fleet/hosts/{id} |
| Software | GET | /api/v1/fleet/software |
| Vulnerabilidades | GET | /api/v1/fleet/vulnerabilities |

### Crear Politica (ejemplo)
```json
POST /api/v1/fleet/policies
{
  "name": "Puerto 4444 prohibido",
  "query": "SELECT pid, port FROM listening_ports WHERE port = 4444;",
  "description": "Alerta si alguien usa el puerto 4444",
  "resolution": "Detener el proceso que usa el puerto",
  "platform": "windows"
}
```
