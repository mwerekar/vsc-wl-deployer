import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

// CREAR CANAL DE SALIDA PARA DEBUG
const outputChannel = vscode.window.createOutputChannel("WebLogic Deployer");

export function activate(context: vscode.ExtensionContext) {


    // 1. Comando: Configurar Servidores
    let configCmd = vscode.commands.registerCommand('weblogic.config', () => {
        // Abre la configuración global de VS Code filtrando por la extensión
        vscode.commands.executeCommand('workbench.action.openSettings', 'weblogic.servers');
    });

    // 2. Comando: Build & Deploy
    let buildDeployCmd = vscode.commands.registerCommand('weblogic.buildAndDeploy', async () => {
        const projectInfo = await getProjectInfo();
        const mvnOpts = await getMavenOptions();
        if (!projectInfo) { return; }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Ejecutando Maven Build.. ",
            cancellable: false
        }, async (progress) => {
            try {
                let command = 'mvn clean package';
                if (mvnOpts) {
                    command += ` ${mvnOpts}`;
                }
                await executeCommand(command, projectInfo.workspaceRoot);
                vscode.window.showInformationMessage('Build exitoso. Iniciando despliegue...');
                await performDeploy(projectInfo);
            } catch (err) {
                vscode.window.showErrorMessage(`Error en Build: ${err}`);
            }
        });
    });

    // 3. Comando: Deploy
    let deployCmd = vscode.commands.registerCommand('weblogic.deploy', async () => {
        const projectInfo = await getProjectInfo();
        if (!projectInfo) { return; }
        await performDeploy(projectInfo);
    });

    // 4. Comando: UnDeploy
    let undeployCmd = vscode.commands.registerCommand('weblogic.undeploy', async () => {
        const projectInfo = await getProjectInfo();
        if (!projectInfo) { return; }
        await performUnDeploy(projectInfo);
    });


    // 5: Comando para Ver Log en Vivo ---
    let showLogCmd = vscode.commands.registerCommand('weblogic.showLog', async () => {


        // Buscar el servidor marcado por defecto (o el primero si no hay default)
        const defaultServer = await getServer();
        let tailLines = 100;

        if (!defaultServer) {
            vscode.window.showErrorMessage('No hay servidores WebLogic configurados. Ve a los ajustes.');
            return;
        }

        if (!defaultServer.logPath) {
            vscode.window.showErrorMessage(`El servidor "${defaultServer.name}" no tiene configurada la ruta del log (logPath).`);
            return;
        }

        if (!defaultServer.logPath) {
            vscode.window.showErrorMessage(`El servidor "${defaultServer.name}" no tiene configurada la ruta del log (logPath).`);
            return;
        }
        if (defaultServer.tailLines) {
            tailLines = defaultServer.tailLines;
        }



        // Crear una terminal dedicada para el log o reutilizarla si ya existe
        const terminalName = `WebLogic Log: ${defaultServer.name}`;
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);

        if (!terminal) {
            terminal = vscode.window.createTerminal(terminalName);
        }

        terminal.show(); // Abre el panel de la terminal en el IDE

        // Construir el comando dependiendo de si usa Docker o es Local
        let logCommand = '';
        if (defaultServer.containerName && defaultServer.containerName.trim() !== '') {
            // MODO DOCKER: usar docker exec
            logCommand = `docker exec -it ${defaultServer.containerName} tail -n ${tailLines} -f ${defaultServer.logPath}`;
        } else {
            // MODO LOCAL: tail directo (compatible con Linux/Mac/Git Bash en Windows)
            // Nota: Si usas PowerShell nativo en Windows, se podría cambiar a "Get-Content -Path ... -Wait"
            logCommand = `tail -n  ${tailLines}  -f ${defaultServer.logPath}`;
        }

        // Enviar el comando a la terminal simulando que el usuario presiona Enter
        terminal.sendText(logCommand);
    });


    // Botón Build & Deploy
    const btnBuildDeploy = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    btnBuildDeploy.command = 'weblogic.buildAndDeploy';
    btnBuildDeploy.text = '$(rocket)';
    btnBuildDeploy.tooltip = 'Empaquetar y Desplegar en WebLogic';
    btnBuildDeploy.show();

    // Botón Deploy
    const btnDeploy = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    btnDeploy.command = 'weblogic.deploy';
    btnDeploy.text = '$(cloud-upload)';
    btnDeploy.tooltip = 'Desplegar en WebLogic (Sin recompilar)';
    btnDeploy.show();

    // Botón UnDeploy
    const btnUndeploy = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
    btnUndeploy.command = 'weblogic.undeploy';
    btnUndeploy.text = '$(trash)';
    btnUndeploy.tooltip = 'Remover de WebLogic';
    btnUndeploy.show();

    const btnShowLog = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 97); // 97 para que aparezca junto a los otros
    btnShowLog.command = 'weblogic.showLog';
    btnShowLog.text = '$(output)';
    btnShowLog.tooltip = 'Ver log del servidor WebLogic en vivo';
    btnShowLog.show();

    // Suscribir los botones al ciclo de vida de la extensión para limpieza automática
    context.subscriptions.push(btnBuildDeploy, btnDeploy, btnUndeploy, btnShowLog);



    context.subscriptions.push(configCmd, buildDeployCmd, deployCmd, undeployCmd, showLogCmd);
}

