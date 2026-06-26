# WebLogic Deployer para VS Code

Extensión para automatizar el ciclo de vida de despliegue de aplicaciones Java J2EE hacia servidores WebLogic 15 (locales o remotos). Permite compilar proyectos con Maven y gestionar el despliegue de artefactos (`.war` o `.ear`) directamente desde Visual Studio Code.

## Características y Uso

Las operaciones de despliegue se realizan sobre el proyecto activo (leyendo el `pom.xml` y la carpeta `target`) y se comunican a través de la API REST de administración de WebLogic.

- **Build & Deploy:** Empaqueta el aplicativo con Maven y realiza el despliegue en WebLogic, posteriormente abre el navegador con el contexto.
- **Deploy:** Realiza únicamente el despliegue del artefacto (`war` o `ear`) del proyecto activo.
- **UnDeploy:** Elimina el despliegue (undeploy) del aplicativo en el servidor WebLogic.
- **Configurar Servidores:** Interfaz para registrar múltiples servidores WebLogic globalmente en el IDE.

## Ejecucion 
- Comandos  `Shift + Alt + P`
- Botones  
![image](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG0AAAAmCAYAAADOZxX5AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAlMSURBVHhe7Zn9c1TVGcc/995NgtngQgRkodEkJSQBYgyClJchJgGjBoOoTBGrCGXUqR1G5B/wH/BlGGeqjgN1fBloaNMBS6UUaFFK5KUBEYiGSZAogSiBQBayZM+9/eHeszl78kJCVsbt7Hfmzp77vJ3n5bzds0ZwwkSHJBIKpk5I4uePZNESEMmiJSCSRUtAJIuWgEgWLQGRLFoCIlm0BIQxZeq05Md1gsFI3ogkHpLLYwIiOdNuFfz5VD/9CHkZEPpmOx988jUhXWaQuOVFs8bfR9WDM8jNTMcyAVsQam/mi+3bqP9Rl/7/Qe5Dv6Nc1PLeLqhcuZS0fevZ2qBLDQ63sGjp5FUuo7owhaa6f7Dv2BnaQgLSAtxV8jCPF1/gL+/s5IyulogYM5/Vz95HQKcPhEuH2bhhL+06vQ8YLyzIc5ryXyDvmzeoPa6zh4fA1EdZumASAQvEdYHV3czfPtxGQ691IUj5b6tJ+fQddnyv8+IAM5OSxY9RenfAnd3XLtBY9wlb6weTopuEeS/LV49lz7s7adV5KiYu5MV5P/D25iM6p1+YGWXL+FUm+Hw6a3jIvH8ZK8v8HPvTBmqPdQxQMIBWLl5O5/YxOj0eCFK+cgVzU79i8x/e4LXX3+CtvzaQMWcFq8uCunD8YEN3RoDxOl3HmAB+WycODPPPn18mY0jz+MawpjzGs7MtDm76O+3FT7DkrnNs/XAbDeRT/fxa1r2ylhcX5eNXlUyIRFRCfJA2o5SSa/vYuPkArWGXFm49wMd/3Ee4uJQZt+ka8cJ5Lnf6oufzaUvWsmRq7zamj9Cl81GtwcD8fUUWFvFNmDh1mJOd4yh6fBnVE8+xddN2GkNQUFHJuG+38OZbW2i+s5KKAk/BzCd7/AXa4ro0WmTmTmPBlCBtp472PqmFDvDBm5s4dE1nxA/dIp3Rd7rtFF/Paqa2g5npRIY601573V0y4rqfXW9hR10zfnE2WrAo7AhCGyGZc2aR23acQ5diyMNAOiVLX2LlgmJSrxzh4HFvinkITC5j+QtrWPfKWta9vIYXn32EaXFebaCVi50ppNzoS9hM4Wr7gLteL9zI5M2jM0RoRBoZyl7ZsGsvFyYtY93Ly8g5v4NdDWBlLeTxGT7q/3WY2NTePNJmVFOeUsfb735Ebe2emH00WLGK1YvuJei3XIJp4R+TT+XKVZRP7JGLC+wb79PjR6XTPdSZBllUPv80szJ01jDx7W62n7qd8meepESO4tARar3DwNuffE1X1kJWPpFL2/ZN7B7aYBsQU3KCtJ480HtJvHshi4s9Z+wO6jev5+MDbQgAM0DJQ2XE82jScSU8iJkW5uplnTgwTH/JXAqvt9DYqbOGh7xFL7E0+yr1jT5K1cJ5sLyC+cLpWClXY5nDRMeVMOmZvdOfW5jnHn7sDupr3md3q6D1P5vYLAsXKGR6jq5187jW3dWnHz0IMjqji2tdOn1gmE+VpvPlzsF91A0K/knMuj+HCy1nESkQOlzDxn3EFM4tWBZNNR9Q3yEQQjcyPDQdPQlFD1M1OXakBEamAdC69yNOTl7BkiIoWbyCwuYtfN4KkEb67TEqw0L7lTA+b6Z1R3oOe2o7xQoTGuJebhU6ra9+2tSt028aBYt+w0y+ZN/+AxwLF7C4qggu2QTvnEB2cRbOtWwqqybSUvM+B8dV82jueT7b2cjFeN7LdJ7m6x9HUbzgYR6cP5s5s2fzi6t1NKdOp3Csj5HZMykKjuBKcx3tYx9gzpyZZI8ECNN69CCNQ0xifxBj8imdeJ39J87R1lBHww8uvac9iemlAX747ATnNN2BYJ3tuu1VnTgc/NjwBf/9fjSVzz1HwbcbqfmugKp5E2jasZ4tp39Jxdw7iERGMzqYw6x8g/01tXzVa/MZPrrbT3PsUB3797vPifNwsXsUxVPGkerJdDTX0X7HbHKie24De/7ZRIdiZ1joHkX+7Mn4z5ygpbP3qAxMf4D5Gd+x92gLQ/nyiP/dY2oWlc88SdaZLWz8NxTmhfjquLb4mkHKfz2X0M4tfHGLL4mDFatY7h1GxKU2OtPHEUiV+9wGdsf1WxH8Ux7lqYXuVZ4O0XGKTzf1d0vUP+JetIIla5jXWcvGnS3kLVnDvMs1vLcrjkfDOCAwuYyqsiL32G8LQuePsWv7HhrjNsV+WsS9aEn89LjRV0QSP0Mki5aAMCqqFjmO7WCYbv0cx8EwAAyvbQByBZU0t+3S3V/HwaODY7vyhukSHNtlqnbBlfea0XdwabKtQtJj+vLatu1gyv48mmGY2EJElQzTwLbdmOTjOOodkheL7cr29NMTa++ceDF4wnpM8kXaA7x+lRx4+Ze0KL0feSPnnhLHtm3PERfSMUkzTRPbdoPrUe4JQO3MNE0ikQimNwh0WWlD2tf7BqI0qWfbNpZlReWlTZUvfVTp8lf1X9eT75Jn23ZUR/UvNqGx8ZhKwoUQ0Xc9j3ixS/uqj6pfaj/SbzUGUxeSzsqOHMchEolEjanFkHz5axhGjNMoAar9yLaabFXGNM2YIliWe17WfRVC4DhOlN9XgtTApS9qIiRf0qWOfJdt6Yd8tywraicSiWDbdlRe9g1gWVaMH4aX477yIeNRfZBt6a/36zqOl8S+Eij5uiGVJ52TepKOlmwAn/I3uaqjwvFGo2yrfqmJkzwVcjAYMcugKydlpR2UQSKLImmqnN6PECLGD5RBoz7Cu6NT+5U2pb46QA0vr+oAUvUBjOyiex2pjDYNUUa0HB3SsO0tWbIz2Yk+KwzDIMPvZ8SINFJT5F2ECymLsiSqdlEGitqWPoavhwmHr3Ols+e2W9qQkH7r8anJ0H3ury0LKYTA5/NF6TIvsl85YGxv8Mj8qfz+IGOU+mrMyL7umnqP05fTsji68zJYvIB9Ph+RSCSaaOmkxLixYzEMg66urhh7aiGkczLB6Gu4NpCkvOXzYXm8Sx0dUfvykTZlfypfjUMIEVM4GbuMR02ihKqv8lS63o+j7L+qX6pvkqYXVtKEEJiqs6qgoUxttfO+AlGTjTeDTNPE7/cjhKCry/3vQQYmZaWjMgjV6e5u9xLbcRyEEAghYopoGAYiEiEcDmOaJmmpqdjK8q7aV/cK6bfalzrjJV/Gq8oZyiDAi8dRCqHK60WUdDXf6hIraaa3TEu70hdTWSH+B1vnZzwbC04IAAAAAElFTkSuQmCC)
- Atajos de Teclado

