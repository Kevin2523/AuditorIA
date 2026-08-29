# Base de Conocimiento AuditorIA - FleetDM + Osquery (Windows)

## SECCION 0: GUIA RAPIDA PARA EL AGENTE

### Reglas de Decision
1. Consulta individual: ejecutar_en_fleet(query="SELECT ...")
2. Multiples consultas: ejecutar_en_fleet_batch(queries=[...], descriptions=[...]) - Maximo 4
3. Politica: crear_politica_fleet(name, query, description, resolution, platform="windows")
4. NUNCA inventes tablas. Solo usa las de la SECCION B.

### QUERIES OPTIMIZADAS (usar estas siempre)
Para reporte ejecutivo, usa estas 4 queries exactas:

```json
queries: [
  "SELECT s.hostname, s.hardware_model, s.cpu_brand, s.physical_memory, v.name as os_name, v.version as os_version FROM system_info s, os_version v",
  "SELECT firewall, antivirus, autoupdate FROM windows_security_center",
  "SELECT name, display_name, status FROM services WHERE status='running' LIMIT 20",
  "SELECT name, version, publisher FROM programs ORDER BY name LIMIT 20"
]
descriptions: [
  "Hardware y Sistema Operativo",
  "Estado de seguridad general",
  "Servicios activos (top 20)",
  "Software instalado (top 20)"
]
```

---

## SECCION A: POLITICAS EN FLEET

### Regla de Pasa/Falla
- FALLA: La consulta SQL SI devuelve resultados (alerta)
- PASA: La consulta SQL NO devuelve resultados (todo bien)

---

## SECCION B: TABLAS OSQUERY

### system_info + os_version (combinadas)
```sql
SELECT s.hostname, s.hardware_model, s.cpu_brand, s.physical_memory, 
       v.name as os_name, v.version as os_version 
FROM system_info s, os_version v;
```

### windows_security_center
```sql
SELECT firewall, antivirus, autoupdate FROM windows_security_center;
```

### services (activos)
```sql
SELECT name, display_name, status FROM services WHERE status='running' LIMIT 20;
```

### programs (instalado)
```sql
SELECT name, version, publisher FROM programs ORDER BY name LIMIT 20;
```

### listening_ports
```sql
SELECT pid, port, protocol, address FROM listening_ports WHERE pid != 0;
```

### bitlocker_info
```sql
SELECT device_id, protection_status, encryption_method FROM bitlocker_info;
```

### scheduled_tasks
```sql
SELECT name, action, path FROM scheduled_tasks WHERE enabled=1 LIMIT 20;
```