// --- FUNCIONES AUXILIARES ---

async function getMavenOptions() {

    const configuration = vscode.workspace.getConfiguration('maven');

    const mavenOptions = configuration.get<string>('executable.options');

    return mavenOptions;
}

async function getProjectInfo() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No hay un proyecto activo.');
        return null;
    }
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const pomPath = path.join(workspaceRoot, 'pom.xml');

    if (!fs.existsSync(pomPath)) {
        vscode.window.showErrorMessage('No se encontró el archivo pom.xml en la raíz del proyecto.');
        return null;
    }

    const xmlData = fs.readFileSync(pomPath, 'utf8');
    const parser = new XMLParser();
    const result = parser.parse(xmlData);

    const artifactId = result.project.artifactId;
    const packaging = result.project.packaging || 'jar';
    const version = result.project.version;

    if (packaging !== 'war' && packaging !== 'ear') {
        vscode.window.showErrorMessage('El packaging del proyecto debe ser war o ear.');
        return null;
    }

    const artifactName = `${artifactId}.${packaging}`;
    //  const artifactName = `${artifactId}-${version}.${packaging}`;
    const targetPath = path.join(workspaceRoot, 'target', artifactName);

    return { workspaceRoot, artifactId, targetPath, packaging };
}


async function getServer() {
    const config = vscode.workspace.getConfiguration('weblogic');
    const servers: any[] = config.get('servers') || [];

    if (servers.length === 0) {
        vscode.window.showErrorMessage('No hay servidores configurados. Ejecuta "WebLogic: Configurar Servidores".');
        return null;
    }

    let targetServer = servers.find(s => s.isDefault);

    if (!targetServer) {

        const items = servers.map(s => ({ label: s.name, description: `${s.host}:${s.port}`, server: s }));
        const selected = await vscode.window.showQuickPick(items, { placeHolder: 'Selecciona un servidor WebLogic' });
        if (!selected) { return null; }
        targetServer = selected.server;
    }

    return targetServer;
}

function executeCommand(command: string, cwd: string): Promise<string> {
    outputChannel.appendLine(`\n--- EJECUTANDO COMANDO ---`);
    outputChannel.appendLine(`[Directorio]: ${cwd}`);

    // Ocultar la contraseña en el log para seguridad
    const safeCommand = command.replace(/--user [^ ]+/, '--user ***:***');
    outputChannel.appendLine(`[Comando]: ${safeCommand}`);

    return new Promise((resolve, reject) => {
        cp.exec(command, { cwd }, (error, stdout, stderr) => {
            if (stdout) {
                outputChannel.appendLine(`[STDOUT]:\n${stdout}`);
            }
            if (stderr) {
                outputChannel.appendLine(`[STDERR]:\n${stderr}`);
            }

            if (error) {
                outputChannel.appendLine(`[ERROR INTERNO]: ${error.message}`);
                reject(stderr || error.message);
            } else {
                resolve(stdout);
            }
        });
    });
}