## Atajos de Teclado (Shortcuts)

Para agilizar el flujo de trabajo, se han configurado atajos de teclado utilizando un acorde de teclas. Primero debes presionar `Alt + W` (o `Cmd + Alt + W` en Mac), soltar, y luego presionar la letra correspondiente a la acción:

| Comando | Windows / Linux | macOS |
| :--- | :--- | :--- |
| **Build & Deploy** | `Alt + W`, luego `B` | `Cmd + Alt + W`, luego `B` |
| **Deploy** | `Alt + W`, luego `D` | `Cmd + Alt + W`, luego `D` |
| **UnDeploy** | `Alt + W`, luego `U` | `Cmd + Alt + W`, luego `U` |
| **Configurar Servidores** | `Alt + W`, luego `C` | `Cmd + Alt + W`, luego `C` |

*Nota: Los comandos de despliegue solo se activan si tienes un proyecto abierto en el espacio de trabajo.*

## Configuración de Servidores

Puedes configurar uno o más servidores WebLogic ejecutando el comando **WebLogic: Configurar Servidores** (o usando su atajo de teclado). 

La configuración acepta el parámetro `target` para especificar a qué servidor o clúster se va a desplegar (el valor por defecto es `AdminServer`).

Ejemplo de configuración en tu `settings.json`:

```json
"weblogic.servers": [
    {
        "name": "Servidor Desarrollo",
        "host": "192.168.1.100",
        "port": 7001,
        "username": "weblogic",
        "password": "password123",
        "target": "AdminServer",
        "isDefault": true
    },
    {
        "name": "Cluster Pruebas",
        "host": "10.0.0.50",
        "port": 7001,
        "username": "weblogic",
        "password": "password123",
        "target": "TestCluster",
        "isDefault": false
    }
]
```




# Guía de Compilación, Empaquetado e Instalación

Si estás desarrollando o modificando el código fuente de esta extensión, sigue estos pasos para prepararla, empaquetarla y usarla:

## 1. Instalación de Dependencias

Asegúrate de estar en la raíz de tu proyecto en la terminal y ejecuta los siguientes comandos para instalar las dependencias necesarias:


 

```bash
# Instalar dependencias base del proyecto
npm install

# Instalar la librería para parsear el archivo pom.xml
npm install fast-xml-parser

# Instalar la herramienta oficial de empaquetado de VS Code (vsce) globalmente
npm install -g @vscode/vsce

```

## 2. Compilación y Corrección de Formato (Lint)

Es común que el linter de VS Code (ESLint) detecte advertencias por reglas de estilo (como faltas de llaves `{}` en condicionales `if`). Para corregir el código automáticamente antes de compilar, ejecuta:

```bash
npm run lint -- --fix

```

## 3. Empaquetado

Asegúrate de tener un campo `publisher` configurado en tu archivo `package.json` y de haber guardado tu archivo `README.md`. Para generar el archivo instalable de la extensión, ejecuta:

```bash
vsce package

```

Esto creará un archivo con la extensión `.vsix` en tu directorio actual (por ejemplo, `weblogic-deployer-0.0.1.vsix`).

## 4. Instalación

Puedes instalar el archivo `.vsix` recién generado de dos formas:

### Opción A: Vía Terminal

Ejecuta el siguiente comando apuntando al archivo generado:

```bash
code --install-extension weblogic-deployer-0.0.1.vsix

```

### Opción B: Vía Interfaz Gráfica (VS Code)

1. Ve a la vista de **Extensiones** en VS Code presionando `Ctrl+Shift+X`.
2. Haz clic en el menú de los tres puntos (`...`) ubicado en la esquina superior derecha del panel de extensiones.
3. Selecciona la opción **"Install from VSIX..."**.
4. Localiza en tu sistema el archivo generado y selecciónalo para instalar.