async function performDeploy(projectInfo: any) {
    outputChannel.appendLine('\n========================================');
    outputChannel.appendLine(`[DEBUG] Iniciando proceso de DEPLOY para: ${projectInfo.artifactId}`);


    const server = await getServer();
    if (!server) {
        outputChannel.appendLine('[DEBUG] Error: No se seleccionó ningún servidor o no hay configuración.');
        return;
    }

    const deployTarget = server.target || 'AdminServer';


    const apiPath = server.apiPath || '/management/weblogic/latest/edit/appDeployments';
    const url = `http://${server.host}:${server.port}${apiPath}`;

    outputChannel.appendLine(`[DEBUG] Servidor destino: ${server.name} (${server.host}:${server.port})`);
    outputChannel.appendLine(`[DEBUG] Target de WebLogic: ${deployTarget}`);
    outputChannel.appendLine(`[DEBUG] URL de la API REST: ${url}`);


    if (!fs.existsSync(projectInfo.targetPath)) {
        const msg = `No se encontró el artefacto en: ${projectInfo.targetPath}. Ejecuta un Build primero.`;
        outputChannel.appendLine(`[DEBUG] Error: ${msg}`);
        vscode.window.showErrorMessage(msg);
        return;
    }

    // 3. Proceso de Despliegue
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Desplegando ${projectInfo.artifactId} en ${server.name}...`,
        cancellable: false
    }, async () => {
        try {
            // =========================================================
            // FASE 1: UNDEPLOY PREVIO SILENCIOSO
            // =========================================================
            outputChannel.appendLine(`\n[DEBUG] --- FASE 1: Intentando Undeploy previo ---`);
            const undeployUrl = `${url}/${projectInfo.artifactId}`;

            const undeployCmd = `curl -v \
                --user ${server.username}:${server.password} \
                -H "X-Requested-By: VSCode-Deployer" \
                -H "Accept: application/json" \
                -X DELETE \
                "${undeployUrl}"`;

            try {
                const unDeployResult = await executeCommand(undeployCmd, projectInfo.workspaceRoot);
                outputChannel.appendLine(`[DEBUG] Resultado del Undeploy (JSON de respuesta):\n${unDeployResult}`);
            } catch (unDeployErr) {
                // Atrapamos el error silenciosamente (Ej. un 404 porque la app no existe)
                outputChannel.appendLine(`[DEBUG] Nota: La aplicación no existía previamente o el Undeploy devolvió error. Se continúa con el despliegue normalmente.`);
            }

            // =========================================================
            // FASE 2: DEPLOY DE LA NUEVA VERSIÓN
            // =========================================================
            outputChannel.appendLine(`\n[DEBUG] --- FASE 2: Despliegue (Deploy) ---`);

            // Validar si el target es un clúster o un servidor individual para la identidad de WebLogic
            const targetType = deployTarget.toLowerCase().includes('cluster') ? 'clusters' : 'servers';

            // JSON estricto, con el arreglo "identity", y comillas dobles escapadas (\") para Windows CMD
            const modelJson = `{\\"name\\": \\"${projectInfo.artifactId}\\", \\"targets\\": [{\\"identity\\": [\\"${targetType}\\", \\"${deployTarget}\\"]}]}`;
            outputChannel.appendLine(`[DEBUG] Modelo JSON a enviar: ${modelJson}`);

            // Comando CURL con "sourcePath" (API moderna) y tipo application/json explícito
            const curlCmd = `curl -v \
                --user ${server.username}:${server.password} \
                -H "X-Requested-By: VSCode-Deployer" \
                -H "Accept: application/json" \
                -X POST \
                -F "model=${modelJson};type=application/json" \
                -F "sourcePath=@${projectInfo.targetPath}" \
                "${url}"`;

            // Ejecución
            const result = await executeCommand(curlCmd, projectInfo.workspaceRoot);

            // --> CAMBIO PRINCIPAL: Mostrar en el Output Channel la respuesta JSON íntegra devuelta por WebLogic
            outputChannel.appendLine(`\n[DEBUG] Respuesta del servidor WebLogic al Deploy (JSON):\n${result}`);

            // Evaluar si la respuesta contiene errores internos devueltos por la API moderna
            if (result && (result.includes('404 Not Found') || result.includes('"status": 500') || result.includes('"status": 400') || result.includes('FAILURE'))) {
                outputChannel.appendLine(`[DEBUG] ADVERTENCIA: La respuesta de WebLogic contiene un error en el payload.`);
                throw new Error("El servidor WebLogic rechazó la solicitud. Revisa el log detallado.");
            }



            // Éxito
            vscode.window.showInformationMessage(`¡Despliegue exitoso de ${projectInfo.artifactId} en ${deployTarget}!`);

            // Abrir navegador si aplica
            if (server.openBrowser) {
                const appUrl = `http://${server.host}:${server.port}/${projectInfo.artifactId}`;
                outputChannel.appendLine(`[DEBUG] Abriendo navegador en la ruta: ${appUrl}`);
                vscode.env.openExternal(vscode.Uri.parse(appUrl));
            }

        } catch (err) {
            outputChannel.show();
            outputChannel.appendLine(`[DEBUG] EXCEPCIÓN DETECTADA EN DEPLOY: ${err}`);
            vscode.window.showErrorMessage(`Error en Despliegue. Revisa los detalles en el panel 'Output' -> 'WebLogic Deployer'.`);
        }
    });
}
async function performUnDeploy(projectInfo: any) {
    outputChannel.appendLine('\n========================================');
    outputChannel.appendLine(`[DEBUG] Iniciando proceso de UNDEPLOY para: ${projectInfo.artifactId}`);

    // 1. Validar Servidor
    const server = await getServer();
    if (!server) {
        outputChannel.appendLine('[DEBUG] Error: No se seleccionó ningún servidor o no hay configuración.');
        return;
    }

    // Ruta de la API moderna para WebLogic 12.2.1.4+ / 14c / 15
    const apiPath = server.apiPath || '/management/weblogic/latest/edit/appDeployments';
    // Para el undeploy, se agrega el nombre del artefacto al final de la URL
    const url = `http://${server.host}:${server.port}${apiPath}/${projectInfo.artifactId}`;

    outputChannel.appendLine(`[DEBUG] Servidor destino: ${server.name} (${server.host}:${server.port})`);
    outputChannel.appendLine(`[DEBUG] URL de la API REST (Undeploy): ${url}`);

    // 2. Proceso de Undeploy
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Haciendo undeploy de ${projectInfo.artifactId} en ${server.name}...`,
        cancellable: false
    }, async () => {
        try {
            // Comando CURL ejecutando el método DELETE
            const curlCmd = `curl -v \
                --user ${server.username}:${server.password} \
                -H "X-Requested-By: VSCode-Deployer" \
                -H "Accept: application/json" \
                -X DELETE \
                "${url}"`;

            // Ejecución
            const result = await executeCommand(curlCmd, projectInfo.workspaceRoot);

            outputChannel.appendLine(`\n[DEBUG] Respuesta del servidor WebLogic al UnDeploy (JSON):\n${result}`);

            // Evaluar la respuesta del servidor
            if (result && (result.includes('"status": 500') || result.includes('"status": 400') || result.includes('FAILURE'))) {
                outputChannel.appendLine(`[DEBUG] ADVERTENCIA: La respuesta de WebLogic contiene un error en el payload.`);
                throw new Error("El servidor WebLogic rechazó la solicitud. Revisa el log detallado.");
            }

            // Si devuelve 404 es porque la aplicación ya no estaba desplegada
            if (result && result.includes('404 Not Found')) {
                outputChannel.appendLine(`[DEBUG] Nota: La aplicación no existía en el servidor.`);
                vscode.window.showInformationMessage(`La aplicación ${projectInfo.artifactId} no estaba desplegada en WebLogic.`);
            } else {
                vscode.window.showInformationMessage(`¡Undeploy exitoso de ${projectInfo.artifactId}!`);
            }

        } catch (err) {
            outputChannel.show();
            outputChannel.appendLine(`[DEBUG] EXCEPCIÓN DETECTADA EN UNDEPLOY: ${err}`);
            vscode.window.showErrorMessage(`Error en Undeploy. Revisa los detalles en el panel 'Output' -> 'WebLogic Deployer'.`);
        }
    });
}